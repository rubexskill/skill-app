// Würfel-Trainer: Bedienung am 3D-Würfel (Ziehen, Treffer, Ansicht, Zoom), Zug-Eingabe, Zeitnahme, Lernpfad, Aufräumen. Chromium und WebKit.
import { buildDist, launchEngines, openApp, Report, layoutProblems, integrityProblems, tap, tabTap, sleep, openCube, closeSheet, cubeState, cubeIdle, userMoves, scrambleMoves, engineState, dragMouse } from "./lib.mjs";

const dist = buildDist();
const { engines, notes } = await launchEngines();
for (const n of notes) console.log("Hinweis: " + n);
const rep = new Report("cube");

for (const eng of engines) {
  const tag = eng.name;
  const { context, page, errors } = await openApp(dist, eng, { width: 390, height: 844 });
  const V = (sel) => page.locator(`${sel}:not([aria-hidden="true"] *)`).locator("visible=true");
  const check = async (name) => {
    await sleep(150);
    const lp = await layoutProblems(page); const ip = await integrityProblems(page); const er = errors.splice(0);
    if (lp.length) await rep.fail(page, `${tag} · ${name}: Layout ${lp.join(" | ")}`, `${tag}-${name}`); else rep.ok(true);
    if (ip.length) await rep.fail(page, `${tag} · ${name}: Daten ${ip.join(" | ")}`, `${tag}-daten`); else rep.ok(true);
    if (er.length) await rep.fail(page, `${tag} · ${name}: Konsole ${er.join(" | ").slice(0, 300)}`, `${tag}-konsole`); else rep.ok(true);
  };
  const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
  const step = async (name, fn) => {
    if (ONLY && !ONLY.test(name) && !/^(Mischen:|Zug-Eingabe)/.test(name)) return;
    try { await fn(); await check(name); } catch (e) { await rep.fail(page, `${tag} · ${name}: ${String(e.message).split("\n")[0].slice(0, 240)}`, `${tag}-${name}`); }
  };
  const expect = (cond, msg) => { if (!rep.ok(cond, `${tag} · ${msg}`)) throw new Error(msg); };
  const neu = async () => { await tap(page, V(".cz-btn").filter({ hasText: "Neu" }).first(), 500); await cubeIdle(page); };

  await openCube(page);
  const webgl = await page.evaluate(() => !!window.__cube3d);
  rep.ok(webgl, `${tag}: WebGL im Test-Browser verfügbar`);
  if (!webgl) { await context.close(); await eng.browser.close(); continue; }

  const xy = (pos, normal) => page.evaluate(([p, n]) => window.__cube3d.stickerXY(p, n), [pos, normal]);
  const proj = (p) => page.evaluate((q) => window.__cube3d.project(q), p);

  await step("Würfel erscheint in der richtigen Größe", async () => {
    const r = await page.evaluate(() => ({ rect: window.__cube3d.canvasRect(), pr: window.__cube3d.pixelRatio(), dpr: devicePixelRatio, host: document.querySelector(".cube3d").getBoundingClientRect().toJSON() }));
    expect(r.pr <= 2, `Pixeldichte ${r.pr} größer als 2`);
    expect(Math.abs(r.rect.width - r.host.width) < 2 && Math.abs(r.rect.height - r.host.height) < 2, "Zeichenfläche passt nicht zum Rahmen");
    expect(r.rect.width > 300 && r.rect.height > 240, `Zeichenfläche zu klein ${r.rect.width}×${r.rect.height}`);
    const a = await xy([0, 1, 1], [0, 0, 1]), b = await xy([1, 1, 1], [0, 0, 1]);
    expect(Math.hypot(a[0] - b[0], a[1] - b[1]) > 50, "Würfel zu klein dargestellt");
    expect(a[0] > r.rect.left && a[0] < r.rect.right && a[1] > r.rect.top && a[1] < r.rect.bottom, "Würfel liegt nicht in der Fläche");
  });

  // Ziehen auf einer Fläche dreht genau die erwartete Schicht (über den Würfelzustand geprüft)
  const cases = [
    { name: "Vorderseite, obere Reihe nach rechts", pos: [0, 1, 1], n: [0, 0, 1], to: [1, 1, 1], expect: "U'" },
    { name: "Vorderseite, untere Reihe nach rechts", pos: [0, -1, 1], n: [0, 0, 1], to: [1, -1, 1], expect: "D" },
    { name: "Vorderseite, mittlere Reihe nach rechts", pos: [0, 0, 1], n: [0, 0, 1], to: [1, 0, 1], expect: "E" },
    { name: "Vorderseite, rechte Spalte nach oben", pos: [1, 0, 1], n: [0, 0, 1], to: [1, 1, 1], expect: "R" },
    { name: "Vorderseite, linke Spalte nach oben", pos: [-1, 0, 1], n: [0, 0, 1], to: [-1, 1, 1], expect: "L'" },
    { name: "Vorderseite, mittlere Spalte nach oben", pos: [0, 0, 1], n: [0, 0, 1], to: [0, 1, 1], expect: "M'" },
    { name: "Oberseite, vordere Reihe nach rechts", pos: [0, 1, 1], n: [0, 1, 0], to: [1, 1, 1], expect: "F" },
    { name: "Rechte Seite, vordere Spalte nach oben", pos: [1, 0, 1], n: [1, 0, 0], to: [1, 1, 1], expect: "F'" },
  ];
  for (const c of cases) {
    await step(`Ziehen: ${c.name} → ${c.expect}`, async () => {
      await neu();
      const a = await xy(c.pos, c.n);
      const b = await xy(c.to, c.n);
      const ex = await xy(c.pos, c.n);
      void ex;
      const edge = [b[0] - a[0], b[1] - a[1]];
      await dragMouse(page, a[0], a[1], edge[0] * 1.7, edge[1] * 1.7);
      await cubeIdle(page);
      expect(await cubeState(page) === await engineState(page, [c.expect]), `${c.name}: erwartet ${c.expect}, Zustand weicht ab (Züge: ${(await userMoves(page)).join(" ")})`);
      expect((await userMoves(page)).join(" ") === c.expect, `${c.name}: angezeigter Zug ${(await userMoves(page)).join(" ")} statt ${c.expect}`);
    });
  }

  await step("Treffer: jede sichtbare Fläche und jeder Aufkleber dreht die berührte Schicht (2 Richtungen je Aufkleber)", async () => {
    let n = 0;
    for (const normal of [[0, 1, 0], [1, 0, 0], [0, 0, 1]]) {
      if (!(await page.evaluate((nn) => window.__cube3d.visible(nn), normal))) continue;
      const na = normal.findIndex((v) => v !== 0);
      const others = [0, 1, 2].filter((a) => a !== na);
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
        const pos = [0, 0, 0]; pos[na] = normal[na]; pos[others[0]] = i; pos[others[1]] = j;
        for (const axis of others) for (const sign of [1, -1]) {
          await neu();
          const exp = await page.evaluate(([p, nn, ax, s]) => {
            const E = window.app.cube.engine;
            const c = [p[0] + nn[0] * 0.5, p[1] + nn[1] * 0.5, p[2] + nn[2] * 0.5];
            const e = [0, 0, 0]; e[ax] = 1;
            const t = [e[1] * c[2] - e[2] * c[1], e[2] * c[0] - e[0] * c[2], e[0] * c[1] - e[1] * c[0]];
            const a = window.__cube3d.project(c), b = window.__cube3d.project([c[0] + s * t[0] * 0.04, c[1] + s * t[1] * 0.04, c[2] + s * t[2] * 0.04]);
            const dir = [b[0] - a[0], b[1] - a[1]];
            const len = Math.hypot(dir[0], dir[1]);
            const cp = window.__cube3d.project([p[0] + nn[0] * 0.5, p[1] + nn[1] * 0.5, p[2] + nn[2] * 0.5]);
            const edge = Math.hypot(...window.__cube3d.project([p[0] + (nn[0] ? 0 : 1) * 1, p[1] + (nn[1] ? 0 : 1) * 1, p[2]]).map((v, k) => v - window.__cube3d.project(p)[k]));
            if (len < 2) return null;
            // Fast gleiche Bildschirmrichtung für die andere Achse: Zuordnung mehrdeutig, kein Prüffall
            const o = [0, 1, 2].filter((k) => k !== ax && nn[k] === 0)[0];
            if (o !== undefined) {
              const e2 = [0, 0, 0]; e2[o] = 1;
              const t2 = [e2[1] * c[2] - e2[2] * c[1], e2[2] * c[0] - e2[0] * c[2], e2[0] * c[1] - e2[1] * c[0]];
              const b2 = window.__cube3d.project([c[0] + t2[0] * 0.04, c[1] + t2[1] * 0.04, c[2] + t2[2] * 0.04]);
              const d2 = [b2[0] - a[0], b2[1] - a[1]], l2 = Math.hypot(d2[0], d2[1]);
              if (l2 > 0.5 && Math.abs((d2[0] * dir[0] + d2[1] * dir[1]) / (l2 * len)) > 0.9) return null;
            }
            return { move: E.layerMove(ax, p[ax], s), start: cp, dir: [dir[0] / len, dir[1] / len], dist: (1.0 * len) / 0.04 };
          }, [pos, normal, axis, sign]);
          if (!exp) { rep.ok(true); continue; }
          if (exp.dist > 380) { rep.ok(true); continue; } // Fläche zu schräg: ein Radiant wäre weiter als der Bildschirm
          await dragMouse(page, exp.start[0], exp.start[1], exp.dir[0] * exp.dist, exp.dir[1] * exp.dist, { steps: 10, wait: 20, hold: 170 });
          await cubeIdle(page);
          const ok = (await cubeState(page)) === (await engineState(page, [exp.move]));
          if (!ok) { await rep.fail(page, `${tag} · Treffer: Aufkleber ${pos} Fläche ${normal} Achse ${axis}${sign > 0 ? "+" : "−"}: erwartet ${exp.move}, angezeigt „${(await userMoves(page)).join(" ")}“`, `${tag}-treffer`); } else rep.ok(true);
          n++;
        }
      }
    }
    expect(n >= 40, `nur ${n} Treffer-Prüfungen`);
  });

  await step("Kurzes, langsames Ziehen rastet zurück: kein Zug", async () => {
    await neu();
    const a = await xy([0, 1, 1], [0, 0, 1]), b = await xy([1, 1, 1], [0, 0, 1]);
    await dragMouse(page, a[0], a[1], (b[0] - a[0]) * 0.22, (b[1] - a[1]) * 0.22, { steps: 8, wait: 40 });
    await cubeIdle(page);
    expect(await cubeState(page) === await engineState(page, []), "kleiner Zug hat den Würfel verändert");
    expect((await userMoves(page)).length === 0, "kleiner Zug erscheint in den Zügen");
  });
  await step("Kurzer schneller Flick genügt für 90°", async () => {
    await neu();
    const a = await xy([0, 1, 1], [0, 0, 1]), b = await xy([1, 1, 1], [0, 0, 1]);
    await page.evaluate(async ([x, y, dx, dy]) => {
      const c = document.querySelector("canvas.cube3d-canvas") || document.querySelector(".cube3d canvas");
      const fire = (type, px, py) => c.dispatchEvent(new PointerEvent(type, { pointerId: 7, pointerType: "touch", isPrimary: true, bubbles: true, cancelable: true, clientX: px, clientY: py, buttons: type === "pointerup" ? 0 : 1 }));
      fire("pointerdown", x, y);
      for (let i = 1; i <= 5; i++) { fire("pointermove", x + (dx * i) / 5, y + (dy * i) / 5); const t0 = performance.now(); while (performance.now() - t0 < 12) { /* feste Zeit pro Schritt */ } }
      fire("pointerup", x + dx, y + dy);
    }, [a[0], a[1], (b[0] - a[0]) * 0.6, (b[1] - a[1]) * 0.6]);
    await cubeIdle(page);
    expect(await cubeState(page) === await engineState(page, ["U'"]), `Flick ergab „${(await userMoves(page)).join(" ")}“ statt U'`);
  });
  await step("Halbe Drehung: weit ziehen ergibt 180°", async () => {
    await neu();
    const a = await xy([-1, 1, 1], [0, 0, 1]), b = await xy([0, 1, 1], [0, 0, 1]);
    await dragMouse(page, a[0], a[1], (b[0] - a[0]) * 5, (b[1] - a[1]) * 5, { steps: 20, wait: 14 });
    await cubeIdle(page);
    const m = (await userMoves(page)).join(" ");
    expect(m === "U2" && await cubeState(page) === await engineState(page, ["U2"]), `weites Ziehen ergab „${m}“ statt U2`);
  });
  await step("Während des Einrastens startet keine zweite Drehung; der Zustand bleibt gültig", async () => {
    await neu();
    const a = await xy([0, 1, 1], [0, 0, 1]), b = await xy([1, 1, 1], [0, 0, 1]);
    const e = [b[0] - a[0], b[1] - a[1]];
    await dragMouse(page, a[0], a[1], e[0] * 1.7, e[1] * 1.7, { steps: 6, wait: 5 });
    // sofort die nächste Geste, während die erste noch einrastet
    const c = await xy([1, 0, 1], [0, 0, 1]);
    await dragMouse(page, c[0], c[1], 0, -Math.hypot(e[0], e[1]) * 1.7, { steps: 6, wait: 5 });
    await cubeIdle(page);
    const moves = await userMoves(page);
    expect(moves.length >= 1 && moves.length <= 2, `${moves.length} Züge nach zwei schnellen Gesten`);
    expect(await cubeState(page) === await engineState(page, moves), `Zustand passt nicht zu den angezeigten Zügen ${moves.join(" ")}`);
  });

  await step("Hintergrund ziehen dreht die Ansicht (Zustand bleibt), Doppeltippen stellt sie wieder her, Pinch zoomt begrenzt", async () => {
    await neu();
    const before = await xy([0, 1, 1], [0, 0, 1]);
    const rect = await page.evaluate(() => window.__cube3d.canvasRect());
    const bx = rect.left + 14, by = rect.top + rect.height - 14; // Ecke neben dem Würfel
    await dragMouse(page, bx, by, 120, -60, { steps: 12, wait: 16 });
    await sleep(900);
    const after = await xy([0, 1, 1], [0, 0, 1]);
    expect(Math.hypot(after[0] - before[0], after[1] - before[1]) > 25, "Ansicht hat sich nicht gedreht");
    expect(await cubeState(page) === await engineState(page, []), "Ansicht drehen hat den Würfel verändert");
    expect((await userMoves(page)).length === 0, "Ansicht drehen zählt als Zug");
    // Doppeltippen auf den Hintergrund
    await page.mouse.click(bx, by); await sleep(90); await page.mouse.click(bx, by);
    await sleep(900);
    const reset = await xy([0, 1, 1], [0, 0, 1]);
    expect(Math.hypot(reset[0] - before[0], reset[1] - before[1]) < 3, `Standardansicht nicht wiederhergestellt (${Math.round(Math.hypot(reset[0] - before[0], reset[1] - before[1]))} px daneben)`);
    if (eng.name === "chromium") {
      const cdp = await context.newCDPSession(page);
      const spread = async (d0, d1) => {
        const cx = rect.left + rect.width / 2, cy = by;
        const send = (type, pts) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: pts });
        await send("touchStart", [{ x: cx - d0 / 2, y: cy, id: 1 }, { x: cx + d0 / 2, y: cy, id: 2 }]);
        for (let i = 1; i <= 8; i++) { const d = d0 + ((d1 - d0) * i) / 8; await send("touchMove", [{ x: cx - d / 2, y: cy, id: 1 }, { x: cx + d / 2, y: cy, id: 2 }]); await sleep(16); }
        await send("touchEnd", []);
        await sleep(200);
      };
      const w0 = await page.evaluate(() => window.__cube3d.zoom());
      await spread(80, 200);
      const w1 = await page.evaluate(() => window.__cube3d.zoom());
      expect(w1 > w0 * 1.3, `Pinch vergrößert nicht (${w0} → ${w1})`);
      await spread(80, 600); await spread(80, 600);
      expect(await page.evaluate(() => window.__cube3d.zoom()) <= 1.71, "Zoom nicht nach oben begrenzt");
      await spread(300, 20); await spread(300, 20); await spread(300, 20);
      expect(await page.evaluate(() => window.__cube3d.zoom()) >= 0.64, "Zoom nicht nach unten begrenzt");
      expect(await cubeState(page) === await engineState(page, []), "Pinch hat den Würfel verändert");
    }
  });

  // ---------- Bedienung: Mischen, Zug-Eingabe, Zurück, Zeit ----------
  await step("Mischen: 25 Züge, Würfel zeigt genau diese Mischung, Zeit bereit", async () => {
    await tap(page, V(".cz-btn").filter({ hasText: "Mischen" }).first(), 300);
    await page.waitForFunction(() => document.querySelector(".cz-timer.is-ready"), null, { timeout: 20000 });
    await cubeIdle(page);
    const s = await scrambleMoves(page);
    expect(s.length === 25, `Mischung hat ${s.length} Züge`);
    expect(await cubeState(page) === await engineState(page, s), "Würfel passt nicht zur angezeigten Mischung");
    expect((await V(".cz-time").first().textContent()) === "0,00", "Zeit startet nicht bei 0,00");
    expect(/Bereit/.test(await V(".cz-note").first().textContent()), "„Bereit“ fehlt");
  });
  await step("Zug-Eingabe, Zurück (mehrfach), Zeit startet beim ersten Zug", async () => {
    const s = await scrambleMoves(page);
    await tap(page, V('button[aria-label="Züge eingeben"]').first(), 300);
    await V(".cz-type input").first().fill("Q");
    await tap(page, V(".cz-go").first(), 200);
    expect(/Unbekannter Zug/.test(await V(".cz-err").first().textContent()), "Fehlermeldung für unbekannten Zug fehlt");
    await V(".cz-type input").first().fill("R U R'");
    await tap(page, V(".cz-go").first(), 300);
    await cubeIdle(page);
    await sleep(500);
    expect((await userMoves(page)).join(" ") === "R U R'", `Züge: ${(await userMoves(page)).join(" ")}`);
    expect(await cubeState(page) === await engineState(page, [...s, "R", "U", "R'"]), "Zustand nach der Eingabe falsch");
    expect(await page.evaluate(() => document.querySelector(".cz-timer").classList.contains("is-running")), "Zeit läuft nach dem ersten Zug nicht");
    for (let i = 0; i < 3; i++) { await tap(page, V(".cz-btn").filter({ hasText: "Zurück" }).first(), 150); await cubeIdle(page); }
    expect((await userMoves(page)).length === 0, "Zurück entfernt nicht alle Züge");
    expect(await cubeState(page) === await engineState(page, s), "Zurück stellt die Mischung nicht her");
    expect(await V(".cz-btn").filter({ hasText: "Zurück" }).first().isDisabled(), "Zurück ist ohne Züge nicht deaktiviert");
    await V(".cz-type input").first().fill("");
  });
  await step("Gelöst: Zeit stoppt, wird gespeichert, erscheint im Verlauf mit Bestzeit", async () => {
    const s = await scrambleMoves(page);
    const inv = await page.evaluate((m) => window.app.cube.engine.invertMoves(m), s);
    await V(".cz-type input").first().fill(inv.join(" "));
    await tap(page, V(".cz-go").first(), 300);
    await page.waitForFunction(() => document.querySelector(".cz-timer.is-solved"), null, { timeout: 30000 });
    await cubeIdle(page);
    const t = await V(".cz-time").first().textContent();
    expect(/^\d+(:\d\d)?,\d\d$/.test(t) && t !== "0,00", `Zeit sieht falsch aus: ${t}`);
    expect(/Bestzeit/.test(await V(".cz-note").first().textContent()), "„Neue Bestzeit“ fehlt");
    const rows = await page.evaluate(() => window.db.cubeTimes.toArray());
    expect(rows.length === 1 && rows[0].scramble.split(" ").length === 25, "Zeit wurde nicht mit Mischung gespeichert");
    await tap(page, V('button[aria-label="Zeiten"]').first(), 500);
    expect(await V(".cz-rowtime").count() === 1 && (await V(".cz-stats b").first().textContent()) === t, "Verlauf zeigt Bestzeit nicht");
    // fünf weitere Zeiten: Ao5 erscheint; Zeit löschen und zurückholen
    await page.evaluate(async () => { for (const ms of [30000, 25000, 28000, 26000]) { await window.app.cube.store.addCubeTime(ms, "R", Date.now() + ms); } });
    await sleep(500);
    const stats = await V(".cz-stats b").allTextContents();
    expect(stats[1] !== "–", `Ao5 fehlt: ${stats}`);
    expect(stats[2] === "–", "Ao12 sollte mit 5 Zeiten leer sein");
    await tap(page, V(".rec-del").first(), 500);
    expect(await page.evaluate(() => window.db.cubeTimes.count()) === 4, "Zeit nicht gelöscht");
    await tap(page, V(".toast-action").first(), 500);
    expect(await page.evaluate(() => window.db.cubeTimes.count()) === 5, "Rückgängig stellt die Zeit nicht her");
    await tap(page, V(".fl-back").first(), 500);
  });
  await step("Notation antippen dreht die Schicht einmal vor, der Zustand bleibt", async () => {
    await neu();
    await V('button[aria-label="Züge eingeben"]').first().click().catch(() => {});
    await page.evaluate(() => document.querySelector(".cz-type input") || null);
    await tap(page, V(".cz-btn").filter({ hasText: "Mischen" }).first(), 300);
    await page.waitForFunction(() => document.querySelector(".cz-timer.is-ready"), null, { timeout: 20000 });
    await cubeIdle(page);
    const before = await cubeState(page);
    await tap(page, V(".cz-moves.is-dim .cz-move").first(), 100);
    await sleep(100);
    expect(await page.evaluate(() => window.__cube3d.busy()), "Vordrehen startet nicht");
    await cubeIdle(page);
    expect(await cubeState(page) === before, "Vordrehen hat den Zustand verändert");
  });

  // ---------- Lernpfad ----------
  await step("Lernpfad: sieben Schritte, „Zeig mir“ spielt den Algorithmus bis gelöst", async () => {
    await tap(page, V('button[aria-label="Lernpfad"]').first(), 500);
    expect(await V(".row").filter({ hasText: /^\d\./ }).count() === 7, "Lernpfad hat nicht 7 Schritte");
    await tap(page, V(".row").filter({ hasText: "Weiße Ecken" }).first(), 500);
    await tap(page, V(".cz-algo-actions .cz-btn").filter({ hasText: "Zeig mir" }).first(), 900);
    const start = await cubeState(page);
    expect(start !== await engineState(page, []), "Der Fall ist schon gelöst");
    await tap(page, V(".cz-btn").filter({ hasText: "Start" }).first(), 300);
    await page.waitForFunction(() => { const s = window.__cube3d?.state(); return s && [0, 1, 2, 3, 4, 5].every((f) => new Set(s.slice(f * 9, f * 9 + 9)).size === 1); }, null, { timeout: 30000 });
    await cubeIdle(page);
    expect(await cubeState(page) === await engineState(page, []), "Nach dem Vorspielen ist der Würfel nicht gelöst");
  });
  await step("Lernpfad: Üben – der Fall wird mit der Umkehrung aufgebaut, Lösen per Eingabe speichert „kann ich“", async () => {
    await tap(page, V(".fl-back").first(), 500); // zurück zum Schritt
    await tap(page, V(".cz-algo-actions .cz-btn").filter({ hasText: "Üben" }).first(), 900);
    await cubeIdle(page);
    const caseState = await cubeState(page);
    const algo = await page.evaluate(() => window.app.cube.path.ALGOS.find((a) => a.id === "ecken-rechts").notation);
    expect(caseState === await page.evaluate((a) => { const E = window.app.cube.engine; return E.cubeToString(E.applyMoves(E.solvedCube(), E.invertMoves(E.parseMoves(a)))); }, algo), "Fall entspricht nicht der Umkehrung des Algorithmus");
    await tap(page, V('button[aria-label="Züge eingeben"]').first(), 300);
    await V(".cz-type input").first().fill(algo);
    await tap(page, V(".cz-go").first(), 300);
    await page.waitForSelector(".cz-done", { timeout: 20000 });
    const prog = await page.evaluate(() => window.db.cubeProgress.toArray());
    expect(prog.some((p) => p.id === "ecken-rechts" && p.state === "kann"), "Fortschritt „kann ich“ nicht gespeichert");
    await tap(page, V(".cz-btn").filter({ hasText: "Noch üben" }).first(), 500);
    expect((await page.evaluate(() => window.db.cubeProgress.get("ecken-rechts"))).state === "ueben", "„Noch üben“ nicht gespeichert");
    await tap(page, V(".fl-back").first(), 500);
    await tap(page, V(".fl-back").first(), 500);
    expect(await V(".cz-dot.is-ueben").count() === 1, "Schritt „Weiße Ecken“ zeigt nicht „noch üben“");
    await tap(page, V(".fl-back").first(), 500);
  });

  // ---------- Aufräumen: mehrfach öffnen und schließen ----------
  await step("Mehrfach öffnen und schließen: Zeichenkontext, Listener und Animationen werden aufgeräumt", async () => {
    await closeSheet(page);
    await sleep(700);
    const base = await page.evaluate(() => ({ ...window.__cubeCounters }));
    for (let i = 0; i < 8; i++) {
      await openCube(page);
      await tap(page, V(".cz-btn").filter({ hasText: "Mischen" }).first(), 200);
      await sleep(300);
      await closeSheet(page);
      await sleep(600);
    }
    const end = await page.evaluate(() => ({ ...window.__cubeCounters, cube: !!window.__cube3d, canvases: document.querySelectorAll("canvas.cube3d-canvas").length }));
    expect(end.created - base.created === 8 && end.destroyed - base.destroyed === 8, `Szenen angelegt ${end.created - base.created}, aufgeräumt ${end.destroyed - base.destroyed}`);
    expect(end.listeners === base.listeners && end.listeners === 0, `Listener übrig: ${end.listeners}`);
    expect(!end.cube && end.canvases === 0, "Zeichenfläche oder Testzugang bleibt nach dem Schließen stehen");
    const f1 = end.frames; await sleep(900);
    expect(await page.evaluate(() => window.__cubeCounters.frames) === f1, "Es wird nach dem Schließen noch gezeichnet");
  });
  await step("Im Ruhezustand wird nicht dauernd gezeichnet (Akku)", async () => {
    await openCube(page);
    await sleep(1500);
    const f1 = await page.evaluate(() => window.__cubeCounters.frames);
    await sleep(1200);
    expect(await page.evaluate(() => window.__cubeCounters.frames) === f1, "Zeichenschleife läuft im Ruhezustand weiter");
    await closeSheet(page);
  });

  await context.close();
  await eng.browser.close();
}
const res = rep.finish({ engines: engines.map((e) => e.name), notes });
process.exit(res.failures.length ? 1 : 0);
