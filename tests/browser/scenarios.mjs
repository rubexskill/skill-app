// Szenario-Tests: echte Abläufe wie ein Mensch (Tippen per Touch, Eingaben, Wischen), in Chromium und WebKit.
// Nach jedem Schritt: Layout, Konsole, Datenintegrität.
import fs from "node:fs";
import path from "node:path";
import { buildDist, launchEngines, openApp, Report, layoutProblems, integrityProblems, snapshot, blobsWork, tap, tabTap, sleep, resultsDir } from "./lib.mjs";

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
    const lp = await layoutProblems(page);
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

  // ---------- Backup und Wiederherstellung ----------
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
    await db(async () => { for (const t of window.db.tables) await t.clear(); });
    await sleep(400);
    await page.locator('input[type=file][accept*="json"], input[type=file]').filter({ hasNot: page.locator("[accept^='video']") }).first().setInputFiles(file).catch(async () => { await page.locator("input[type=file]").first().setInputFiles(file); });
    await sleep(700);
    await tap(page, asBtn("Daten ersetzen"), 1200);
    const after = await snapshot(page);
    expect(after === before, "Nach dem Import sind die Daten nicht identisch (" + (after.length - before.length) + " Zeichen Unterschied)");
  });
  await check("Ende");

  await context.close();
  await eng.browser.close();
}
const res = rep.finish({ engines: engines.map((e) => e.name), notes, skipped });
if (skipped.length) { console.log("Übersprungen/Einschränkungen:"); skipped.forEach((s) => console.log("  - " + s)); }
process.exit(res.failures.length ? 1 : 0);
