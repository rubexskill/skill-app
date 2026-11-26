// Barrierefreiheit: Namen für alle Bedienelemente, Kontrast (AA) in Hell und Dunkel, Fokusreihenfolge, „Bewegung reduzieren“, große Schrift (schmale Breiten).
// Schreibt außerdem test-results/symbole.md: Symbole ohne Text mit ihrem Namen (zur Prüfung durch dich).
import fs from "node:fs";
import path from "node:path";
import { tapProblems, buildDist, launchEngines, openApp, Report, layoutProblems, nameProblems, contrastProblems, focusProblems, sleep, tabTap, tap, seedRich, resultsDir } from "./lib.mjs";

const dist = buildDist();
const { engines, notes } = await launchEngines();
const rep = new Report("a11y");
const eng = engines.find((e) => e.name === "chromium") ?? engines[0];
const icons = new Map();

const pagesOf = async (page, scheme, label) => {
  const V = (sel) => page.locator(sel).locator("visible=true");
  const check = async (name, { contrast = true } = {}) => {
    await sleep(250);
    const probs = [...(await nameProblems(page)), ...(await tapProblems(page))];
    if (contrast) probs.push(...(await contrastProblems(page)));
    probs.push(...(await focusProblems(page, 14)));
    for (const p of probs) await rep.fail(page, `${label} · ${name}: ${p}`, `a11y-${name}`);
    if (!probs.length) rep.ok(true);
    // Symbole ohne Text sammeln
    const found = await page.evaluate(() => [...document.querySelectorAll("button, [role=button], [role=switch], [role=checkbox], a[href]")].filter((e) => {
      const r = e.getBoundingClientRect(); if (r.width <= 0 || e.closest("[aria-hidden='true']:not(.sheet-layer), [inert]")) return false;
      const t = [...e.childNodes].map((n) => (n.nodeType === 3 ? n.textContent : n.nodeType === 1 && n.getAttribute("aria-hidden") !== "true" && !n.querySelector?.("svg") ? n.textContent : "")).join("").trim();
      return !t && e.querySelector("svg, [aria-hidden]");
    }).map((e) => `${e.getAttribute("aria-label") || e.getAttribute("title") || "(ohne Namen)"}`));
    for (const f of found) { const k = `${name}|${f}`; if (!icons.has(k)) icons.set(k, { page: name, label: f }); }
  };
  for (const t of ["Übersicht", "Heute", "To-dos", "Inbox", "Mehr"]) { await tabTap(page, t); await check(t); }
  await tabTap(page, "Übersicht");
  await tap(page, page.locator('text="Klavierstück" >> visible=true').first(), 800).catch(() => {});
  await check("Skill");
  await tap(page, page.locator(".page[aria-hidden='false'] .unit-tile").first(), 800).catch(() => {});
  await check("Stück");
  await tabTap(page, "Mehr");
  for (const row of ["Gewohnheiten", "Statistik", "Wunschliste", "Begriffe"]) {
    const r = V(".row").filter({ hasText: new RegExp(`^${row}`) }).first();
    if (!(await r.count())) continue;
    await tap(page, r, 700); await check(row);
    await tap(page, V(".nav-back").first(), 600).catch(() => {});
  }
  // Trainer: Flaggen und Würfel
  await tabTap(page, "Übersicht");
  await tap(page, V('text="Flaggen & Geografie"').first(), 800).catch(() => {});
  await tap(page, V(".trainer-btn").first(), 1000).catch(() => {});
  await check("Flaggen-Trainer");
  await page.keyboard.press("Escape"); await tap(page, V(".sheet-bar button, .sheet-head button", { hasText: "Schließen" }).first(), 600).catch(() => {});
  await tabTap(page, "Übersicht");
  await tap(page, V('text="Zauberwürfel"').first(), 800).catch(() => {});
  await tap(page, V(".trainer-btn").first(), 1500).catch(() => {});
  await check("Würfel-Trainer", { contrast: true });
};

for (const scheme of ["light", "dark"]) {
  const { context, page, errors } = await openApp(dist, eng, { width: 390, height: 844, scheme });
  try {
    await seedRich(page);
    await pagesOf(page, scheme, `${eng.name} ${scheme}`);
  } catch (e) { await rep.fail(page, `${scheme}: Abbruch – ${String(e.message).split("\n")[0].slice(0, 200)}`, "a11y-abbruch"); }
  rep.ok(errors.length === 0, `Konsole ${scheme}: ${errors.join(" | ").slice(0, 200)}`);
  await context.close();
}

// Große Schrift: bei 130 % und 160 % Textgröße hat der Inhalt nur noch 300 bzw. 244 CSS-Pixel Breite. Nichts darf abgeschnitten oder überlappt sein.
for (const [w, h, name] of [[300, 650, "130 %"], [244, 530, "160 %"]]) {
  const { context, page, errors } = await openApp(dist, eng, { width: w, height: h, scheme: "light" });
  try {
    await seedRich(page);
    // ungünstigster Fall: breite Ersatzschrift (wie auf Linux-Rechnern); iOS-Schrift ist schmaler
    await page.addStyleTag({ content: '*{font-family:"DejaVu Sans",sans-serif !important}' });
    const V = (sel) => page.locator(sel).locator("visible=true");
    const check = async (n) => { await sleep(250); let lp = await layoutProblems(page); if (lp.length) { await sleep(700); lp = await layoutProblems(page); } const np = await nameProblems(page); for (const p of [...lp, ...np]) await rep.fail(page, `Schrift ${name} · ${n}: ${p}`, `a11y-schrift-${n}`); if (!lp.length && !np.length) rep.ok(true); };
    for (const t of ["Übersicht", "Heute", "To-dos", "Inbox", "Mehr"]) { await tabTap(page, t); await check(t); }
    await tabTap(page, "Übersicht");
    await tap(page, page.locator('text="Klavierstück" >> visible=true').first(), 800).catch(() => {});
    await check("Skill");
    await tabTap(page, "Übersicht");
    await tap(page, V('text="Flaggen & Geografie"').first(), 800).catch(() => {});
    await tap(page, V(".trainer-btn").first(), 1000).catch(() => {});
    await check("Flaggen-Trainer");
    await tap(page, V(".fl-go").first(), 900).catch(() => {});
    await check("Flaggen-Frage");
    await page.keyboard.press("Escape"); await tap(page, V(".sheet-bar button, .sheet-head button", { hasText: "Schließen" }).first(), 600).catch(() => {});
    await tabTap(page, "Übersicht");
    await tap(page, V('text="Zauberwürfel"').first(), 800).catch(() => {});
    await tap(page, V(".trainer-btn").first(), 1500).catch(() => {});
    await check("Würfel-Trainer");
    await tap(page, V(".cz-pill", { hasText: "Lösung" }).first(), 600).catch(() => {});
  } catch (e) { await rep.fail(page, `Schrift ${name}: Abbruch – ${String(e.message).split("\n")[0].slice(0, 200)}`, "a11y-schrift-abbruch"); }
  rep.ok(errors.length === 0, `Konsole Schrift ${name}: ${errors.join(" | ").slice(0, 200)}`);
  await context.close();
}

// Bewegung reduzieren: Konfetti und Würfelträgheit entfallen
{
  const eng2 = eng;
  const ctx = await eng2.browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", hasTouch: true, isMobile: true, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const fs2 = await import("node:fs"); void fs2;
  await ctx.route("https://skills.test/**", (route) => { let p = new URL(route.request().url()).pathname; if (p === "/") p = "/index.html"; const f = path.join(dist, p); if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: "" }); const ext = path.extname(f); route.fulfill({ status: 200, contentType: ({ ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json" })[ext] ?? "application/octet-stream", body: fs.readFileSync(f) }); });
  await page.goto("https://skills.test/");
  await page.waitForFunction(() => window.db && window.app, null, { timeout: 15000 });
  const reduced = await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  rep.ok(reduced, "reducedMotion wird vom Browser nicht gemeldet");
  const dur = await page.evaluate(() => { const el = document.createElement("div"); el.className = "toast is-shown"; document.body.appendChild(el); const cs = getComputedStyle(el); const d = parseFloat(cs.animationDuration) * (cs.animationDuration.endsWith("ms") ? 0.001 : 1); el.remove(); return d; });
  rep.ok(dur <= 0.02, `Animationen laufen trotz „Bewegung reduzieren“ (${dur}s)`);
  await ctx.close();
}

fs.mkdirSync(resultsDir, { recursive: true });
const list = [...icons.values()].sort((a, b) => a.page.localeCompare(b.page));
fs.writeFileSync(path.join(resultsDir, "symbole.md"), "# Symbole ohne Text\n\n| Seite | Name für VoiceOver |\n|---|---|\n" + list.map((x) => `| ${x.page} | ${x.label} |`).join("\n") + "\n");
console.log(`Symbole ohne Text: ${list.length}`);
for (const e of engines) await e.browser.close();
const res = rep.finish({ notes, icons: list.length });
process.exit(res.failures.length ? 1 : 0);
