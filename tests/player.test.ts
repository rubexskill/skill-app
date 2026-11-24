import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../src/db";
import { createSkill, dayLabel, whenLabel } from "../src/logic";
import { addLoops, addRecording, createPart, createUnit, nextRecordingName, sortUnits, updateRecording } from "../src/units";
import { loopAction, loopEnd, wrapped } from "../src/clipLoop";

beforeEach(async () => { for (const t of db.tables) await t.clear(); });

const now = new Date(2026, 10, 24, 22, 0); // Dienstag
const ago = (days: number, h = 12) => new Date(2026, 10, 24 - days, h, 0).getTime();

describe("Relatives Datum", () => {
  it("Heute, Gestern, Wochentag, Wochen, Monate, Jahre", () => {
    expect(dayLabel(ago(0), now)).toBe("Heute");
    expect(dayLabel(ago(1), now)).toBe("Gestern");
    expect(dayLabel(ago(2), now)).toBe("Letzten Sonntag");
    expect(dayLabel(ago(6), now)).toBe("Letzten Mittwoch");
    expect(dayLabel(ago(7), now)).toBe("Vor 1 Woche");
    expect(dayLabel(ago(14), now)).toBe("Vor 2 Wochen");
    expect(dayLabel(ago(21), now)).toBe("Vor 3 Wochen");
    expect(dayLabel(ago(65), now)).toBe("Vor 2 Monaten");
    expect(dayLabel(ago(400), now)).toBe("Vor 1 Jahr");
    expect(dayLabel(ago(-3), now)).toMatch(/^Fr, 27\. Nov\./);
  });
  it("Aufnahme-Zeile: nur heute mit Uhrzeit", () => {
    expect(whenLabel(new Date(2026, 10, 24, 21, 36).getTime(), now)).toBe("Heute, 21:36");
    expect(whenLabel(ago(1), now)).toBe("Gestern");
  });
});

describe("Aufnahmen: fortlaufende Namen", () => {
  it("Aufnahme 1, 2, … pro Stück und Abschnitt getrennt; umbenennbar; nie doppelt nach Löschen", async () => {
    const s = await createSkill({ name: "Learn piano song", title: "Klavierstück", kategorie: "Kreativ & Alltag", typ: "skill", status: "lerne" });
    const u = await createUnit(s.id, "Stück");
    const p = await createPart(u.id, "Intro");
    const blob = new Blob([new Uint8Array(4)], { type: "audio/mp4" });
    const a = await addRecording({ unitId: u.id, blob, duration: 3 });
    const b = await addRecording({ unitId: u.id, blob, duration: 3 });
    const c = await addRecording({ unitId: u.id, partId: p.id, blob, duration: 3 });
    expect([a.name, b.name, c.name]).toEqual(["Aufnahme 1", "Aufnahme 2", "Aufnahme 1"]);
    await db.recordings.delete(a.id);
    expect((await addRecording({ unitId: u.id, blob, duration: 1 })).name).toBe("Aufnahme 3");
    await updateRecording(b.id, { name: "Refrain" });
    expect(nextRecordingName([{ name: "Refrain" }, { name: "Aufnahme 3" }])).toBe("Aufnahme 4");
  });
  it("alte Namen mit Datum werden beim Update fortlaufend umbenannt (Daten bleiben)", async () => {
    const s = await createSkill({ name: "Learn piano song", title: "Klavierstück", kategorie: "Kreativ & Alltag", typ: "skill", status: "lerne" });
    const u = await createUnit(s.id, "Stück");
    await db.recordings.bulkAdd([
      { id: "r2", unitId: u.id, name: "Aufnahme 24.11. 21:36", note: "x", at: 200, duration: 3, size: 1, mime: "audio/mp4" },
      { id: "r1", unitId: u.id, name: "Aufnahme 20.11. 09:00", note: "", at: 100, duration: 3, size: 1, mime: "audio/mp4" },
    ] as never);
    const { renameDefaultRecordings } = await import("../src/db");
    await renameDefaultRecordings(db.recordings);
    expect((await db.recordings.get("r1"))!.name).toBe("Aufnahme 1");
    expect((await db.recordings.get("r2"))!.name).toBe("Aufnahme 2");
    expect((await db.recordings.get("r2"))!.note).toBe("x");
  });
});

describe("Stücke-Reihenfolge", () => {
  it("Lerne ich, dann Auffrischen, dann Kann ich; innerhalb nach Reihenfolge", () => {
    const u = [
      { id: "a", status: "kann", order: 0 }, { id: "b", status: "auffrischen", order: 1 },
      { id: "c", status: "lerne", order: 5 }, { id: "d", status: "lerne", order: 2 }, { id: "e", status: "kann", order: 3 },
    ] as const;
    expect(sortUnits([...u]).map((x) => x.id)).toEqual(["d", "c", "b", "a", "e"]);
  });
});

describe("Schleife ohne Pause", () => {
  it("ganzer Clip: natives Loop, keine Bildschirmschleife", () => {
    expect(loopEnd(0, 0, 10)).toBe(0);
    expect(loopEnd(0, 9.98, 10)).toBe(0);
    expect(loopAction(9.99, loopEnd(0, 10, 10), 10, true)).toBe("none");
  });
  it("Ausschnitt: springt am Ende zurück (lap), ohne Schleife anhalten", () => {
    expect(loopAction(4.97, loopEnd(1, 5, 10), 10, true)).toBe("lap");
    expect(loopAction(4.97, loopEnd(1, 5, 10), 10, false)).toBe("stop");
    expect(loopAction(3, loopEnd(1, 5, 10), 10, true)).toBe("none");
  });
  it("Start später, Ende = Clip-Ende: Ende kurz davor, damit kein „ended“ nötig ist", () => {
    const e = loopEnd(2, 10, 10);
    expect(e).toBeLessThan(10);
    expect(loopAction(9.95, e, 10, true)).toBe("lap");
  });
  it("Neustart des nativen Loops wird erkannt (Zähler), normales Weiterlaufen nicht", () => {
    expect(wrapped(9.95, 0.02)).toBe(true);
    expect(wrapped(3.0, 3.016)).toBe(false);
  });
  it("Zähler wird gesammelt gespeichert", async () => {
    const s = await createSkill({ name: "Learn piano song", title: "Klavierstück", kategorie: "Kreativ & Alltag", typ: "skill", status: "lerne" });
    const u = await createUnit(s.id, "Stück");
    const p = await createPart(u.id, "Intro");
    await addLoops(p.id, 14);
    await addLoops(p.id, 0);
    expect((await db.parts.get(p.id))!.loops).toBe(14);
  });
});
