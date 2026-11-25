// Große Datenmengen: 500 Einträge, 2000 To-dos, 5000 Sessions, 60 Stücke, 300 Abschnitte, 400 Aufnahmen-Metadaten.
// Gemessen werden Start, Seitenwechsel, Scrollen (Bildzeiten) und Suche bei 4-fach gedrosselter CPU (Handy-Näherung).
import { buildDist, launchEngines, openApp, Report, sleep, tabTap, tap } from "./lib.mjs";

const dist = buildDist();
const { engines } = await launchEngines();
const eng = engines.find((e) => e.name === "chromium");
const rep = new Report("perf");
const THROTTLE = Number(process.env.THROTTLE || 4);
const results = {};

const { context, page, errors } = await openApp(dist, eng, { width: 390, height: 844 });
const cdp = await context.newCDPSession(page);

const data = await page.evaluate(async () => {
  const cats = ["Kopf: Rechnen, Gedächtnis & Denken", "Körper & Sport", "Natur, Erde & Himmel", "Kreativ & Alltag", "Sprachen"];
  const now = Date.now();
  const skills = Array.from({ length: 500 }, (_, i) => ({ id: `s${i}`, name: `Skill ${i} lernen`, title: `Skill ${i}`, kategorie: cats[i % cats.length], typ: i % 12 === 0 ? "gewohnheit" : "skill", status: ["lerne", "idee", "rausfinden", "kann"][i % 4], createdAt: now - i * 1000 }));
  const todos = Array.from({ length: 2000 }, (_, i) => ({ id: `t${i}`, listId: ["inbox", "allgemein", "schule"][i % 3], text: `To-do ${i} Zahnarzt Einkaufen Mathe`, due: i % 5 === 0 ? new Date(now + (i % 20) * 86400000).toISOString().slice(0, 10) : null, done: i % 7 === 0, doneAt: i % 7 === 0 ? now : null, createdAt: now - i * 500 }));
  const sessions = Array.from({ length: 5000 }, (_, i) => ({ id: `x${i}`, skillId: `s${(i * 7) % 500}`, start: now - i * 3600000, minutes: 10 + (i % 40) }));
  const units = Array.from({ length: 60 }, (_, i) => ({ id: `u${i}`, skillId: "s1", title: `Stück ${i}`, status: "lerne", note: "", nextNote: null, order: i, createdAt: now - i }));
  const parts = Array.from({ length: 300 }, (_, i) => ({ id: `p${i}`, unitId: `u${i % 60}`, name: `Abschnitt ${i}`, order: i, notes: [], links: [], clips: [] }));
  const recordings = Array.from({ length: 400 }, (_, i) => ({ id: `r${i}`, unitId: `u${i % 60}`, partId: `p${i % 300}`, at: now - i * 1000, name: `Aufnahme ${i}`, seconds: 30, bytes: 1000, mime: "audio/mp4" }));
  const checks = Array.from({ length: 1500 }, (_, i) => ({ id: `s${(i % 40) * 12}|d${i}`, skillId: `s${(i % 40) * 12}`, date: new Date(now - (i % 120) * 86400000).toISOString().slice(0, 10) }));
  await window.app.logic.restoreBackup({ format: "skill-app-backup", version: 5, exportedAt: new Date().toISOString(), skills, todos, sessions, units, parts, recordings, checks });
  return { skills: await window.db.skills.count(), todos: await window.db.todos.count(), sessions: await window.db.sessions.count() };
});
console.log("Daten:", JSON.stringify(data));

await cdp.send("Emulation.setCPUThrottlingRate", { rate: THROTTLE });

/** Bildzeiten während eines Scroll-Laufs: Anzahl Bilder über 50 ms und längstes Bild */
const scrollRun = () => page.evaluate(async () => {
  const el = [...document.querySelectorAll(".scroller")].find((e) => e.getBoundingClientRect().width > 0 && e.scrollHeight > e.clientHeight + 50) ?? document.scrollingElement;
  const frames = [];
  let last = performance.now();
  await new Promise((resolve) => {
    let n = 0;
    const step = () => {
      const t = performance.now();
      frames.push(t - last); last = t;
      el.scrollTop += 220; n++;
      if (n < 40) requestAnimationFrame(step); else resolve();
    };
    requestAnimationFrame(step);
  });
  el.scrollTop = 0;
  const slow = frames.filter((f) => f > 50).length;
  return { frames: frames.length, slow, max: Math.round(Math.max(...frames)) };
});

const t0 = Date.now();
await page.reload();
await page.waitForFunction(() => window.db && window.app && document.querySelector(".tabbar") && document.querySelector(".acard, .row"), null, { timeout: 60000 });
results.startMs = Date.now() - t0;

const visit = async (name, tab, ready) => {
  const t = Date.now();
  await tabTap(page, tab);
  await page.locator(ready).locator("visible=true").first().waitFor({ timeout: 30000 });
  results[`${name}Ms`] = Date.now() - t;
};
await visit("heute", "Heute", ".large-title");
await visit("todos", "To-dos", ".swipe");
results.todoRows = await page.locator(".swipe").locator("visible=true").count();
const more = page.locator(".more-rows").locator("visible=true");
results.moreButtons = await more.count();
if (results.moreButtons) { await more.first().scrollIntoViewIfNeeded(); await more.first().click(); await sleep(600); results.todoRowsAfterMore = await page.locator(".swipe").locator("visible=true").count(); }
results.todoScroll = await scrollRun();
// Suche
const tS = Date.now();
await tap(page, page.locator('button[aria-label="To-dos durchsuchen"]:visible').first(), 100);
await page.locator(".todo-search input").fill("Mathe 19");
await page.waitForFunction(() => [...document.querySelectorAll(".swipe")].filter((e) => e.getBoundingClientRect().width > 0).length < 600, null, { timeout: 30000 });
results.todoSearchMs = Date.now() - tS;
await page.reload();
await page.waitForFunction(() => window.db && document.querySelector(".tabbar"), null, { timeout: 60000 });
await tabTap(page, "Übersicht");
await visit("uebersicht", "Übersicht", ".acard, .row");
// Alle Einträge (500) über „Mehr“/Übersicht
await visit("statistik", "Mehr", ".row");

await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
console.log(JSON.stringify(results, null, 1));

const budget = (name, value, max) => rep.ok(value <= max, `${name}: ${value} (Budget ${max})`);
budget("Start bis Inhalt (ms, gedrosselt)", results.startMs, 12000);
budget("To-dos öffnen (ms)", results.todosMs, 4000);
budget("Heute öffnen (ms)", results.heuteMs, 5000);
rep.ok(results.moreButtons > 0 && results.todoRowsAfterMore > results.todoRows, "„Weitere anzeigen“ zeigt mehr Zeilen");
budget("To-do-Zeilen im DOM", results.todoRows, 400);
budget("To-dos Scrollen: Bilder über 50 ms", results.todoScroll.slow, 5);
budget("To-dos Scrollen: längstes Bild (ms)", results.todoScroll.max, 150);
budget("To-do-Suche (ms)", results.todoSearchMs, 6000);
budget("Übersicht öffnen (ms)", results.uebersichtMs, 8000);
rep.ok(errors.length === 0, `Konsole: ${errors.join(" | ").slice(0, 200)}`);
await context.close(); await eng.browser.close();
const res = rep.finish({ results });
process.exit(res.failures.length ? 1 : 0);
