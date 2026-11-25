import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../src/db";
import { addDays, createSkill, dayKey, exportBackup, habitStats, readBackup, restoreBackup, toggleCheck } from "../src/logic";

beforeEach(async () => { for (const t of db.tables) await t.clear(); });

const keys = (offsets: number[], today: Date) => offsets.map((o) => dayKey(addDays(today, o)));
const T = new Date(2026, 10, 25, 12);

describe("Gewohnheiten: Serien in Tagen", () => {
  it("keine Haken: 0 und 0", () => expect(habitStats([], T)).toEqual({ current: 0, best: 0 }));
  it("heute und die zwei Tage davor: 3 in Folge", () => expect(habitStats(keys([0, -1, -2], T), T)).toEqual({ current: 3, best: 3 }));
  it("heute noch offen, gestern und vorgestern erledigt: Serie läuft noch (2)", () => expect(habitStats(keys([-1, -2], T), T).current).toBe(2));
  it("vorgestern zuletzt: Serie ist gerissen (0), beste bleibt", () => expect(habitStats(keys([-2, -3, -4, -5], T), T)).toEqual({ current: 0, best: 4 }));
  it("beste Serie liegt früher als die laufende", () => expect(habitStats(keys([0, -1, -5, -6, -7, -8, -9], T), T)).toEqual({ current: 2, best: 5 }));
  it("doppelte Einträge und unsortierte Reihenfolge stören nicht", () => expect(habitStats([...keys([-1, 0, -2], T), ...keys([0], T)], T)).toEqual({ current: 3, best: 3 }));
  it("über Monatsgrenzen und Sommerzeit", () => {
    const d = new Date(2026, 2, 30, 12); // Zeitumstellung am 29.3.
    expect(habitStats(keys([0, -1, -2, -3, -4], d), d)).toEqual({ current: 5, best: 5 });
  });
});

describe("Gewohnheiten: Daten bleiben erhalten", () => {
  it("Sessions und Haken einer Gewohnheit überstehen Backup und Wiederherstellung; ein Haken pro Tag", async () => {
    const h = await createSkill({ name: "Gummizüge tragen", kategorie: "Gewohnheiten", typ: "gewohnheit", status: "lerne" });
    await db.sessions.add({ id: "s1", skillId: h.id, start: Date.now() - 86400000, minutes: 15 } as never);
    const today = dayKey(new Date());
    await toggleCheck(h.id, today);
    await toggleCheck(h.id, today); // nochmal = zurück
    expect(await db.checks.count()).toBe(0);
    await toggleCheck(h.id, today);
    await toggleCheck(h.id, dayKey(addDays(new Date(), -1)));
    const blob = await exportBackup();
    for (const t of db.tables) await t.clear();
    await restoreBackup(await readBackup(new File([blob], "b.json")));
    expect(await db.sessions.count()).toBe(1);
    expect(await db.checks.count()).toBe(2);
    expect((await db.skills.toArray())[0].typ).toBe("gewohnheit");
  });
});
