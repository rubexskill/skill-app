// Jede alte Datenbankversion (1 bis 10) mit Testdaten bis zur aktuellen migrieren: nichts geht verloren, Neues kommt dazu.
import Dexie from "dexie";
import { afterAll, describe, expect, it } from "vitest";
import { db } from "../src/db";
import { exportBackup, readBackup, restoreBackup } from "../src/logic";

/** Tabellen mit Schlüsseln je Version (wie in db.ts, kumulativ) */
const STORES: Record<number, Record<string, string>> = {};
const add = (v: number, s: Record<string, string>) => { STORES[v] = { ...(STORES[v - 1] ?? {}), ...s }; };
add(1, { skills: "id, name, kategorie, typ, status, createdAt", sessions: "id, skillId, start", inbox: "id, createdAt", checks: "id, skillId, date", apps: "id, order" });
add(2, { todos: "id, listId, due, createdAt", lists: "id, order" });
add(3, { records: "id, skillId, at" });
add(4, { terms: "id, createdAt", wishes: "id, createdAt", cards: "id, skillId, due", tombs: "id" });
add(5, {});
add(6, { sessions: "id, skillId, start, unitId", units: "id, skillId, createdAt", parts: "id, unitId, order", clipBlobs: "id" });
add(7, { recordings: "id, unitId, partId, at", recBlobs: "id" });
add(8, { covers: "id" });
add(9, {});
add(10, { flagStats: "id" });

const T = 1_700_000_000_000;

async function seedOld(old: Dexie, v: number) {
  await old.table("skills").bulkAdd([
    { id: "s1", name: "Spanisch lernen", title: "Spanisch lernen", kategorie: "Sprachen", typ: "skill", status: "lerne", createdAt: T },
    { id: "s2", name: "Learn piano song", title: "Klavierstück", kategorie: "Kreativ & Alltag", typ: "skill", status: "lerne", createdAt: T },
    { id: "h1", name: "Gummizüge tragen", title: "Gummizüge tragen", kategorie: "Gewohnheiten", typ: "gewohnheit", status: "lerne", createdAt: T },
  ]);
  await old.table("sessions").bulkAdd([
    { id: "se1", skillId: "s1", start: T, minutes: 20 },
    { id: "se2", skillId: "s2", start: T + 1, minutes: 45 },
    { id: "se3", skillId: "h1", start: T + 2, minutes: 15 },
  ]);
  await old.table("inbox").add({ id: "i1", text: "Idee", createdAt: T });
  await old.table("checks").add({ id: "h1|2023-11-14", skillId: "h1", date: "2023-11-14" });
  await old.table("apps").add({ id: "a1", name: "App", order: 1 });
  if (v >= 2) await old.table("todos").add({ id: "t1", listId: "inbox", text: "Zahnarzt", due: null, done: false, doneAt: null, createdAt: T });
  if (v >= 3) await old.table("records").add({ id: "r1", skillId: "s2", value: 12, at: T });
  if (v >= 4) {
    await old.table("terms").add({ id: "te1", term: "ñandú", createdAt: T });
    await old.table("wishes").add({ id: "w1", text: "Gitarre", createdAt: T });
    await old.table("cards").add({ id: "c1", skillId: "s1", front: "Hola", back: "Hallo", due: T });
  }
  if (v >= 6) await old.table("units").add({ id: "u0", skillId: "s1", title: "Altes Stück", status: "lerne", note: "", nextNote: null, order: 0, createdAt: T });
  if (v >= 6) await old.table("parts").add({ id: "p1", unitId: "u0", name: "Intro", order: 0 });
  if (v >= 7) await old.table("recordings").bulkAdd([{ id: "rec1", unitId: "u0", partId: "p1", at: T, name: "Aufnahme 24.11. 21:36" }]);
  if (v >= 10) await old.table("flagStats").add({ id: "FR", level: 3, seen: 4, right: 3, wrong: 1, last: 9 });
}

describe("Migration von jeder alten Datenbankversion bis zur aktuellen", () => {
  for (let v = 1; v <= 10; v++) {
    it(`Version ${v} → aktuell: Daten bleiben, Neues kommt dazu, Backup-Rundlauf klappt`, async () => {
      db.close();
      await Dexie.delete("skill-app");
      const old = new Dexie("skill-app");
      old.version(v).stores(STORES[v]);
      await old.open();
      await seedOld(old, v);
      expect(old.verno).toBe(v);
      old.close();

      await db.open();
      expect(db.verno).toBeGreaterThanOrEqual(11);
      // alles Alte ist noch da
      expect(await db.skills.count()).toBe(3);
      expect((await db.skills.get("s1"))?.title).toBe("Spanisch lernen");
      expect(await db.sessions.count()).toBe(3);
      expect((await db.sessions.get("se1"))?.minutes).toBe(20);
      expect((await db.sessions.get("se3"))?.minutes).toBe(15); // Session einer Gewohnheit bleibt erhalten
      expect((await db.skills.get("h1"))?.typ).toBe("gewohnheit");
      expect(await db.checks.count()).toBe(1);
      expect(await db.inbox.count()).toBe(1);
      expect(await db.apps.count()).toBe(1);
      // Felder, die es früher nicht gab, sind ergänzt
      const s1 = (await db.skills.get("s1"))!;
      if (v < 4) { expect(Array.isArray(s1.milestones)).toBe(true); expect(s1.sessionMinutes).toBeGreaterThan(0); expect(s1.upd).toBeTypeOf("number"); }
      if (v < 2) expect(await db.lists.count()).toBeGreaterThan(0);
      if (v >= 2) expect(await db.todos.count()).toBe(1);
      if (v >= 3) expect((await db.records.get("r1"))?.value).toBe(12);
      if (v >= 4) { expect(await db.terms.count()).toBe(1); expect(await db.wishes.count()).toBe(1); expect(await db.cards.count()).toBe(1); }
      // Version 6: Klavierstück-Sessions wandern in den ersten Unterpunkt, nichts anderes
      if (v < 6) {
        const piano = (await db.skills.get("s2"))!;
        expect(piano.useUnits).toBe(true);
        const units = await db.units.where("skillId").equals("s2").toArray();
        expect(units.length).toBe(1);
        expect((await db.sessions.get("se2"))?.unitId).toBe(units[0].id);
        expect((await db.sessions.get("se2"))?.minutes).toBe(45);
        expect((await db.sessions.get("se1"))?.unitId).toBeUndefined();
      } else expect(await db.units.where("skillId").equals("s2").count()).toBe(0);
      if (v >= 6) { expect(await db.units.count()).toBe(1); expect(await db.parts.count()).toBe(1); }
      // Version 9: Standardnamen der Aufnahmen werden fortlaufend nummeriert
      if (v >= 7 && v < 9) expect((await db.recordings.get("rec1"))?.name).toBe("Aufnahme 1");
      if (v >= 9) expect(await db.recordings.count()).toBe(1);
      if (v >= 10) expect((await db.flagStats.get("FR"))?.level).toBe(3);
      // neue Tabellen sind leer und benutzbar
      expect(await db.cubeTimes.count()).toBe(0);
      await db.cubeTimes.add({ id: "z1", ms: 30000, at: T, scramble: "R U", upd: 1 } as never);
      expect(await db.cubeTimes.count()).toBe(1);
      await db.cubeTimes.clear();
      // Backup und Wiederherstellung auf dem migrierten Bestand
      const before = [await db.skills.count(), await db.sessions.count(), await db.checks.count()];
      const file = new File([await exportBackup()], "b.json");
      await restoreBackup(await readBackup(file));
      expect([await db.skills.count(), await db.sessions.count(), await db.checks.count()]).toEqual(before);
    });
  }
});

afterAll(async () => { db.close(); await Dexie.delete("skill-app"); });
