import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../src/db";
import { createSkill, deleteSkill } from "../src/logic";
import { addClip, clipTitle, coverCrop, coverFileName, createPart, createUnit, exportClipFiles, importClipFiles, initials, missingCoverIds, removeClip, removeUnitCover, renameClip, setUnitCover } from "../src/units";
import { clampRange, fmtTime, loopAction, onEnded } from "../src/clipLoop";

beforeEach(async () => { for (const t of db.tables) await t.clear(); });

const setup = async () => {
  const s = await createSkill({ name: "Learn piano song", title: "Klavierstück", kategorie: "Kreativ & Alltag", typ: "skill", status: "lerne" });
  const u = await createUnit(s.id, "Homecoming – Kanye West");
  const p = await createPart(u.id, "Intro");
  return { s, u, p };
};
const img = () => new File([new Uint8Array(40)], "x.jpg", { type: "image/jpeg" });

describe("Clip-Titel", () => {
  it("Standard „Clip 1“, „Clip 2“; Umbenennen speichert, leer fällt zurück", async () => {
    const { p } = await setup();
    const a = await addClip(p.id, new File([new Uint8Array(5)], "IMG_0001.MOV", { type: "video/quicktime" }));
    const b = await addClip(p.id, new File([new Uint8Array(5)], "IMG_0002.MOV", { type: "video/quicktime" }));
    let part = (await db.parts.get(p.id))!;
    expect(clipTitle(part.clips[0], 0)).toBe("Clip 1");
    expect(clipTitle(part.clips[1], 1)).toBe("Clip 2");
    await renameClip(p.id, b.id, "Linke Hand");
    part = (await db.parts.get(p.id))!;
    expect(clipTitle(part.clips[1], 1)).toBe("Linke Hand");
    await renameClip(p.id, a.id, "  ");
    part = (await db.parts.get(p.id))!;
    expect(clipTitle(part.clips[0], 0)).toBe("Clip 1");
  });
});

describe("Schleifen-Logik", () => {
  it("Ausschnitt, Schleife und Zeitanzeige", () => {
    expect(loopAction(4.97, 5, 10, true)).toBe("lap");
    expect(loopAction(4.97, 5, 10, false)).toBe("stop");
    expect(loopAction(2, 5, 10, true)).toBe("none");
    expect(loopAction(9.9, 0, 10, true)).toBe("none");
    expect(onEnded(true)).toBe("lap");
    expect(onEnded(false)).toBe("none");
    expect(fmtTime(7.4)).toBe("0:07");
    expect(fmtTime(125)).toBe("2:05");
    expect(clampRange(4.9, 5, 10, "start")[0]).toBeLessThanOrEqual(4.7);
  });
});

describe("Titelbild", () => {
  it("Initialen und Dateiname", () => {
    expect(initials("Homecoming – Kanye West")).toBe("HK");
    expect(initials("Intro")).toBe("I");
    expect(initials("–")).toBe("♪");
    expect(coverFileName("abc", "Mein Stück!")).toBe("skills-bild_abc_Mein-Stück.jpg");
  });
  it("Zuschnitt füllt das Fenster immer ganz", () => {
    const c = coverCrop(4000, 3000, 300, 1, 9999, 9999);
    expect(c.left).toBeLessThanOrEqual(0);
    expect(c.top).toBeLessThanOrEqual(0);
    expect(c.sx).toBeGreaterThanOrEqual(0);
    expect(c.sx + c.size).toBeLessThanOrEqual(4000 + 0.001);
    expect(c.sy + c.size).toBeLessThanOrEqual(3000 + 0.001);
    const z = coverCrop(4000, 3000, 300, 2, 0, 0);
    expect(z.size).toBeCloseTo(1500);
  });
  it("setzen, fehlt-Erkennung, Entfernen mit Rückgängig, Skill löschen räumt auf", async () => {
    const { s, u } = await setup();
    await setUnitCover(u.id, img());
    expect((await db.units.get(u.id))!.hasCover).toBe(true);
    expect((await missingCoverIds()).size).toBe(0);
    await db.covers.clear();
    expect((await missingCoverIds()).has(u.id)).toBe(true);
    await setUnitCover(u.id, img());
    const undo = await removeUnitCover(u.id);
    expect((await db.units.get(u.id))!.hasCover).toBe(false);
    expect(await db.covers.count()).toBe(0);
    await undo();
    expect((await db.units.get(u.id))!.hasCover).toBe(true);
    expect(await db.covers.count()).toBe(1);
    await deleteSkill(s.id);
    expect(await db.covers.count()).toBe(0);
  });
  it("Export und Import ordnen das Bild über die Stück-ID zu", async () => {
    const { u, p } = await setup();
    await setUnitCover(u.id, img());
    const c = await addClip(p.id, new File([new Uint8Array(5)], "a.mp4", { type: "video/mp4" }));
    const files = await exportClipFiles();
    expect(files.some((f) => f.name.startsWith(`skills-bild_${u.id}_`))).toBe(true);
    await db.covers.clear();
    const r = await importClipFiles(files);
    expect(r.unmatched).toBe(0);
    expect(await db.covers.count()).toBe(1);
    await removeClip(p.id, c.id);
  });
  it("Backup/Abgleich tragen nur das Merkmal hasCover, nie das Bild", async () => {
    const { u } = await setup();
    await setUnitCover(u.id, img());
    const { exportBackup } = await import("../src/logic");
    const json = await (await exportBackup()).text();
    expect(json).toContain("hasCover");
    expect(json).not.toContain("covers");
  });
});
