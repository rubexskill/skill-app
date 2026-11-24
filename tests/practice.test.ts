import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../src/db";
import { createSkill, deleteSkill, exportBackup, readBackup, restoreBackup } from "../src/logic";
import { BPM_MAX, BPM_MIN, METERS, clampBpm, effectiveMetronome, meterOf, planClicks, wheelFromScroll, wheelIndex, wheelValue } from "../src/metronome";
import { RECORDER_HINT, RECORDER_TYPES, errorName, errorTip, failureOf, pickRecorderMime } from "../src/recorder";
import { Metronome, metronomeRunning, stopAllMetronomes } from "../src/metronome";
import {
  addRecording, createPart, createUnit, deletePart, deleteUnit, exportClipFiles, importClipFiles, missingRecordingIds, recordingFileName, recordingsOf,
  recordingsOfUnit, removeRecording, removeRecordings, setPartMetronome, sizeLabel, setUnitMetronome, storageWarning, updateRecording,
} from "../src/units";
import { applySync, exportSync, parseSync } from "../src/sync";

beforeEach(async () => {
  for (const t of db.tables) await t.clear();
});

const audio = (bytes = 800, name = "a.m4a") => new File([new Uint8Array(bytes)], name, { type: "audio/mp4" });
const setup = async () => {
  const s = await createSkill({ name: "Learn piano song", title: "Klavierstück", kategorie: "Kreativ & Alltag", typ: "skill", status: "lerne" });
  const u = await createUnit(s.id, "Stück");
  const p = await createPart(u.id, "Intro");
  return { s, u, p };
};

describe("BPM-Rad", () => {
  it("hält 30 bis 240 ein", () => {
    expect([BPM_MIN, BPM_MAX]).toEqual([30, 240]);
    expect(clampBpm(10)).toBe(30);
    expect(clampBpm(999)).toBe(240);
    expect(clampBpm(97.6)).toBe(98);
    expect(clampBpm(NaN)).toBe(80);
  });
  it("Rad: Wert ↔ Position, auch außerhalb der Grenzen", () => {
    expect(wheelIndex(30)).toBe(0);
    expect(wheelIndex(240)).toBe(210);
    expect(wheelIndex(500)).toBe(210);
    expect(wheelValue(0)).toBe(30);
    expect(wheelValue(210)).toBe(240);
    expect(wheelValue(-5)).toBe(30);
    expect(wheelFromScroll(40 * 90, 40)).toBe(120);
    expect(wheelFromScroll(40 * 90 + 17, 40)).toBe(120); // rastet auf die nächste Zahl
    expect(wheelFromScroll(40 * 90 + 23, 40)).toBe(121);
    expect(wheelFromScroll(1e6, 40)).toBe(240);
  });
  it("Taktarten: Schläge pro Takt, unbekannte fallen auf 4/4", () => {
    expect(METERS.map((m) => m.id)).toEqual(expect.arrayContaining(["4/4", "3/4", "6/8"]));
    expect(meterOf("3/4").beats).toBe(3);
    expect(meterOf("6/8").beats).toBe(6);
    expect(meterOf("quatsch").id).toBe("4/4");
  });
  it("plant Schläge genau nach der Audio-Uhr, Eins betont", () => {
    const r = planClicks({ time: 10, beat: 0 }, 120, 4, 12.01);
    expect(r.clicks.map((c) => +(c.time - 10).toFixed(3))).toEqual([0, 0.5, 1, 1.5, 2]);
    expect(r.clicks.map((c) => c.beat)).toEqual([0, 1, 2, 3, 0]);
    expect(r.clicks.map((c) => c.accent)).toEqual([true, false, false, false, true]);
    // nahtlos weiter, keine Doppelungen
    const r2 = planClicks(r.next, 120, 4, 13.01);
    expect(r2.clicks[0].time).toBeCloseTo(12.5, 6);
    expect(r2.clicks[0].beat).toBe(1);
  });
  it("Tempo- und Taktwechsel gelten ab dem nächsten Schlag", () => {
    const a = planClicks({ time: 0, beat: 0 }, 60, 3, 3.01); // 0,1,2,3
    expect(a.clicks.map((c) => c.beat)).toEqual([0, 1, 2, 0]);
    const b = planClicks(a.next, 120, 3, 5.01);
    expect(b.clicks[0].time).toBeCloseTo(4, 6);
    expect(b.clicks[1].time - b.clicks[0].time).toBeCloseTo(0.5, 6);
  });
});

describe("Tempo pro Abschnitt", () => {
  it("merkt Tempo und Taktart pro Abschnitt, Stück-Standard als Fallback", async () => {
    const { u, p } = await setup();
    expect(effectiveMetronome((await db.parts.get(p.id))!, (await db.units.get(u.id))!)).toEqual({ bpm: 80, meter: "4/4" });
    await setUnitMetronome(u.id, { bpm: 100, meter: "3/4" });
    expect(effectiveMetronome((await db.parts.get(p.id))!, (await db.units.get(u.id))!)).toEqual({ bpm: 100, meter: "3/4" });
    await setPartMetronome(p.id, { bpm: 60 });
    const part = (await db.parts.get(p.id))!;
    expect(effectiveMetronome(part, (await db.units.get(u.id))!)).toEqual({ bpm: 60, meter: "3/4" });
    const p2 = await createPart(u.id, "Strophe");
    expect(effectiveMetronome((await db.parts.get(p2.id))!, (await db.units.get(u.id))!).bpm).toBe(100);
  });
  it("Tempo bleibt im Backup erhalten", async () => {
    const { p } = await setup();
    await setPartMetronome(p.id, { bpm: 132, meter: "6/8" });
    const text = await (await exportBackup()).text();
    await restoreBackup(await readBackup(new File([text], "b.json")));
    expect(await db.parts.get(p.id)).toMatchObject({ bpm: 132, meter: "6/8" });
  });
});

describe("Aufnahmen", () => {
  it("legt an (Stück und Abschnitt getrennt), benennt um, notiert, löscht mit Rückgängig", async () => {
    const { u, p } = await setup();
    const a = await addRecording({ unitId: u.id, partId: null, blob: audio(), duration: 12.34 });
    const b = await addRecording({ unitId: u.id, partId: p.id, blob: audio(500), duration: 4 });
    expect(a.name).toBe("Aufnahme 1");
    expect(a.duration).toBe(12.3);
    expect((await recordingsOf(u.id, null)).map((r) => r.id)).toEqual([a.id]);
    expect((await recordingsOf(u.id, p.id)).map((r) => r.id)).toEqual([b.id]);
    await updateRecording(a.id, { name: "  Takt 1–8  ", note: "zu schnell" });
    expect(await db.recordings.get(a.id)).toMatchObject({ name: "Takt 1–8", note: "zu schnell" });
    await updateRecording(a.id, { name: "   " }); // leer: bleibt
    expect((await db.recordings.get(a.id))!.name).toBe("Takt 1–8");
    const undo = await removeRecording(a.id);
    expect([await db.recordings.count(), await db.recBlobs.count()]).toEqual([1, 1]);
    await undo();
    expect([await db.recordings.count(), await db.recBlobs.count()]).toEqual([2, 2]);
  });

  it("Abschnitt, Stück und Skill löschen nehmen die Aufnahmen mit – und bringen sie zurück", async () => {
    const { s, u, p } = await setup();
    await addRecording({ unitId: u.id, partId: p.id, blob: audio(), duration: 3 });
    await addRecording({ unitId: u.id, partId: null, blob: audio(), duration: 3 });
    let undo = await deletePart(p.id);
    expect([await db.recordings.count(), await db.recBlobs.count()]).toEqual([1, 1]);
    await undo();
    expect(await db.recordings.count()).toBe(2);
    undo = await deleteUnit(u.id);
    expect([await db.recordings.count(), await db.recBlobs.count()]).toEqual([0, 0]);
    await undo();
    expect([await db.recordings.count(), await db.recBlobs.count()]).toEqual([2, 2]);
    undo = await deleteSkill(s.id);
    expect([await db.recordings.count(), await db.recBlobs.count()]).toEqual([0, 0]);
    await undo();
    expect([await db.recordings.count(), await db.recBlobs.count()]).toEqual([2, 2]);
  });

  it("Export und Import ordnen Aufnahmen über die ID im Dateinamen zu, fehlende werden erkannt", async () => {
    const { u } = await setup();
    const r = await addRecording({ unitId: u.id, blob: audio(321), duration: 5, mime: "audio/mp4" });
    const files = await exportClipFiles();
    expect(files).toHaveLength(1);
    expect(files[0].name).toBe(recordingFileName(r));
    expect(files[0].name).toMatch(/^skills-aufnahme_/);
    expect(files[0].name.endsWith(".m4a")).toBe(true);
    await db.recBlobs.clear();
    expect([...(await missingRecordingIds())]).toEqual([r.id]);
    const res = await importClipFiles([...files, new File([new Uint8Array(1)], "skills-aufnahme_unbekannt_x.m4a")]);
    expect(res).toEqual({ matched: 1, unmatched: 1 });
    expect((await missingRecordingIds()).size).toBe(0);
    expect((await db.recBlobs.get(r.id))!.blob.size).toBe(321);
  });

  it("Backup und Abgleich tragen Metadaten, aber nie die Audiodateien", async () => {
    const { u } = await setup();
    const r = await addRecording({ unitId: u.id, blob: audio(2048), duration: 9 });
    const text = await (await exportBackup()).text();
    expect(JSON.parse(text).recordings[0]).toMatchObject({ id: r.id, size: 2048 });
    expect(text).not.toContain("recBlobs");
    await db.recBlobs.clear();
    await restoreBackup(await readBackup(new File([text], "b.json")));
    expect(await db.recordings.count()).toBe(1);
    expect((await missingRecordingIds()).has(r.id)).toBe(true);
    // Abgleich
    const sync = parseSync(await (await exportSync()).text());
    await db.recordings.clear();
    await new Promise((res) => setTimeout(res, 20));
    await db.tombs.clear();
    const rep = await applySync(sync);
    expect(rep.added.recordings).toBe(1);
  });

  it("warnt bei großen Aufnahmen wie bei Clips", () => {
    expect(storageWarning({ clipBytes: 0, recBytes: 90 * 1024 * 1024, count: 3 }, 20 * 1024 * 1024)).toContain("Aufnahmen");
    expect(storageWarning({ clipBytes: 10, recBytes: 10, count: 1 })).toBeNull();
  });

  it("Format: mp4, dann webm/opus, dann aac, sonst Standard des Browsers", () => {
    expect(RECORDER_TYPES).toEqual(["audio/mp4", "audio/webm;codecs=opus", "audio/aac", "audio/webm"]);
    expect(pickRecorderMime((t) => t === "audio/aac")).toBe("audio/aac");
    expect(pickRecorderMime((t) => t === "audio/webm")).toBe("audio/webm");
    expect(pickRecorderMime((t) => t === "audio/mp4" || t === "audio/aac")).toBe("audio/mp4");
    expect(pickRecorderMime(() => { throw new Error("kaputt"); })).toBeUndefined();
  });

  it("Fehlernamen werden ruhig erklärt: Gruppe, Hinweis und ein Satz Hilfe", () => {
    const cases: [string, string, RegExp][] = [
      ["NotAllowedError", "denied", /iOS-Einstellungen unter Apps → Safari/],
      ["NotFoundError", "none", /Mikrofon vorhanden/],
      ["NotReadableError", "busy", /andere App/i],
      ["SecurityError", "security", /https/],
      ["NotSupportedError", "unsupported", /Format/],
      ["AbortError", "busy", /unterbrochen/],
      ["InvalidStateError", "other", /Metronom/],
    ];
    for (const [name, failure, tip] of cases) {
      expect(failureOf({ name })).toBe(failure);
      expect(errorTip(name)).toMatch(tip);
      expect(RECORDER_HINT[failure as keyof typeof RECORDER_HINT].length).toBeGreaterThan(10);
    }
    expect(errorName({ name: "NotAllowedError" })).toBe("NotAllowedError");
    expect(errorName({ failureName: "X", name: "Y" })).toBe("X");
    expect(errorName(null)).toBe("Unbekannt");
    expect(errorTip("Unbekanntes")).toMatch(/Neustart/);
  });

  it("Größenangabe: 0 Byte ist „0 KB“, nie „1 KB“", () => {
    expect(sizeLabel(0)).toBe("0 KB");
    expect(sizeLabel(10)).toBe("1 KB");
    expect(sizeLabel(5 * 1024 * 1024)).toBe("5 MB");
  });

  it("löscht einzeln, alle eines Stücks und bringt alles zurück", async () => {
    const { u, p } = await setup();
    const a = await addRecording({ unitId: u.id, partId: null, blob: audio(), duration: 0 }); // Probeaufnahme mit Dauer 0
    const b = await addRecording({ unitId: u.id, partId: null, blob: audio(5), duration: 0.2 });
    const c = await addRecording({ unitId: u.id, partId: p.id, blob: audio(), duration: 8 });
    expect((await recordingsOfUnit(u.id)).length).toBe(3);
    // einzeln, auch sehr kurze
    let undo = await removeRecording(a.id);
    expect(await db.recordings.get(a.id)).toBeUndefined();
    await undo();
    expect(await db.recordings.get(a.id)).toBeTruthy();
    // alle hier (Stück-Ebene)
    undo = await removeRecordings((await recordingsOf(u.id, null)).map((r) => r.id));
    expect([await db.recordings.count(), await db.recBlobs.count()]).toEqual([1, 1]);
    expect((await db.recordings.get(c.id))?.partId).toBe(p.id);
    await undo();
    expect([await db.recordings.count(), await db.recBlobs.count()]).toEqual([3, 3]);
    // alle des Stücks inklusive Abschnitte
    undo = await removeRecordings((await recordingsOfUnit(u.id)).map((r) => r.id));
    expect([await db.recordings.count(), await db.recBlobs.count()]).toEqual([0, 0]);
    await undo();
    expect([await db.recordings.count(), await db.recBlobs.count()]).toEqual([3, 3]);
    expect((await db.recordings.get(b.id))!.duration).toBe(0.2);
    await removeRecordings([]); // leer: nichts passiert
    expect(await db.recordings.count()).toBe(3);
  });

  it("Das Metronom lässt sich vor einer Aufnahme von außen stoppen", () => {
    const m = new Metronome();
    let stopped = 0;
    m.onStop = () => { stopped++; };
    m.start(100, 4);
    expect(metronomeRunning()).toBe(true);
    stopAllMetronomes();
    expect(metronomeRunning()).toBe(false);
    expect(m.running).toBe(false);
    expect(stopped).toBe(1);
    stopAllMetronomes(); // nichts läuft: kein zweiter Aufruf
    expect(stopped).toBe(1);
  });

  it("Aufnahme-Format und ruhige Fehlertexte", () => {
    expect(pickRecorderMime((t) => t === "audio/mp4")).toBe("audio/mp4");
    expect(pickRecorderMime((t) => t.startsWith("audio/webm"))).toBe("audio/webm;codecs=opus");
    expect(pickRecorderMime(() => false)).toBeUndefined();
    expect(RECORDER_TYPES[0]).toBe("audio/mp4");
    expect(failureOf({ name: "NotAllowedError" })).toBe("denied");
    expect(failureOf({ name: "NotFoundError" })).toBe("none");
    expect(failureOf(new Error("x"))).toBe("other");
  });
});
