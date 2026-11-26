// Demo-Modus: Laden, Trennung von den echten Daten, Beenden, Zurücksetzen, Aufnahme-Modus; alle Demo-Seiten in mehreren Größen ohne Überlauf.
import { buildDist, launchEngines, openApp, Report, layoutProblems, nameProblems, sleep, tabTap, tap, blobsWork } from "./lib.mjs";

const dist = buildDist();
const { engines, notes } = await launchEngines();
for (const n of notes) console.log("Hinweis: " + n);
const rep = new Report("demo");
const SIZES = process.env.QUICK ? [[390, 844]] : [[375, 812], [390, 844], [430, 932], [812, 375]];
const SCHEMES = process.env.QUICK ? ["light"] : ["light", "dark"];
const boot = (page) => page.waitForFunction(() => window.db && window.app && window.__toast && document.querySelector(".tabbar, .sidebar"), null, { timeout: 30000 });

for (const eng of engines) {
  const tag = eng.name;
  // ---------- Ablauf: laden, getrennt, zurücksetzen, Aufnahme-Modus, beenden ----------
  {
    const { context, page, errors } = await openApp(dist, eng, { width: 390, height: 844 });
    const V = (sel) => page.locator(sel).locator("visible=true");
    const asBtn = (label) => page.locator(".as-layer.is-shown .as-btn", { hasText: label }).first();
    const blobs = await blobsWork(page);
    const expect = (c, m) => { if (!rep.ok(c, `${tag}: ${m}`)) throw new Error(m); };
    try {
      await page.evaluate(async () => { await window.app.logic.createSkill({ name: "Echter Eintrag", kategorie: "Test", typ: "skill", status: "lerne" }); await window.app.logic.addTodo("Echtes To-do", "list-allgemein", null); });
      const real = () => page.evaluate(async () => JSON.stringify([await window.db.skills.count(), await window.db.todos.count(), window.db.name]));
      const realBefore = await real();
      expect(JSON.parse(realBefore)[2] === "skill-app", "normale Datenbank hat den falschen Namen");
      await tabTap(page, "Mehr");
      expect(await V(".row").filter({ hasText: "Demo-Daten laden" }).count() === 1, "„Demo-Daten laden“ fehlt unter Mehr");
      expect(await V(".row").filter({ hasText: "Demo beenden" }).count() === 0, "„Demo beenden“ ohne Demo sichtbar");
      expect(await page.locator(".demo-chip").count() === 0, "Demo-Zeichen ohne Demo");
      await Promise.all([page.waitForEvent("load"), tap(page, V(".row").filter({ hasText: "Demo-Daten laden" }).first(), 200)]);
      await boot(page);
      await sleep(600);
      const info = await page.evaluate(async () => ({ name: window.db.name, skills: await window.db.skills.count(), todos: await window.db.todos.count(), checks: await window.db.checks.count(), chip: !!document.querySelector(".demo-chip") }));
      expect(info.name === "skill-app-demo", `Demo nutzt die Datenbank ${info.name}`);
      expect(info.skills >= 15 && info.todos >= 8 && info.checks > 20, `Demo-Daten unvollständig: ${JSON.stringify(info)}`);
      expect(info.chip, "kleines Demo-Zeichen fehlt");
      // echte Daten unberührt (getrennte Datenbank)
      const probe = await page.evaluate(async () => new Promise((resolve) => { const r = indexedDB.open("skill-app"); r.onsuccess = () => { const db = r.result; const out = []; const tx = db.transaction(["skills", "todos"], "readonly"); tx.objectStore("skills").count().onsuccess = (e) => out.push(e.target.result); tx.objectStore("todos").count().onsuccess = (e) => out.push(e.target.result); tx.oncomplete = () => { db.close(); resolve(out); }; }; r.onerror = () => resolve(null); }));
      expect(probe && probe[0] === JSON.parse(realBefore)[0] && probe[1] === JSON.parse(realBefore)[1], `echte Datenbank verändert: ${JSON.stringify(probe)}`);
      // Übersicht lebendig
      await tabTap(page, "Übersicht");
      expect(await V(".acard").count() === 4, `Übersicht zeigt ${await V(".acard").count()} aktive Karten statt 4`);
      await tabTap(page, "Heute");
      expect(/12 Tage in Folge/.test(await page.evaluate(() => document.body.innerText)), "Heute zeigt keine 12-Tage-Serie");
      // Aufnahme-Modus
      await tabTap(page, "Mehr");
      await page.evaluate(() => localStorage.setItem("demo.backup.last", JSON.stringify(Date.now() - 40 * 86400000)));
      expect(await V(".row").filter({ hasText: "Aufnahme-Modus" }).count() === 1, "Aufnahme-Modus fehlt");
      await tap(page, V(".row").filter({ hasText: "Aufnahme-Modus" }).locator("[role=switch]").first(), 400);
      expect(await page.evaluate(() => document.documentElement.classList.contains("demo-record") && getComputedStyle(document.querySelector(".demo-chip")).display === "none"), "Aufnahme-Modus blendet das Demo-Zeichen nicht aus");
      expect(await V(".row").filter({ hasText: "Speicherschutz" }).count() === 0, "Speicher-Hinweis im Aufnahme-Modus sichtbar");
      expect(await V(".row").filter({ hasText: "kein Backup" }).count() === 0, "Backup-Erinnerung im Aufnahme-Modus sichtbar");
      await tap(page, V(".row").filter({ hasText: "Aufnahme-Modus" }).locator("[role=switch]").first(), 400);
      // Zurücksetzen
      await page.evaluate(async () => { await window.db.todos.update("demo-t-1", { done: true }); await window.db.skills.add({ ...(await window.db.skills.toArray())[0], id: "extra-x" }); });
      await Promise.all([page.waitForEvent("load"), tap(page, V(".row").filter({ hasText: "Demo zurücksetzen" }).first(), 200)]);
      await boot(page);
      const reset = await page.evaluate(async () => ({ done: (await window.db.todos.get("demo-t-1"))?.done, extra: await window.db.skills.get("extra-x") }));
      expect(reset.done === false && !reset.extra, "Zurücksetzen stellt den Anfangszustand nicht her");
      // Medien (nur mit Blob-Speicher)
      if (blobs) {
        const m = await page.evaluate(async () => ({ clips: await window.db.clipBlobs.count(), rec: await window.db.recBlobs.count(), recs: await window.db.recordings.count() }));
        expect(m.clips === 1 && m.rec === 2 && m.recs === 2, `Clip/Aufnahmen fehlen: ${JSON.stringify(m)}`);
      }
      // Demo beenden
      await tabTap(page, "Mehr");
      await tap(page, V(".row").filter({ hasText: "Demo beenden" }).first(), 500);
      await Promise.all([page.waitForEvent("load"), tap(page, asBtn("Demo beenden"), 200)]);
      await boot(page);
      await sleep(400);
      const end = await page.evaluate(async () => ({ name: window.db.name, real: JSON.stringify([await window.db.skills.count(), await window.db.todos.count()]), dbs: (await indexedDB.databases?.())?.map((d) => d.name) ?? [], chip: !!document.querySelector(".demo-chip"), keys: Object.keys(localStorage).filter((k) => k.startsWith("demo.") || k.startsWith("skills.demo")) }));
      expect(end.name === "skill-app", "nach Demo beenden nicht die normale Datenbank");
      expect(end.real === JSON.stringify([JSON.parse(realBefore)[0], JSON.parse(realBefore)[1]]), `echte Daten verändert: ${end.real}`);
      expect(!end.dbs.includes("skill-app-demo"), "Demo-Datenbank wurde nicht gelöscht");
      expect(!end.chip && end.keys.length === 0, `Reste der Demo: ${JSON.stringify(end.keys)}`);
    } catch (e) { await rep.fail(page, `${tag} · Demo-Ablauf: ${String(e.message).split("\n")[0].slice(0, 220)}`, `${tag}-demo-ablauf`); }
    const er = errors.splice(0);
    rep.ok(er.length === 0, `${tag}: Konsole beim Demo-Ablauf: ${er.join(" | ").slice(0, 250)}`);
    await context.close();
  }

  // ---------- Demo-Seiten in mehreren Größen ----------
  for (const [w, h] of SIZES) for (const scheme of SCHEMES) {
    const label = `${tag} ${w}×${h} ${scheme}`;
    const { context, page, errors } = await openApp(dist, eng, { width: w, height: h, scheme });
    const V = (sel) => page.locator(sel).locator("visible=true");
    const check = async (name) => {
      await sleep(250);
      let lp = await layoutProblems(page);
      if (lp.length) { await sleep(600); lp = await layoutProblems(page); }
      const np = await nameProblems(page);
      const er = errors.splice(0);
      for (const p of [...lp, ...np]) await rep.fail(page, `${label} · ${name}: ${p}`, `${tag}-demo-${name}`);
      if (!lp.length && !np.length) rep.ok(true);
      if (er.length) await rep.fail(page, `${label} · ${name}: Konsole ${er.join(" | ").slice(0, 200)}`, `${tag}-demo-konsole`); else rep.ok(true);
    };
    try {
      await page.evaluate(() => localStorage.setItem("skills.demo", "1"));
      await page.reload();
      await boot(page);
      await sleep(500);
      errors.splice(0);
      for (const t of ["Übersicht", "Heute", "To-dos", "Inbox", "Mehr"]) { await tabTap(page, t); await check(t); }
      await tabTap(page, "Mehr");
      for (const row of ["Gewohnheiten", "Statistik"]) {
        const r = V(".row").filter({ hasText: new RegExp(`^${row}`) }).first();
        if (await r.count()) { await tap(page, r, 700); await check(row); await tap(page, V(".nav-back").first(), 600).catch(() => {}); }
      }
      // Gewohnheit, Skill, Stück, Abschnitt
      await tabTap(page, "Heute");
      await tap(page, V(".row").filter({ hasText: "Jeden Tag lesen" }).first(), 800).catch(() => {});
      await check("Gewohnheit");
      await tabTap(page, "Übersicht");
      await tap(page, page.locator('text="Klavierstück" >> visible=true').first(), 900).catch(() => {});
      await check("Klavierstück");
      await tap(page, page.locator(".page[aria-hidden='false'] .unit-tile").first(), 900).catch(() => {});
      await check("Stück");
      await tap(page, page.locator(".part-main", { hasText: "Strophe" }).first(), 900).catch(() => {});
      await check("Abschnitt");
      // Trainer
      await tabTap(page, "Übersicht");
      await tap(page, V('text="Flaggen & Geografie"').first(), 800).catch(() => {});
      await tap(page, V(".trainer-btn").first(), 1000).catch(() => {});
      const sure = await page.locator(".fl-sure").first().textContent().catch(() => "");
      rep.ok(/70 von 195 sicher/.test(sure ?? ""), `${label}: Flaggen zeigen „${sure}“ statt „70 von 195 sicher“`);
      await check("Flaggen");
      await page.keyboard.press("Escape"); await tap(page, V(".sheet-bar button, .sheet-head button", { hasText: "Schließen" }).first(), 600).catch(() => {});
      await tabTap(page, "Übersicht");
      await tap(page, V('text="Zauberwürfel"').first(), 800).catch(() => {});
      await tap(page, V(".trainer-btn").first(), 1500).catch(() => {});
      await tap(page, V('button[aria-label="Zeiten"]').first(), 700).catch(() => {});
      const stats = await V(".cz-stats b").allTextContents();
      rep.ok(stats.length === 3 && stats.every((x) => x !== "–"), `${label}: Würfel-Zeiten ohne Bestzeit/Ao5/Ao12 (${stats.join(" ")})`);
      await check("Würfel-Zeiten");
    } catch (e) { await rep.fail(page, `${label}: Abbruch – ${String(e.message).split("\n")[0].slice(0, 200)}`, `${tag}-demo-abbruch`); }
    await context.close();
  }
}
for (const e of engines) await e.browser.close();
const res = rep.finish({ engines: engines.map((e) => e.name), notes });
process.exit(res.failures.length ? 1 : 0);
