// Offline und Updates mit echtem Service Worker (Chromium, lokaler Server): Flugmodus-Start, alle Hauptseiten und Trainer,
// neue Version → „Update bereit“ → Neu laden → neue Version aktiv, ohne dass der Cache gelöscht werden muss.
import { buildDist, launchEngines, Report, sleep, tabTap, tap } from "./lib.mjs";
import { createServer } from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const distA = buildDist();
const { engines, notes } = await launchEngines();
for (const n of notes) console.log("Hinweis: " + n);
const eng = engines.find((e) => e.name === "chromium");
const rep = new Report("offline");

// Version B: gleicher Build, aber index.html mit Kennung und neuer Revision im Service Worker
const distB = fs.mkdtempSync(path.join(os.tmpdir(), "skills-offline-b-"));
fs.cpSync(distA, distB, { recursive: true });
const html = fs.readFileSync(path.join(distB, "index.html"), "utf8");
fs.writeFileSync(path.join(distB, "index.html"), html.replace("<head>", '<head><meta name="build" content="B">'));
const sw = fs.readFileSync(path.join(distB, "sw.js"), "utf8");
fs.writeFileSync(path.join(distB, "sw.js"), sw.replace(/(url:\s*"index\.html",\s*revision:\s*)"[^"]*"/, '$1"build-b-revision"') + "\n// Version B\n");

let dir = distA;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json", ".ico": "image/x-icon", ".webmanifest": "application/manifest+json" };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p === "/") p = "/index.html";
  const f = path.join(dir, p);
  if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": types[path.extname(f)] ?? "application/octet-stream", "cache-control": "no-cache" });
  res.end(fs.readFileSync(f));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://localhost:${server.address().port}/`;

const context = await eng.browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: "allow", permissions: [] });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => { if (m.type() === "error" && !/favicon|apple-touch|Failed to load resource.*(net::ERR_INTERNET_DISCONNECTED|offline)/i.test(m.text())) errors.push(`console: ${m.text()}`); });
const failedRequests = [];
page.on("requestfailed", (r) => { if (!/favicon/.test(r.url())) failedRequests.push(r.url()); });
const V = (sel) => page.locator(sel).locator("visible=true");
const build = () => page.evaluate(() => document.querySelector('meta[name="build"]')?.content ?? "A");
const swReady = async () => {
  await page.evaluate(async () => { const r = await navigator.serviceWorker.ready; return !!r.active; });
  await page.waitForFunction(async () => (await caches.keys()).length > 0 && !!(await caches.match("index.html")), null, { timeout: 30000 });
};

try {
  await page.goto(base);
  await page.waitForFunction(() => window.db && window.app, null, { timeout: 20000 });
  await swReady();
  await page.reload(); // erst nach dem Neuladen steuert der Service Worker die Seite
  await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 20000 });
  await page.waitForFunction(() => window.db && window.app, null, { timeout: 20000 });
  rep.ok(true);
  rep.ok((await build()) === "A", "Version A erwartet");

  // ---- Flugmodus ----
  await context.setOffline(true);
  await page.reload();
  await page.waitForSelector(".tabbar", { timeout: 20000 });
  rep.ok(true);
  for (const t of ["Übersicht", "Heute", "To-dos", "Inbox", "Mehr"]) {
    await tabTap(page, t);
    const text = await page.evaluate(() => [...document.querySelectorAll(".page")].filter((p) => p.getAttribute("aria-hidden") !== "true").map((p) => p.innerText).join(" "));
    rep.ok(text.length > 8, `offline: Seite „${t}“ ist leer`);
  }
  // Flaggen-Trainer: Flaggen (SVG) kommen aus dem Cache
  await page.evaluate(async () => { await window.app.flags.store.ensureFlagSkill(); await window.app.cube.store.ensureCubeSkill(); });
  await tabTap(page, "Übersicht");
  await tap(page, V('text="Flaggen & Geografie"').first(), 900);
  await tap(page, V(".trainer-btn").first(), 1200);
  await tap(page, V(".fl-go").first(), 1000);
  await page.waitForFunction(() => { const i = document.querySelector(".fl-img"); return !i || (i.complete && i.naturalWidth > 0); }, null, { timeout: 8000 }).catch(() => {});
  const imgOk = await page.evaluate(() => { const i = document.querySelector(".fl-img"); return !i || (i.complete && i.naturalWidth > 0); });
  rep.ok(imgOk, "offline: Flagge wird nicht angezeigt");
  await tap(page, V(".sheet-bar button, .sheet-head button", { hasText: "Schließen" }).first(), 700).catch(() => {});
  await page.keyboard.press("Escape");
  // Würfel-Trainer: der Baustein mit three.js wird beim Öffnen nachgeladen (liegt im Cache)
  await tabTap(page, "Übersicht");
  await tap(page, V('text="Zauberwürfel"').first(), 900);
  await tap(page, V(".trainer-btn").first(), 1500);
  await page.waitForFunction(() => window.__cube3d || document.querySelector(".cz-net"), null, { timeout: 15000 }).catch(() => {});
  rep.ok(await page.evaluate(() => !!document.querySelector(".cz") && !document.querySelector(".errscreen")), "offline: Würfel-Trainer lädt nicht");
  rep.ok(failedRequests.length === 0, `offline: fehlgeschlagene Anfragen: ${failedRequests.slice(0, 3).join(", ")}`);
  await context.setOffline(false);

  // ---- Update ----
  dir = distB;
  await page.goto(base);
  await page.waitForFunction(() => window.db && window.app, null, { timeout: 20000 });
  rep.ok((await build()) === "A", "vor dem Update läuft noch Version A");
  await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); await r.update(); });
  await page.waitForSelector(".update-notice", { timeout: 20000 }).catch(() => {});
  rep.ok(await page.locator(".update-notice").count() === 1, "„Update bereit“ erscheint nicht");
  if (await page.locator(".update-notice").count()) {
    rep.ok(/Update bereit/.test(await page.locator(".update-notice").innerText()), "Text des Hinweises");
    const bb = await page.locator(".update-notice button").boundingBox();
    rep.ok(bb && bb.height >= 44, "Neu-laden-Knopf zu klein");
    rep.ok((await build()) === "A", "Die App darf sich nicht von selbst neu laden");
    await page.locator(".update-notice button").click();
    await page.waitForFunction(() => document.querySelector('meta[name="build"]')?.content === "B", null, { timeout: 20000 }).catch(() => {});
    rep.ok((await build()) === "B", "nach „Neu laden“ läuft nicht Version B");
    await page.waitForFunction(() => window.db && window.app, null, { timeout: 20000 });
    rep.ok(await page.locator(".update-notice").count() === 0, "Hinweis bleibt nach dem Update stehen");
    // und auch Version B startet offline
    await context.setOffline(true);
    await page.reload();
    await page.waitForSelector(".tabbar", { timeout: 20000 });
    rep.ok((await build()) === "B", "offline startet nicht Version B");
    await context.setOffline(false);
  }
  rep.ok(errors.length === 0, `Konsole: ${errors.join(" | ").slice(0, 300)}`);
} catch (e) {
  await rep.fail(page, `Abbruch: ${String(e.message).split("\n")[0].slice(0, 240)}`, "offline-abbruch");
} finally {
  server.close();
  await context.close();
  for (const e of engines) await e.browser.close();
}
void sleep;
const res = rep.finish({ notes });
process.exit(res.failures.length ? 1 : 0);
