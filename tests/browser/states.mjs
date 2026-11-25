// Leere, Lade- und Fehlerzustände aller Seiten: ruhig, sinnvoll beschriftet, nichts abgeschnitten; Datenbank gesperrt → Fehlerseite statt Leere.
import { buildDist, launchEngines, openApp, Report, layoutProblems, integrityProblems, sleep, tabTap, tap } from "./lib.mjs";
import fs from "node:fs";
import path from "node:path";
import { createServer } from "node:http";

const dist = buildDist();
const { engines, notes } = await launchEngines();
for (const n of notes) console.log("Hinweis: " + n);
const rep = new Report("states");
const SIZES = process.env.QUICK ? [[390, 844]] : [[375, 812], [430, 932], [812, 375]];

for (const eng of engines) {
  const tag = eng.name;
  for (const [w, h] of SIZES) for (const scheme of process.env.QUICK ? ["light"] : ["light", "dark"]) {
    const label = `${tag} ${w}×${h} ${scheme}`;
    const { context, page, errors } = await openApp(dist, eng, { width: w, height: h, scheme });
    const V = (sel) => page.locator(sel).locator("visible=true");
    const check = async (name) => {
      await sleep(250);
      const lp = await layoutProblems(page); const ip = await integrityProblems(page); const er = errors.splice(0);
      const text = await page.evaluate(() => [...document.querySelectorAll(".page")].filter((p) => p.getAttribute("aria-hidden") !== "true").map((p) => p.innerText).join(" ").trim());
      if (lp.length) await rep.fail(page, `${label} · ${name}: Layout ${lp.join(" | ")}`, `${tag}-leer-${name}`); else rep.ok(true);
      if (ip.length) await rep.fail(page, `${label} · ${name}: Daten ${ip.join(" | ")}`, `${tag}-leer-daten`); else rep.ok(true);
      if (er.length) await rep.fail(page, `${label} · ${name}: Konsole ${er.join(" | ").slice(0, 200)}`, `${tag}-leer-konsole`); else rep.ok(true);
      if (text.length < 8) await rep.fail(page, `${label} · ${name}: Seite ist leer (kein Text)`, `${tag}-leer-text`); else rep.ok(true);
    };
    try {
      // frisch installiert: nur die zwei eingebauten Skills (Flaggen, Würfel), sonst nichts
      await page.evaluate(async () => { for (const t of window.db.tables) if (!["skills"].includes(t.name)) await t.clear(); await window.db.lists.bulkAdd([]); });
      for (const t of ["Übersicht", "Heute", "To-dos", "Inbox", "Mehr"]) { await tabTap(page, t); await check(t); }
      // Unterseiten über „Mehr“
      await tabTap(page, "Mehr");
      for (const row of ["Gewohnheiten", "Projekte", "Begriffe", "Wunschliste", "Statistik"]) {
        const r = V(".row").filter({ hasText: new RegExp(`^${row}`) }).first();
        if (!(await r.count())) continue;
        await tap(page, r, 700); await check(row);
        await tap(page, V(".nav-back").first(), 600).catch(() => {});
      }
      // leerer Skill
      await page.evaluate(async () => { await window.app.logic.createSkill({ name: "Leerer Skill", title: "Leerer Skill", kategorie: "Sprachen", typ: "skill", status: "lerne" }); });
      await tabTap(page, "Übersicht");
      await tap(page, V(".acard, .row").filter({ hasText: "Leerer Skill" }).first(), 800).catch(() => {});
      await check("Skill leer");
    } catch (e) {
      await rep.fail(page, `${label}: Abbruch – ${String(e.message).split("\n")[0].slice(0, 200)}`, `${tag}-leer-abbruch`);
    } finally { await context.close(); }
  }
}

// Fehlerzustand: Datenbank gesperrt (z. B. privater Modus) → ruhige Fehlerseite mit „Neu laden“, keine leere Seite, kein Absturz
{
  const eng = engines[0];
  const context = await eng.browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
  await context.addInitScript(() => { Object.defineProperty(window, "indexedDB", { value: undefined, configurable: true }); });
  const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".ico": "image/x-icon" };
  await context.route("https://skills.test/**", (route) => {
    let p = new URL(route.request().url()).pathname; if (p === "/") p = "/index.html";
    const f = path.join(dist, p);
    if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: "" });
    route.fulfill({ status: 200, contentType: types[path.extname(f)] ?? "application/octet-stream", body: fs.readFileSync(f) });
  });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  await page.goto("https://skills.test/");
  await page.waitForSelector(".errscreen", { timeout: 15000 }).catch(() => {});
  const shown = await page.locator(".errscreen").count();
  rep.ok(shown === 1, `${eng.name}: bei gesperrter Datenbank erscheint keine Fehlerseite`);
  if (shown) {
    const text = await page.locator(".errscreen").innerText();
    rep.ok(/Daten lassen sich nicht öffnen/.test(text) && /nicht verändert/.test(text), `Fehlertext unklar: ${text.slice(0, 100)}`);
    const b = await page.locator(".errscreen button").boundingBox();
    rep.ok(b && b.height >= 44, "„Neu laden“ zu klein");
    rep.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "Fehlerseite läuft seitlich über");
  }
  rep.ok(pageErrors.length === 0, `Unbehandelte Fehler: ${pageErrors.join(" | ").slice(0, 200)}`);
  await context.close();
}
void createServer;
for (const e of engines) await e.browser.close();
const res = rep.finish({ engines: engines.map((e) => e.name), notes });
process.exit(res.failures.length ? 1 : 0);
