// Szenario-Tests: echte Abläufe wie ein Mensch (Tippen per Touch, Eingaben, Wischen), in Chromium und WebKit.
// Nach jedem Schritt: Layout, Konsole, Datenintegrität.
import fs from "node:fs";
import path from "node:path";
import { buildDist, launchEngines, openApp, Report, layoutProblems, integrityProblems, snapshot, blobsWork, tap, tabTap, sleep, resultsDir, flagProblems, openFlags, flagAnswer, flagReady } from "./lib.mjs";

const dist = buildDist();
const { engines, notes } = await launchEngines();
for (const n of notes) console.log("Hinweis: " + n);
const rep = new Report("scenarios");
const skipped = [];

/** Ein webm-Testvideo, im Browser aufgenommen (nur wo MediaRecorder webm kann). */
const makeVideo = (page) => page.evaluate(async () => {
  try {
    const c = document.createElement("canvas"); c.width = 160; c.height = 100; const ctx = c.getContext("2d");
    const rec = new MediaRecorder(c.captureStream(30), { mimeType: "video/webm" }); const chunks = []; rec.ondataavailable = (e) => chunks.push(e.data);
    const done = new Promise((r) => (rec.onstop = r)); rec.start(); let n = 0; const iv = setInterval(() => { ctx.fillStyle = n++ % 2 ? "#468" : "#864"; ctx.fillRect(0, 0, 160, 100); }, 40);
    await new Promise((r) => setTimeout(r, 1400)); clearInterval(iv); rec.stop(); await done;
    const buf = new Uint8Array(await new Blob(chunks).arrayBuffer());
    let s = ""; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    return buf.length > 500 ? btoa(s) : null;
  } catch { return null; }
});

for (const eng of engines) {
  const tag = eng.name;
  const { context, page, errors } = await openApp(dist, eng, { width: 390, height: 844 });
  const blobs = await blobsWork(page);
  if (!blobs) skipped.push(`${tag}: Playwright-WebKit speichert keine Blobs in IndexedDB → Clip-/Aufnahme-Dateien dort nicht prüfbar`);
  const V = (sel) => page.locator(`${sel}:not([aria-hidden="true"] *)`).locator("visible=true");
  const sheetBtn = (label) => page.locator(".sheet-layer.is-shown .sheet-bar button, .sheet-layer.is-shown .sheet-head button", { hasText: label }).first();
  const asBtn = (label) => page.locator(".as-layer.is-shown .as-btn", { hasText: label }).first();
  const fold = (name) => V(".fold-head").filter({ hasText: name }).first();
  const db = (fn, arg) => page.evaluate(fn, arg);

  const check = async (name) => {
    await sleep(200);
    const lp = [...(await layoutProblems(page)), ...(await flagProblems(page))];
    const ip = await integrityProblems(page);
    const er = errors.splice(0);
    if (lp.length) await rep.fail(page, `${tag} · ${name}: Layout ${lp.join(" | ")}`, `${tag}-${name}`); else rep.ok(true);
    if (ip.length) await rep.fail(page, `${tag} · ${name}: Daten ${ip.join(" | ")}`, `${tag}-daten`); else rep.ok(true);
    if (er.length) await rep.fail(page, `${tag} · ${name}: Konsole ${er.join(" | ").slice(0, 300)}`, `${tag}-konsole`); else rep.ok(true);
  };
  const step = async (name, fn, { skip } = {}) => {
    if (skip) { skipped.push(`${tag} · ${name}: ${skip}`); return; }
    try { await fn(); await check(name); } catch (e) { await rep.fail(page, `${tag} · ${name}: ${String(e.message).split("\n")[0].slice(0, 220)}`, `${tag}-${name}`); await page.keyboard.press("Escape").catch(() => {}); }
  };
  const expect = (cond, msg) => { if (!rep.ok(cond, `${tag} · ${msg}`)) throw new Error(msg); };

  // ---------- Skill ----------
  await step("Skill anlegen", async () => {
    await tabTap(page, "Übersicht");
    await tap(page, V('button[aria-label="Neuer Eintrag"]').first());
    await V(".sheet-layer.is-shown input").first().fill("Spanisch lernen");
    await tap(page, sheetBtn("Hinzufügen"), 900);
    expect(await db(() => window.db.skills.filter((s) => s.title === "Spanisch lernen").count()) === 1, "Skill „Spanisch lernen“ wurde nicht gespeichert");
    expect(/Spanisch/.test(await V(".large-title").last().textContent()), "Skill-Seite zeigt den Titel nicht");
  });
  await step("Status ändern", async () => {
    await tap(page, V(".status-menu").first());
    await tap(page, asBtn("Aktiv"));
    expect(await db(() => window.db.skills.filter((s) => s.title === "Spanisch lernen").first().then((s) => s.status)) === "lerne", "Status nicht auf „Aktiv“ gesetzt");
  });
  await step("Notiz speichern", async () => {
    await tap(page, fold("Notizen"));
    await V(".fold-body textarea").first().fill("Vokabeln jeden Tag üben – ñandú");
    await sleep(900);
    expect(await db(() => window.db.skills.filter((s) => s.title === "Spanisch lernen").first().then((s) => s.notes)) === "Vokabeln jeden Tag üben – ñandú", "Notiz nicht gespeichert");
  });
  await step("Link speichern", async () => {
    await tap(page, fold("Links & Videos"));
    await tap(page, V(".row").filter({ hasText: "Link hinzufügen" }).first());
    await V(".sheet-layer.is-shown input").nth(0).fill("example.com/spanisch");
    await V(".sheet-layer.is-shown input").nth(1).fill("Kurs");
    await tap(page, sheetBtn("Sichern"), 700);
    expect(await db(() => window.db.skills.filter((s) => s.title === "Spanisch lernen").first().then((s) => s.links.length)) === 1, "Link nicht gespeichert");
  });
  await step("Session hinzufügen", async () => {
    await tap(page, fold("Sessions"));
    await tap(page, V(".row").filter({ hasText: "Session hinzufügen" }).first());
    await sleep(500);
    await tap(page, sheetBtn("Sichern"), 700).catch(async () => { await tap(page, sheetBtn("Hinzufügen"), 700); });
    expect(await db(() => window.db.sessions.count()) >= 1, "Session nicht gespeichert");
  });

  // ---------- Stück, Abschnitt ----------
  await step("Stück anlegen", async () => {
    await db(async () => { const s = await window.db.skills.filter((x) => x.title === "Spanisch lernen").first(); await window.db.skills.update(s.id, { useUnits: true }); });
    await sleep(500);
    await tap(page, V(".unit-add").first());
    await V(".sheet-layer.is-shown input").first().fill("Lied Nr. 1");
    await tap(page, sheetBtn("Anlegen"), 900);
    expect(await db(() => window.db.units.filter((u) => u.title === "Lied Nr. 1").count()) === 1, "Stück nicht angelegt");
  });
  await step("Abschnitt anlegen", async () => {
    await tap(page, V(".text-btn").filter({ hasText: "Abschnitt hinzufügen" }).first());
    await V(".sheet-layer.is-shown input").first().fill("Strophe 1");
    await tap(page, sheetBtn("Hinzufügen"), 900);
    expect(await db(() => window.db.parts.filter((p) => p.name === "Strophe 1").count()) === 1, "Abschnitt nicht angelegt");
  });
  await step("Abschnitt: Notiz und Link", async () => {
    await tap(page, fold("Notizen"));
    await V(".fold-body textarea").first().fill("Linke Hand langsam");
    await tap(page, V(".inline-btn").filter({ hasText: "Sichern" }).first());
    await tap(page, fold("Links"));
    await tap(page, V(".row").filter({ hasText: "Link hinzufügen" }).first());
    await V(".sheet-layer.is-shown input").nth(0).fill("https://example.com/noten");
    await tap(page, sheetBtn("Sichern"), 700);
    const p = await db(() => window.db.parts.filter((x) => x.name === "Strophe 1").first());
    expect(p.notes.length === 1 && p.links.length === 1, `Abschnitt: Notiz/Link nicht gespeichert (${p.notes.length}/${p.links.length})`);
  });

  // ---------- Clip, Player ----------
  const video = blobs ? await makeVideo(page) : null;
  await step("Clip hinzufügen", async () => {
    const buf = Buffer.from(video, "base64");
    await page.locator('input[type=file][accept="video/*"]').first().setInputFiles({ name: "test.webm", mimeType: "video/webm", buffer: buf });
    for (let i = 0; i < 40; i++) { if (await db(() => window.db.parts.filter((p) => p.clips.length > 0).count())) break; await sleep(200); }
    const p = await db(() => window.db.parts.filter((x) => x.name === "Strophe 1").first());
    expect(p.clips.length === 1 && /^Clip 1$/.test(p.clips[0].title ?? "Clip 1"), `Clip nicht gespeichert (${p.clips.length} Clips, Video ${Math.round((video?.length ?? 0) * 0.75)} Byte, Eingaben ${await page.locator("input[type=file]").count()}, Toast ${await page.locator(".toast").textContent()}, Blobs ${await db(() => window.db.clipBlobs.count())}, Teile ${JSON.stringify(await db(() => window.db.parts.toArray().then((a) => a.map((x) => [x.name, x.clips.length, x.unitId]))))}, Konsole ${errors.join("|")})`);
    await sleep(600);
  }, { skip: !video ? (blobs ? "Chromium/WebKit kann hier kein webm aufnehmen" : "Blobs nicht speicherbar") : undefined });
  await step("Player: öffnen, Tempo, Schleife, schließen", async () => {
    await tap(page, V(".clip-row").first(), 800);
    expect(await page.locator(".fsp").count() === 1, "Player öffnet nicht");
    await tap(page, V(".fsp-cap").filter({ hasText: "0,5×" }).first(), 250).catch(async () => { await tap(page, page.locator(".fsp-hit"), 300); await tap(page, V(".fsp-cap").filter({ hasText: "0,5×" }).first(), 250); });
    expect(await page.evaluate(() => document.querySelector(".fsp video").playbackRate) === 0.5, "Tempo 0,5× nicht gesetzt");
    await tap(page, V('.fsp-btn[aria-label="Dauerschleife"]').first(), 250);
    await tap(page, V(".fsp-center").first(), 600);
    await tap(page, V(".fsp-x").first(), 700);
    expect(await page.locator(".fsp").count() === 0, "Player schließt nicht");
  }, { skip: !video ? "kein Test-Clip" : undefined });
  await step("Clip umbenennen und löschen", async () => {
    await tap(page, V(".clip-more").first());
    await tap(page, asBtn("Umbenennen"));
    await V(".sheet-layer.is-shown input").first().fill("Rechte Hand");
    await tap(page, sheetBtn("Sichern"), 600);
    expect((await db(() => window.db.parts.filter((x) => x.name === "Strophe 1").first())).clips[0].title === "Rechte Hand", "Clip nicht umbenannt");
    await tap(page, V(".clip-more").first());
    await tap(page, asBtn("Löschen"), 700);
    expect((await db(() => window.db.parts.filter((x) => x.name === "Strophe 1").first())).clips.length === 0, "Clip nicht gelöscht");
    await tap(page, V(".toast-action").first(), 600);
    expect((await db(() => window.db.parts.filter((x) => x.name === "Strophe 1").first())).clips.length === 1, "Rückgängig stellt den Clip nicht her");
  }, { skip: !video ? "kein Test-Clip" : undefined });

  // ---------- Metronom, Aufnahme ----------
  await step("Metronom", async () => {
    await tap(page, fold("Metronom"));
    await tap(page, V(".metro-btn").first(), 800);
    expect(await V(".metro-btn.is-running").count() === 1, "Metronom startet nicht");
    await tap(page, V(".metro-btn").first(), 300);
    expect(await V(".metro-btn.is-running").count() === 0, "Metronom stoppt nicht");
  });
  await step("Aufnahme (Fake-Mikrofon)", async () => {
    await tap(page, fold("Aufnahmen"));
    await tap(page, V(".row").filter({ hasText: "Aufnahme starten" }).first(), 1500);
    if (eng.name === "chromium") {
      expect(await V(".rec-stop").count() === 1, "Aufnahme startet nicht (Fake-Mikrofon)");
      await sleep(1200);
      await tap(page, V(".rec-stop").first(), 900);
      const n = await db(() => window.db.recordings.filter((r) => r.name === "Aufnahme 1").count());
      expect(n === 1, "Aufnahme nicht als „Aufnahme 1“ gespeichert");
    } else {
      expect(await V(".rec-detail").count() > 0 || await V(".rec-stop").count() > 0, "Weder Aufnahme noch lesbare Fehlermeldung");
    }
  }, { skip: !blobs ? "Blobs nicht speicherbar" : undefined });
  await step("Aufnahme wird gesichert, wenn die App in den Hintergrund geht", async () => {
    const before = await db(() => window.db.recordings.count());
    await tap(page, V(".row").filter({ hasText: "Aufnahme starten" }).first(), 1500);
    expect(await V(".rec-stop").count() === 1, "Aufnahme startet nicht");
    await sleep(1000);
    await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
    await page.waitForFunction((n) => window.db.recordings.count().then((c) => c === n + 1), before, { timeout: 8000 }).catch(() => {});
    await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event("visibilitychange")); });
    expect(await db(() => window.db.recordings.count()) === before + 1, "Aufnahme ging beim Verlassen der App verloren");
    expect(await V(".rec-stop").count() === 0, "Aufnahme läuft nach dem Verlassen weiter");
    await db(async () => { const last = (await window.db.recordings.orderBy("at").last()); if (last) { await window.db.recordings.delete(last.id); await window.db.recBlobs.delete(last.id); } });
  }, { skip: eng.name !== "chromium" || !blobs ? "nur mit Fake-Mikrofon und Blobs (Chromium)" : undefined });
  await step("Aufnahme umbenennen und löschen", async () => {
    await tap(page, V(".row").filter({ hasText: "Aufnahme 1" }).first());
    await V(".sheet-layer.is-shown input").first().fill("Refrain");
    await tap(page, sheetBtn("Sichern"), 600);
    expect(await db(() => window.db.recordings.filter((r) => r.name === "Refrain").count()) === 1, "Aufnahme nicht umbenannt");
    await tap(page, V(".rec-del").first(), 600);
    expect(await db(() => window.db.recordings.filter((r) => r.name === "Refrain").count()) === 0, "Aufnahme nicht gelöscht");
    await tap(page, V(".toast-action").first(), 600);
    expect(await db(() => window.db.recordings.filter((r) => r.name === "Refrain").count()) === 1, "Rückgängig stellt die Aufnahme nicht her");
  }, { skip: eng.name !== "chromium" ? "nur mit Fake-Mikrofon (Chromium)" : undefined });

  // ---------- To-dos ----------
  await step("To-do anlegen und abhaken", async () => {
    await tabTap(page, "To-dos");
    const input = V(".compose input").first();
    await tap(page, input, 200);
    await input.fill("Kuchen backen morgen");
    await page.keyboard.press("Enter"); await sleep(600);
    const t = await db(() => window.db.todos.filter((x) => x.text === "Kuchen backen").first());
    expect(!!t && !!t.due, "To-do mit „morgen“ nicht angelegt");
    await tap(page, V(".todo-row", { hasText: "Kuchen" }).locator(".check").first(), 1200);
    expect((await db(() => window.db.todos.filter((x) => x.text === "Kuchen backen").first())).done === true, "Haken erledigt nicht");
  });
  const todoSwipe = async (text, dx) => {
    const row = V(".todo-card .todo-row").filter({ hasText: text }).first();
    await row.evaluate((e) => e.scrollIntoView({ block: "center" })); await sleep(150);
    const b = await row.boundingBox(); const y = b.y + b.height / 2; const x0 = b.x + b.width / 2;
    await page.mouse.move(x0, y); await page.mouse.down();
    for (let i = 1; i <= 8; i++) { await page.mouse.move(x0 + (dx * i) / 8, y + 1); await sleep(16); }
    await page.mouse.up(); await sleep(1100);
  };
  await step("To-do wischen: morgen und löschen", async () => {
    await db(async () => { const l = await window.db.lists.toArray(); await window.app.logic.addTodo("Wischen A", l[0].id, null); await new Promise((r) => setTimeout(r, 6)); await window.app.logic.addTodo("Wischen B", l[0].id, null); });
    await sleep(600);
    await todoSwipe("Wischen A", 160);
    const a = await db(() => window.db.todos.filter((x) => x.text === "Wischen A").first());
    const b = await db(() => window.db.todos.filter((x) => x.text === "Wischen B").first());
    const tomorrow = await db(() => { const d = new Date(); d.setDate(d.getDate() + 1); return window.app.logic.dayKey(d); });
    expect(a.due === tomorrow && !b.due, `Wischen rechts: A ${a.due}, B ${b.due}`);
    await todoSwipe("Wischen B", -160);
    expect(await db(() => window.db.todos.filter((x) => x.text === "Wischen B").count()) === 0, "Wischen links löscht nicht");
    await tap(page, V(".toast-action").first(), 600);
    expect(await db(() => window.db.todos.filter((x) => x.text === "Wischen B").count()) === 1, "Rückgängig stellt das To-do nicht her");
  });
  await step("To-do Suche und Alle-Ansicht", async () => {
    await tap(page, V('button[aria-label="To-dos durchsuchen"]').first());
    await V(".todo-search input").first().fill("wischen");
    await sleep(500);
    expect(await V(".todo-card .todo-row").count() === 2, "Suche findet nicht beide Treffer");
    expect(await V("mark.hit").count() >= 2, "Treffer nicht hervorgehoben");
    await tap(page, V(".todo-search-x").first());
    const heads = await V(".all-card .todo-sub").allTextContents();
    expect(heads.some((h) => /^Morgen/.test(h)) && /Ohne Datum/.test(heads[heads.length - 1] ?? ""), `Alle-Ansicht: ${JSON.stringify(heads)}`);
  });

  // ---------- Aufräumen ----------
  await step("Aufräumen: duplizieren, löschen, zusammenführen", async () => {
    const sids = await db(async () => {
      const l = await window.db.lists.toArray(); const L = window.app.logic;
      await L.addTodo("zahnarzt", l[0].id, null, true); await L.addTodo("Zahnarzt anrufen", l[0].id, null, true); await L.addTodo("asdf", l[0].id, null, true);
      const items = (await window.app.tidy.collectUnsorted()).filter((i) => ["zahnarzt", "Zahnarzt anrufen", "asdf"].includes(i.text));
      return Object.fromEntries(items.map((i) => [i.text, i.sid]));
    });
    await sleep(600);
    await tap(page, V(".tidy-go").first(), 700);
    const answer = JSON.stringify([
      { id: sids["Zahnarzt anrufen"], art: "todo", titel: "Zahnarzt anrufen", liste: "Allgemein", datum: null },
      { id: sids["zahnarzt"], aktion: "duplikat_von", duplikat_von: sids["Zahnarzt anrufen"] },
      { id: sids["asdf"], aktion: "loeschen" },
    ]);
    await V(".sheet-layer.is-shown textarea").first().fill("```json\n" + answer + "\n```");
    await tap(page, V(".sheet-layer.is-shown .row").filter({ hasText: "Vorschau zeigen" }).first(), 800);
    await tap(page, sheetBtn("Übernehmen"), 800);
    if (await page.locator(".as-layer.is-shown").count()) await tap(page, asBtn("Jetzt übernehmen"), 900);
    const left = await db(() => window.db.todos.filter((x) => ["zahnarzt", "Zahnarzt anrufen", "asdf"].includes(x.text)).toArray().then((a) => a.map((t) => t.text)));
    expect(left.length === 1 && left[0] === "Zahnarzt anrufen", `Aufräumen: übrig ${JSON.stringify(left)}`);
    await tap(page, V(".toast-action").first(), 700).catch(() => {});
  });


  // ---------- Gewohnheit ----------
  await step("Gewohnheit: Detailseite ohne Timer, mit Haken, Serie in Tagen und Wochenpunkten", async () => {
    const hid = await db(async () => {
      const h = await window.app.logic.createSkill({ name: "Gummizüge tragen", title: "Gummizüge tragen", kategorie: "Gewohnheiten", typ: "gewohnheit", status: "lerne" });
      await window.db.sessions.put({ id: "habit-session", skillId: h.id, start: Date.now() - 3 * 86400000, minutes: 15 });
      return h.id;
    });
    await tabTap(page, "Heute");
    await tap(page, V(".row").filter({ hasText: "Gummizüge tragen" }).first(), 900);
    expect(await V(".habit-check").count() === 1, "Haken-Knopf „Heute erledigt“ fehlt");
    const text = await page.evaluate(() => document.querySelector(".habit-detail")?.parentElement?.textContent ?? "");
    for (const bad of ["min/Einheit", "Einheit 15", "Rekorde", "Sessions", "Timer"]) expect(!text.includes(bad), `„${bad}“ steht noch auf der Gewohnheits-Seite`);
    expect(await V(".hero, .hero-btn, .ring").count() === 0, "Timer-Kreis oder Play-Knopf sichtbar");
    expect(/Aktiv/.test(await V(".status-menu").first().textContent()), "Status „Aktiv“ fehlt");
    expect(/Beste Serie/.test(await V(".habit-nums").first().textContent()) && /in Folge/.test(await V(".habit-nums").first().textContent()), "Serie in Tagen fehlt");
    const dot = await V(".week-dots.is-big .week-dot i").first().boundingBox();
    expect(dot && dot.width >= 22, "Wochenpunkte sind nicht größer");
    expect(await V(".fold-head").filter({ hasText: "Notizen" }).count() === 1, "Notizen sind nicht einklappbar");
    const hb = await V(".habit-check").first().boundingBox();
    expect(hb.width >= 44 && hb.height >= 44, "Haken-Knopf zu klein");
    // antippen = abgehakt, nochmal = zurück (ein Haken pro Tag)
    await tap(page, V(".habit-check").first(), 500);
    expect(await db((id) => window.db.checks.where("skillId").equals(id).count(), hid) === 1, "Haken wurde nicht gespeichert");
    expect(/Heute erledigt$/.test((await V(".habit-check-label").first().textContent()) ?? ""), "Beschriftung zeigt „erledigt“ nicht");
    expect(/1 Tag/.test(await V(".habit-nums").first().textContent()), "Serie zeigt nicht 1 Tag");
    await tap(page, V(".habit-check").first(), 500);
    expect(await db((id) => window.db.checks.where("skillId").equals(id).count(), hid) === 0, "zweites Antippen nimmt den Haken nicht zurück");
    // Sessions bleiben erhalten
    expect(await db(() => window.db.sessions.get("habit-session").then((x) => !!x)), "Session der Gewohnheit ging verloren");
    await tap(page, V(".nav-back, .back-btn, .nav-bar button").first(), 500).catch(() => {});
  });

  // ---------- Flaggen-Trainer ----------
  await step("Flaggen: Skill ist da, Trainer öffnet", async () => {
    await db(() => { localStorage.removeItem("flags.run"); });
    await tabTap(page, "Übersicht");
    await openFlags(page);
    expect(await V(".fl-go").count() === 1, "Üben-Knopf fehlt");
    expect(/von 195 sicher/.test(await V(".fl-sure").first().textContent()), "„x von 195 sicher“ fehlt");
    expect(await V(".fl-chip").count() === 2, "Auswahl für Umfang und Bereich fehlt");
  });
  await step("Flaggen: Quiz mit 10 Fragen (7 richtig, 3 falsch), Ergebnis, Fehler wiederholen", async () => {
    await tap(page, V(".fl-go").first(), 700);
    // Nach Flagge, nicht nach Position: die 3., 6. und 8. neue Flagge wird falsch beantwortet, Wiederholungen (kommen im selben Durchgang wieder) richtig
    const seen = new Set();
    const decide = (info) => { if (seen.has(info.iso)) return true; seen.add(info.iso); return ![3, 6, 8].includes(seen.size); };
    for (let i = 0; i < 40; i++) {
      await flagReady(page);
      if (await V(".fl-score").count()) break;
      const w = await page.locator(".fl-bar i").first().evaluate((e) => parseFloat(e.style.width));
      expect(w >= 0 && w <= 100, "Fortschrittsbalken außerhalb 0–100 %");
      await flagAnswer(page, decide);
    }
    await page.waitForSelector(".fl-score", { timeout: 8000 });
    expect(/70/.test(await V(".fl-score").first().textContent()), "Ergebnis ist nicht 70 %");
    expect(await V(".fl-miss li").count() === 3, "Liste der falschen Flaggen hat nicht 3 Zeilen");
    const stats = await db(() => window.db.flagStats.toArray());
    expect(stats.length >= 10, `Lernstand zu wenig Zeilen: ${stats.length}`);
    expect(stats.filter((x) => x.wrong >= 1).length >= 3, "Fehler nicht im Lernstand");
    await tap(page, V(".fl-big").filter({ hasText: "Fehler wiederholen" }).first(), 700);
    for (let i = 0; i < 3; i++) await flagAnswer(page, true);
    await page.waitForSelector(".fl-score", { timeout: 8000 });
    expect(/100/.test(await V(".fl-score").first().textContent()), "Wiederholung nicht 100 %");
    expect(await V(".fl-big").filter({ hasText: "Fehler wiederholen" }).count() === 0, "„Fehler wiederholen“ trotz 100 %");
    await tap(page, V(".fl-big").filter({ hasText: "Fertig" }).first(), 500);
    expect(await V(".fl-go").count() === 1, "Nach „Fertig“ nicht auf der Startseite");
  });
  await step("Flaggen: abbrechen und fortsetzen", async () => {
    await tap(page, V(".fl-go").first(), 700);
    for (let i = 0; i < 3; i++) await flagAnswer(page, true);
    await flagReady(page);
    await tap(page, V(".fl-x").first(), 600);
    expect(await V(".fl-resume").count() === 1, "„Fortsetzen“ wird nicht angeboten");
    expect(/3 von 10/.test(await V(".fl-resume").first().textContent()), "Zwischenstand falsch: " + (await V(".fl-resume").first().textContent()));
    await tap(page, V(".fl-resume").first(), 700);
    const w = await page.locator(".fl-bar i").first().evaluate((e) => parseFloat(e.style.width));
    expect(Math.abs(w - 30) < 1, `Fortschritt nach Fortsetzen ${w} statt 30 %`);
    for (let i = 0; i < 7; i++) await flagAnswer(page, true);
    await page.waitForSelector(".fl-score", { timeout: 8000 });
    await tap(page, V(".fl-big").filter({ hasText: "Fertig" }).first(), 500);
    expect(await V(".fl-resume").count() === 0, "„Fortsetzen“ bleibt nach dem Ende stehen");
  });
  await step("Flaggen: Umfang, Bereich, Einstellungen, Fortschritt", async () => {
    await tap(page, V(".fl-chip").nth(0), 400);
    await tap(page, asBtn("Endlos"), 400);
    await tap(page, V(".fl-chip").nth(1), 400);
    await tap(page, asBtn("Nach Kontinent"), 400);
    await tap(page, asBtn("Ozeanien"), 400);
    expect(/Ozeanien/.test(await V(".fl-chip").nth(1).textContent()), "Bereich „Ozeanien“ nicht gewählt");
    await tap(page, V(".fl-go").first(), 700);
    await flagReady(page);
    expect(await V(".fl-endless").count() === 1, "Endlos zeigt keinen Zähler");
    for (let i = 0; i < 3; i++) await flagAnswer(page, true);
    await tap(page, V(".fl-x").first(), 600);
    await db(() => localStorage.removeItem("flags.run"));
    await page.reload(); await page.waitForFunction(() => window.db && window.__toast); await sleep(500);
    await openFlags(page);
    expect(await V(".fl-resume").count() === 0, "Zwischenstand trotz Löschen noch da");
    await tap(page, V('.fl-icon[aria-label="Fortschritt"]').first(), 700);
    expect(await V(".fl-cell").count() === 195, `Fortschritts-Raster zeigt ${await V(".fl-cell").count()} statt 195 Flaggen`);
    await tap(page, V(".fl-cell").first(), 300);
    expect(await V(".fl-info b, .fl-info .fl-miss-name").count() >= 1, "Tippen zeigt kein Land");
    await tap(page, V(".fl-back").first(), 400);
    await tap(page, V('.fl-icon[aria-label="Einstellungen"]').first(), 600);
    await tap(page, V(".row").filter({ hasText: "Bekannte Gebiete" }).locator(".switch, [role=switch], input").first(), 400).catch(() => {});
    await tap(page, V(".fl-back").first(), 400);
    await db(() => { const p = JSON.parse(localStorage.getItem("flags.prefs")); p.amount = 10; p.scope = "all"; p.territories = false; localStorage.setItem("flags.prefs", JSON.stringify(p)); });
    await tap(page, V(".sheet-bar button, .sheet-head button").filter({ hasText: "Schließen" }).first(), 700);
  });

  // ---------- Backup und Wiederherstellung ----------
  await step("Tastatur: ein Eingabefeld unten auf der Seite bleibt über der Tastatur sichtbar", async () => {
    await tabTap(page, "Übersicht");
    await tap(page, V(".row, .acard").filter({ hasText: "Spanisch lernen" }).first(), 900);
    const ta = V(".fold-body textarea").first();
    if (!(await ta.count())) await tap(page, fold("Notizen"), 500);
    // iOS: die Tastatur nimmt unten 336 px weg (visualViewport); hier wird die Höhe gesetzt und das Feld fokussiert
    await page.evaluate(() => { document.documentElement.style.setProperty("--kb", "336px"); const t = [...document.querySelectorAll(".fold-body textarea")].find((e) => e.getBoundingClientRect().width > 0); t?.focus(); });
    await sleep(900);
    const box = await V(".fold-body textarea").first().boundingBox();
    const vh = await page.evaluate(() => innerHeight);
    expect(box && box.y + box.height <= vh - 336 + 2 && box.y >= 0, `Eingabefeld liegt unter der Tastatur (unten ${box && Math.round(box.y + box.height)} von ${vh - 336})`);
    await page.evaluate(() => { document.documentElement.style.removeProperty("--kb"); document.activeElement?.blur(); });
  });
  await step("Backup exportieren, Daten löschen, importieren – identisch", async () => {
    await tabTap(page, "Mehr");
    const before = await snapshot(page);
    const dl = page.waitForEvent("download", { timeout: 6000 }).catch(() => null);
    await tap(page, V(".row").filter({ hasText: "Backup exportieren" }).first(), 500);
    const d = await dl;
    let file;
    if (d) { file = path.join(resultsDir, `backup-${tag}.json`); await d.saveAs(file); }
    else { const text = await db(async () => await (await window.app.logic.exportBackup()).text()); file = path.join(resultsDir, `backup-${tag}.json`); fs.writeFileSync(file, text); skipped.push(`${tag}: Backup-Download nicht ausgelöst, Datei über die Logik erzeugt`); }
    const json = JSON.parse(fs.readFileSync(file, "utf8"));
    expect(json.format === "skill-app-backup" && json.skills.length > 0, "Backup-Datei ungültig");
    expect(!JSON.stringify(json).includes("blob"), "Backup enthält Blobs");
    expect(Array.isArray(json.flagStats) && json.flagStats.length > 0, "Backup enthält keinen Flaggen-Lernstand");
    await db(async () => { for (const t of window.db.tables) await t.clear(); });
    await sleep(400);
    await page.locator('input[type=file][accept*="json"], input[type=file]').filter({ hasNot: page.locator("[accept^='video']") }).first().setInputFiles(file).catch(async () => { await page.locator("input[type=file]").first().setInputFiles(file); });
    await sleep(700);
    await tap(page, asBtn("Daten ersetzen"), 1200);
    const after = await snapshot(page);
    expect(after === before, "Nach dem Import sind die Daten nicht identisch (" + (after.length - before.length) + " Zeichen Unterschied)");
  });
  await step("Backup-Härtefälle: kaputte Datei, Zusammenfassung, Rückgängig, Speicher, Erinnerung", async () => {
    await tabTap(page, "Mehr");
    const input = page.locator('input[type=file][accept*="json"]').first();
    const count = () => db(async () => [await window.db.skills.count(), await window.db.todos.count()].join("/"));
    const good = await count();
    // kaputte, leere, falsche Datei: verständliche Meldung, nichts ändert sich
    for (const [name, content, msg] of [["kaputt.json", '{"format":"skill-app-backup","skills":[{"id":"x"', /beschädigt/], ["leer.json", "", /leer/], ["fremd.json", '{"a":1}', /keine Backup-Datei/]]) {
      const f = path.join(resultsDir, `${tag}-${name}`); fs.writeFileSync(f, content);
      await input.setInputFiles(f);
      await page.waitForFunction((r) => new RegExp(r).test(document.body.textContent ?? ""), msg.source, { timeout: 6000 }).catch(() => {});
      expect(msg.test(await page.evaluate(() => document.body.textContent)), `${name}: keine verständliche Meldung`);
      expect(await count() === good, `${name}: Daten haben sich geändert`);
      await sleep(4300); // Hinweis verschwindet
    }
    // gültige Datei: Zusammenfassung, dann ersetzen, dann Rückgängig
    const text = await db(async () => await (await window.app.logic.exportBackup()).text());
    const f = path.join(resultsDir, `${tag}-gut.json`);
    const data = JSON.parse(text); data.todos = data.todos.slice(0, Math.max(0, data.todos.length - 1)); fs.writeFileSync(f, JSON.stringify(data));
    await input.setInputFiles(f);
    await page.waitForSelector(".as-layer.is-shown", { timeout: 6000 });
    const sheet = await page.locator(".as-layer.is-shown").first().textContent();
    expect(/Backup vom/.test(sheet) && /Auf diesem Gerät sind jetzt/.test(sheet), "Zusammenfassung vor dem Überschreiben fehlt");
    await tap(page, asBtn("Daten ersetzen"), 1200);
    expect(await count() !== good, "Import hat nichts ersetzt");
    await tap(page, V(".toast-action").first(), 1500);
    expect(await count() === good, "Rückgängig stellt den alten Stand nicht her");
    // Speicher und Erinnerung
    expect(await V(".row").filter({ hasText: "Speicherschutz" }).count() === 1, "Zeile „Speicherschutz“ fehlt");
    await db(() => localStorage.setItem("backup.last", String(Date.now() - 20 * 86400000)));
    await page.reload();
    await page.waitForFunction(() => window.db && window.app && window.__toast, null, { timeout: 15000 });
    await tabTap(page, "Mehr");
    expect(/Seit 20 Tagen kein Backup/.test(await V(".row").filter({ hasText: "kein Backup" }).first().textContent()), "Erinnerung „Seit 20 Tagen kein Backup“ fehlt");
    await tap(page, V(".row").filter({ hasText: "Erinnerung nach 14 Tagen" }).locator("[role=switch], button, input").first(), 500);
    expect(await V(".row").filter({ hasText: "kein Backup" }).count() === 0, "Erinnerung lässt sich nicht abschalten");
  });
  await check("Ende");

  await context.close();
  await eng.browser.close();
}
const res = rep.finish({ engines: engines.map((e) => e.name), notes, skipped });
if (skipped.length) { console.log("Übersprungen/Einschränkungen:"); skipped.forEach((s) => console.log("  - " + s)); }
process.exit(res.failures.length ? 1 : 0);
