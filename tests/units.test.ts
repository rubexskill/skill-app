import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../src/db";
import { createSkill, deleteSkill, exportBackup, readBackup, restoreBackup, saveSessionNote, startTimer, stopTimer } from "../src/logic";
import { FIRST_UNIT_TITLE, moveToFirstUnit } from "../src/unitsMigrate";
import { addClip, addLoop, addPartNote, clipStorage, createPart, createUnit, deletePart, deleteUnit, importClipFiles, missingClipIds, movePart, removeClip, storageWarning, unitProgress, exportClipFiles } from "../src/units";
import { applySync, exportSync, parseSync } from "../src/sync";

beforeEach(async () => {
  for (const t of db.tables) await t.clear();
});

const piano = () => createSkill({ name: "Learn piano song", title: "Klavierstück", kategorie: "Kreativ & Alltag", typ: "skill", status: "lerne" });
const clip = (name = "a.mp4", bytes = 1000) => new File([new Uint8Array(bytes)], name, { type: "video/mp4" });

describe("Migration: Klavierstück → erster Unterpunkt", () => {
  it("ordnet Sessions, Rekorde und Nächstes Mal zu, nichts geht verloren", async () => {
    const s = await piano();
    await db.skills.update(s.id, { useUnits: undefined, nextNote: { text: "Takt 5 langsamer", rating: 2, at: 1000 } });
    // Zustand vor der Migration: kein useUnits-Feld
    await db.skills.where("id").equals(s.id).modify((x) => { delete x.useUnits; });
    await db.sessions.bulkAdd([{ id: "a", skillId: s.id, start: 1, minutes: 20 }, { id: "b", skillId: s.id, start: 2, minutes: 35, note: "gut" }]);
    await db.records.add({ id: "r", skillId: s.id, value: 90, at: 3 });
    const other = await createSkill({ name: "Anderer", kategorie: "k", typ: "skill", status: "idee" });
    await db.sessions.add({ id: "c", skillId: other.id, start: 4, minutes: 10 });

    await moveToFirstUnit({ skills: db.skills, sessions: db.sessions, records: db.records, units: db.units });

    const units = await db.units.toArray();
    expect(units).toHaveLength(1);
    expect(units[0]).toMatchObject({ skillId: s.id, title: FIRST_UNIT_TITLE, status: "lerne" });
    expect(units[0].nextNote?.text).toBe("Takt 5 langsamer");
    const after = (await db.skills.get(s.id))!;
    expect(after.useUnits).toBe(true);
    expect(after.nextNote).toBeNull();
    const sessions = await db.sessions.where("skillId").equals(s.id).toArray();
    expect(sessions).toHaveLength(2);
    expect(sessions.every((x) => x.unitId === units[0].id)).toBe(true);
    expect(sessions.reduce((n, x) => n + x.minutes, 0)).toBe(55);
    expect((await db.sessions.get("b"))!.note).toBe("gut");
    expect((await db.records.get("r"))!.unitId).toBe(units[0].id);
    expect((await db.sessions.get("c"))!.unitId).toBeUndefined();
    expect((await db.units.where("skillId").equals(other.id).count())).toBe(0);
    // zweiter Lauf ändert nichts
    await moveToFirstUnit({ skills: db.skills, sessions: db.sessions, records: db.records, units: db.units });
    expect(await db.units.count()).toBe(1);
  });

  it("andere Skills bleiben unberührt, Unterpunkte sind dort aus", async () => {
    const s = await createSkill({ name: "Handstand", kategorie: "k", typ: "skill", status: "idee" });
    await moveToFirstUnit({ skills: db.skills, sessions: db.sessions, records: db.records, units: db.units });
    expect(await db.units.count()).toBe(0);
    expect((await db.skills.get(s.id))!.useUnits).toBeFalsy();
  });

  it("neues „Klavierstück“ hat Unterpunkte standardmäßig an", async () => {
    expect((await piano()).useUnits).toBe(true);
  });
});

describe("Unterpunkte und Abschnitte", () => {
  it("legt an, zählt Fortschritt, sortiert um und löscht mit Rückgängig", async () => {
    const s = await piano();
    const u = await createUnit(s.id, "Stück A");
    const a = await createPart(u.id, "Intro");
    const b = await createPart(u.id, "Strophe");
    const c = await createPart(u.id, "");
    expect(c.name).toBe("Abschnitt 3");
    await db.parts.update(a.id, { solid: true });
    expect(unitProgress(await db.parts.where("unitId").equals(u.id).toArray())).toEqual({ solid: 1, total: 3 });
    await movePart(c.id, -1);
    expect((await db.parts.where("unitId").equals(u.id).sortBy("order")).map((p) => p.name)).toEqual(["Intro", "Abschnitt 3", "Strophe"]);
    await movePart(a.id, -1); // schon ganz oben
    expect((await db.parts.where("unitId").equals(u.id).sortBy("order"))[0].name).toBe("Intro");
    await addPartNote(a.id, "  Links langsam  ");
    await addLoop(a.id); await addLoop(a.id);
    expect((await db.parts.get(a.id))).toMatchObject({ loops: 2 });
    expect((await db.parts.get(a.id))!.notes[0].text).toBe("Links langsam");

    const undo = await deletePart(b.id);
    expect(await db.parts.get(b.id)).toBeUndefined();
    await undo();
    expect(await db.parts.get(b.id)).toBeTruthy();
  });

  it("Unterpunkt löschen: Übezeit bleibt beim Skill, Rückgängig stellt alles her", async () => {
    const s = await piano();
    const u = await createUnit(s.id, "Stück");
    const p = await createPart(u.id, "Intro");
    await addClip(p.id, clip());
    await db.sessions.add({ id: "x", skillId: s.id, start: 1, minutes: 12, unitId: u.id });
    const undo = await deleteUnit(u.id);
    expect(await db.units.count()).toBe(0);
    expect(await db.parts.count()).toBe(0);
    expect(await db.clipBlobs.count()).toBe(0);
    const sess = (await db.sessions.get("x"))!;
    expect(sess.minutes).toBe(12);
    expect(sess.unitId).toBeUndefined();
    await undo();
    expect(await db.parts.count()).toBe(1);
    expect(await db.clipBlobs.count()).toBe(1);
    expect((await db.sessions.get("x"))!.unitId).toBe(u.id);
  });

  it("Skill löschen entfernt Unterpunkte, Abschnitte und Clips – und kommt zurück", async () => {
    const s = await piano();
    const u = await createUnit(s.id, "Stück");
    const p = await createPart(u.id, "Intro");
    await addClip(p.id, clip());
    const undo = await deleteSkill(s.id);
    expect([await db.units.count(), await db.parts.count(), await db.clipBlobs.count()]).toEqual([0, 0, 0]);
    await undo();
    expect([await db.units.count(), await db.parts.count(), await db.clipBlobs.count()]).toEqual([1, 1, 1]);
  });
});

describe("Timer für Unterpunkte", () => {
  it("Session bekommt unitId, Nächstes Mal landet im Unterpunkt, Skill-Summe stimmt", async () => {
    const s = await piano();
    const u = await createUnit(s.id, "Stück");
    await startTimer(s.id, u.id);
    expect((await db.skills.get(s.id))!.timerUnit).toBe(u.id);
    await db.skills.update(s.id, { timerStart: Date.now() - 5 * 60000 });
    const r = (await stopTimer(s.id))!;
    expect(r.saved).toBe(true);
    expect(r.unit?.id).toBe(u.id);
    const sess = (await db.sessions.toArray())[0];
    expect(sess).toMatchObject({ skillId: s.id, unitId: u.id, minutes: 5 });
    await saveSessionNote(r, 3, "Takt 9 üben");
    expect((await db.units.get(u.id))!.nextNote?.text).toBe("Takt 9 üben");
    expect((await db.skills.get(s.id))!.nextNote).toBeNull();
    expect((await db.skills.get(s.id))!.timerUnit).toBeNull();
    expect((await db.sessions.where("skillId").equals(s.id).toArray()).reduce((n, x) => n + x.minutes, 0)).toBe(5);
  });
});

describe("Clips: Speicher, Backup, Export", () => {
  it("Backup enthält Unterpunkte und Abschnitte samt Clip-Metadaten, aber keine Videos", async () => {
    const s = await piano();
    const u = await createUnit(s.id, "Stück");
    const p = await createPart(u.id, "Intro");
    const meta = await addClip(p.id, clip("takt.mp4", 2048));
    await db.sessions.add({ id: "x", skillId: s.id, start: 1, minutes: 7, unitId: u.id });
    const text = await (await exportBackup()).text();
    expect(text).not.toContain("clipBlobs");
    const data = JSON.parse(text);
    expect(data.units).toHaveLength(1);
    expect(data.parts[0].clips[0]).toMatchObject({ id: meta.id, name: "takt.mp4", size: 2048 });
    expect(JSON.stringify(data)).not.toContain("blob");

    await db.clipBlobs.clear(); // neues Gerät: Video fehlt
    await restoreBackup(await readBackup(new File([text], "b.json")));
    expect(await db.units.count()).toBe(1);
    expect((await db.parts.toArray())[0].clips).toHaveLength(1);
    expect((await db.sessions.get("x"))!.unitId).toBe(u.id);
    expect([...(await missingClipIds())]).toEqual([meta.id]);
  });

  it("Export und Import ordnen Videos über die Clip-ID wieder zu", async () => {
    const s = await piano();
    const u = await createUnit(s.id, "Stück");
    const p = await createPart(u.id, "Intro");
    const meta = await addClip(p.id, clip("Mein Clip.mp4", 500));
    const files = await exportClipFiles();
    expect(files).toHaveLength(1);
    expect(files[0].name).toContain(meta.id);
    await db.clipBlobs.clear();
    const r = await importClipFiles([...files, new File([new Uint8Array(3)], "fremd.mp4")]);
    expect(r).toEqual({ matched: 1, unmatched: 1 });
    expect(await db.clipBlobs.count()).toBe(1);
    expect((await clipStorage()).clipBytes).toBe(500);
    const undo = await removeClip(p.id, meta.id);
    expect(await db.clipBlobs.count()).toBe(0);
    await undo();
    expect(await db.clipBlobs.count()).toBe(1);
  });

  it("warnt bei mehr als 100 MB und bei knappem Speicher", () => {
    expect(storageWarning({ clipBytes: 10, count: 1 })).toBeNull();
    expect(storageWarning({ clipBytes: 90 * 1024 * 1024, count: 5 }, 20 * 1024 * 1024)).toContain("MB");
    expect(storageWarning({ clipBytes: 0, count: 0, usage: 900, quota: 1000 })).toContain("fast voll");
    expect(storageWarning({ clipBytes: 0, count: 0, usage: 900, quota: 1000 }, 500)).toContain("nicht genug");
  });
});

describe("Abgleich mit Unterpunkten", () => {
  it("führt Unterpunkte und Abschnitte zusammen", async () => {
    const s = await piano();
    const u = await createUnit(s.id, "Stück");
    await createPart(u.id, "Intro");
    const file = parseSync(await (await exportSync()).text());
    await db.parts.clear();
    await db.units.clear();
    await new Promise((r) => setTimeout(r, 20));
    await db.tombs.clear(); // Löschvermerke der Testbereinigung
    const rep = await applySync(file);
    expect(rep.added.units).toBe(1);
    expect(rep.added.parts).toBe(1);
    expect(await db.parts.count()).toBe(1);
  });
});
