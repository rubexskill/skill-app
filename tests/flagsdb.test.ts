import { beforeEach, describe, expect, it } from "vitest";
import Dexie from "dexie";
import { db, SYNC_TABLES } from "../src/db";
import { createSkill, exportBackup, readBackup, restoreBackup } from "../src/logic";
import { applySync, exportSync, parseSync } from "../src/sync";
import { addPracticeTime, ensureFlagSkill, loadStats, recordAnswer, resetStats, splitMinutes } from "../src/trainer/flags/store";
import { builtInTrainer } from "../src/trainer/Trainer";

beforeEach(async () => { for (const t of db.tables) await t.clear(); });

describe("Lernstand speichern", () => {
  it("Antworten landen in der Tabelle und steigen/fallen die Stufen", async () => {
    await recordAnswer("FR", true, 10);
    await recordAnswer("FR", true, 20);
    await recordAnswer("DE", false, 30);
    const stats = await loadStats();
    expect(stats.get("FR")).toMatchObject({ level: 2, seen: 2, right: 2, wrong: 0, last: 20 });
    expect(stats.get("DE")).toMatchObject({ level: 0, seen: 1, right: 0, wrong: 1 });
    await recordAnswer("FR", false, 40);
    expect((await loadStats()).get("FR")).toMatchObject({ level: 0, wrong: 1, seen: 3 });
  });
  it("Zurücksetzen löscht den Lernstand (mit Löschvermerken für den Abgleich)", async () => {
    await new Promise((r) => setTimeout(r, 60)); // Löschvermerke aus dem Aufräumen des vorigen Tests abwarten
    await db.tombs.clear();
    await recordAnswer("FR", true);
    await resetStats();
    await new Promise((r) => setTimeout(r, 60)); // Löschvermerke entstehen kurz nach dem Löschen
    expect((await loadStats()).size).toBe(0);
    expect((await db.tombs.toArray()).map((t) => t.id)).toEqual(["flagStats:FR"]);
  });
});

describe("Lernzeit zählt als normale Lernzeit des Skills", () => {
  it("Restzeit unter einer Minute wird gesammelt, volle Minuten werden Sessions", () => {
    expect(splitMinutes(0, 30_000)).toEqual({ minutes: 0, pending: 30_000 });
    expect(splitMinutes(30_000, 40_000)).toEqual({ minutes: 1, pending: 10_000 });
    expect(splitMinutes(10_000, 185_000)).toEqual({ minutes: 3, pending: 15_000 });
    expect(splitMinutes(0, 0)).toEqual({ minutes: 0, pending: 0 });
    expect(splitMinutes(0, -500)).toEqual({ minutes: 0, pending: 0 });
  });
  it("addPracticeTime legt eine Session am Skill an", async () => {
    const s = await createSkill({ name: "Learn flags and geography", kategorie: "Wissen & Verstehen", typ: "skill", status: "lerne" });
    expect(await addPracticeTime(s.id, 125_000, 0)).toBe(2);
    const sessions = await db.sessions.where("skillId").equals(s.id).toArray();
    expect(sessions.length).toBe(1);
    expect(sessions[0].minutes).toBe(2);
    expect(await addPracticeTime(s.id, 20_000, 5_000)).toBe(0);
    expect(await db.sessions.count()).toBe(1);
  });
});

describe("Trainer-Zuordnung", () => {
  it("der Skill „Flaggen & Geografie“ bekommt den Flaggen-Trainer", () => {
    expect(builtInTrainer({ title: "Flaggen & Geografie", metric: null })?.kind).toBe("flags");
  });
});

describe("Backup, Import und Abgleich mit Lernstand", () => {
  it("Lernstand gehört ins Backup und kommt beim Import identisch zurück", async () => {
    await recordAnswer("FR", true, 1); await recordAnswer("FR", true, 2); await recordAnswer("DE", false, 3); await recordAnswer("IT", true, 4);
    const before = (await db.flagStats.toArray()).sort((a, b) => a.id.localeCompare(b.id));
    const blob = await exportBackup();
    const json = JSON.parse(await blob.text());
    expect(json.flagStats.length).toBe(3);
    for (const t of db.tables) await t.clear();
    expect(await db.flagStats.count()).toBe(0);
    await restoreBackup(await readBackup(new File([blob], "b.json")));
    expect((await db.flagStats.toArray()).sort((a, b) => a.id.localeCompare(b.id))).toEqual(before);
  });
  it("ältere Backups ohne Lernstand lassen sich weiter importieren", async () => {
    const s = await createSkill({ name: "Anderes", kategorie: "Test", typ: "skill", status: "lerne" });
    const json = JSON.parse(await (await exportBackup()).text());
    delete json.flagStats;
    for (const t of db.tables) await t.clear();
    await restoreBackup(await readBackup(new File([JSON.stringify(json)], "alt.json")));
    expect((await db.skills.toArray()).map((x) => x.id)).toEqual([s.id]);
    expect(await db.flagStats.count()).toBe(0);
  });
  it("Abgleich führt Lernstände zusammen: neue Zeilen kommen dazu, die jüngere Änderung gewinnt", async () => {
    expect(SYNC_TABLES).toContain("flagStats");
    await recordAnswer("FR", true, 1); await recordAnswer("DE", true, 1);
    const fromOther = parseSync(await (await exportSync()).text());
    // Gegenseite: FR älter, DE jünger (spätere Änderung), dazu ES nur dort
    fromOther.tables.flagStats = [
      { ...(await db.flagStats.get("FR"))!, level: 4, upd: 1 },
      { ...(await db.flagStats.get("DE"))!, level: 3, upd: Date.now() + 100_000 },
      { id: "ES", level: 2, seen: 2, right: 2, wrong: 0, last: 5, upd: Date.now() },
    ];
    const report = await applySync(fromOther);
    expect(report.added.flagStats).toBe(1);
    expect(report.updated.flagStats).toBe(1);
    const m = new Map((await db.flagStats.toArray()).map((x) => [x.id, x]));
    expect(m.get("FR")!.level).toBe(1); // lokal ist jünger
    expect(m.get("DE")!.level).toBe(3); // von der anderen Seite, jünger
    expect(m.get("ES")!.level).toBe(2);
  });
});

describe("Migration auf die neue Datenbankversion", () => {
  it("vorhandene Daten bleiben erhalten, die Tabelle für den Lernstand kommt dazu", async () => {
    // Schema der aktuellen Datenbank ohne die neue Tabelle als „alte“ Version 9 nachbauen
    await db.open();
    const stores: Record<string, string> = {};
    for (const t of db.tables) {
      if (t.name === "flagStats") continue;
      stores[t.name] = [t.schema.primKey.src, ...t.schema.indexes.map((i) => i.src)].join(",");
    }
    db.close();
    await Dexie.delete("skill-app");
    const old = new Dexie("skill-app");
    old.version(9).stores(stores);
    await old.open();
    await old.table("skills").add({ id: "s1", name: "Altbestand", title: "Altbestand", kategorie: "Test", typ: "skill", status: "lerne", upd: 5 });
    await old.table("todos").add({ id: "t1", listId: "list-allgemein", text: "bleibt", due: null, done: false, doneAt: null, createdAt: 1, upd: 5 });
    await old.table("sessions").add({ id: "se1", skillId: "s1", start: 1, minutes: 12, upd: 5 });
    expect(old.verno).toBe(9);
    old.close();
    // die App öffnet dieselbe Datenbank mit der neuen Version
    await db.open();
    expect(db.verno).toBeGreaterThanOrEqual(10);
    expect((await db.skills.get("s1"))?.name).toBe("Altbestand");
    expect((await db.todos.get("t1"))?.text).toBe("bleibt");
    expect((await db.sessions.get("se1"))?.minutes).toBe(12);
    expect(await db.flagStats.count()).toBe(0);
    await recordAnswer("FR", true, 1);
    expect(await db.flagStats.count()).toBe(1);
  });
});

describe("Skill „Flaggen & Geografie“", () => {
  const mem = new Map<string, string>();
  const store = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
  it("wird einmalig angelegt, wenn er fehlt – und nicht wieder, wenn man ihn löscht", async () => {
    Object.defineProperty(globalThis, "localStorage", { value: store, configurable: true });
    mem.clear();
    expect(await ensureFlagSkill()).toBe(true);
    const skills = await db.skills.filter((s) => s.title === "Flaggen & Geografie").toArray();
    expect(skills.length).toBe(1);
    expect(builtInTrainer(skills[0])?.kind).toBe("flags");
    expect(await ensureFlagSkill()).toBe(false);
    await db.skills.delete(skills[0].id);
    expect(await ensureFlagSkill()).toBe(false);
    expect(await db.skills.filter((s) => s.title === "Flaggen & Geografie").count()).toBe(0);
  });
  it("ein vorhandener Skill wird nicht doppelt angelegt", async () => {
    Object.defineProperty(globalThis, "localStorage", { value: store, configurable: true });
    mem.clear();
    await createSkill({ name: "Learn flags and geography", title: "Flaggen & Geografie", kategorie: "Natur, Erde & Himmel", typ: "skill", status: "idee" });
    expect(await ensureFlagSkill()).toBe(false);
    expect(await db.skills.count()).toBe(1);
  });
});
