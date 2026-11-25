// Affentest: zufälliges Tippen, Wischen, Scrollen, Tippen von Text, Drehen, Navigieren – mit festem Startwert (wiederholbar).
// Aufruf: node tests/browser/monkey.mjs   (SEEDS=11,22,33  ACTIONS=300  ENGINES=chromium,webkit  DARK=1)
// Nach jedem Schritt: keine Konsolenfehler, nichts außerhalb/überlappend, Tippflächen und Tab-Leiste erreichbar, Daten gültig.
import { buildDist, launchEngines, openApp, Report, rng, layoutProblems, integrityProblems, seedRich, tabTap, sleep } from "./lib.mjs";

const dist = buildDist();
const { engines, notes } = await launchEngines();
for (const n of notes) console.log("Hinweis: " + n);
const seeds = (process.env.SEEDS || "11,22,33").split(",").map(Number);
const ACTIONS = Number(process.env.ACTIONS || 300);
const rep = new Report("monkey");
const WORDS = ["Klavier", "Übung", "ÄÖÜ ß", "a", "   ", "<b>fett</b>", "🎹 Musik", "x".repeat(120), "Zahnarzt morgen #allgemein", "Mathe: Aufgabe 4", "https://example.com/seite", "0", "-1", "'; DROP TABLE;--", "Lernen\nZweite Zeile"];
let totalActions = 0;
const kinds = {};
const kindOf = (w) => (/^tippe Text/.test(w) ? "Text" : /^tippe/.test(w) ? "Tippen" : /^wische/.test(w) ? "Wischen" : /^scrolle/.test(w) ? "Scrollen" : /^Tab/.test(w) ? "Tab" : /^zurück/.test(w) ? "Zurück" : /^drehe/.test(w) ? "Drehen" : /^Darstellung/.test(w) ? "Hell/Dunkel" : /^(keine|kein)/.test(w) ? "ohne Ziel" : /^Aktion scheiterte/.test(w) ? "gescheitert" : "Sonstiges");

for (const eng of engines) for (const seed of seeds) {
  const r = rng(seed * 7919 + (eng.name === "webkit" ? 1 : 0));
  const tag = `${eng.name} seed ${seed}`;
  const { context, page, errors } = await openApp(dist, eng, { width: 390, height: 844, scheme: process.env.DARK ? "dark" : "light" });
  context.on("page", (p) => p.close().catch(() => {}));
  page.on("filechooser", (fc) => fc.setFiles([]).catch(() => {}));
  page.on("dialog", (d) => d.dismiss().catch(() => {}));
  await seedRich(page);
  await tabTap(page, "Übersicht");
  const log = [];
  const sigs = new Set();
  let size = { w: 390, h: 844 };

  const candidates = () => page.evaluate(() => {
    const sel = "button, [role=button], .row.is-tappable, .fold-head, .tile, .unit-tile, .pill, .check, .tab, .nav-btn, .nav-back, .clip-row, .part-main, .acard, .mini-pill, .as-btn, .sheet-bar button, .segmented button, .switch, label.mini-pill";
    const h = innerHeight, w = innerWidth; const out = [];
    const tb = document.querySelector(".tabbar")?.getBoundingClientRect();
    for (const e of document.querySelectorAll(sel)) {
      const cs = getComputedStyle(e); const rc = e.getBoundingClientRect();
      if (cs.visibility === "hidden" || cs.display === "none" || cs.pointerEvents === "none" || rc.width < 4 || rc.height < 4) continue;
      if (e.closest("[aria-hidden='true']:not(.as-layer):not(.sheet-layer)") || e.closest("[hidden]") || e.closest(".is-hidden, .is-covered")) continue;
      if (e.disabled) continue;
      const cx = Math.min(w - 2, Math.max(2, rc.left + rc.width / 2)), cy = Math.min(h - 2, Math.max(2, rc.top + rc.height / 2));
      if (cy < 0 || cy > h) continue;
      const hit = document.elementFromPoint(cx, cy);
      if (!hit || !(e.contains(hit) || hit.closest(sel) === e)) continue; // verdeckt – ein Mensch tippt hier nicht
      out.push({ x: cx, y: cy, name: (e.getAttribute("aria-label") || e.textContent || e.className).toString().trim().slice(0, 28).replace(/\s+/g, " ") });
    }
    return out;
  });
  const inputs = () => page.evaluate(() => [...document.querySelectorAll("input:not([type=file]):not([type=range]):not([type=date]):not([type=checkbox]), textarea")].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && r.top >= 0 && r.bottom <= innerHeight && !e.closest("[aria-hidden='true']:not(.sheet-layer)") && !e.closest("[hidden]"); }).map((e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }));
  const rows = () => page.evaluate(() => [...document.querySelectorAll(".swipe-content")].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 40 && r.top > 60 && r.bottom < innerHeight - 60 && cs.visibility !== "hidden" && !e.closest("[aria-hidden='true']") && !e.closest(".is-hidden, .is-covered, [hidden]"); }).map((e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; }));

  const act = async () => {
    const roll = r.next();
    if (roll < 0.52) {
      const c = await candidates(); if (!c.length) return "keine Ziele";
      const t = r.pick(c); await page.touchscreen.tap(t.x, t.y); return `tippe „${t.name}“`;
    }
    if (roll < 0.62) {
      const c = await rows(); if (!c.length) return "kein Wischziel";
      const t = r.pick(c); const dx = (r.chance(0.5) ? 1 : -1) * (60 + r.int(160));
      await page.mouse.move(t.x, t.y); await page.mouse.down();
      for (let i = 1; i <= 6; i++) { await page.mouse.move(t.x + (dx * i) / 6, t.y + 1); await sleep(12); }
      await page.mouse.up(); return `wische ${dx > 0 ? "rechts" : "links"} ${Math.abs(dx)}`;
    }
    if (roll < 0.72) { const dy = (r.chance(0.5) ? 1 : -1) * (80 + r.int(500)); await page.mouse.move(size.w / 2, size.h / 2); await page.mouse.wheel(0, dy); return `scrolle ${dy}`; }
    if (roll < 0.82) {
      const c = await inputs(); if (!c.length) return "kein Eingabefeld";
      const t = r.pick(c); await page.touchscreen.tap(t.x, t.y); await sleep(80);
      const text = r.pick(WORDS); const loc = page.locator("input:focus, textarea:focus").first();
      if (await loc.count()) { await loc.fill(text).catch(() => {}); if (r.chance(0.4)) await page.keyboard.press("Enter"); }
      return `tippe Text „${text.slice(0, 16).replace(/\n/g, "↵")}“`;
    }
    if (roll < 0.87) { const t = r.pick(["Übersicht", "Heute", "To-dos", "Inbox", "Mehr"]); await page.locator(".tabbar").getByText(t, { exact: true }).first().tap({ timeout: 2000 }).catch(() => {}); return `Tab ${t}`; }
    if (roll < 0.91) { const b = page.locator(".nav-back").locator("visible=true").last(); if (await b.count()) await b.tap({ timeout: 1500 }).catch(() => {}); return "zurück"; }
    if (roll < 0.94) { await page.keyboard.press("Escape"); return "Escape"; }
    if (roll < 0.97) { size = { w: size.h, h: size.w }; await page.setViewportSize({ width: size.w, height: size.h }); return `drehe ${size.w}×${size.h}`; }
    if (roll < 0.985) { const s = r.pick(["light", "dark"]); await page.emulateMedia({ colorScheme: s }); return `Darstellung ${s}`; }
    if (roll < 0.995) { await page.reload(); await page.waitForFunction(() => window.db && window.__toast, null, { timeout: 15000 }); return "neu laden"; }
    await page.evaluate(() => window.scrollTo(0, 0)); return "scroll oben";
  };

  for (let i = 1; i <= ACTIONS && sigs.size < 6; i++) {
    let what;
    try { what = await act(); } catch (e) { what = `Aktion scheiterte: ${String(e.message).split("\n")[0].slice(0, 80)}`; }
    totalActions++; kinds[kindOf(what)] = (kinds[kindOf(what)] ?? 0) + 1;
    log.push(`${i}: ${what}`); if (log.length > 10) log.shift();
    await sleep(140);
    const probs = [];
    try {
      const alive = await page.evaluate(() => !!window.db && !!document.querySelector(".tabbar"));
      if (!alive) probs.push("App nicht mehr bedienbar (Tab-Leiste/Datenbank fehlt)");
      probs.push(...(await layoutProblems(page)));
      if (i % 10 === 0) probs.push(...(await integrityProblems(page)));
    } catch (e) { probs.push(`Prüfung scheiterte: ${String(e.message).split("\n")[0].slice(0, 100)}`); }
    probs.push(...errors.splice(0));
    if (probs.length) {
      const sig = probs[0].slice(0, 70);
      if (!sigs.has(sig)) { sigs.add(sig); await rep.fail(page, `${tag} · Schritt ${i}: ${probs.slice(0, 3).join(" | ")}\n      Ablauf: ${log.slice(-6).join(" → ")}`, `${eng.name}-${seed}-${i}`); }
    } else rep.ok(true);
  }
  await context.close();
}
for (const e of engines) await e.browser.close();
const res = rep.finish({ engines: engines.map((e) => e.name), seeds, actionsTotal: totalActions, kinds, notes });
console.log("Aktionen nach Art:", JSON.stringify(kinds));
process.exit(res.failures.length ? 1 : 0);
