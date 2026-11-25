import { beforeEach, describe, expect, it } from "vitest";
import Dexie from "dexie";
import { db, SYNC_TABLES } from "../src/db";
import { createSkill, exportBackup, readBackup, restoreBackup } from "../src/logic";
import { applySync, exportSync, parseSync } from "../src/sync";
import { addCubePracticeTime, addCubeTime, deleteCubeTime, ensureCubeSkill, loadCubeTimes, loadProgress, restoreCubeTime, setAlgoState } from "../src/trainer/cube/store";
import { statsOf } from "../src/trainer/cube/stats";
import { builtInTrainer } from "../src/trainer/Trainer";

beforeEach(async () => { for (const t of db.tables) await t.clear(); });
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("Zeiten speichern", () => {
  it("Zeit, Datum und Mischung werden gespeichert, neueste zuerst", async () => {
    await addCubeTime(31234, "R U R'", 1000);
    await addCubeTime(25000.4, "F2 D", 3000);
    await addCubeTime(28000, "L B", 2000);
    const times = await loadCubeTimes();
    expect(times.map((t) => t.at)).toEqual([3000, 2000, 1000]);
    expect(times[0]).toMatchObject({ ms: 25000, scramble: "F2 D" });
    expect(statsOf(times.map((t) => t.ms)).best).toBe(25000);
  });
  it("Einzelzeiten sind löschbar, Rückgängig stellt sie her", async () => {
    const t = await addCubeTime(20000, "R", 1);
    await addCubeTime(30000, "U", 2);
    await deleteCubeTime(t.id);
    expect((await loadCubeTimes()).length).toBe(1);
    await restoreCubeTime(t);
    expect((await loadCubeTimes()).map((x) => x.ms)).toEqual([30000, 20000]);
  });
  it("Lernpfad-Fortschritt: kann / noch üben, überschreibt den alten Stand", async () => {
    await setAlgoState("ecken-rechts", "ueben", 1);
    await setAlgoState("ecken-rechts", "kann", 2);
    await setAlgoState("kreuz-f2", "ueben", 3);
    const p = await loadProgress();
    expect(p.get("ecken-rechts")).toMatchObject({ state: "kann", at: 2 });
    expect(p.get("kreuz-f2")?.state).toBe("ueben");
    expect(p.size).toBe(2);
  });
});

describe("Übungsdauer zählt als Lernzeit des Skills", () => {
  it("volle Minuten werden Sessions, der Rest wird gesammelt", async () => {
    const s = await createSkill({ name: "Rubik's Cube solving", title: "Zauberwürfel", kategorie: "Tricks", typ: "skill", status: "lerne" });
    expect(await addCubePracticeTime(s.id, 190_000, 0)).toBe(3);
    expect((await db.sessions.where("skillId").equals(s.id).toArray()).map((x) => x.minutes)).toEqual([3]);
    expect(await addCubePracticeTime(s.id, 10_000, 5_000)).toBe(0);
  });
});

describe("Trainer und Skill", () => {
  it("der Skill „Zauberwürfel“ bekommt den Würfel-Trainer", () => {
    expect(builtInTrainer({ title: "Zauberwürfel", metric: null })?.kind).toBe("cube");
  });
  const mem = new Map<string, string>();
  const store = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) };
  it("wird einmalig angelegt, wenn er fehlt – und nicht wieder, wenn man ihn löscht", async () => {
    Object.defineProperty(globalThis, "localStorage", { value: store, configurable: true });
    mem.clear();
    expect(await ensureCubeSkill()).toBe(true);
    const skills = await db.skills.filter((s) => s.title === "Zauberwürfel").toArray();
    expect(skills.length).toBe(1);
    expect(await ensureCubeSkill()).toBe(false);
    await db.skills.delete(skills[0].id);
    expect(await ensureCubeSkill()).toBe(false);
    expect(await db.skills.filter((s) => s.title === "Zauberwürfel").count()).toBe(0);
  });
  it("ein vorhandener Skill wird nicht doppelt angelegt", async () => {
    Object.defineProperty(globalThis, "localStorage", { value: store, configurable: true });
    mem.clear();
    await createSkill({ name: "Rubik's Cube solving", title: "Zauberwürfel", kategorie: "Tricks, Geschick & Mentalismus", typ: "skill", status: "idee" });
    expect(await ensureCubeSkill()).toBe(false);
    expect(await db.skills.count()).toBe(1);
  });
});

describe("Backup, Import und Abgleich mit Zeiten und Lernpfad", () => {
  it("Zeiten und Lernpfad kommen aus dem Backup identisch zurück", async () => {
    await addCubeTime(23415, "R U R' U'", 10); await addCubeTime(25000, "F2", 20);
    await setAlgoState("gelbes-kreuz", "kann", 5);
    const times = (await db.cubeTimes.toArray()).sort((a, b) => a.at - b.at);
    const prog = await db.cubeProgress.toArray();
    const blob = await exportBackup();
    const json = JSON.parse(await blob.text());
    expect(json.cubeTimes.length).toBe(2);
    expect(json.cubeProgress.length).toBe(1);
    for (const t of db.tables) await t.clear();
    await restoreBackup(await readBackup(new File([blob], "b.json")));
    expect((await db.cubeTimes.toArray()).sort((a, b) => a.at - b.at)).toEqual(times);
    expect(await db.cubeProgress.toArray()).toEqual(prog);
  });
  it("ältere Backups ohne Würfeldaten lassen sich weiter importieren", async () => {
    const s = await createSkill({ name: "Anderes", kategorie: "Test", typ: "skill", status: "lerne" });
    const json = JSON.parse(await (await exportBackup()).text());
    delete json.cubeTimes; delete json.cubeProgress;
    for (const t of db.tables) await t.clear();
    await restoreBackup(await readBackup(new File([JSON.stringify(json)], "alt.json")));
    expect((await db.skills.toArray()).map((x) => x.id)).toEqual([s.id]);
    expect(await db.cubeTimes.count()).toBe(0);
  });
  it("Abgleich: neue Zeiten kommen dazu, gelöschte Zeiten verschwinden, Lernpfad nimmt die jüngere Änderung", async () => {
    expect(SYNC_TABLES).toContain("cubeTimes");
    expect(SYNC_TABLES).toContain("cubeProgress");
    const a = await addCubeTime(20000, "A", 1); await addCubeTime(21000, "B", 2);
    await setAlgoState("gelbes-kreuz", "ueben", 1);
    const other = parseSync(await (await exportSync()).text());
    // Gegenseite: eine Zeit mehr, Lernpfad dort jünger auf „kann“
    other.tables.cubeTimes = [...(other.tables.cubeTimes ?? []), { id: "nur-drüben", ms: 19000, at: 5, scramble: "C", upd: Date.now() }];
    other.tables.cubeProgress = [{ id: "gelbes-kreuz", state: "kann", at: 9, upd: Date.now() + 100_000 }];
    const report = await applySync(other);
    expect(report.added.cubeTimes).toBe(1);
    expect(report.updated.cubeProgress).toBe(1);
    expect((await loadProgress()).get("gelbes-kreuz")?.state).toBe("kann");
    expect((await loadCubeTimes()).length).toBe(3);
    // hier gelöscht, dort noch vorhanden → bleibt gelöscht
    const file = parseSync(await (await exportSync()).text());
    await deleteCubeTime(a.id);
    await pause(60);
    await applySync(file);
    expect((await db.cubeTimes.get(a.id))).toBeUndefined();
  });
});

describe("Migration auf die neue Datenbankversion", () => {
  it("vorhandene Daten bleiben erhalten, die neuen Tabellen kommen dazu", async () => {
    await db.open();
    const stores: Record<string, string> = {};
    for (const t of db.tables) {
      if (t.name === "cubeTimes" || t.name === "cubeProgress") continue;
      stores[t.name] = [t.schema.primKey.src, ...t.schema.indexes.map((i) => i.src)].join(",");
    }
    db.close();
    await Dexie.delete("skill-app");
    const old = new Dexie("skill-app");
    old.version(10).stores(stores);
    await old.open();
    await old.table("skills").add({ id: "s1", name: "Altbestand", title: "Altbestand", kategorie: "Test", typ: "skill", status: "lerne", upd: 5 });
    await old.table("flagStats").add({ id: "FR", level: 3, seen: 4, right: 3, wrong: 1, last: 9, upd: 5 });
    await old.table("sessions").add({ id: "se1", skillId: "s1", start: 1, minutes: 12, upd: 5 });
    expect(old.verno).toBe(10);
    old.close();
    await db.open();
    expect(db.verno).toBeGreaterThanOrEqual(11);
    expect((await db.skills.get("s1"))?.name).toBe("Altbestand");
    expect((await db.flagStats.get("FR"))?.level).toBe(3);
    expect((await db.sessions.get("se1"))?.minutes).toBe(12);
    expect(await db.cubeTimes.count()).toBe(0);
    await addCubeTime(30000, "R", 1);
    await setAlgoState("kreuz-f2", "kann", 2);
    expect(await db.cubeTimes.count()).toBe(1);
    expect(await db.cubeProgress.count()).toBe(1);
  });
});
