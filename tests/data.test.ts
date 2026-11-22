import { beforeEach, describe, expect, it } from "vitest";
import { db } from "../src/db";
import { createSkill, deleteSkill, weekBuckets, startOfWeek, monthBuckets, dailyMinutes, streakDays } from "../src/logic";
import { applySync, exportSync, parseSync } from "../src/sync";
import { parseMarkdown } from "../src/mdparse";
import { COUNTRIES } from "../src/trainer/data";

async function wipe() {
  for (const t of db.tables) await t.clear();
}
const exported = async () => parseSync(await (await exportSync()).text());
const skill = (name: string) => createSkill({ name, kategorie: "Test", typ: "skill", status: "lerne" });
const session = (skillId: string, minutes = 10, start = Date.now()) => db.sessions.add({ id: crypto.randomUUID(), skillId, start, minutes });
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

beforeEach(wipe);

describe("Abgleich zwischen zwei Datenbeständen", () => {
  it("führt Skills und Sessions von beiden Seiten zusammen", async () => {
    const a = await skill("Nur auf dem iPhone");
    await session(a.id, 12);
    const fileFromPhone = await exported();
    await wipe();
    const b = await skill("Nur auf dem iPad");
    await session(b.id, 5);
    const report = await applySync(fileFromPhone);
    expect(report.total).toBeGreaterThan(0);
    expect((await db.skills.toArray()).map((s) => s.name).sort()).toEqual(["Nur auf dem iPad", "Nur auf dem iPhone"]);
    expect((await db.sessions.toArray()).reduce((x, s) => x + s.minutes, 0)).toBe(17);
  });

  it("zweiter Abgleich mit derselben Datei ändert nichts", async () => {
    const a = await skill("Eins");
    await session(a.id);
    const file = await exported();
    await wipe();
    await skill("Zwei");
    await applySync(file);
    const again = await applySync(file);
    expect(again.total).toBe(0);
  });

  it("neuere Änderung gewinnt, ältere nicht", async () => {
    const a = await skill("Titel alt");
    await db.skills.update(a.id, { title: "vom iPhone" });
    const phone = await exported();
    await pause(15);
    await db.skills.update(a.id, { title: "vom iPad, später" });
    await applySync(phone);
    expect((await db.skills.get(a.id))!.title).toBe("vom iPad, später");

    const padFile = await exported();
    await pause(15);
    await db.skills.update(a.id, { title: "noch später" });
    await applySync(padFile);
    expect((await db.skills.get(a.id))!.title).toBe("noch später");
  });

  it("Gelöschtes bleibt gelöscht, samt Sessions", async () => {
    const a = await skill("Wird gelöscht");
    await session(a.id);
    const before = await exported();
    await pause(15);
    await deleteSkill(a.id);
    await pause(60); // der Löschvermerk wird kurz nach dem Löschen geschrieben
    await applySync(before);
    expect(await db.skills.get(a.id)).toBeUndefined();
    expect(await db.sessions.where("skillId").equals(a.id).count()).toBe(0);
  });

  it("Timer läuft weiter, Abgleich löscht ihn nicht", async () => {
    const a = await skill("Mit Timer");
    const file = await exported();
    await db.skills.update(a.id, { timerStart: 12345 });
    await applySync(file);
    expect((await db.skills.get(a.id))!.timerStart).toBe(12345);
  });

  it("kaputte Datei wird abgelehnt", () => {
    expect(() => parseSync("kein json")).toThrow();
    expect(() => parseSync(JSON.stringify({ hallo: 1 }))).toThrow();
  });
});

describe("Markdown-Import", () => {
  const md = [
    "---", "titel: egal", "---", "# Liste", "", "## Schule",
    "- [ ] Referat vorbereiten",
    "- [x] Hefte kaufen",
    "- Link: [Duden](https://www.duden.de) und https://example.org/x",
    "  - eingerückt",
    "",
    "```", "- [ ] im Codeblock", "```", "",
    "1. Nummeriert", "",
  ].join("\n");
  const items = parseMarkdown(md);
  it("erkennt Checkboxen, Erledigtes, Gruppen und Tiefe", () => {
    const t = items.find((i) => i.title === "Referat vorbereiten")!;
    expect(t.checkbox).toBe(true);
    expect(t.done).toBe(false);
    expect(t.group).toBe("Schule");
    expect(items.find((i) => i.title === "Hefte kaufen")!.done).toBe(true);
    expect(items.find((i) => i.title === "eingerückt")!.depth).toBe(1);
  });
  it("behält Links, überspringt Front-Matter und Codeblöcke", () => {
    const l = items.find((i) => i.title.startsWith("Link"))!;
    expect(l.links.map((x) => x.url)).toEqual(["https://www.duden.de", "https://example.org/x"]);
    expect(items.some((i) => i.title.includes("im Codeblock"))).toBe(false);
    expect(items.some((i) => i.title.includes("egal"))).toBe(false);
    expect(items.some((i) => i.title === "Nummeriert")).toBe(true);
  });
});

describe("Statistik", () => {
  it("Wochenstatistik: Sessions landen in der richtigen Woche (Montag bis Sonntag)", () => {
    const monday = startOfWeek();
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6, 23, 30).getTime();
    const lastSunday = monday.getTime() - 60000;
    const mk = (start: number, minutes: number) => ({ id: String(start), skillId: "x", start, minutes });
    const b = weekBuckets([mk(monday.getTime(), 10), mk(sunday, 5), mk(lastSunday, 7), mk(monday.getTime() - 8 * 864e5, 3)], 12);
    expect(b).toHaveLength(12);
    expect(b[11].current).toBe(true);
    expect(b[11].minutes).toBe(15);
    expect(b[10].minutes).toBe(7);
    expect(b[9].minutes).toBe(3);
    expect(b.reduce((a, x) => a + x.minutes, 0)).toBe(25);
  });
  it("Monate und Tage summieren alle Sessions, auch später hinzugefügte", () => {
    const now = Date.now();
    const s = [{ id: "1", skillId: "x", start: now, minutes: 2 }, { id: "2", skillId: "y", start: now - 3600e3 * 24 * 40, minutes: 1 }];
    expect(monthBuckets(s, 12).reduce((a, x) => a + x.minutes, 0)).toBe(3);
    expect([...dailyMinutes(s).values()].reduce((a, x) => a + x, 0)).toBe(3);
    expect(streakDays(dailyMinutes(s))).toBe(1);
  });
});

describe("Länderdaten", () => {
  it("ISO-Codes und Hauptstädte sind eindeutig", () => {
    const iso = COUNTRIES.map((c) => c.iso);
    expect(new Set(iso).size).toBe(iso.length);
    for (const c of COUNTRIES) expect(c.iso).toMatch(/^[A-Z]{2}$/);
    const caps = COUNTRIES.map((c) => c.capital);
    expect(new Set(caps).size).toBe(caps.length);
  });
  it("Stichproben", () => {
    const cap = (iso: string) => COUNTRIES.find((c) => c.iso === iso)?.capital;
    expect([cap("DE"), cap("AU"), cap("CA"), cap("TR"), cap("CH"), cap("BR")]).toEqual(["Berlin", "Canberra", "Ottawa", "Ankara", "Bern", "Brasília"]);
  });
});
