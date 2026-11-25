// Fehler-Tests: jeder gemeldete Fehler hat hier einen Test, der ihn reproduziert.
// Aufruf: node tests/browser/bugs.mjs   (DARK=1 dunkel, DIST=<Ordner> nutzt einen vorhandenen Test-Build)
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require("playwright-core")); }
const root = path.resolve(import.meta.dirname, "../..");
const dist = process.env.DIST || fs.mkdtempSync(path.join(os.tmpdir(), "skills-bugs-"));
if (!process.env.DIST) execFileSync("npx", ["vite", "build", "--outDir", dist, "--emptyOutDir"], { cwd: root, stdio: "ignore", env: { ...process.env, PUBLIC_BUILD: "1", VITE_EXPOSE: "1" } });
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webmanifest": "application/manifest+json" };
const failures = [];
const only = process.env.ONLY ? process.env.ONLY.split(",") : null;
const wants = (n) => !only || only.includes(n);

async function open(viewport = { width: 390, height: 844 }) {
  const browser = globalThis.__browser;
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2, hasTouch: true, isMobile: true, serviceWorkers: "block", colorScheme: process.env.DARK ? "dark" : "light" });
  await context.route("https://skills.test/**", (route) => {
    let p = new URL(route.request().url()).pathname;
    if (p === "/") p = "/index.html";
    const f = path.join(dist, p);
    if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: "" });
    route.fulfill({ status: 200, contentType: types[path.extname(f)] ?? "application/octet-stream", body: fs.readFileSync(f) });
  });
  const page = await context.newPage();
  await page.goto("https://skills.test/");
  await page.waitForFunction(() => window.db && window.__toast);
  return { context, page };
}

/** Echte Touch-Geste über CDP: Start, Bewegung, optional halten (Hook), Ende. */
async function touchSwipe(page, cdp, x0, y, dx, { hold } = {}) {
  const send = (type, x) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });
  await send("touchStart", x0);
  for (let i = 1; i <= 8; i++) { await send("touchMove", x0 + (dx * i) / 8); await page.waitForTimeout(16); }
  if (hold) await hold();
  await send("touchEnd", x0 + dx);
}

const rowBox = async (page, text) => {
  const loc = page.locator(".todo-card .todo-row", { hasText: text }).first();
  await loc.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(150);
  return loc.boundingBox();
};

async function seedTodos(page) {
  await page.evaluate(async () => {
    const lists = await window.db.lists.toArray();
    for (const t of ["Klavierspielen", "Rubik's Cube", "Zahnarzt"]) { await window.app.logic.addTodo(t, lists[0].id, null); await new Promise((r) => setTimeout(r, 8)); }
  });
  await page.locator(".tabbar").getByText("To-dos", { exact: true }).tap();
  await page.waitForTimeout(700);
}
const todo = (page, text) => page.evaluate((t) => window.db.todos.filter((x) => x.text === t).first(), text);

async function todoTests() {
  const { context, page } = await open();
  const cdp = await context.newCDPSession(page);
  await seedTodos(page);

  // 1a) Die Zeile trägt die To-do-ID (data-id), damit die Geste an der ID hängt
  if (wants("1a")) {
    const ids = await page.evaluate(async () => { const rows = [...document.querySelectorAll(".todo-card .swipe")]; const all = await window.db.todos.toArray(); return { n: rows.length, ok: rows.every((r) => all.some((t) => t.id === r.dataset.id)) }; });
    if (!ids.n || !ids.ok) failures.push(`1a · Zeilen ohne data-id der To-do-ID: ${JSON.stringify(ids)}`);
  }

  // 1b) Während einer Geste wird die Liste nicht neu sortiert/gerendert; die Aktion trifft die berührte Zeile
  if (wants("1b")) {
    const b = await rowBox(page, "Rubik");
    const before = await page.locator(".todo-card .todo-row .row-title").allTextContents();
    let during = [];
    await touchSwipe(page, cdp, b.x + b.width / 2, b.y + b.height / 2, 150, {
      hold: async () => {
        await page.evaluate(async () => { const lists = await window.db.lists.toArray(); await window.db.todos.add({ id: "neu-oben", listId: lists[0].id, text: "Neu oben", due: null, done: false, doneAt: null, createdAt: 1, upd: Date.now() }); });
        await page.waitForTimeout(350);
        during = await page.locator(".todo-card .todo-row .row-title").allTextContents();
      },
    });
    await page.waitForTimeout(1000);
    if (JSON.stringify(during) !== JSON.stringify(before)) failures.push(`1b · Liste wurde während der Geste neu gerendert: ${JSON.stringify(before)} → ${JSON.stringify(during)}`);
    const [r, k, z] = await Promise.all([todo(page, "Rubik's Cube"), todo(page, "Klavierspielen"), todo(page, "Zahnarzt")]);
    if (!r.due || k.due || z.due) failures.push(`1b · Aktion traf die falsche Zeile: Rubik ${r.due}, Klavier ${k.due}, Zahnarzt ${z.due}`);
    const after = await page.locator(".todo-card .todo-row .row-title").allTextContents();
    if (!after.includes("Neu oben")) failures.push("1b · Liste rückt nach der Geste nicht nach");
    await page.evaluate(async () => { await window.db.todos.delete("neu-oben"); await window.db.todos.filter((t) => t.text === "Rubik's Cube").modify({ due: null }); });
    await page.waitForTimeout(500);
  }

  // 1c) Geister-Klick: nach dem Wischen rückt die Zeile darunter unter den Finger; ein Klick dort darf nichts auslösen
  if (wants("1c")) {
    const b = await rowBox(page, "Klavierspielen");
    const y = b.y + b.height / 2;
    await touchSwipe(page, cdp, b.x + b.width / 2, y, 150);
    await page.waitForTimeout(260);
    await page.evaluate(({ x, y }) => { const el = document.elementFromPoint(x, y); el?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1, clientX: x, clientY: y })); }, { x: b.x + 30, y });
    await page.waitForTimeout(1100);
    const state = await page.evaluate(async () => ({ done: await window.db.todos.filter((t) => t.done).count(), sheet: document.querySelectorAll(".sheet-layer.is-shown").length }));
    if (state.done || state.sheet) failures.push(`1c · Geister-Klick nach dem Wischen: ${JSON.stringify(state)}`);
    await page.evaluate(() => window.db.todos.filter((t) => t.text === "Klavierspielen").modify({ due: null, done: false, doneAt: null }));
    await page.waitForTimeout(500);
  }

  // 1d) Erledigt nur durch echten Tap (pointerdown + pointerup auf demselben Haken)
  if (wants("1d")) {
    await page.waitForTimeout(400);
    const synthetic = await page.evaluate(() => { const c = [...document.querySelectorAll(".todo-card .check")][0]; c.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail: 1 })); return true; });
    await page.waitForTimeout(1000);
    const d1 = await page.evaluate(() => window.db.todos.filter((t) => t.done).count());
    if (synthetic && d1) failures.push("1d · Klick ohne pointerdown am Haken erledigt ein To-do");
    await page.locator(".todo-card .check").first().evaluate((el) => el.scrollIntoView({ block: "center" })); await page.waitForTimeout(200);
    const cb = await page.locator(".todo-card .check").first().boundingBox();
    await page.touchscreen.tap(cb.x + cb.width / 2, cb.y + cb.height / 2);
    await page.waitForTimeout(1100);
    const d2 = await page.evaluate(() => window.db.todos.filter((t) => t.done).count());
    if (d2 !== 1) failures.push(`1d · Echter Tap auf den Haken erledigt nicht genau ein To-do (${d2})`);
  }
  await context.close();
}

async function uiTests() {
  const { context, page } = await open();
  await seedTodos(page);
  // 3) Toast: mittig, über der Tab-Leiste, passende Breite, einer gleichzeitig, nach 4 s weg
  if (wants("3")) {
    const measure = () => page.evaluate(() => {
      const ts = [...document.querySelectorAll(".toast")]; const t = document.querySelector(".toast.is-shown"); const tb = document.querySelector(".tabbar").getBoundingClientRect();
      if (!t) return { none: true, count: ts.length };
      const r = t.getBoundingClientRect();
      return { count: ts.length, shown: document.querySelectorAll(".toast.is-shown").length, cx: r.left + r.width / 2, vw: innerWidth, w: r.width, h: r.height, left: r.left, right: r.right, bottom: r.bottom, tabTop: tb.top, z: Number(getComputedStyle(t).zIndex) };
    });
    const check = (name, m, vw) => {
      if (m.none) return failures.push(`3 · ${name}: kein Toast sichtbar`);
      if (Math.abs(m.cx - vw / 2) > 1.5 || m.w > vw * 0.9 + 1 || m.left < 0 || m.right > vw || m.bottom > m.tabTop - 2 || m.h > 72 || m.shown !== 1 || m.count !== 1 || m.z <= 200) failures.push(`3 · ${name}: ${JSON.stringify(m)}`);
    };
    await page.evaluate(() => window.__toast("Aufnahme gespeichert – nur auf diesem Gerät, kein Upload."));
    await page.waitForTimeout(700);
    const long = await measure();
    check("langer Hinweis", long, 390);
    if (long.w < 390 * 0.6) failures.push(`3 · Hinweis ist in eine schmale Spalte gequetscht: ${Math.round(long.w)} px bei 390 px`);
    await page.evaluate(() => window.__toast("Auf morgen verschoben", { label: "Rückgängig", run() {} }));
    await page.waitForTimeout(700);
    check("Hinweis mit Rückgängig", await measure(), 390);
    await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(500);
    await page.evaluate(() => window.__toast("Aufnahme gelöscht", { label: "Rückgängig", run() {} }));
    await page.waitForTimeout(700);
    check("Querformat", await measure(), 844);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(4600);
    const gone = await page.evaluate(() => document.querySelectorAll(".toast.is-shown").length);
    if (gone) failures.push("3 · Hinweis verschwindet nicht nach 4 s");
  }
  // 3b) Läuft ein Timer, schwebt der Mini-Timer über der Tab-Leiste: der Hinweis darf ihn nicht überdecken (Affentest-Fund)
  if (wants("3")) {
    await page.evaluate(async () => { const s = await window.app.logic.createSkill({ name: "Timerskill", kategorie: "Körper & Sport", typ: "skill", status: "lerne" }); await window.app.logic.startTimer(s.id); });
    await page.waitForSelector(".mini.is-shown", { timeout: 4000 }).catch(() => {});
    await page.evaluate(() => window.__toast("„Skill 2“ geschafft", { label: "Rückgängig", run() {} }));
    await page.waitForTimeout(800);
    const o = await page.evaluate(() => { const t = document.querySelector(".toast.is-shown")?.getBoundingClientRect(); const m = document.querySelector(".mini.is-shown .mini-inner")?.getBoundingClientRect(); return t && m ? { overlap: Math.min(t.bottom, m.bottom) - Math.max(t.top, m.top) > 2, t: [t.top, t.bottom], m: [m.top, m.bottom] } : { missing: !!t + "/" + !!m }; });
    if (o.missing || o.overlap) failures.push(`3b · Hinweis überdeckt den Mini-Timer: ${JSON.stringify(o)}`);
    await page.evaluate(async () => { const s = await window.db.skills.filter((x) => x.timerStart != null).first(); if (s) await window.app.logic.stopTimer(s.id); });
    await page.waitForTimeout(500);
  }
  // 4) Keine blaue Textauswahl außer in Eingabefeldern und Notiz-Texten
  if (wants("4")) {
    const res = await page.evaluate(() => {
      const us = (cls, tag = "div") => { const e = document.createElement(tag); if (cls) e.className = cls; document.body.appendChild(e); const cs = getComputedStyle(e); const v = [cs.userSelect, cs.webkitUserSelect, cs.getPropertyValue("-webkit-touch-callout")]; e.remove(); return v; };
      const must = ["row", "row-title", "tile", "acard", "fold-head", "unit-tile", "large-title", "fsp", "pill", "tab", "group-header", "todo-card", "sheet-title", "toast", "clip-row", "fold-title"];
      const bad = must.filter((c) => { const [u, w] = us(c); return u !== "none" || w !== "none"; }).map((c) => c);
      const btn = us("", "button"); const h = us("", "h1");
      if (btn[0] !== "none") bad.push("button");
      if (h[0] !== "none") bad.push("h1");
      const sel = ["input", "textarea"].filter((t) => us("", t)[0] === "none"); const note = us("note-text")[0] === "none" ? ["note-text"] : [];
      return { bad, sel: [...sel, ...note] };
    });
    if (res.bad.length) failures.push(`4 · Auswahl nicht gesperrt: ${res.bad.join(", ")}`);
    if (res.sel.length) failures.push(`4 · Auswahl in Eingabe/Notiz gesperrt: ${res.sel.join(", ")}`);
  }
  // 5) Datum in To-do-Zeilen wird nie abgeschnitten
  if (wants("5")) {
    await page.evaluate(async () => {
      const lists = await window.db.lists.toArray(); const L = window.app.logic;
      const long = "Ein sehr langer Titel ohne Pause Superkalifragilistischexpialigetisch und noch viel mehr Text dahinter";
      await L.addTodo(long + " heute", lists[0].id, L.dayKey(new Date()));
      await L.addTodo(long + " gestern", lists[0].id, L.dayKey(L.addDays(new Date(), -1)));
      await L.addTodo(long + " später", lists[1].id, L.dayKey(L.addDays(new Date(), 20)));
    });
    await page.waitForTimeout(700);
    const res = await page.evaluate(() => [...document.querySelectorAll(".todo-card .todo-row")].map((row) => {
      const d = row.querySelector(".row-detail"); const t = row.querySelector(".row-title"); if (!d) return null;
      const dr = d.getBoundingClientRect(), tr = t.getBoundingClientRect(), rr = row.getBoundingClientRect();
      return { text: d.textContent, cut: d.scrollWidth > d.clientWidth + 0.5, outside: dr.right > rr.right + 0.5, under: tr.right > dr.left + 1 && tr.bottom > dr.top && tr.top < dr.bottom, w: Math.round(dr.width) };
    }).filter(Boolean));
    const inList = async (name) => page.evaluate(() => [...document.querySelectorAll(".todo-card .todo-row, .page-content .todo-row, .group-body .row")].filter((r) => r.offsetParent && r.querySelector(".row-detail")).map((row) => {
      const d = row.querySelector(".row-detail"); const t = row.querySelector(".row-title"); const dr = d.getBoundingClientRect(), tr = t.getBoundingClientRect(), rr = row.getBoundingClientRect();
      return { text: d.textContent, cut: d.scrollWidth > d.clientWidth + 0.5, outside: dr.right > rr.right + 0.5, under: tr.right > dr.left + 1 && tr.bottom > dr.top && tr.top < dr.bottom, w: Math.round(dr.width) };
    }));
    await page.locator(".list-chip", { hasText: "Allgemein" }).first().tap(); await page.waitForTimeout(500);
    res.push(...(await inList("Allgemein")));
    await page.locator(".tabbar").getByText("Heute", { exact: true }).tap(); await page.waitForTimeout(700);
    res.push(...(await inList("Heute")));
    const bad = res.filter((r) => r.cut || r.outside || r.under);
    if (!res.length) failures.push("5 · keine Zeilen mit Datum gefunden");
    if (bad.length) failures.push(`5 · Datum abgeschnitten/überlagert: ${JSON.stringify(bad)}`);
  }
  await context.close();
}

const hitTap = (page) => page.evaluate(() => ({ x: 30, y: innerHeight * 0.45 })).then(({ x, y }) => page.touchscreen.tap(x, y));

async function playerTest() {
  const { context, page } = await open();
  // Test-Clip (echtes Video) und Stück/Abschnitt anlegen
  await page.evaluate(async () => {
    const s = await window.app.logic.createSkill({ name: "Learn piano song", title: "Klavierstück", kategorie: "Kreativ & Alltag", typ: "skill", status: "lerne" });
    const u = await window.app.units.createUnit(s.id, "Stück");
    const p = await window.app.units.createPart(u.id, "Intro");
    const c = document.createElement("canvas"); c.width = 160; c.height = 100; const ctx = c.getContext("2d");
    const rec = new MediaRecorder(c.captureStream(30), { mimeType: "video/webm" }); const chunks = []; rec.ondataavailable = (e) => chunks.push(e.data);
    const done = new Promise((r) => (rec.onstop = r)); rec.start(); let n = 0; const iv = setInterval(() => { ctx.fillStyle = n++ % 2 ? "#468" : "#864"; ctx.fillRect(0, 0, 160, 100); }, 40);
    await new Promise((r) => setTimeout(r, 1500)); clearInterval(iv); rec.stop(); await done;
    const blob = new Blob(chunks, { type: "video/webm" });
    await window.db.parts.update(p.id, { clips: [{ id: "c1", name: "x", size: blob.size, addedAt: Date.now(), duration: 1.5 }] });
    await window.db.clipBlobs.put({ id: "c1", blob });
  });
  const tap = async (loc) => { await loc.evaluate((el) => el.scrollIntoView({ block: "center" })); await page.waitForTimeout(120); const b = await loc.boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(800); };
  await tap(page.locator(".tabbar").getByText("Übersicht", { exact: true }));
  await tap(page.locator('text="Klavierstück" >> visible=true').first());
  await tap(page.locator(".page[aria-hidden='false'] .unit-tile").first());
  await tap(page.locator(".part-main").first());
  await tap(page.locator(".page[aria-hidden='false'] .clip-row").first());
  if (!(await page.locator(".fsp").count())) { failures.push("2 · Player ließ sich nicht öffnen"); return context.close(); }
  // quer, Schleife aus, Clip läuft zu Ende
  await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(500);
  await hitTap(page); await page.waitForTimeout(300);
  const loopBtn = page.locator('.fsp-btn[aria-label="Dauerschleife"]');
  await loopBtn.tap(); await page.waitForTimeout(200);
  await page.locator(".fsp-center").tap(); await page.waitForTimeout(2600);
  const ended = await page.evaluate(() => ({ paused: document.querySelector(".fsp video").paused, ui: document.querySelector(".fsp-ui").classList.contains("is-on"), loop: document.querySelector(".fsp video").loop }));
  if (!ended.paused || !ended.ui || ended.loop) failures.push(`2 · Ende ohne Schleife: Overlay/Pause falsch ${JSON.stringify(ended)}`);
  // zurück ins Hochformat: alles muss antippbar bleiben, Layout passt
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(600);
  const lay = await page.evaluate(() => { const f = document.querySelector(".fsp").getBoundingClientRect(); const x = document.querySelector(".fsp-x").getBoundingClientRect(); const hit = document.elementFromPoint(x.left + x.width / 2, x.top + x.height / 2); return { w: f.width, h: f.height, iw: innerWidth, ih: innerHeight, xHit: !!hit?.closest(".fsp-x"), locked: document.documentElement.classList.contains("has-player") }; });
  if (Math.abs(lay.w - lay.iw) > 1 || Math.abs(lay.h - lay.ih) > 1 || !lay.xHit) failures.push(`2 · Hochformat nach Drehen: ${JSON.stringify(lay)}`);
  // Play startet wieder von vorn, alle Knöpfe reagieren
  await page.locator(".fsp-center").tap(); await page.waitForTimeout(500);
  const restarted = await page.evaluate(() => { const v = document.querySelector(".fsp video"); return { paused: v.paused, t: v.currentTime }; });
  if (restarted.paused || restarted.t > 1.2) failures.push(`2 · Play nach Ende startet nicht von vorn: ${JSON.stringify(restarted)}`);
  await page.locator('.fsp-cap', { hasText: "0,5×" }).tap(); await page.waitForTimeout(200);
  const rate = await page.evaluate(() => document.querySelector(".fsp video").playbackRate);
  if (rate !== 0.5) failures.push(`2 · Tempo-Knopf reagiert nach Drehen nicht (${rate})`);
  // Drehen mehrfach hintereinander (auch während der 350-ms-Sperre) darf nichts blockieren
  for (let i = 0; i < 2; i++) { await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(150); await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(150); }
  await page.waitForTimeout(500);
  if (!(await page.evaluate(() => document.querySelector(".fsp-ui").classList.contains("is-on")))) { await hitTap(page); await page.waitForTimeout(300); }
  const xb = await page.locator(".fsp-x").boundingBox();
  await page.touchscreen.tap(xb.x + xb.width / 2, xb.y + xb.height / 2); await page.waitForTimeout(700);
  if (await page.locator(".fsp").count()) failures.push("2 · X schließt den Player nach Drehen nicht");
  const clean = await page.evaluate(() => ({ cls: document.documentElement.classList.contains("has-player"), rootVis: getComputedStyle(document.getElementById("root")).visibility, bodyOv: getComputedStyle(document.body).overflow, lock: document.documentElement.dataset.inputLock ?? null }));
  if (clean.cls || clean.rootVis === "hidden") failures.push(`2 · Sperre/Scroll-Lock bleibt nach Schließen: ${JSON.stringify(clean)}`);
  await page.waitForTimeout(500);
  // danach müssen Zeilen auf der Seite tippbar sein
  const rb = await page.locator(".page[aria-hidden='false'] .clip-row").first().boundingBox();
  await page.touchscreen.tap(rb.x + rb.width / 2, rb.y + rb.height / 2); await page.waitForTimeout(700);
  if (!(await page.locator(".fsp").count())) failures.push("2 · Zeile auf der Seite reagiert nach Schließen nicht");
  await hitTap(page); await page.waitForTimeout(300);
  const xb2 = await page.locator(".fsp-x").boundingBox(); await page.touchscreen.tap(xb2.x + xb2.width / 2, xb2.y + xb2.height / 2); await page.waitForTimeout(900);
  // Schließen und sofort wieder Drehen: Sperre hebt sich in jedem Fall auf
  await page.setViewportSize({ width: 844, height: 390 }); await page.waitForTimeout(500);
  const lockLeft = await page.evaluate(() => { const el = document.elementFromPoint(innerWidth / 2, innerHeight / 2); return el?.closest(".fsp") ? "fsp" : (document.documentElement.dataset.inputLock ?? "frei"); });
  if (lockLeft !== "frei" && lockLeft !== null) failures.push(`2 · Eingabesperre hängt nach Schließen+Drehen: ${lockLeft}`);
  await context.close();
}

globalThis.__browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
for (const [names, fn, label] of [[["1a", "1b", "1c", "1d"], todoTests, "To-dos"], [["3", "4", "5"], uiTests, "Hinweise/Auswahl/Datum"], [["2"], playerTest, "Player"]]) {
  if (!names.some(wants)) continue;
  try { await fn(); } catch (e) { failures.push(`Abbruch (${label}): ` + String(e.message).split("\n").slice(0, 4).join(" ").slice(0, 400)); }
}
await globalThis.__browser.close();
if (failures.length) { console.error("Fehler-Tests schlagen fehl:\n" + failures.join("\n")); process.exit(1); }
console.log("Alle Fehler-Tests bestanden.");
