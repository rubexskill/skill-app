// Gemeinsame Bausteine für die Selbsttests (Szenarien, Matrix, Affentest).
// Motoren: Chromium und WebKit (Safari-Engine). Ist WebKit nicht startbar, wird das offen gemeldet und Chromium mit iPhone-Emulation genutzt.
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const require = createRequire(import.meta.url);
const pw = require("playwright-core");
export const root = path.resolve(import.meta.dirname, "../..");
export const resultsDir = path.join(root, "test-results");
fs.mkdirSync(resultsDir, { recursive: true });
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webmanifest": "application/manifest+json", ".ico": "image/x-icon" };

/** Test-Build (mit window.db/window.app) – einmal pro Prozess, oder DIST=<Ordner>. */
export function buildDist() {
  if (process.env.DIST) return process.env.DIST;
  const dist = fs.mkdtempSync(path.join(os.tmpdir(), "skills-e2e-"));
  execFileSync("npx", ["vite", "build", "--outDir", dist, "--emptyOutDir"], { cwd: root, stdio: "ignore", env: { ...process.env, PUBLIC_BUILD: "1", VITE_EXPOSE: "1" } });
  return dist;
}

/** Welche Motoren laufen? ENGINES=chromium,webkit (Standard: beide, soweit startbar). */
export async function launchEngines() {
  const wanted = (process.env.ENGINES || "chromium,webkit").split(",");
  const out = [];
  const notes = [];
  for (const name of wanted) {
    try {
      let opts = {};
      if (name === "chromium" && process.env.CHROMIUM) opts = { executablePath: process.env.CHROMIUM };
      else if (name === "chromium" && !process.env.CI && fs.existsSync("/opt/pw-browsers/chromium")) opts = { executablePath: "/opt/pw-browsers/chromium" };
      if (name === "webkit" && process.env.WEBKIT) opts = { executablePath: process.env.WEBKIT };
      if (name === "webkit" && !process.env.WEBKIT && !process.env.CI) {
        // lokal installiertes WebKit (z. B. PLAYWRIGHT_BROWSERS_PATH=/tmp/pw-webkit) automatisch finden
        for (const base of [process.env.PW_WEBKIT_DIR, "/tmp/pw-webkit"].filter(Boolean)) {
          if (!fs.existsSync(base)) continue;
          const dir = fs.readdirSync(base).find((d) => d.startsWith("webkit-"));
          if (dir) { opts = { executablePath: path.join(base, dir, "pw_run.sh") }; break; }
        }
      }
      if (name === "chromium") opts = { ...opts, args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", "--autoplay-policy=no-user-gesture-required"] };
      const browser = await pw[name].launch(opts);
      out.push({ name, browser });
    } catch (e) {
      notes.push(`${name} nicht startbar: ${String(e.message).split("\n").find((l) => l.trim() && !/[╔║╚]/.test(l)) ?? "unbekannt"}`);
    }
  }
  if (wanted.includes("webkit") && !out.some((e) => e.name === "webkit")) {
    notes.push("WebKit fehlt – es läuft nur Chromium mit iPhone-Emulation.");
  }
  return { engines: out, notes };
}

// Notbremse: Läuft eine Suite länger als SUITE_TIMEOUT_MIN Minuten (in CI gesetzt), bricht sie mit Fehler ab, statt ewig zu hängen.
if (process.env.SUITE_TIMEOUT_MIN) {
  const t = setTimeout(() => { console.error(`\nZeitüberschreitung: Suite läuft länger als ${process.env.SUITE_TIMEOUT_MIN} Minuten – Abbruch.`); process.exit(3); }, Number(process.env.SUITE_TIMEOUT_MIN) * 60000);
  t.unref();
}
/** Kurzläufer für CI (weniger Wiederholungen); lokal läuft alles. */
export const LIGHT = !!process.env.LIGHT;

const IPHONE_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

/** Neue Seite mit Handy-Emulation. Sammelt Konsolenfehler. */
export async function openApp(dist, { browser, engine }, { width = 390, height = 844, scheme = "light", seed } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, serviceWorkers: "block", colorScheme: scheme, permissions: engine === "chromium" ? ["microphone"] : [], userAgent: engine === "webkit" ? IPHONE_UA : undefined, acceptDownloads: true });
  await context.route("https://skills.test/**", (route) => {
    let p = new URL(route.request().url()).pathname;
    if (p === "/") p = "/index.html";
    const f = path.join(dist, p);
    if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: "" });
    route.fulfill({ status: 200, contentType: types[path.extname(f)] ?? "application/octet-stream", body: fs.readFileSync(f) });
  });
  const page = await context.newPage();
  page.setDefaultTimeout(process.env.CI ? 15000 : 30000);
  page.setDefaultNavigationTimeout(30000);
  const errors = [];
  const benign = /Service Worker|favicon|apple-touch-icon|Failed to load resource|NotFoundError|NotAllowedError|Permission denied|getUserMedia/i;
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error" && !benign.test(m.text())) errors.push(`console: ${m.text()}`); });
  await page.goto("https://skills.test/");
  await page.waitForFunction(() => window.db && window.app && window.__toast, null, { timeout: 20000 });
  await sleep(300);
  return { context, page, errors };
}

/** Berichtssammler: zählt Fälle, speichert Fehler mit Screenshot. */
export class Report {
  constructor(name) { this.name = name; this.cases = 0; this.failures = []; this.shots = 0; this.started = Date.now(); }
  ok(cond, msg) { this.cases++; if (!cond) this.failures.push(msg); return !!cond; }
  async shot(page, label) {
    try { const f = path.join(resultsDir, `${this.name}-${label.replace(/[^\w-]+/g, "_").slice(0, 60)}-${++this.shots}.png`); await page.screenshot({ path: f }); return f; } catch { return null; }
  }
  async fail(page, msg, label = "fehler") { this.cases++; const f = page ? await this.shot(page, label) : null; this.failures.push(f ? `${msg} [${path.basename(f)}]` : msg); }
  finish(extra = {}) {
    const res = { suite: this.name, cases: this.cases, failures: this.failures, seconds: Math.round((Date.now() - this.started) / 1000), ...extra };
    fs.writeFileSync(path.join(resultsDir, `${this.name}.json`), JSON.stringify(res, null, 2));
    console.log(`${this.name}: ${this.cases} Fälle, ${this.failures.length} Fehler (${res.seconds} s)`);
    for (const f of this.failures.slice(0, 40)) console.log("  ✗ " + f);
    return res;
  }
}

/** Mulberry32 – kleiner, wiederholbarer Zufallsgenerator. */
export function rng(seed) {
  let a = seed >>> 0;
  const next = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return { next, int: (n) => Math.floor(next() * n), pick: (a) => a[Math.floor(next() * a.length)], chance: (p) => next() < p };
}

/** Prüft Layout-Regeln der sichtbaren Seite. Gibt Probleme als Text zurück. */
export async function layoutProblems(page, { reach = true } = {}) {
  // Seitenwechsel-Animationen abwarten (währenddessen nehmen Seiten bewusst keine Eingaben an)
  await page.waitForFunction(() => !document.querySelector(".page.is-entering, .page.is-leaving, .page.is-uncovering") && !document.getAnimations().some((a) => a.playState === "running" && a.effect?.target?.closest?.(".page, .tab-pane, .stack, .navbar")), null, { timeout: 3000 }).catch(() => {});
  return page.evaluate((reach) => {
    const out = [];
    const w = innerWidth, h = innerHeight;
    const de = document.documentElement;
    if (de.scrollWidth > w + 1) out.push(`html scrollWidth ${de.scrollWidth} > ${w}`);
    if (document.body.scrollWidth > w + 1) out.push(`body scrollWidth ${document.body.scrollWidth} > ${w}`);
    const overlay = document.querySelector(".sheet-layer, .as-layer, .fsp, .sorter");
    const intentional = (el) => el.closest(".active-rail, .list-pills, .filter-chips, .chips-scroll, .tr-scroll, .sorter, .sheet-layer, .toast, .as-layer, .fsp, .wheel, .celebrate, .swipe-actions, .swipe-lead, .crop, .swipe.is-active");
    const hiddenPage = (el) => !!el.closest(".is-hidden, .is-covered, [hidden]");
    const vis = (el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.display !== "none" && cs.visibility !== "hidden" && r.width > 0 && r.height > 0 && !hiddenPage(el); };
    for (const el of document.querySelectorAll("body *")) {
      if (intentional(el) || !vis(el)) continue;
      const cs = getComputedStyle(el);
      if ((cs.overflowX === "auto" || cs.overflowX === "scroll") && el.scrollWidth > el.clientWidth + 1) out.push(`scroll-x ${el.tagName}.${String(el.className).slice(0, 30)}`);
      const r = el.getBoundingClientRect();
      if (r.right > w + 1 || r.left < -1) out.push(`außerhalb ${el.tagName}.${String(el.className).slice(0, 30)} ${Math.round(r.left)}..${Math.round(r.right)}/${w}`);
    }
    if (!overlay) {
      const sel = "button, [role=button], a[href], .row.is-tappable, .fold-head, .tile, .unit-tile, .pill, .check, .tab, .nav-btn, .nav-back, .clip-row, .part-main";
      const tb = document.querySelector(".tabbar")?.getBoundingClientRect();
      const nb = [...document.querySelectorAll(".navbar")].filter((n) => n.offsetParent).pop()?.getBoundingClientRect();
      // schwebende Elemente (Mini-Timer, Hinweis) dürfen bewusst über dem Inhalt liegen; was sie verdecken, wird nicht geprüft
      const floaters = [...document.querySelectorAll(".toast.is-shown, .mini, .mini-inner")].map((f) => f.getBoundingClientRect()).filter((r) => r.width > 0);
      { const t = document.querySelector(".toast.is-shown")?.getBoundingClientRect(); const m = document.querySelector(".mini.is-shown .mini-inner")?.getBoundingClientRect(); if (t && m && Math.min(t.right, m.right) - Math.max(t.left, m.left) > 2 && Math.min(t.bottom, m.bottom) - Math.max(t.top, m.top) > 2) out.push("Hinweis überdeckt den Mini-Timer"); }
      const covered = (r) => floaters.some((f) => Math.min(r.right, f.right) - Math.max(r.left, f.left) > 2 && Math.min(r.bottom, f.bottom) - Math.max(r.top, f.top) > 2);
      const els = [...document.querySelectorAll(sel)].filter((e) => vis(e) && !intentional(e) && !e.closest(".navbar,.tabbar,.mini,.toast") && !covered(e.getBoundingClientRect()));
      const inView = els.filter((e) => { const r = e.getBoundingClientRect(); const top = nb ? nb.bottom : 0; const bot = tb ? tb.top : h; return r.top >= top - 1 && r.bottom <= bot + 1 && r.left >= 0 && r.right <= w; });
      // Überlappung
      for (let i = 0; i < inView.length; i++) for (let j = i + 1; j < inView.length; j++) {
        const a = inView[i], b = inView[j];
        if (a.contains(b) || b.contains(a)) continue;
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        const ow = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), oh = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
        if (ow > 6 && oh > 6) out.push(`überlappt ${a.className.toString().slice(0, 24)} / ${b.className.toString().slice(0, 24)} (${Math.round(ow)}×${Math.round(oh)})`);
      }
      // Erreichbarkeit: Mittelpunkt gehört zum Element
      if (reach) for (const e of inView) {
        const r = e.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        if (!hit || !(e.contains(hit) || hit.closest(sel) === e)) out.push(`nicht erreichbar ${e.className.toString().slice(0, 30)} → ${hit?.tagName}.${String(hit?.className).slice(0, 24)}`);
      }
      // Tab-Leiste erreichbar
      if (tb) for (const t of document.querySelectorAll(".tab")) {
        const r = t.getBoundingClientRect(); if (!r.width) continue;
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        if (!hit || !t.contains(hit)) out.push(`Tab-Leiste nicht erreichbar: ${t.textContent} → ${hit?.tagName}.${String(hit?.className).slice(0, 30)}`);
      }
    }
    return [...new Set(out)].slice(0, 10);
  }, reach);
}

/** Datenintegrität: Verweise, Zahlen, Formate. */
export async function integrityProblems(page) {
  return page.evaluate(async () => {
    const db = window.db; const out = [];
    const all = {};
    for (const n of ["skills", "sessions", "todos", "lists", "units", "parts", "recordings", "terms", "wishes", "inbox", "apps", "records", "cards", "checks", "flagStats", "cubeTimes", "cubeProgress"]) { try { all[n] = await db.table(n).toArray(); } catch { all[n] = []; } }
    const ids = (n) => new Set(all[n].map((x) => x.id));
    for (const [n, rows] of Object.entries(all)) {
      const seen = new Set();
      for (const r of rows) {
        if (r.id != null) { if (seen.has(r.id)) out.push(`${n}: doppelte ID ${r.id}`); seen.add(r.id); }
        const walk = (v, p) => { if (typeof v === "number" && !Number.isFinite(v)) out.push(`${n}.${p}: keine gültige Zahl`); else if (v && typeof v === "object" && !(v instanceof Blob)) for (const k of Object.keys(v)) walk(v[k], `${p}.${k}`); };
        walk(r, "");
      }
    }
    const skills = ids("skills"), units = ids("units"), parts = ids("parts"), lists = ids("lists");
    for (const s of all.sessions) { if (!skills.has(s.skillId)) out.push(`Session ${s.id}: Skill fehlt`); if (s.unitId && !units.has(s.unitId)) out.push(`Session ${s.id}: Stück fehlt`); if (!(s.minutes >= 0)) out.push(`Session ${s.id}: Minuten`); }
    for (const t of all.todos) { if (!lists.has(t.listId)) out.push(`To-do ${t.id}: Liste fehlt`); if (t.due != null && !/^\d{4}-\d\d-\d\d$/.test(t.due)) out.push(`To-do ${t.id}: Datum ${t.due}`); if (typeof t.text !== "string") out.push(`To-do ${t.id}: Text`); }
    for (const u of all.units) if (!skills.has(u.skillId)) out.push(`Stück ${u.id}: Skill fehlt`);
    for (const p of all.parts) { if (!units.has(p.unitId)) out.push(`Abschnitt ${p.id}: Stück fehlt`); const cids = new Set(); for (const c of p.clips ?? []) { if (cids.has(c.id)) out.push(`Abschnitt ${p.id}: doppelter Clip`); cids.add(c.id); } }
    for (const r of all.recordings) { if (!units.has(r.unitId)) out.push(`Aufnahme ${r.id}: Stück fehlt`); if (r.partId && !parts.has(r.partId)) out.push(`Aufnahme ${r.id}: Abschnitt fehlt`); }
    const FD = window.app.flags.data;
    for (const f of all.flagStats) { if (!FD.BY_ISO.has(f.id)) out.push(`Lernstand ${f.id}: unbekannte Flagge`); if (!(f.level >= 0 && f.level <= 4)) out.push(`Lernstand ${f.id}: Stufe ${f.level}`); if (f.right + f.wrong !== f.seen) out.push(`Lernstand ${f.id}: Zähler passen nicht`); }
    for (const t of all.cubeTimes) { if (!(t.ms >= 0)) out.push(`Würfelzeit ${t.id}: ${t.ms}`); if (typeof t.scramble !== "string") out.push(`Würfelzeit ${t.id}: Mischung fehlt`); }
    const AL = new Set(window.app.cube.path.ALGOS.map((a) => a.id));
    for (const p of all.cubeProgress) { if (!AL.has(p.id)) out.push(`Lernpfad ${p.id}: unbekannter Algorithmus`); if (p.state !== "kann" && p.state !== "ueben") out.push(`Lernpfad ${p.id}: Stand ${p.state}`); }
    const clipIds = new Set(all.parts.flatMap((p) => (p.clips ?? []).map((c) => c.id))); const recIds = ids("recordings");
    for (const k of await db.clipBlobs.toCollection().primaryKeys()) if (!clipIds.has(k)) out.push(`Video ${k}: Clip fehlt`);
    for (const k of await db.recBlobs.toCollection().primaryKeys()) if (!recIds.has(k)) out.push(`Audio ${k}: Aufnahme fehlt`);
    for (const k of await db.covers.toCollection().primaryKeys()) if (!units.has(k)) out.push(`Titelbild ${k}: Stück fehlt`);
    return out.slice(0, 10);
  });
}

/** Sicherungsrelevanter Datenbestand als vergleichbarer Text (ohne Änderungszeiten). */
export async function snapshot(page) {
  return page.evaluate(async () => {
    const names = ["skills", "sessions", "inbox", "checks", "apps", "todos", "lists", "records", "terms", "wishes", "cards", "units", "parts", "recordings", "flagStats", "cubeTimes", "cubeProgress"];
    const strip = (v) => Array.isArray(v) ? v.map(strip) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).filter((k) => k !== "upd").sort().map((k) => [k, strip(v[k])])) : v;
    const out = {};
    for (const n of names) out[n] = (await window.db.table(n).toArray()).map(strip).sort((a, b) => String(a.id ?? JSON.stringify(a)).localeCompare(String(b.id ?? JSON.stringify(b))));
    return JSON.stringify(out);
  });
}

export const matrix = (full) => {
  const sizes = [[375, 812], [390, 844], [430, 932]];
  const out = [];
  for (const [w, h] of sizes) for (const land of [false, true]) for (const scheme of ["light", "dark"]) out.push({ width: land ? h : w, height: land ? w : h, scheme, label: `${w}${land ? "q" : "h"}-${scheme}` });
  return full ? out : out.slice(0, 2);
};

/** Tippt in die Mitte eines Elements (scrollt es vorher in die Mitte; Tab-Leiste bleibt, wo sie ist). */
export async function tap(page, loc, wait = 450) {
  const el = typeof loc === "string" ? page.locator(loc).first() : loc;
  await el.evaluate((e) => { if (e.closest(".sheet-layer")) e.scrollIntoView({ block: "nearest" }); else if (!e.closest(".tabbar, .navbar, .as-layer, .fsp")) e.scrollIntoView({ block: "center" }); });
  await sleep(100);
  const b = await el.boundingBox();
  if (!b) throw new Error("kein Rahmen: " + el);
  await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
  await sleep(wait);
}
export const tabTap = (page, name) => tap(page, page.locator(".tabbar").getByText(name, { exact: true }).first(), 600);

/** Reichhaltige Testdaten (über die Logik, wie die App sie selbst anlegt). */
export async function seedRich(page) {
  return page.evaluate(async () => {
    const L = window.app.logic, U = window.app.units, db = window.db;
    const LONG = "Eine ziemlich lange Überschrift ohne Leerzeichen-Pause-Superkalifragilistischexpialigetisch und noch viel mehr Text dahinter";
    const cats = ["Körper & Sport", "Kopf: Rechnen, Gedächtnis & Denken", "Atmung, Sinne & Körperkontrolle", "Kreativ & Alltag"];
    const piano = await L.createSkill({ name: "Learn piano song", title: "Klavierstück", kategorie: "Kreativ & Alltag", typ: "skill", status: "lerne" });
    for (let i = 0; i < 5; i++) await L.createSkill({ name: i === 0 ? LONG : `Skill ${i}`, kategorie: cats[i % 4], typ: "skill", status: i < 3 ? "lerne" : "idee", notes: i === 0 ? LONG : "" });
    await L.createSkill({ name: "Wasser trinken", kategorie: "Gewohnheiten", typ: "gewohnheit", status: "lerne" });
    await L.createSkill({ name: "Steuererklärung", kategorie: "Projekte & Besorgungen", typ: "projekt", status: "idee" });
    const u1 = await U.createUnit(piano.id, "Homecoming – Kanye West");
    const u2 = await U.createUnit(piano.id, "Nocturne " + LONG.slice(0, 40));
    await db.units.update(u2.id, { status: "auffrischen" });
    const p1 = await U.createPart(u1.id, "Intro " + LONG.slice(0, 30));
    await U.createPart(u1.id, "Strophe");
    await db.parts.update(p1.id, { notes: [{ id: "n1", text: LONG, at: Date.now() }], links: [{ id: "l1", url: "https://example.com/" + "x".repeat(60), title: LONG.slice(0, 50), addedAt: Date.now() }], loops: 4 });
    await db.recordings.bulkAdd([
      { id: "rc1", unitId: u1.id, name: "Aufnahme 1", note: "", at: Date.now() - 86400000, duration: 83.4, size: 1500000, mime: "audio/mp4" },
      { id: "rc2", unitId: u1.id, partId: p1.id, name: "Aufnahme 2 " + LONG.slice(0, 40), note: "x", at: Date.now(), duration: 12, size: 300000, mime: "audio/mp4" },
    ]);
    try { await db.recBlobs.bulkPut([{ id: "rc1", blob: new Blob([new Uint8Array(8)], { type: "audio/mp4" }) }]); } catch { /* WebKit-Testumgebung speichert keine Blobs */ }
    await db.sessions.bulkAdd([{ id: "se1", skillId: piano.id, start: Date.now() - 7200000, minutes: 30, unitId: u1.id }, { id: "se2", skillId: piano.id, start: Date.now() - 3 * 86400000, minutes: 20 }]);
    const lists = await db.lists.toArray();
    const add = async (t, li, due) => { await L.addTodo(t, lists[li].id, due); await new Promise((r) => setTimeout(r, 4)); };
    const today = new Date(); const dk = (n) => L.dayKey(L.addDays(today, n));
    await add("Zahnarzt anrufen", 0, dk(-2)); await add(LONG, 0, dk(0)); await add("Klavierspielen", 0, null); await add("Rubik's Cube", 0, null);
    await add("Mathe: Aufgaben 3", 1, dk(1)); await add("Deutsch: Gedicht lernen " + LONG.slice(0, 30), 1, dk(5)); await add("Bio: Referat", 1, dk(20)); await add("Einkaufen", 0, dk(2));
    await db.terms.add({ id: "t1", term: "Doomsday", explanation: LONG, understood: false, understoodAt: null, links: [], createdAt: Date.now() });
    await db.wishes.add({ id: "w1", name: "Metronom", url: "https://example.com/x", note: "", bought: false, boughtAt: null, createdAt: Date.now() });
    for (let i = 0; i < 3; i++) await db.inbox.add({ id: "i" + i, text: "Idee " + i + " " + LONG.slice(0, 30), createdAt: Date.now() - i * 86400000 });
    return { piano: piano.id, u1: u1.id, p1: p1.id };
  });
}

/** Kann diese Umgebung Blobs in IndexedDB speichern? (Playwright-WebKit mit flüchtigem Speicher kann es nicht; echtes Safari schon.) */
export async function blobsWork(page) {
  return page.evaluate(async () => {
    try { await window.db.covers.put({ id: "__probe", blob: new Blob([new Uint8Array(4)], { type: "image/png" }) }); await window.db.covers.delete("__probe"); return true; } catch { return false; }
  });
}

// ---------------- Flaggen-Trainer ----------------

/** Prüft die Oberfläche des Flaggen-Trainers (im Blatt): nichts außerhalb, Mindestgrößen, Bilder geladen und 4:3, Antworten überlappen nicht. */
export async function flagProblems(page) {
  return page.evaluate(() => {
    const root = document.querySelector(".sheet-layer.is-shown .fl") ?? document.querySelector(".fl");
    if (!root) return [];
    const panel = root.closest(".sheet") ?? document.body;
    const pr = panel.getBoundingClientRect();
    const vw = innerWidth, vh = innerHeight;
    const out = [];
    const vis = (el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.display !== "none" && cs.visibility !== "hidden" && r.width > 0 && r.height > 0; };
    for (const el of root.querySelectorAll("*")) {
      if (!vis(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.right > pr.right + 1 || r.left < pr.left - 1 || r.right > vw + 1) out.push(`Flaggen: ${el.tagName}.${String(el.className).slice(0, 24)} ragt seitlich heraus`);
    }
    const inView = (r) => r.bottom > 0 && r.top < vh && r.bottom > pr.top && r.top < pr.bottom;
    for (const b of root.querySelectorAll(".fl-ans")) { const r = b.getBoundingClientRect(); if (vis(b) && r.height < 51.5) out.push(`Antwortfläche nur ${Math.round(r.height)} px hoch`); if (b.scrollWidth > b.clientWidth + 1 || b.scrollHeight > b.clientHeight + 1) out.push("Antworttext wird abgeschnitten"); }
    for (const b of root.querySelectorAll(".fl-x, .fl-icon, .fl-chip, .fl-back, .fl-go, .fl-next, .fl-big")) { const r = b.getBoundingClientRect(); if (vis(b) && (r.height < 43.5 || r.width < 43.5)) out.push(`Tippfläche ${b.className} zu klein (${Math.round(r.width)}×${Math.round(r.height)})`); }
    for (const i of root.querySelectorAll("img.fl-img")) {
      const r = i.getBoundingClientRect(); if (!vis(i) || !inView(r)) continue;
      if (!i.complete || i.naturalWidth === 0) out.push(`Flagge nicht geladen: ${i.getAttribute("src")}`);
      if (Math.abs(r.width / r.height - 4 / 3) > 0.03) out.push(`Flagge nicht 4:3: ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
    const ans = [...root.querySelectorAll(".fl-ans")].filter(vis);
    for (let a = 0; a < ans.length; a++) for (let b = a + 1; b < ans.length; b++) {
      const x = ans[a].getBoundingClientRect(), y = ans[b].getBoundingClientRect();
      if (Math.min(x.right, y.right) - Math.max(x.left, y.left) > 1 && Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) > 1) out.push("Antworten überlappen");
    }
    // gleich große Flaggen bei „Land → Flagge“
    const fb = [...root.querySelectorAll(".fl-flagbtn")].filter(vis).map((b) => Math.round(b.getBoundingClientRect().width));
    if (fb.length && new Set(fb).size > 1) out.push(`Flaggen-Antworten ungleich breit: ${fb.join("/")}`);
    return [...new Set(out)].slice(0, 8);
  });
}

/** Skill „Flaggen & Geografie“ öffnen und das Trainer-Blatt zeigen. */
export async function openFlags(page) {
  if (await page.locator(".tabbar").count()) await tabTap(page, "Übersicht");
  await tap(page, page.locator('text="Flaggen & Geografie" >> visible=true').first(), 900);
  await tap(page, page.locator(".trainer-btn:visible").first(), 900);
}

/** Wartet auf eine frische Frage oder das Ergebnis. */
export async function flagReady(page) {
  await page.waitForFunction(() => document.querySelector(".fl-score") || document.querySelector(".fl-ans:not(.is-right):not(.is-wrong):not(.is-dim)"), null, { timeout: 8000 });
  await sleep(380); // Eingabeschutz nach neuer Frage
}

/** Beantwortet die aktuelle Frage richtig oder bewusst falsch. Gibt zurück, was gefragt war. */
export async function flagAnswer(page, right, { next = true } = {}) {
  await flagReady(page);
  const info = await page.evaluate(() => {
    const D = window.app.flags.data;
    const flags = !!document.querySelector(".fl-answers.is-flags");
    const buttons = [...document.querySelectorAll(".fl-ans")];
    let iso, correct;
    if (flags) { const name = document.querySelector(".fl-name").textContent; iso = D.FLAGS.find((f) => f.name === name).iso; correct = buttons.findIndex((b) => b.getAttribute("aria-label") === name); }
    else { iso = document.querySelector(".fl-img.is-l").getAttribute("src").match(/flags\/(\w+)\.svg/)[1].toUpperCase(); const name = D.BY_ISO.get(iso).name; correct = buttons.findIndex((b) => b.textContent === name); }
    return { iso, correct, n: buttons.length, dir: flags ? "country" : "flag" };
  });
  if (info.correct < 0) throw new Error("richtige Antwort nicht gefunden: " + info.iso);
  if (typeof right === "function") right = right(info);
  const idx = right ? info.correct : (info.correct === 0 ? 1 : 0);
  await tap(page, page.locator(".fl-ans").nth(idx), right ? 150 : 500);
  if (!right) { if (next) await tap(page, page.locator(".fl-next"), 250); } else await sleep(800);
  return info;
}

// ---------------- Zauberwürfel-Trainer ----------------

export async function openCube(page) {
  if (await page.locator(".tabbar").count()) await tabTap(page, "Übersicht");
  await tap(page, page.locator('text="Zauberwürfel" >> visible=true').first(), 900);
  await tap(page, page.locator(".trainer-btn:visible").first(), 1200);
  await page.waitForFunction(() => window.__cube3d || document.querySelector(".cz-net"), null, { timeout: 15000 });
  await sleep(500);
}
export const closeSheet = async (page) => tap(page, page.locator(".sheet-bar button, .sheet-head button", { hasText: "Schließen" }).locator("visible=true").first(), 700);
export const cubeState = (page) => page.evaluate(() => window.__cube3d?.state() ?? null);
export const cubeIdle = (page) => page.waitForFunction(() => window.__cube3d && !window.__cube3d.busy(), null, { timeout: 15000 }).then(() => sleep(120));
/** Moves, die die Oberfläche unter „Deine Züge“ zeigt */
export const userMoves = (page) => page.evaluate(() => [...document.querySelectorAll(".cz-notation .cz-nbody .cz-moves:not(.is-dim) .cz-move")].map((b) => b.textContent));
export const scrambleMoves = (page) => page.evaluate(() => [...document.querySelectorAll(".cz-notation .cz-nbody .cz-moves.is-dim .cz-move")].map((b) => b.textContent));
/** Zustand, den die Engine für Züge ab gelöstem Würfel ergibt */
export const engineState = (page, moves) => page.evaluate((m) => { const E = window.app.cube.engine; return E.cubeToString(E.applyMoves(E.solvedCube(), m)); }, moves);

/** Ziehen mit der Maus (Pointer-Ereignisse) von (x,y) um (dx,dy), in `steps` Schritten */
export async function dragMouse(page, x, y, dx, dy, { steps = 14, wait = 18, hold = 0 } = {}) {
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) { await page.mouse.move(x + (dx * i) / steps, y + (dy * i) / steps); if (wait) await sleep(wait); }
  if (hold) await sleep(hold);
  await page.mouse.up();
}

/** Würfel-Trainer: Zeichenfläche sinnvoll groß und im Blatt, Bedienelemente erreichbar und groß genug, Zeit lesbar */
export async function cubeProblems(page, ref) {
  return page.evaluate((ref) => {
    const out = [];
    const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && !e.closest("[aria-hidden='true']:not(.sheet-layer)"); };
    const root = document.querySelector(".cz");
    if (!root || !vis(root)) return out;
    const vw = innerWidth, vh = innerHeight;
    const host = root.querySelector(".cube3d");
    if (host && vis(host)) {
      const r = host.getBoundingClientRect();
      if (r.width < Math.min(280, vw * 0.6) || r.height < Math.min(200, vh * 0.28)) out.push(`Würfel zu klein (${Math.round(r.width)}×${Math.round(r.height)})`);
      if (r.left < -1 || r.right > vw + 1) out.push("Würfelfläche ragt seitlich heraus");
      const c = host.querySelector("canvas");
      if (c && (Math.abs(c.getBoundingClientRect().width - r.width) > 2)) out.push("Zeichenfläche passt nicht zum Rahmen");
      // gleiche Größe in allen Ansichten (Start, Wiedergabe, Lernpfad, Üben)
      if (ref) { if (!ref.w) { ref.w = r.width; ref.h = r.height; } else if (Math.abs(ref.w - r.width) > 1.5 || Math.abs(ref.h - r.height) > 1.5) out.push(`Würfel ändert die Größe (${Math.round(ref.w)}×${Math.round(ref.h)} → ${Math.round(r.width)}×${Math.round(r.height)})`); }
    }
    for (const b of root.querySelectorAll("button, input")) {
      if (!vis(b)) continue;
      if (b.closest(".cz-moves")) continue; // Notationsmarken sind klein, aber gruppiert (≥ 40 px breit)
      const r = b.getBoundingClientRect();
      if (r.height < 43.5 || r.width < 43.5) out.push(`Tippfläche zu klein: ${b.getAttribute("aria-label") || b.textContent?.trim().slice(0, 20)} ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
    for (const b of root.querySelectorAll(".cz-move")) {
      if (!vis(b)) continue;
      const r = b.getBoundingClientRect();
      if (r.height < 36 || r.width < 36) out.push(`Notationsmarke zu klein ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
    const pl = root.querySelector(".cz-player");
    if (pl && vis(pl)) {
      const pr = pl.getBoundingClientRect();
      for (const e of pl.querySelectorAll("button, .cz-pl-now, .cz-pl-phase")) {
        const r = e.getBoundingClientRect();
        if (r.width && (r.right > pr.right + 1 || r.left < pr.left - 1)) out.push(`Wiedergabeleiste: ${e.getAttribute("aria-label") || e.className} ragt seitlich heraus`);
      }
    }
    const t = root.querySelector(".cz-time");
    if (t && vis(t) && parseFloat(getComputedStyle(t).fontSize) < 32) out.push("Zeitanzeige zu klein");
    return out;
  }, ref);
}
