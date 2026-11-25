import { beforeEach, describe, expect, it } from "vitest";
import Dexie from "dexie";
import { db } from "../src/db";
import { BACKUP_VERSION, MAX_BACKUP_BYTES, countsOf, describeBackup, parseBackupText } from "../src/backupfile";
import { createSkill, exportBackup, readBackup, restoreBackup, addTodo } from "../src/logic";

beforeEach(async () => { for (const t of db.tables) await t.clear(); });

const good = (extra: Record<string, unknown> = {}) => JSON.stringify({ format: "skill-app-backup", version: 5, exportedAt: "2026-11-01T10:00:00Z", skills: [{ id: "a", title: "A" }], ...extra });

describe("Backup-Datei prüfen", () => {
  it("gültige Datei", () => {
    const r = parseBackupText(good());
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.skills.length).toBe(1);
  });
  it("leer, kaputt, abgeschnitten, Binärmüll, falsches Format", () => {
    for (const t of ["", "   \n", "{", good().slice(0, 40), "\u0000\u0001\u0002PK", "[]", "null", JSON.stringify({ format: "andere-app", skills: [] }), JSON.stringify({ format: "skill-app-backup" })]) {
      const r = parseBackupText(t);
      expect(r.ok, t.slice(0, 20)).toBe(false);
      if (!r.ok) expect(r.message.length).toBeGreaterThan(10);
    }
  });
  it("neuere Version wird abgelehnt, ältere ohne Versionsfeld angenommen", () => {
    const n = parseBackupText(good({ version: BACKUP_VERSION + 1 }));
    expect(n.ok).toBe(false);
    if (!n.ok) expect(n.message).toMatch(/neueren Version/);
    expect(parseBackupText(JSON.stringify({ format: "skill-app-backup", skills: [{ id: "a" }] })).ok).toBe(true);
  });
  it("riesige Datei wird vor dem Lesen abgelehnt", () => {
    const r = parseBackupText("{}", MAX_BACKUP_BYTES + 1);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/zu groß/);
  });
  it("beschädigte Tabelle (kein Array) wird gemeldet, nichts wird übernommen", () => {
    const r = parseBackupText(good({ todos: { id: "x" } }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toMatch(/To-dos/);
  });
  it("doppelte IDs werden zusammengelegt (letzte gewinnt), Zeilen ohne ID übersprungen", () => {
    const r = parseBackupText(good({ skills: [{ id: "a", title: "alt" }, { id: "a", title: "neu" }, { title: "ohne id" }, 5, null], todos: [{ id: "t" }, { id: "t" }] }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.skills).toEqual([{ id: "a", title: "neu" }]);
      expect(r.data.todos?.length).toBe(1);
      expect(r.duplicates).toBe(2);
      expect(r.dropped).toBe(3);
    }
  });
  it("Zusammenfassung nennt Datei und aktuellen Stand", () => {
    const r = parseBackupText(good({ todos: [{ id: "t" }], sessions: [{ id: "s" }, { id: "s2" }] }));
    if (!r.ok) throw new Error(r.message);
    const cur = countsOf({ skills: [1, 2, 3] as never[] });
    const text = describeBackup(r.data, cur, { dropped: 1, duplicates: 0 });
    expect(text).toMatch(/1 Einträge, 1 To-dos, 2 Sessions/);
    expect(text).toMatch(/jetzt 3 Einträge/);
    expect(text).toMatch(/1 unbrauchbare Zeile übersprungen/);
  });
});

describe("Import ändert nie halb: entweder alles oder nichts", () => {
  it("Fehler mitten im Import (unbrauchbare Zeile) lässt die alten Daten unberührt", async () => {
    await createSkill({ name: "Bleibt", title: "Bleibt", kategorie: "Test", typ: "skill", status: "lerne" });
    await addTodo("bleibt auch", "inbox", null);
    const before = [await db.skills.count(), await db.todos.count()];
    // Zeile ohne gültigen Schlüssel umgeht die Prüfung absichtlich: der Import muss trotzdem komplett zurückrollen
    const broken = { format: "skill-app-backup", version: 5, exportedAt: "", skills: [{ id: "n1", title: "Neu" }], todos: [{ text: "ohne id" }] };
    await expect(restoreBackup(broken as never)).rejects.toBeTruthy();
    expect([await db.skills.count(), await db.todos.count()]).toEqual(before);
    expect((await db.skills.toArray())[0].title).toBe("Bleibt");
  });
  it("doppelter Import ergibt denselben Stand (nichts wird doppelt)", async () => {
    await createSkill({ name: "A", title: "A", kategorie: "Test", typ: "skill", status: "lerne" });
    await addTodo("x", "inbox", null);
    const file = new File([await exportBackup()], "b.json");
    for (let i = 0; i < 3; i++) await restoreBackup(await readBackup(file));
    expect(await db.skills.count()).toBe(1);
    expect(await db.todos.count()).toBe(1);
  });
  it("altes Backup (Version 1, nur Einträge) lädt und ergänzt Felder", async () => {
    const old = { format: "skill-app-backup", exportedAt: "2025-01-01T00:00:00Z", skills: [{ id: "o1", name: "Alt", title: "Alt", kategorie: "Test", status: "lerne" }] };
    await restoreBackup(await readBackup(new File([JSON.stringify(old)], "o.json")));
    const s = (await db.skills.toArray())[0];
    expect(s.title).toBe("Alt");
    expect(Array.isArray(s.milestones)).toBe(true);
    expect(await db.lists.count()).toBeGreaterThan(0);
  });
  it("sehr großes Backup (500 Einträge, 2000 To-dos, 5000 Sessions) lädt zügig und vollständig", async () => {
    const skills = Array.from({ length: 500 }, (_, i) => ({ id: `s${i}`, name: `S${i}`, title: `Skill ${i}`, kategorie: "Test", typ: "skill", status: "lerne" }));
    const todos = Array.from({ length: 2000 }, (_, i) => ({ id: `t${i}`, listId: "inbox", text: `To-do ${i}`, due: null, done: false, doneAt: null, createdAt: i }));
    const sessions = Array.from({ length: 5000 }, (_, i) => ({ id: `x${i}`, skillId: `s${i % 500}`, start: i, minutes: 10 }));
    const text = JSON.stringify({ format: "skill-app-backup", version: 5, exportedAt: "2026-01-01T00:00:00Z", skills, todos, sessions });
    const t0 = performance.now();
    const p = parseBackupText(text);
    if (!p.ok) throw new Error(p.message);
    await restoreBackup(p.data);
    expect(performance.now() - t0).toBeLessThan(8000);
    expect([await db.skills.count(), await db.todos.count(), await db.sessions.count()]).toEqual([500, 2000, 5000]);
  });
  it("readBackup gibt verständliche Fehler statt Rohfehler", async () => {
    await expect(readBackup(new File(["{ kaputt"], "k.json"))).rejects.toThrow(/beschädigt/);
    await expect(readBackup(new File([""], "l.json"))).rejects.toThrow(/leer/);
  });
});

void Dexie;
