// Layout-Matrix: Hauptseiten in beiden Motoren, 375/390/430 px, Hoch- und Querformat, hell und dunkel.
// Prüft je Seite: kein seitliches Verschieben, nichts außerhalb, nichts überlappt, Tippflächen erreichbar, Tab-Leiste erreichbar, keine Konsolenfehler, Daten gültig.
import { buildDist, launchEngines, openApp, Report, layoutProblems, integrityProblems, matrix, seedRich, tap, tabTap, sleep } from "./lib.mjs";

const dist = buildDist();
const { engines, notes } = await launchEngines();
for (const n of notes) console.log("Hinweis: " + n);
const rep = new Report("matrix");
const full = process.env.QUICK ? false : true;

for (const eng of engines) {
  for (const combo of matrix(full)) {
    const tag = `${eng.name} ${combo.label}`;
    let ctx;
    try {
      ctx = await openApp(dist, eng, combo);
      const { page, errors } = ctx;
      await seedRich(page);
      await sleep(400);
      const check = async (name) => {
        await sleep(250);
        const probs = await layoutProblems(page);
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
      rep.ok((await integrityProblems(page)).length === 0, `${tag}: Daten ungültig`);
    } catch (e) {
      await rep.fail(ctx?.page, `${tag}: Abbruch – ${String(e.message).split("\n")[0].slice(0, 200)}`, "abbruch");
    } finally { await ctx?.context.close(); }
  }
}
for (const e of engines) await e.browser.close();
const res = rep.finish({ engines: engines.map((e) => e.name), notes });
process.exit(res.failures.length ? 1 : 0);
