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
    await db.recordings.bulkAdd([
      { id: "rc1", unitId: "u1", name: "Aufnahme " + LONG, note: LONG, at: Date.now() - 86400000, duration: 83.4, size: 1500000, mime: "audio/mp4" },
      { id: "rc2", unitId: "u1", partId: "p1", name: "Takt 1–8", note: "", at: Date.now(), duration: 12, size: 300000, mime: "audio/mp4" },
      { id: "rc3", unitId: "u1", partId: "p1", name: "Zweite Aufnahme " + LONG, note: "", at: Date.now() - 3600000, duration: 30, size: 600000, mime: "audio/mp4" },
    ]);
    await db.recBlobs.bulkPut([{ id: "rc1", blob: new Blob([new Uint8Array(8)], { type: "audio/mp4" }) }, { id: "rc2", blob: new Blob([new Uint8Array(8)], { type: "audio/mp4" }) }]);
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
    // To-dos „Alle“: gemeinsame Übersicht, Datum zuerst, Herkunft pro Zeile
    const heads = await page.locator(".all-card .todo-sub").allTextContents();
    if (!heads.length || !/^Überfällig/.test(heads[0]) || !/^Heute/.test(heads[1] ?? "") || /Allgemein/.test(heads.join())) failures.push(`${width}px · Alle-Abschnitte: ${JSON.stringify(heads)}`);
    const nCards = await page.locator(".todo-card").count();
    if (nCards !== 1) failures.push(`${width}px · Alle zeigt ${nCards} Karten statt einer`);
    const origins = await page.locator(".all-card .todo-origin").count();
    if (origins < 5) failures.push(`${width}px · Herkunft je Zeile fehlt (${origins})`);
    await check("To-dos Alle");
    await page.locator(".pill.list-chip", { hasText: "Schule" }).first().click(); await page.waitForTimeout(400);
    if (await page.locator(".all-card").count()) failures.push(`${width}px · Reiter Schule zeigt noch Alle`);
    await check("To-dos Schule");
    // Suche: alle Listen, Treffer markiert, Reiter bleibt
    await page.locator('button[aria-label="To-dos durchsuchen"]:visible').first().click(); await page.waitForTimeout(400);
    await page.locator(".todo-search input").fill("kurz"); await page.waitForTimeout(400);
    const res = await page.evaluate(() => ({ rows: document.querySelectorAll(".todo-card .todo-row").length, marks: document.querySelectorAll("mark.hit").length, tab: document.querySelector(".list-chip.is-on")?.textContent }));
    if (res.rows < 2 || res.marks < 2 || !/Schule/.test(res.tab ?? "")) failures.push(`${width}px · Suche: ${JSON.stringify(res)}`);
    await check("To-dos Suche");
    await page.locator(".todo-search input").fill("qqqq"); await page.waitForTimeout(300);
    if (!(await page.locator(".search-empty").count())) failures.push(`${width}px · Suche ohne Treffer: Hinweis fehlt`);
    await check("To-dos Suche leer");
    await page.locator(".todo-search-x").click(); await page.waitForTimeout(300);
    if (await page.locator(".todo-search").count() || !/Schule/.test(await page.locator(".list-chip.is-on").textContent())) failures.push(`${width}px · Suche schließen verliert Reiter`);
    await page.locator(".pill.list-chip", { hasText: "Alle" }).first().click(); await page.waitForTimeout(300);
    await tab("Inbox"); await page.waitForTimeout(500); await check("Inbox");
    await tab("Mehr"); await page.waitForTimeout(500); await check("Mehr");
    await page.locator(".scroller:visible").last().evaluate((el) => { el.scrollTop = el.scrollHeight; }); await page.waitForTimeout(300); await check("Mehr unten");
    await page.locator(".scroller:visible").last().evaluate((el) => { el.scrollTop = 0; });
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
    const hasHero = await page.locator(".page:not(.is-covered) .hero").count();
    const hasTotal = await page.locator(".total-card").count();
    if (hasHero || !hasTotal) failures.push(`${width}px · Klavierstück: Timer-Ring statt Gesamtkarte (hero ${hasHero}, total ${hasTotal})`);
    // Raster: erstes „Lerne ich“ groß, „Neues Stück“ klein darunter
    await page.evaluate(([sid]) => window.db.units.put({ id: "u3", skillId: sid, title: "Auffrischen-Stück", status: "auffrischen", note: "", nextNote: null, order: 0, createdAt: Date.now() }), [await page.evaluate(() => window.db.units.get("u1").then((x) => x.skillId))]); await page.waitForTimeout(500);
    const gridInfo = await page.evaluate(() => { const g = document.querySelector(".page[aria-hidden='false'] .unit-grid"); if (!g) return null; const k = [...g.children]; const add = g.parentElement.querySelector(".unit-add"); const fr = k[0].getBoundingClientRect(); const sr = k[1].getBoundingClientRect(); return { n: k.length, featured: k[0].classList.contains("is-featured"), wide: fr.width > sr.width * 1.7, order: k.map((c) => c.querySelector(".unit-status")?.textContent), addH: add?.getBoundingClientRect().height, addBelow: add ? add.getBoundingClientRect().top >= k[k.length - 1].getBoundingClientRect().bottom : false, gridW: g.getBoundingClientRect().width, addW: add?.getBoundingClientRect().width }; });
    if (!gridInfo || gridInfo.n < 2 || !gridInfo.featured || !gridInfo.wide || gridInfo.order[0] !== "Lerne ich" || gridInfo.order[gridInfo.order.length - 1] !== "Auffrischen" && gridInfo.order.includes("Auffrischen") && gridInfo.order.indexOf("Auffrischen") < gridInfo.order.lastIndexOf("Lerne ich") || !(gridInfo.addH < 60) || !gridInfo.addBelow) failures.push(`${width}px · Stück-Raster: ${JSON.stringify(gridInfo)}`);
    await page.evaluate(([sid]) => window.db.units.put({ id: "u2", skillId: sid, title: "Sehr langer Stückname " + "x".repeat(60), status: "lerne", note: "", nextNote: null, order: 1, createdAt: Date.now(), hasCover: true }), [await page.evaluate(() => window.db.units.get('u1').then((x) => x.skillId))]); await page.waitForTimeout(500);
    await check("Stück-Raster (Platzhalter, Bild fehlt)");
    await page.locator(".unit-tile").first().click(); await page.waitForTimeout(800);
    await check("Unterpunkt");
    // Titelbild wählen und zuschneiden (lokal)
    const png = await page.evaluate(() => { const c = document.createElement("canvas"); c.width = 600; c.height = 400; const x = c.getContext("2d"); x.fillStyle = "#c46"; x.fillRect(0, 0, 600, 400); x.fillStyle = "#fff"; x.fillRect(200, 100, 200, 200); return c.toDataURL("image/png").split(",")[1]; });
    await page.locator('.page[aria-hidden="false"] .ucover-btn').click(); await page.waitForTimeout(400);
    await page.getByText("Aus der Mediathek wählen").click({ timeout: 3000 }).catch(() => {});
    await page.locator('input[type=file][accept="image/*"]').setInputFiles({ name: "cover.png", mimeType: "image/png", buffer: Buffer.from(png, "base64") }); await page.waitForTimeout(700);
    await check("Titelbild zuschneiden");
    await page.getByRole("button", { name: "Sichern" }).last().click(); await page.waitForTimeout(700);
    const coverState = await page.evaluate(async () => ({ n: await window.db.covers.count(), has: (await window.db.units.get("u1")).hasCover }));
    if (coverState.n !== 1 || !coverState.has) failures.push(`${width}px · Titelbild nicht gespeichert: ${JSON.stringify(coverState)}`);
    await check("Unterpunkt mit Titelbild");
    // eingeklappt → jede Zeile einzeln aufklappen und prüfen
    for (const name of ["Metronom", "Aufnahmen"]) {
      const head = page.locator('.page[aria-hidden="false"] .fold-head', { hasText: name }).first();
      await head.scrollIntoViewIfNeeded(); await head.click(); await page.waitForTimeout(350);
      await check(`Unterpunkt ${name} offen`);
    }
    // Aufnahmen: Löschen-Knopf je Zeile, „···“-Menü, Fehlerdetail beim Start (Chromium ohne Mikrofon)
    const top = page.locator('.page[aria-hidden="false"]');
    const delBtns = await top.locator(".rec-del").count();
    const moreBtn = await top.locator(".fold-more").count();
    if (delBtns < 1 || moreBtn < 1) failures.push(`${width}px · Aufnahmen: Löschen-Knopf ${delBtns}, Menü ${moreBtn}`);
    await top.locator(".rec-del").first().click(); await page.waitForTimeout(400);
    const left = await page.evaluate(() => window.db.recordings.where("unitId").equals("u1").count());
    if (left !== 2) failures.push(`${width}px · Löschen-Knopf entfernt nicht (übrig ${left})`);
    await page.locator(".toast-action").click(); await page.waitForTimeout(400);
    const back = await page.evaluate(() => window.db.recordings.where("unitId").equals("u1").count());
    if (back !== 3) failures.push(`${width}px · Rückgängig stellt nicht her (${back})`);
    await top.getByText("Aufnahme starten").click(); await page.waitForTimeout(900);
    const detailText = await top.locator(".rec-detail").first().textContent().catch(() => null);
    if (!detailText || !/Fehler: \w+/.test(detailText)) failures.push(`${width}px · Fehlerdetail fehlt: ${detailText}`);
    await check("Unterpunkt Aufnahme-Fehler");
    const recRows = await top.locator(".fold-body .row").allTextContents();
    if (recRows.some((t) => /\b\d+\s?(KB|MB)\b/.test(t)) || !recRows.some((t) => /Aufnahme/.test(t) && /(Heute, \d\d:\d\d|Gestern|Letzten|Vor \d)/.test(t))) failures.push(`${width}px · Aufnahmen-Zeilen: ${JSON.stringify(recRows.slice(0, 4))}`);
    // ohne Aufnahmen keine Größenangabe
    await page.evaluate(() => window.db.recordings.clear()); await page.waitForTimeout(500);
    const footerText = await top.locator(".fold-body .group-footer").allTextContents();
    if (footerText.some((t) => /KB Aufnahmen|MB Aufnahmen/.test(t))) failures.push(`${width}px · Größe trotz fehlender Aufnahmen: ${footerText.join("|")}`);
    await page.evaluate(() => window.db.recordings.bulkAdd([{ id: "rc1", unitId: "u1", name: "Aufnahme Test", note: "", at: Date.now(), duration: 10, size: 1500000, mime: "audio/mp4" }])); await page.waitForTimeout(500);
    // Metronom: Rad drehen (Tempo wird pro Stück gemerkt), starten und stoppen
    await page.locator('.page[aria-hidden="false"] .wheel-scroll').first().evaluate((el) => { el.scrollTop = (150 - 30) * 40; });
    await page.waitForTimeout(700);
    const unitBpm = await page.evaluate(() => window.db.units.get("u1").then((u) => u.bpm));
    if (unitBpm !== 150) failures.push(`${width}px · Stück-Tempo nicht gemerkt: ${unitBpm}`);
    await page.locator('.page[aria-hidden="false"] .metro-btn').first().click(); await page.waitForTimeout(700);
    const blinked = await page.locator('.page[aria-hidden="false"] .metro-dots i').count();
    if (blinked !== 4) failures.push(`${width}px · Metronom: ${blinked} Schlag-Punkte statt 4`);
    await check("Unterpunkt Metronom läuft");
    await page.locator('.page[aria-hidden="false"] .metro-btn').first().click(); await page.waitForTimeout(200);
    await page.locator('.page[aria-hidden="false"] .fold-head', { hasText: "Aufnahmen" }).first().click();
    await page.locator('.page[aria-hidden="false"] .fold-head', { hasText: "Metronom" }).first().click(); await page.waitForTimeout(250);
    await page.locator(".scroller:visible").last().evaluate((el) => { el.scrollTop = el.scrollHeight; }); await page.waitForTimeout(300); await check("Unterpunkt unten");
    await page.locator('.page[aria-hidden="false"] .fold-head', { hasText: "Notizen zum Stück" }).click().catch(() => {}); await page.waitForTimeout(300); await check("Unterpunkt Notizen offen");
    await page.locator(".part-main").first().click(); await page.waitForTimeout(800);
    await check("Abschnitt");
    const made = await page.evaluate(async () => {
      const c = document.createElement("canvas"); c.width = 160; c.height = 100; const ctx = c.getContext("2d"); ctx.fillStyle = "#468"; ctx.fillRect(0, 0, 160, 100);
      const thumb = c.toDataURL("image/jpeg", 0.7);
      let blob = new Blob([new Uint8Array(20)], { type: "video/mp4" }); let real = false;
      try {
        const st = c.captureStream(30); const rec = new MediaRecorder(st, { mimeType: "video/webm" }); const chunks = [];
        rec.ondataavailable = (e) => chunks.push(e.data);
        const done = new Promise((r) => (rec.onstop = r));
        rec.start(); let n = 0; const iv = setInterval(() => { ctx.fillStyle = n++ % 2 ? "#468" : "#864"; ctx.fillRect(0, 0, 160, 100); }, 40);
        await new Promise((r) => setTimeout(r, 1600)); clearInterval(iv); rec.stop(); await done;
        blob = new Blob(chunks, { type: "video/webm" }); real = blob.size > 500;
      } catch {}
      const p = await window.db.parts.get("p1"); p.clips[0].thumb = thumb; p.clips[0].duration = 12; p.clips[0].start = undefined; p.clips[0].end = undefined; await window.db.parts.put(p);
      await window.db.clipBlobs.put({ id: "c1", blob });
      return real;
    });
    await page.waitForTimeout(500);
    await page.waitForTimeout(500);
    // Clip-Zeile: Titel „Clip 1“, nur Dauer, kein Dateiname, keine Speicherangabe
    const rowTxt = await page.locator('.page[aria-hidden="false"] .clip-row').first().innerText();
    if (/\.mp4|MB|KB/.test(rowTxt) || !/Clip 1/.test(rowTxt) || !/0:12/.test(rowTxt)) failures.push(`${width}px · Clip-Zeile: ${JSON.stringify(rowTxt)}`);
    const pageTxt = await page.locator('.page-content:has(.clip-row)').first().innerText();
    if (/\d\s?(MB|KB)\b/.test(pageTxt)) failures.push(`${width}px · Abschnitt zeigt Speicherangabe: ${pageTxt.match(/.{0,30}\d\s?(MB|KB).{0,10}/)}`);
    // Clip öffnet Vollbild-Player: füllt alles, Seite dahinter gesperrt
    await page.locator('.page[aria-hidden="false"] .clip-row').first().click(); await page.waitForTimeout(700);
    const fsi = await page.evaluate(() => { const f = document.querySelector(".fsp"); if (!f) return null; const r = f.getBoundingClientRect(); const x = document.querySelector(".fsp-x")?.getBoundingClientRect(); const pts = [[2, 2], [innerWidth - 3, 2], [2, innerHeight - 3], [innerWidth - 3, innerHeight - 3], [innerWidth / 2, innerHeight - 10]]; return { top: r.top, left: r.left, w: r.width, h: r.height, ih: innerHeight, bg: getComputedStyle(f).backgroundColor, closeLeft: !!x && x.left < r.width / 2 && x.top < 140, covered: pts.every(([px, py]) => !!document.elementFromPoint(px, py)?.closest(".fsp")), locked: document.documentElement.classList.contains("has-player") && getComputedStyle(document.body).overflow === "hidden", rootHidden: getComputedStyle(document.getElementById("root")).visibility === "hidden" }; });
    if (!fsi || fsi.top !== 0 || fsi.left !== 0 || fsi.w < width - 1 || Math.abs(fsi.h - fsi.ih) > 1 || fsi.bg !== "rgb(0, 0, 0)" || !fsi.closeLeft || !fsi.covered || !fsi.locked || !fsi.rootHidden) failures.push(`${width}px · Vollbild-Player: ${JSON.stringify(fsi)}`);
    await check("Vollbild-Player");
    await page.locator(".fsp-cap", { hasText: "0,5×" }).first().click({ timeout: 2000 }).catch(() => failures.push(`${width}px · Tempo-Kapsel 0,5× fehlt`));
    const speed = await page.evaluate(() => document.querySelector(".fsp video")?.playbackRate);
    if (speed !== 0.5) failures.push(`${width}px · Tempo 0,5× nicht gesetzt: ${speed}`);
    await page.locator(".fsp-cap", { hasText: "1×" }).first().click();
    const pitch = await page.evaluate(() => { const v = document.querySelector(".fsp video"); return v ? (v.preservesPitch !== false) : null; });
    if (pitch === false) failures.push(`${width}px · Tonhöhe wird nicht erhalten`);
    if (made) {
      // Abspielen nur über den Mittelknopf; erstes Tippen aufs Video zeigt nur die Steuerung
      await page.locator(".fsp-center").click(); await page.waitForTimeout(2600);
      const st1 = await page.evaluate(() => ({ paused: document.querySelector(".fsp video").paused, ui: document.querySelector(".fsp-ui").classList.contains("is-on") }));
      if (st1.paused || st1.ui) failures.push(`${width}px · Overlay blendet nach 2 s nicht aus / Video pausiert: ${JSON.stringify(st1)}`);
      await page.mouse.click(width / 2, 200); await page.waitForTimeout(350);
      const st2 = await page.evaluate(() => ({ paused: document.querySelector(".fsp video").paused, ui: document.querySelector(".fsp-ui").classList.contains("is-on") }));
      if (st2.paused || !st2.ui) failures.push(`${width}px · Erstes Tippen soll nur Steuerung zeigen: ${JSON.stringify(st2)}`);
      // Ganzer Clip: natives Loop, läuft ohne Pause und ohne Overlay weiter
      await page.waitForTimeout(2300);
      const lp = await page.evaluate(async () => {
        const v = document.querySelector(".fsp video"); let pauses = 0; v.addEventListener("pause", () => pauses++);
        const ui = []; const o = new MutationObserver(() => ui.push(document.querySelector(".fsp-ui").classList.contains("is-on"))); o.observe(document.querySelector(".fsp-ui"), { attributes: true });
        await new Promise((r) => setTimeout(r, 3400)); o.disconnect();
        return { loop: v.loop, paused: v.paused, pauses, uiOn: ui.includes(true), count: document.querySelector(".fsp-count").textContent, dur: v.duration };
      });
      if (!lp.loop || lp.paused || lp.pauses || lp.uiOn || !/^\d+× in der Schleife$/.test(lp.count)) failures.push(`${width}px · Dauerschleife (ganzer Clip): ${JSON.stringify(lp)}`);
      // Ausschnitt: Rücksprung ohne pause/play, Overlay bleibt weg
      await page.locator(".fsp-hit").click(); await page.waitForTimeout(400);
      await page.locator('.fsp-btn[aria-label="Ausschnitt"]').click(); await page.waitForTimeout(300);
      await page.evaluate(() => { const [s, e] = document.querySelectorAll(".fsp-trim input"); const set = (el, val) => { const d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value"); d.set.call(el, String(val)); el.dispatchEvent(new Event("change", { bubbles: true })); }; set(e, 0.8); set(s, 0.2); });
      await page.locator('.fsp-btn[aria-label="Ausschnitt"]').click(); await page.waitForTimeout(400);
      await page.mouse.click(width / 2, 200); await page.waitForTimeout(2400);
      const tr = await page.evaluate(async () => {
        const v = document.querySelector(".fsp video"); let pauses = 0, plays = 0; v.addEventListener("pause", () => pauses++); v.addEventListener("play", () => plays++);
        let maxT = 0, minAfter = 9; const t0 = performance.now();
        await new Promise((res) => { const f = () => { maxT = Math.max(maxT, v.currentTime); if (performance.now() - t0 > 2500) res(); else requestAnimationFrame(f); }; f(); });
        const ui = document.querySelector(".fsp-ui").classList.contains("is-on");
        return { loop: v.loop, paused: v.paused, pauses, plays, ui, maxT };
      });
      if (tr.loop || tr.paused || tr.pauses || tr.plays || tr.ui || tr.maxT > 0.95) failures.push(`${width}px · Schleife mit Ausschnitt: ${JSON.stringify(tr)}`);
      // Pause nur über den Mittelknopf
      await page.mouse.click(width / 2, 200); await page.waitForTimeout(350);
      await page.locator(".fsp-center").click(); await page.waitForTimeout(300);
      if (!(await page.evaluate(() => document.querySelector(".fsp video").paused))) failures.push(`${width}px · Mittelknopf pausiert nicht`);
      const stillUi = await page.evaluate(async () => { await new Promise((r) => setTimeout(r, 2500)); return document.querySelector(".fsp-ui").classList.contains("is-on"); });
      if (!stillUi) failures.push(`${width}px · Steuerung blendet im Pausenzustand aus`);
      await page.evaluate(() => window.db.parts.get("p1").then((p) => { p.clips[0].start = undefined; p.clips[0].end = undefined; return window.db.parts.put(p); }));
    } else console.log(`${width}px · Hinweis: Chromium konnte kein Test-Video aufnehmen, Schleifen-Prüfung übersprungen`);
    await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(400);
    await check("Vollbild-Player quer");
    const fsl = await page.evaluate(() => { const f = (document.querySelector(".fsp") ?? document.body).getBoundingClientRect(); return { w: f.width, h: f.height, ih: innerHeight, sw: document.documentElement.scrollWidth }; });
    if (fsl.sw > 845 || Math.abs(fsl.h - fsl.ih) > 1) failures.push(`${width}px · Player quer: ${JSON.stringify(fsl)}`);
    await page.setViewportSize({ width, height: 800 }); await page.waitForTimeout(300);
    // Schließen: Tippen auf X; der Geister-Klick darf die Seite dahinter (Zurück-Knopf unter dem X) nicht treffen
    await page.mouse.click(width / 2, 300); await page.waitForTimeout(300);
    const xb = await page.locator(".fsp-x").boundingBox();
    await page.mouse.click(xb.x + xb.width / 2, xb.y + xb.height / 2); await page.waitForTimeout(150);
    if (await page.locator(".fsp").count()) failures.push(`${width}px · Player lässt sich nicht schließen`);
    await page.waitForTimeout(500);
    if (!(await page.locator('.page[aria-hidden="false"] .clip-row').count())) failures.push(`${width}px · Geister-Klick nach dem Schließen hat die Seite dahinter getroffen`);
    const rootBack = await page.evaluate(() => getComputedStyle(document.getElementById("root")).visibility !== "hidden" && !document.documentElement.classList.contains("has-player"));
    if (!rootBack) failures.push(`${width}px · Seite nach Schließen noch gesperrt`);
    // Umbenennen per Menü
    await page.locator('.page[aria-hidden="false"] .clip-more').first().click(); await page.waitForTimeout(400);
    await page.getByText("Umbenennen").click({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(400);
    await check("Clip umbenennen");
    await page.locator(".sheet input, .sheet textarea").last().fill("Rechte Hand"); await page.getByRole("button", { name: "Sichern" }).last().click(); await page.waitForTimeout(500);
    const renamed = await page.evaluate(() => window.db.parts.get("p1").then((p) => p.clips[0].title));
    if (renamed !== "Rechte Hand") failures.push(`${width}px · Clip nicht umbenannt: ${renamed}`);
    for (const name of ["Metronom", "Aufnahmen"]) {
      const head = page.locator('.page[aria-hidden="false"] .fold-head', { hasText: name }).first();
      await head.scrollIntoViewIfNeeded(); await head.click(); await page.waitForTimeout(350);
      await check(`Abschnitt ${name} offen`);
    }
    await page.locator('.page[aria-hidden="false"] .wheel-scroll').first().evaluate((el) => { el.scrollTop = (96 - 30) * 40; });
    await page.waitForTimeout(700);
    const partBpm = await page.evaluate(() => window.db.parts.get("p1").then((p) => p.bpm));
    if (partBpm !== 96) failures.push(`${width}px · Abschnitt-Tempo nicht gemerkt: ${partBpm}`);
    const unitStill = await page.evaluate(() => window.db.units.get("u1").then((u) => u.bpm));
    if (unitStill !== 150) failures.push(`${width}px · Stück-Standard wurde überschrieben: ${unitStill}`);
    await page.locator(".scroller:visible").last().evaluate((el) => { el.scrollTop = el.scrollHeight; }); await page.waitForTimeout(300); await check("Abschnitt unten");
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
