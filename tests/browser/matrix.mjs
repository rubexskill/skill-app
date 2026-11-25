// Layout-Matrix: Hauptseiten in beiden Motoren, 375/390/430 px, Hoch- und Querformat, hell und dunkel.
// Prüft je Seite: kein seitliches Verschieben, nichts außerhalb, nichts überlappt, Tippflächen erreichbar, Tab-Leiste erreichbar, keine Konsolenfehler, Daten gültig.
import { buildDist, launchEngines, openApp, Report, layoutProblems, integrityProblems, matrix, seedRich, tap, tabTap, sleep, flagProblems, cubeProblems, openCube, openFlags, flagAnswer, flagReady } from "./lib.mjs";

const dist = buildDist();
const { engines, notes } = await launchEngines();
for (const n of notes) console.log("Hinweis: " + n);
const rep = new Report("matrix");
const full = process.env.QUICK ? false : true;

for (const eng of engines) {
  for (const combo of matrix(full).filter((c) => !process.env.COMBO || c.label.includes(process.env.COMBO))) {
    const tag = `${eng.name} ${combo.label}`;
    let ctx;
    try {
      ctx = await openApp(dist, eng, combo);
      const { page, errors } = ctx;
      await seedRich(page);
      await sleep(400);
      const cubeRef = {};
      const check = async (name) => {
        await sleep(250);
        const probs = [...(await layoutProblems(page)), ...(await flagProblems(page)), ...(await cubeProblems(page, cubeRef))];
        if (probs.length) await rep.fail(page, `${tag} · ${name}: ${probs.join(" | ")}`, `${eng.name}-${combo.label}-${name}`);
        else rep.ok(true);
        if (errors.length) { await rep.fail(page, `${tag} · ${name}: Konsole: ${errors.splice(0).join(" | ").slice(0, 300)}`, "konsole"); } else rep.ok(true);
      };
      for (const t of ["Übersicht", "Heute", "To-dos", "Inbox", "Mehr"]) { await tabTap(page, t); await check(t); }
      // To-dos: Reiter und Suche
      await tabTap(page, "To-dos");
      for (const chip of ["Allgemein", "Schule", "Alle"]) { await tap(page, page.locator(".list-chip", { hasText: chip }).first()); await check(`To-dos ${chip}`); }
      await tap(page, page.locator('button[aria-label="To-dos durchsuchen"]:visible').first()); await page.locator(".todo-search input").fill("a"); await check("To-dos Suche");
      await tap(page, page.locator(".todo-search-x")); await check("To-dos Suche zu");
      // Skill → Stück → Abschnitt
      await tabTap(page, "Übersicht");
      await tap(page, page.locator('text="Klavierstück" >> visible=true').first());
      await check("Skill");
      await tap(page, page.locator(".page[aria-hidden='false'] .unit-tile").first());
      await check("Stück");
      for (const f of ["Metronom", "Aufnahmen"]) { await tap(page, page.locator(".page[aria-hidden='false'] .fold-head", { hasText: f }).first()); await check(`Stück ${f}`); }
      await tap(page, page.locator(".part-main").first());
      await check("Abschnitt");
      // Flaggen-Trainer: Start, beide Fragearten, falsche Antwort, Ergebnis, Fortschritt, Einstellungen
      const closeSheet = async () => { await tap(page, page.locator(".sheet-bar button, .sheet-head button", { hasText: "Schließen" }).locator("visible=true").first(), 700); };
      const V = (sel) => page.locator(sel).locator("visible=true");
      await openFlags(page);
      await check("Flaggen Start");
      for (const dir of ["flag", "country"]) {
        await page.evaluate((d) => { const p = JSON.parse(localStorage.getItem("flags.prefs") ?? "{}"); localStorage.setItem("flags.prefs", JSON.stringify({ ...p, direction: d, amount: 10, scope: "all" })); }, dir);
        await closeSheet(); await openFlags(page);
        await tap(page, V(".fl-go").first(), 800); await flagReady(page);
        await check(`Flaggen Frage ${dir}`);
        await flagAnswer(page, false, { next: false }); await sleep(300);
        await check(`Flaggen falsch ${dir}`);
        await tap(page, V(".fl-next").first(), 400);
        await tap(page, V(".fl-x").first(), 600);
      }
      await page.evaluate(() => {
        const R = window.app.flags; const run = R.logic.startRun(R.logic.DEFAULT_PREFS, new Map(), Math.random, Date.now());
        run.queue = run.queue.slice(0, 1); run.done = 9; run.total = 10;
        run.first = { FR: true, DE: false, IT: true, ES: false, PT: true, PL: false, NL: true, BE: true, AT: true };
        localStorage.setItem("flags.run", JSON.stringify(run));
      });
      await closeSheet(); await openFlags(page);
      await check("Flaggen Start mit Fortsetzen");
      await tap(page, V(".fl-resume").first(), 700);
      await flagAnswer(page, true);
      await page.waitForSelector(".fl-score", { timeout: 8000 }); await sleep(300);
      await check("Flaggen Ergebnis");
      await tap(page, V(".fl-big").filter({ hasText: "Fertig" }).first(), 500);
      await tap(page, V('.fl-icon[aria-label="Fortschritt"]').first(), 800); await check("Flaggen Fortschritt");
      await tap(page, V(".fl-cell").nth(20), 300); await check("Flaggen Fortschritt Auswahl");
      await tap(page, V(".fl-back").first(), 400);
      await tap(page, V('.fl-icon[aria-label="Einstellungen"]').first(), 700); await check("Flaggen Einstellungen");
      await tap(page, V(".fl-back").first(), 400);
      await closeSheet();
      // Würfel-Trainer: Start, gemischt, läuft, gelöst, Notation offen/Eingabe, Zeiten, Lernpfad, Schritt, Zeig mir, Üben
      await openCube(page); await check("Würfel Start");
      await tap(page, V(".cz-btn").filter({ hasText: "Mischen" }).first(), 300);
      await page.waitForFunction(() => document.querySelector(".cz-timer.is-ready"), null, { timeout: 25000 }); await sleep(500);
      await check("Würfel gemischt");
      // Lösung zeigen: Leiste, Phasenübersicht, ein Zug, beenden
      await tap(page, V(".cz-pill").filter({ hasText: "Lösung zeigen" }).first(), 800); await check("Würfel Lösung");
      await tap(page, V('button[aria-label="Ein Zug weiter"]').first(), 800); await check("Würfel Lösung Zug");
      await tap(page, V(".cz-fold").filter({ hasText: "Phasen" }).first(), 400); await check("Würfel Phasen");
      await tap(page, V('button[aria-label="Wiedergabe beenden"]').first(), 500);
      await tap(page, V('button[aria-label="Züge eingeben"]').first(), 400); await check("Würfel Eingabe");
      await V(".cz-type input").first().fill("R U R'");
      await tap(page, V(".cz-go").first(), 900); await check("Würfel läuft");
      const inv = await page.evaluate(() => { const E = window.app.cube.engine; return E.formatMoves(E.invertMoves(E.parseMoves(document.querySelector(".cz-moves.is-dim") ? [...document.querySelectorAll(".cz-moves.is-dim .cz-move")].map((b) => b.textContent).join(" ") : ""))); });
      await V(".cz-type input").first().fill(inv);
      await tap(page, V(".cz-go").first(), 300);
      await page.waitForFunction(() => !window.__cube3d?.busy(), null, { timeout: 40000 }); await sleep(800);
      await check("Würfel Ende");
      await tap(page, V('button[aria-label="Zeiten"]').first(), 700); await check("Würfel Zeiten");
      await tap(page, V(".fl-back").first(), 500);
      await tap(page, V('button[aria-label="Lernpfad"]').first(), 700); await check("Würfel Lernpfad");
      await tap(page, V(".row").filter({ hasText: "Weiße Ecken" }).first(), 700); await check("Würfel Schritt");
      await tap(page, V(".cz-algo-actions .cz-btn").filter({ hasText: "Zeig mir" }).first(), 1000); await check("Würfel Zeig mir");
      await tap(page, V('button[aria-label="Wiedergabe beenden"]').first(), 500);
      await tap(page, V(".cz-algo-actions .cz-btn").filter({ hasText: "Üben" }).first(), 1000); await check("Würfel Üben");
      await closeSheet();
      rep.ok((await integrityProblems(page)).length === 0, `${tag}: Daten ungültig`);
    } catch (e) {
      await rep.fail(ctx?.page, `${tag}: Abbruch – ${String(e.message).split("\n")[0].slice(0, 200)}`, "abbruch");
    } finally { await ctx?.context.close(); }
  }
}
for (const e of engines) await e.browser.close();
const res = rep.finish({ engines: engines.map((e) => e.name), notes });
process.exit(res.failures.length ? 1 : 0);
