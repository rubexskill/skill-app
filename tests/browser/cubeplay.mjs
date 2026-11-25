// Würfel-Trainer, Teil 2: Gesten-Zustand (Pinch, Abbruch, verlorenes Loslassen), gerade Ansicht, Drehteller-Grenzen, Lösung zeigen (Weiter/Zurück/Springen/eigener Zug).
import { LIGHT, buildDist, launchEngines, openApp, Report, layoutProblems, integrityProblems, tap, sleep, openCube, cubeState, cubeIdle, engineState, dragMouse } from "./lib.mjs";

const dist = buildDist();
const { engines, notes } = await launchEngines();
for (const n of notes) console.log("Hinweis: " + n);
const rep = new Report("cubeplay");

for (const eng of engines) {
  const tag = eng.name;
  const { context, page, errors } = await openApp(dist, eng, { width: 390, height: 844 });
  const V = (sel) => page.locator(sel).locator("visible=true");
  const check = async (name) => {
    await sleep(150);
    const lp = await layoutProblems(page); const ip = await integrityProblems(page); const er = errors.splice(0);
    if (lp.length) await rep.fail(page, `${tag} · ${name}: Layout ${lp.join(" | ")}`, `${tag}-play-${name}`); else rep.ok(true);
    if (ip.length) await rep.fail(page, `${tag} · ${name}: Daten ${ip.join(" | ")}`, `${tag}-play-daten`); else rep.ok(true);
    if (er.length) await rep.fail(page, `${tag} · ${name}: Konsole ${er.join(" | ").slice(0, 300)}`, `${tag}-play-konsole`); else rep.ok(true);
  };
  const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
  const step = async (name, fn) => {
    if (ONLY && !ONLY.test(name)) return;
    try { await fn(); await check(name); } catch (e) { await rep.fail(page, `${tag} · ${name}: ${String(e.message).split("\n")[0].slice(0, 240)}`, `${tag}-play-${name}`); }
  };
  const expect = (cond, msg) => { if (!rep.ok(cond, `${tag} · ${msg}`)) throw new Error(msg); };

  await openCube(page);
  if (!(await page.evaluate(() => !!window.__cube3d))) { await context.close(); await eng.browser.close(); continue; }

  const cam = () => page.evaluate(() => window.__cube3d.camera());
  const gest = () => page.evaluate(() => window.__cube3d.gesture());
  const rect = () => page.evaluate(() => window.__cube3d.canvasRect());
  const xy = (pos, normal) => page.evaluate(([p, n]) => window.__cube3d.stickerXY(p, n), [pos, normal]);
  const neu = async () => { await tap(page, V(".cz-btn").filter({ hasText: "Neu" }).first(), 400); await cubeIdle(page); await page.evaluate(() => window.__cube3d.resetViewNow?.()); };
  /** Synthetisches Zeigerereignis auf der Zeichenfläche (mehrere Finger, Abbruch, verlorenes Loslassen) */
  const ptr = (type, id, x, y, primary = id === 1) => page.evaluate(([t, i, px, py, pr]) => {
    const c = document.querySelector("canvas.cube3d-canvas");
    c.dispatchEvent(new PointerEvent(t, { pointerId: i, pointerType: "touch", isPrimary: pr, bubbles: true, cancelable: true, clientX: px, clientY: py, buttons: t === "pointerup" || t === "pointercancel" ? 0 : 1 }));
  }, [type, id, x, y, primary]);
  const corner = async () => { const r = await rect(); return { x: r.left + 14, y: r.top + 24 }; };
  const idleNow = async (msg) => { const g = await gest(); expect(g.mode === "idle" && g.ids.length === 0, `${msg}: Gestenzustand ${JSON.stringify(g)} statt idle`); };
  /** Danach muss normales Bedienen wieder gehen: Ansicht drehen und eine Schicht ziehen */
  const stillWorks = async (msg) => {
    await idleNow(msg);
    const before = await cam();
    const c = await corner();
    await dragMouse(page, c.x, c.y, 90, 20, { steps: 8, wait: 12 });
    await sleep(500);
    const after = await cam();
    expect(Math.abs(after.yaw - before.yaw) > 3, `${msg}: Ansicht dreht nicht mehr (Hänger)`);
    await page.evaluate(() => window.__cube3d.setView(-10, 10));
    await sleep(100);
    const a = await xy([0, 1, 1], [0, 0, 1]), b = await xy([1, 1, 1], [0, 0, 1]);
    const st = await cubeState(page);
    await dragMouse(page, a[0], a[1], (b[0] - a[0]) * 1.8, (b[1] - a[1]) * 1.8, { steps: 8, wait: 12 });
    await cubeIdle(page);
    expect(await cubeState(page) !== st, `${msg}: Schicht lässt sich nicht mehr drehen (Hänger)`);
    // zurück: Neu
    await neu();
  };

  // ---------- Teil A: Ansicht ----------
  await step("Standardansicht ist gerade: 10° seitlich, 10° von oben, kein Verkippen, gleiche Größe", async () => {
    const c = await cam();
    expect(Math.abs(c.yaw + 10) < 0.01 && Math.abs(c.pitch - 10) < 0.01 && Math.abs(c.roll) < 0.01 && c.zoom === 1, `Kamera ${JSON.stringify(c)}`);
    // Vorderseite frontal: linke und rechte Kante der Vorderseite fast gleich hoch, Fläche breit sichtbar
    const tl = await xy([-1, 1, 1], [0, 0, 1]), tr = await xy([1, 1, 1], [0, 0, 1]), bl = await xy([-1, -1, 1], [0, 0, 1]);
    expect(Math.abs(tl[1] - tr[1]) < 0.12 * Math.abs(tr[0] - tl[0]), "Vorderseite ist schief zur Seite");
    expect(Math.abs(tl[0] - bl[0]) < 0.12 * Math.abs(bl[1] - tl[1]), "Vorderseite ist verkippt");
    for (const n of [[1, 0, 0], [0, 1, 0]]) expect(!(await page.evaluate((nn) => window.__cube3d.visible(nn), n)), "mehr als eine Fläche deutlich sichtbar");
    const r = await rect();
    expect(Math.abs(r.width - 390) < 40 && r.height > 280, `Würfelfläche ${r.width}×${r.height}`);
  });
  await step("Drehen wie ein Drehteller: nach oben/unten begrenzt auf 80°, nie verkippt, seitlich unbegrenzt", async () => {
    const c0 = await corner();
    for (const [dx, dy] of [[0, -300], [0, 600], [0, -900], [260, 40], [-260, 70], [200, -80]]) {
      await dragMouse(page, c0.x, c0.y + (dy > 0 ? 0 : 150), dx, dy > 0 ? Math.min(dy, 150) + 200 : dy, { steps: 14, wait: 8 }).catch(() => {});
      await sleep(250);
    }
    for (let i = 0; i < 6; i++) { await dragMouse(page, c0.x, c0.y + 60, 330, 0, { steps: 10, wait: 6 }); await sleep(120); }
    await sleep(900);
    const c = await cam();
    expect(Math.abs(c.pitch) <= 80.01, `Nicken ${c.pitch}° über der Grenze`);
    expect(Math.abs(c.roll) < 0.01, `Würfel ist verkippt (Roll ${c.roll}°)`);
    expect(Math.abs(c.yaw) <= 180.01, "Drehwinkel nicht normalisiert");
    await page.evaluate(() => window.__cube3d.setView(30, 200)); // Test-Zugang begrenzt ebenfalls
    expect((await cam()).pitch <= 80.01, "setView ignoriert die Grenze");
  });
  await step("Zurücksetzen: Doppeltippen auf den Hintergrund und der kleine Knopf stellen die gerade Ansicht her", async () => {
    await page.evaluate(() => window.__cube3d.setView(120, -50));
    const c = await corner();
    await page.mouse.dblclick(c.x, c.y);
    await sleep(900);
    let v = await cam();
    expect(Math.abs(v.yaw + 10) < 0.5 && Math.abs(v.pitch - 10) < 0.5, `Doppeltippen: ${JSON.stringify(v)}`);
    await page.evaluate(() => window.__cube3d.setView(-120, 60));
    expect(await V('button[aria-label="Ansicht zurücksetzen"]').count() === 1, "Knopf fehlt");
    const bb = await V('button[aria-label="Ansicht zurücksetzen"]').first().boundingBox();
    expect(bb.width >= 43.5 && bb.height >= 43.5, "Knopf zu klein");
    await tap(page, V('button[aria-label="Ansicht zurücksetzen"]').first(), 900);
    v = await cam();
    expect(Math.abs(v.yaw + 10) < 0.5 && Math.abs(v.pitch - 10) < 0.5, `Knopf: ${JSON.stringify(v)}`);
  });

  // ---------- Teil A: Hänger ----------
  await step("Hänger: Pinch, dann sofort Ziehen", async () => {
    const c = await corner(); const r = await rect();
    const mx = r.left + r.width / 2, my = r.top + 40;
    await ptr("pointerdown", 1, mx - 40, my); await ptr("pointerdown", 2, mx + 40, my, false);
    expect((await gest()).mode === "zoom", "Pinch startet nicht");
    await ptr("pointermove", 1, mx - 80, my); await ptr("pointermove", 2, mx + 80, my, false);
    await ptr("pointerup", 1, mx - 80, my); await ptr("pointerup", 2, mx + 80, my, false);
    void c;
    await stillWorks("nach Pinch");
  });
  await step("Hänger: Schicht ziehen, dann zweiter Finger (Pinch) – kein Zug, danach alles frei", async () => {
    const a = await xy([0, 1, 1], [0, 0, 1]), b = await xy([1, 1, 1], [0, 0, 1]);
    const st = await cubeState(page);
    await ptr("pointerdown", 1, a[0], a[1]);
    for (let i = 1; i <= 4; i++) await ptr("pointermove", 1, a[0] + ((b[0] - a[0]) * i) / 3, a[1] + ((b[1] - a[1]) * i) / 3);
    expect((await gest()).mode === "schicht", "Schichtgeste startet nicht");
    const r = await rect();
    await ptr("pointerdown", 2, r.left + 30, r.top + 30, false);
    expect((await gest()).mode === "zoom", "zweiter Finger startet keinen Pinch");
    await ptr("pointerup", 2, r.left + 30, r.top + 30, false);
    await ptr("pointerup", 1, a[0], a[1]);
    await cubeIdle(page);
    expect(await cubeState(page) === st, "Abgebrochene Schichtgeste hat einen Zug erzeugt");
    await stillWorks("nach Schicht+Pinch");
  });
  await step("Hänger: pointercancel mitten in jeder Geste", async () => {
    const r = await rect();
    for (const where of ["cube", "bg"]) {
      const p = where === "cube" ? await xy([0, 0, 1], [0, 0, 1]) : [r.left + 14, r.top + 30];
      await ptr("pointerdown", 1, p[0], p[1]);
      for (let i = 1; i <= 3; i++) await ptr("pointermove", 1, p[0] + 12 * i, p[1] - 10 * i);
      await ptr("pointercancel", 1, p[0] + 36, p[1] - 30);
      await cubeIdle(page);
      await stillWorks(`nach Abbruch (${where})`);
    }
  });
  await step("Hänger: zwei Finger in beiden Reihenfolgen loslassen, verlorenes Loslassen, Fokusverlust", async () => {
    const r = await rect(); const mx = r.left + r.width / 2, my = r.top + 40;
    for (const order of [[1, 2], [2, 1]]) {
      await ptr("pointerdown", 1, mx - 30, my); await ptr("pointerdown", 2, mx + 30, my, false);
      await ptr("pointermove", 2, mx + 60, my, false);
      for (const id of order) await ptr("pointerup", id, mx, my, id === 1);
      await idleNow(`Loslassen ${order.join("→")}`);
    }
    // Finger 1 geht verloren (kein pointerup), Finger 2 wird losgelassen, dann ein neuer Finger
    await ptr("pointerdown", 1, mx - 30, my); await ptr("pointerdown", 2, mx + 30, my, false); await ptr("pointerup", 2, mx + 30, my, false);
    expect((await gest()).ids.length === 1, "Finger 1 sollte noch offen sein");
    await sleep(500); // der alte Finger meldet sich nicht mehr
    await ptr("pointerdown", 3, mx, my, true); // neuer Hauptfinger (neue ID): der alte war hängen geblieben
    expect((await gest()).mode === "ansicht" && (await gest()).ids.length === 1, `neuer Finger zählt als zweiter (${JSON.stringify(await gest())})`);
    await ptr("pointerup", 3, mx, my, true);
    await stillWorks("nach verlorenem pointerup");
    // Fokusverlust und Verstecken mitten in der Geste
    await ptr("pointerdown", 1, mx, my);
    await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    await idleNow("blur");
    await ptr("pointerdown", 1, mx, my);
    await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
    await idleNow("visibilitychange");
    await page.evaluate(() => { delete document.hidden; });
    await stillWorks("nach Fokusverlust");
  });
  await step("Hänger: Mischen während einer Geste", async () => {
    const a = await xy([0, 1, 1], [0, 0, 1]), b = await xy([1, 1, 1], [0, 0, 1]);
    await ptr("pointerdown", 1, a[0], a[1]);
    for (let i = 1; i <= 4; i++) await ptr("pointermove", 1, a[0] + ((b[0] - a[0]) * i) / 3, a[1] + ((b[1] - a[1]) * i) / 3);
    await page.evaluate(() => [...document.querySelectorAll(".cz-btn")].find((b) => b.textContent.includes("Mischen")).click());
    await page.waitForFunction(() => document.querySelector(".cz-timer.is-ready"), null, { timeout: 40000 });
    await cubeIdle(page);
    await ptr("pointerup", 1, a[0], a[1]);
    await cubeIdle(page);
    const moves = await page.evaluate(() => [...document.querySelectorAll(".cz-moves.is-dim .cz-move")].map((x) => x.textContent));
    expect(moves.length === 25, `Mischung hat ${moves.length} Züge`);
    const st = await cubeState(page);
    const valid = await page.evaluate((s) => { const E = window.app.cube.engine; const c = E.cubeFromString(s); return !!c && [0, 1, 2, 3, 4, 5].every((f) => c.filter((v) => v === f).length === 9); }, st);
    expect(valid, "ungültiger Würfelzustand");
    expect(st === await engineState(page, moves), "Würfel passt nicht zur Mischung");
    await idleNow("nach Mischen");
    await stillWorks("nach Mischen mit Geste");
  });
  await step("Trägheit läuft aus und blockiert nichts", async () => {
    const c = await corner();
    await dragMouse(page, c.x, c.y, 200, 0, { steps: 6, wait: 4 });
    await sleep(100);
    const a = await xy([0, 0, 1], [0, 0, 1]);
    void a;
    // warten, bis die Trägheit ausgelaufen ist (langsame Rechner brauchen länger), dann darf nicht mehr gezeichnet werden
    let quiet = false;
    for (let t = 0; t < 40 && !quiet; t++) { const f0 = await page.evaluate(() => window.__cubeCounters.frames); await sleep(500); quiet = (await page.evaluate(() => window.__cubeCounters.frames)) === f0; }
    expect(quiet, "Zeichnen läuft nach dem Auslaufen weiter");
    await stillWorks("nach Trägheit");
  });

  // ---------- Teil B: Lösung zeigen ----------
  const mischen = async () => { await tap(page, V(".cz-btn").filter({ hasText: "Mischen" }).first(), 300); await page.waitForFunction(() => document.querySelector(".cz-timer.is-ready"), null, { timeout: 40000 }); await cubeIdle(page); };
  const idxText = async () => page.evaluate(() => (document.querySelector(".cz-pl-count")?.textContent ?? ""));
  const session = () => page.evaluate(() => window.__cubeSession);
  const stateAfter = async (n) => { const s = await session(); return engineStateFrom(s.start, s.moves.slice(0, n)); };
  const engineStateFrom = (start, moves) => page.evaluate(([st, m]) => { const E = window.app.cube.engine; return E.cubeToString(E.applyMoves(E.cubeFromString(st), m)); }, [start, moves]);
  const idxNow = async () => { const t = await idxText(); const m = /Zug (\d+) von/.exec(t); if (m) return Number(m[1]) - 1; const f = /(\d+) von (\d+) Zügen/.exec(t); return f ? Number(f[1]) : -1; };
  const btn = (label) => V(`button[aria-label="${label}"]`).first();

  await step("Lösung zeigen: Leiste direkt unter dem Würfel, Lösung in unter einer Sekunde, Phasen, Zähler", async () => {
    await mischen();
    const mainRect = await rect();
    await tap(page, V(".cz-pill").filter({ hasText: "Lösung zeigen" }).first(), 700);
    expect(await V(".cz-player").count() === 1, "Wiedergabeleiste fehlt");
    const info = await page.evaluate(() => window.__cubeSolve);
    expect(info.ms < 1000, `Lösung dauerte ${info.ms} ms`);
    const s = await session();
    expect(s.moves.length > 20 && s.phases.length >= 5, `Lösung mit ${s.moves.length} Zügen, ${s.phases.length} Phasen`);
    const pb = await V(".cz-player").first().boundingBox(); const sb = await V(".cz-stage").first().boundingBox();
    expect(pb.y >= sb.y + sb.height - 1 && pb.y - (sb.y + sb.height) < 70, "Leiste liegt nicht direkt unter dem Würfel");
    const r = await rect();
    expect(Math.abs(r.width - mainRect.width) < 1.5 && Math.abs(r.height - mainRect.height) < 1.5, "Würfel ändert die Größe bei der Wiedergabe");
    expect(/^Schritt \d · /.test(await V(".cz-pl-phase").first().textContent()), "Phasentitel fehlt");
    expect(new RegExp(`^Zug 1 von ${s.moves.length}$`).test(await idxText()), `Zähler: ${await idxText()}`);
    expect((await V(".cz-pl-move").first().textContent()) === s.moves[0], "großer Zug ist nicht der erste");
    for (const l of ["Zum Anfang", "Ein Zug zurück", "Ein Zug weiter", "Abspielen", "Zum Ende"]) {
      const bb = await btn(l).boundingBox();
      expect(bb && bb.width >= 43.5 && bb.height >= 43.5, `${l}: Tippfläche zu klein`);
    }
  });
  await step("Weiter spielt genau einen Zug, Zurück macht genau einen rückgängig", async () => {
    const s = await session();
    expect(await cubeState(page) === s.start.replace(/\s/g, ""), "Startzustand weicht ab");
    await tap(page, btn("Ein Zug weiter"), 100);
    await cubeIdle(page); await sleep(150);
    expect(await idxNow() === 1 && await cubeState(page) === await stateAfter(1), "Weiter ≠ genau ein Zug");
    await tap(page, btn("Ein Zug zurück"), 100);
    await cubeIdle(page); await sleep(150);
    expect(await idxNow() === 0 && await cubeState(page) === await stateAfter(0), "Zurück ≠ genau ein Zug");
  });
  await step("Schnelles Tippen: Warteschlange, Zustand stimmt immer mit dem Zähler überein", async () => {
    for (let i = 0; i < 5; i++) await btn("Ein Zug weiter").click({ delay: 0 });
    await cubeIdle(page); await sleep(300);
    expect(await idxNow() === 5 && await cubeState(page) === await stateAfter(5), `5× Weiter: Zähler ${await idxNow()}`);
    for (let i = 0; i < 3; i++) await btn("Ein Zug zurück").click({ delay: 0 });
    await cubeIdle(page); await sleep(300);
    expect(await idxNow() === 2 && await cubeState(page) === await stateAfter(2), `3× Zurück: Zähler ${await idxNow()}`);
    let seed = 5; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    for (let n = 0; n < (LIGHT ? 12 : 30); n++) {
      const fwd = rnd() < 0.6;
      await btn(fwd ? "Ein Zug weiter" : "Ein Zug zurück").click({ delay: 0, force: true }).catch(() => {});
      if (rnd() < 0.3) await sleep(Math.floor(rnd() * 200));
    }
    await cubeIdle(page); await sleep(400);
    const i = await idxNow();
    expect(i >= 0 && await cubeState(page) === await stateAfter(i), `Zufälliges Tippen: Zähler ${i} passt nicht zum Würfel`);
  });
  await step("Springen: Anfang, Ende, Phasenübersicht", async () => {
    await tap(page, btn("Zum Ende"), 200); await cubeIdle(page);
    const s = await session();
    expect(await cubeState(page) === await engineState(page, []) && await idxNow() === s.moves.length, "Ende ist nicht gelöst");
    await tap(page, btn("Zum Anfang"), 200); await cubeIdle(page);
    expect(await idxNow() === 0 && await cubeState(page) === await stateAfter(0), "Anfang stimmt nicht");
    await tap(page, V(".cz-fold").filter({ hasText: "Phasen" }).first(), 300);
    const rows = await V(".cz-pl-ph").count();
    expect(rows === s.phases.length, `Phasenzeilen ${rows}`);
    for (const k of [rows - 1, 2, 0, 3].filter((x) => x < rows)) {
      await tap(page, V(".cz-pl-ph").nth(k), 200); await cubeIdle(page); await sleep(100);
      expect(await idxNow() === s.phases[k].from && await cubeState(page) === await stateAfter(s.phases[k].from), `Phasensprung ${k + 1} landet nicht am Phasenbeginn`);
    }
    await check("Phasenübersicht");
  });
  await step("Abspielen: Pause hält an, Weiterspielen läuft bis gelöst (letzte Phase)", async () => {
    // erst ein Stück ab Anfang, dann Pause
    await tap(page, btn("Zum Anfang"), 200);
    await tap(page, V('button[aria-label^="Tempo"]').first(), 80); // 1× → 2×
    await tap(page, btn("Abspielen"), 400);
    await sleep(700);
    await tap(page, btn("Pause"), 300);
    await cubeIdle(page); await sleep(300);
    const i = await idxNow();
    expect(i > 0 && await cubeState(page) === await stateAfter(i), "Pause: Zustand passt nicht zum Zähler");
    await sleep(600);
    expect(await idxNow() === i, "Nach Pause läuft es weiter");
    // dann ab der letzten Phase zu Ende spielen
    const s = await session();
    if (!(await V(".cz-pl-ph").count())) await tap(page, V(".cz-fold").filter({ hasText: "Phasen" }).first(), 300);
    await tap(page, V(".cz-pl-ph").nth(s.phases.length - 1), 300); await cubeIdle(page);
    await tap(page, V('button[aria-label^="Tempo"]').first(), 80); // 2× → 4×
    await tap(page, btn("Abspielen"), 300);
    await page.waitForFunction(() => /Gelöst/.test(document.querySelector(".cz-pl-phase")?.textContent ?? ""), null, { timeout: 60000 });
    await cubeIdle(page);
    expect(await cubeState(page) === await engineState(page, []), "Nach dem Abspielen nicht gelöst");
  });
  await step("Eigener Zug während der Lösung: neu berechnet, nie ein falscher Zustand; X beendet, Würfel frei", async () => {
    await tap(page, btn("Zum Anfang"), 200); await cubeIdle(page);
    await tap(page, btn("Ein Zug weiter"), 200); await cubeIdle(page);
    await page.evaluate(() => { document.querySelector(".sheet-body").scrollTop = 0; window.__cube3d.setView(-10, 10); }); // Phasenliste war offen: Würfel wieder ins Bild
    const a = await xy([0, 1, 1], [0, 0, 1]), b = await xy([1, 1, 1], [0, 0, 1]);
    await dragMouse(page, a[0], a[1], (b[0] - a[0]) * 1.8, (b[1] - a[1]) * 1.8, { steps: 8, wait: 12 });
    await cubeIdle(page); await sleep(300);
    const s = await session();
    // die neue Lösung beginnt beim jetzigen Würfel und löst ihn
    expect(await cubeState(page) === s.start, "Neue Lösung beginnt nicht beim aktuellen Würfel");
    expect(await idxNow() === 0, "Zähler nicht zurückgesetzt");
    expect(/Neu berechnet/.test(await V(".cz-pl-reason").first().textContent()), "Hinweis „Neu berechnet“ fehlt");
    const solvedEnd = await page.evaluate((s2) => { const E = window.app.cube.engine; return E.isSolved(E.applyMoves(E.cubeFromString(s2.start), s2.moves)); }, s);
    expect(solvedEnd, "Neu berechnete Lösung löst den Würfel nicht");
    await tap(page, V('button[aria-label="Wiedergabe beenden"]').first(), 500);
    expect(await V(".cz-player").count() === 0, "Leiste bleibt nach X");
    await stillWorks("nach Beenden der Lösung");
  });
  await step("Tipp zeigt nur den nächsten Zug; gelöster Würfel meldet das", async () => {
    await mischen();
    const st = await cubeState(page);
    await tap(page, V(".cz-pill").filter({ hasText: "Tipp" }).first(), 300);
    await page.waitForFunction(() => /Nächster Zug: [UDLRFB]/.test(document.body.textContent), null, { timeout: 5000 });
    await cubeIdle(page);
    expect(await cubeState(page) === st, "Tipp hat den Würfel verändert");
    await neu();
    await tap(page, V(".cz-pill").filter({ hasText: "Lösung zeigen" }).first(), 400);
    await page.waitForFunction(() => /schon gelöst/.test(document.body.textContent), null, { timeout: 5000 });
    expect(await V(".cz-player").count() === 0, "Leiste bei gelöstem Würfel");
  });

  await context.close();
  await eng.browser.close();
}
const res = rep.finish({ engines: engines.map((e) => e.name), notes });
process.exit(res.failures.length ? 1 : 0);
