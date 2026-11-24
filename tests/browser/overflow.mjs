// Browser-Test: Keine Seite darf seitlich verschiebbar sein (375, 390, 430 px).
// Aufruf: npm run test:browser   (baut einen Test-Build, startet Chromium über playwright-core)
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("playwright-core")); }
const root = path.resolve(import.meta.dirname, "../..");
const dist = process.env.DIST || fs.mkdtempSync(path.join(os.tmpdir(), "skills-dist-"));
if (!process.env.DIST) {
  execFileSync("npx", ["vite", "build", "--outDir", dist, "--emptyOutDir"], { cwd: root, stdio: "ignore", env: { ...process.env, PUBLIC_BUILD: "1", VITE_EXPOSE: "1" } });
}
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".webmanifest": "application/manifest+json", ".json": "application/json" };
const LONG = "Eine ziemlich lange Überschrift ohne Leerzeichen-Pause-Superkalifragilistischexpialigetisch und noch viel mehr Text dahinter";
const URL_LONG = "https://example.org/ein/sehr/langer/pfad/zu/einer/quelle/mit/vielen/teilen/und/parametern?a=1&b=2&c=3&d=4&e=5&f=6&g=7";

const sizes = [375, 390, 430];
const failures = [];

async function seed(page) {
  await page.evaluate(async ([LONG, URL_LONG]) => {
    const L = window.app.logic;
    const db = window.db;
    for (const t of ["todos", "terms", "wishes", "inbox"]) await db[t].clear();
    const cats = ["Körper & Sport", "Kopf: Rechnen, Gedächtnis & Denken", "Atmung, Sinne & Körperkontrolle"];
    let first = null;
    for (let i = 0; i < 6; i++) {
      const s = await L.createSkill({ name: i === 0 ? LONG : `Skill ${i}`, kategorie: cats[i % 3], typ: "skill", status: i < 3 ? "lerne" : "idee", notes: i === 0 ? LONG.repeat(3) : "" });
      if (i === 0) first = s;
    }
    await db.skills.update(first.id, {
      title: "Langer Skill " + LONG.slice(0, 40),
      profile: { about: LONG.repeat(3), why: LONG.repeat(2), tips: URL_LONG + " " + LONG.repeat(2), safety: LONG, searches: [LONG, "handstand tutorial anfänger", "kurz"], ai: false },
      milestones: [{ id: "m1", text: LONG, done: false, doneAt: null }],
      links: [{ id: "l1", url: URL_LONG, title: LONG, addedAt: Date.now() }],
    });
    await L.createSkill({ name: "Wochentag lang " + LONG, title: "Wochentag berechnen", kategorie: cats[1], typ: "skill", status: "lerne" });
    await L.createSkill({ name: LONG, kategorie: "Gewohnheiten", typ: "gewohnheit", status: "lerne" });
    await L.createSkill({ name: LONG, kategorie: "Projekte & Besorgungen", typ: "projekt", status: "idee" });
    const lists = await db.lists.toArray();
    await db.lists.add({ id: "list-lang", name: "Eine Liste mit sehr langem Namen " + LONG.slice(0, 30), order: 5 });
    for (const [i, l] of [lists[0], lists[1], { id: "list-lang" }].entries()) {
      await L.addTodo(LONG + " " + i, l.id, i === 0 ? L.dayKey(new Date()) : null);
      await L.addTodo("kurz " + i, l.id, L.dayKey(L.addDays(new Date(), -1)));
    }
    await db.terms.add({ id: "t1", term: LONG, explanation: LONG.repeat(2), understood: false, understoodAt: null, links: [], createdAt: Date.now() });
    await db.wishes.add({ id: "w1", name: LONG, url: URL_LONG, note: LONG, bought: false, boughtAt: null, createdAt: Date.now() });
    for (let i = 0; i < 4; i++) await db.inbox.add({ id: "i" + i, text: LONG.repeat(2), createdAt: Date.now() - i * 86400000 });
    await db.sessions.add({ id: "se1", skillId: first.id, start: Date.now() - 3600000, minutes: 25, note: LONG });
    // Klavierstück mit Unterpunkten, Abschnitten und Clip-Metadaten
    const piano = await L.createSkill({ name: "Learn piano song", title: "Klavierstück", kategorie: "Kreativ & Alltag", typ: "skill", status: "lerne" });
    await db.units.bulkAdd([
      { id: "u1", skillId: piano.id, title: "Homecoming – Kanye West " + LONG, status: "lerne", note: LONG, nextNote: { text: LONG, rating: 2, at: Date.now() }, order: 0, createdAt: Date.now() },
      { id: "u2", skillId: piano.id, title: "Zweites Stück", status: "auffrischen", note: "", nextNote: null, order: 1, createdAt: Date.now() },
    ]);
    await db.parts.bulkAdd([
      { id: "p1", unitId: "u1", name: "Intro " + LONG, order: 0, solid: true, notes: [{ id: "n1", text: LONG, at: Date.now() }], links: [{ id: "pl", url: URL_LONG, title: LONG, addedAt: Date.now() }], clips: [{ id: "c1", name: LONG + ".mp4", size: 4200000, addedAt: Date.now(), duration: 12 }], loops: 7, createdAt: Date.now() },
      { id: "p2", unitId: "u1", name: "Strophe", order: 1, solid: false, notes: [], links: [], clips: [], loops: 0, createdAt: Date.now() },
    ]);
    await db.sessions.add({ id: "se2", skillId: piano.id, start: Date.now() - 7200000, minutes: 30, unitId: "u1" });
    return first.id;
  }, [LONG, URL_LONG]);
}

/** Alles, was breiter als der Bildschirm ist oder seitlich scrollbar wäre (Karussells mit eigener Absicht ausgenommen). */
async function measure(page) {
  return page.evaluate(() => {
    const w = window.innerWidth;
    const out = [];
    const de = document.documentElement;
    if (de.scrollWidth > w) out.push(`html scrollWidth ${de.scrollWidth} > ${w}`);
    if (document.body.scrollWidth > w) out.push(`body scrollWidth ${document.body.scrollWidth} > ${w}`);
    const intentional = (el) => el.closest(".active-rail, .list-pills, .chips-scroll, .tr-scroll, .sorter, .sheet-layer, .toast, .as-layer");
    for (const el of document.querySelectorAll("*")) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      if (el.closest("[aria-hidden='true']") && el.closest(".page.is-covered, .page.is-hidden")) continue;
      if (intentional(el)) continue;
      if ((cs.overflowX === "auto" || cs.overflowX === "scroll") && el.scrollWidth > el.clientWidth + 1) {
        out.push(`scroll-x ${el.tagName}.${String(el.className).slice(0, 40)} ${el.scrollWidth}>${el.clientWidth}`);
      }
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > w + 1 || r.left < -1) && !el.closest(".swipe-actions, .swipe-lead")) {
        out.push(`Element ${el.tagName}.${String(el.className).slice(0, 40)} ${Math.round(r.left)}..${Math.round(r.right)} (Breite ${w})`);
      }
    }
    return [...new Set(out)].slice(0, 12);
  });
}

const click = async (page, text) => {
  await page.getByText(text, { exact: true }).first().click({ timeout: 4000 });
  await page.waitForTimeout(650);
};

async function run() {
  globalThis.__debug = process.env.DEBUG;
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  for (const width of sizes) {
    const context = await browser.newContext({ viewport: { width, height: 780 }, deviceScaleFactor: 1, hasTouch: true, serviceWorkers: "block", colorScheme: process.env.DARK ? "dark" : "light" });
    await context.route("https://skills.test/**", (route) => {
      let p = new URL(route.request().url()).pathname;
      if (p === "/") p = "/index.html";
      const f = path.join(dist, p);
      if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: "" });
      route.fulfill({ status: 200, contentType: types[path.extname(f)] ?? "application/octet-stream", body: fs.readFileSync(f) });
    });
    const page = await context.newPage();
    await page.goto("https://skills.test/");
    await page.waitForFunction(() => window.db);
    await seed(page);
    await page.waitForTimeout(500);
    const check = async (name) => {
      const res = await measure(page);
      if (res.length) failures.push(`${width}px · ${name}: ${res.join(" | ")}`);
      if (process.env.SHOTS) await page.screenshot({ path: path.join(process.env.SHOTS, `${name.replace(/\W+/g, "_")}-${width}.png`) });
    };
    const tab = (n) => page.locator(".tabbar").getByText(n, { exact: true }).click();
    await tab("Übersicht"); await page.waitForTimeout(500); await check("Übersicht");
    // Kachel „Alle“: an erster Stelle, zeigt die Anzahl aller Einträge, öffnet die ungefilterte Liste
    const allTile = page.locator(".tiles .tile").first();
    const tileInfo = await allTile.evaluate((el) => ({ name: el.querySelector(".tile-name").textContent, count: Number(el.querySelector(".tile-count").textContent), same: el.getBoundingClientRect().height }));
    const total = await page.evaluate(() => window.db.skills.count());
    const otherH = await page.locator(".tiles .tile").nth(1).evaluate((el) => el.getBoundingClientRect().height);
    if (tileInfo.name !== "Alle" || tileInfo.count !== total || Math.abs(tileInfo.same - otherH) > 1) failures.push(`${width}px · Kachel Alle: ${JSON.stringify({ tileInfo, total, otherH })}`);
    await allTile.click(); await page.waitForTimeout(700);
    const chips = await page.locator(".filter-chips .mini-pill").evaluateAll((els) => els.map((e) => [e.textContent, e.classList.contains("is-on")]));
    if (chips[0]?.[0] !== "Alle" || !chips[0][1]) failures.push(`${width}px · Chip Alle nicht vorn/aktiv: ${JSON.stringify(chips)}`);
    await check("Alle-Liste");
    await page.locator(".nav-back >> visible=true").last().click(); await page.waitForTimeout(650);
    await tab("Heute"); await page.waitForTimeout(500); await check("Heute");
    await tab("To-dos"); await page.waitForTimeout(500); await check("To-dos");
    // Wischen: Zeile bleibt in ihrer Karte, Seite bewegt sich nicht
    for (const [dx, name] of [[-220, "To-dos (nach links gewischt)"], [260, "To-dos (nach rechts gewischt)"]]) {
      const row = page.locator(".todo-row").first();
      const box = await row.boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + dx / 2, box.y + box.height / 2 + 1, { steps: 6 });
      await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2 + 1, { steps: 6 });
      await page.waitForTimeout(150);
      const info = await page.evaluate(() => {
        const sc = [...document.querySelectorAll(".scroller")].find((x) => x.offsetParent !== null && x.querySelector(".todo-row"));
        const card = document.querySelector(".todo-card .group-body").getBoundingClientRect();
        const acts = [...document.querySelectorAll(".swipe-actions, .swipe-lead")].filter((a) => getComputedStyle(a).visibility !== "hidden").map((a) => a.getBoundingClientRect());
        return { left: sc.scrollLeft, docLeft: document.documentElement.scrollLeft, outside: acts.some((r) => r.right > card.right + 1 || r.left < card.left - 1), sw: document.documentElement.scrollWidth };
      });
      if (info.left !== 0 || info.docLeft !== 0 || info.outside || info.sw > width) failures.push(`${width}px · ${name}: ${JSON.stringify(info)}`);
      await page.mouse.up();
      await page.waitForTimeout(500);
      // zurückschieben
      await page.mouse.move(10, 10);
    }
    await tab("Inbox"); await page.waitForTimeout(500); await check("Inbox");
    await tab("Mehr"); await page.waitForTimeout(500); await check("Mehr");
    for (const n of ["Gewohnheiten", "Projekte", "Begriffe", "Wunschliste", "Statistik"]) {
      await click(page, n);
      await check(n);
      await page.locator(".nav-back >> visible=true").last().click();
      await page.waitForTimeout(650);
    }
    // Skill-Detail mit langem Steckbrief
    await tab("Übersicht"); await page.waitForTimeout(400);
    await page.getByText("Langer Skill", { exact: false }).first().click({ timeout: 4000 }).catch(async () => {
      await page.locator(".tile, .active-card, .acard").first().click();
    });
    await page.waitForTimeout(800);
    if (process.env.DEBUG) {
      console.log(await page.evaluate(() => { const w = innerWidth; const sc = [...document.querySelectorAll(".scroller")].find((x) => x.scrollWidth > x.clientWidth); if (!sc) return "kein Scroller"; return [...sc.querySelectorAll("*")].filter((e) => e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0).slice(0, 12).map((e) => e.tagName + "." + String(e.className).slice(0, 40) + " scroll " + e.scrollWidth + " client " + e.clientWidth + " | " + (e.textContent || "").slice(0, 30)).join("\n"); }));
    }
    await check("Skill-Detail");
    await page.mouse.wheel(0, 1200); await page.waitForTimeout(300);
    await check("Skill-Detail unten");
    // Klavierstück → Unterpunkt → Abschnitt
    await page.locator(".nav-back >> visible=true").last().click(); await page.waitForTimeout(650);
    await page.getByText("Klavierstück", { exact: true }).first().click({ timeout: 4000 });
    await page.waitForTimeout(800);
    await check("Klavierstück");
    await page.locator(".unit-card").first().click(); await page.waitForTimeout(800);
    await check("Unterpunkt");
    await page.locator(".part-main").first().click(); await page.waitForTimeout(800);
    await check("Abschnitt");
    await page.locator(".nav-back >> visible=true").last().click(); await page.waitForTimeout(650);
    await page.locator(".part-card .swipe-content").first().scrollIntoViewIfNeeded();
    const pbox = await page.locator(".part-card .swipe-content").first().boundingBox();
    await page.mouse.move(pbox.x + pbox.width / 2, pbox.y + pbox.height / 2); await page.mouse.down();
    await page.mouse.move(pbox.x + pbox.width / 2 - 200, pbox.y + pbox.height / 2 + 1, { steps: 8 }); await page.waitForTimeout(150);
    const swInfo = await page.evaluate(() => { const sc = [...document.querySelectorAll(".scroller")].find((x) => x.offsetParent !== null && x.querySelector(".part-card")); const card = document.querySelector(".part-card").getBoundingClientRect(); const a = [...document.querySelectorAll(".part-card .swipe-actions")].map((x) => x.getBoundingClientRect())[0]; return { left: sc.scrollLeft, outside: a ? a.right > card.right + 1 : false }; });
    if (swInfo.left !== 0 || swInfo.outside) failures.push(`${width}px · Abschnitt gewischt: ${JSON.stringify(swInfo)}`);
    await page.mouse.up();
    await context.close();
  }
  await browser.close();
  if (failures.length) {
    console.error("Seitliches Verschieben möglich:\n" + failures.join("\n"));
    process.exit(1);
  }
  console.log("Alle Seiten ohne horizontalen Überlauf (375/390/430 px).");
}
run();
