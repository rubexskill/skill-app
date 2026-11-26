import fs from "node:fs";
import path from "node:path";
import Dexie from "dexie";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { demoOn, settingKey } from "../src/demo/mode";

const store = new Map<string, string>();
const media = { clip: new Blob([new Uint8Array(3000)], { type: "video/mp4" }), takes: [new Blob([new Uint8Array(2500)], { type: "audio/mp4" }), new Blob([new Uint8Array(2400)], { type: "audio/mp4" })] };
beforeEach(() => {
  store.clear();
  (globalThis as unknown as { localStorage: unknown }).localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k), get length() { return store.size; }, key: (i: number) => [...store.keys()][i] ?? null };
  (globalThis as unknown as { document: unknown }).document = { baseURI: "http://x/", documentElement: { classList: { toggle() {}, add() {}, remove() {} } } };
});
afterEach(async () => { vi.resetModules(); for (const n of ["skill-app", "skill-app-demo"]) await Dexie.delete(n); });

/** Module neu laden, damit die Datenbank beim Import den Modus aus localStorage liest */
async function load(demo: boolean) {
  vi.resetModules();
  if (demo) store.set("skills.demo", "1"); else store.delete("skills.demo");
  const dbm = await import("../src/db");
  const seed = await import("../src/demo/seed");
  const ctl = await import("../src/demo/control");
  const logic = await import("../src/logic");
  return { db: dbm.db, ...seed, ...ctl, logic };
}

const at = (y: number, m: number, d: number, h = 14) => new Date(y, m - 1, d, h, 0).getTime();
const NOW = at(2026, 11, 25);

describe("Demo-Modus: Schalter", () => {
  it("nur in der öffentlichen Version und nur mit gesetztem Flag", () => {
    expect(demoOn(true, "1")).toBe(true);
    expect(demoOn(true, null)).toBe(false);
    expect(demoOn(true, "0")).toBe(false);
    expect(demoOn(false, "1")).toBe(false); // private Version
  });
  it("Einstellungen der Demo haben eigene Schlüssel", () => {
    expect(settingKey("flags.prefs", true)).toBe("demo.flags.prefs");
    expect(settingKey("flags.prefs", false)).toBe("flags.prefs");
  });
});

describe("Demo-Datenbank ist getrennt von den echten Daten", () => {
  it("seedDemo verweigert die echte Datenbank", async () => {
    const m = await load(false);
    expect(m.db.name).toBe("skill-app");
    await m.logic.createSkill({ name: "Echt", kategorie: "Test", typ: "skill", status: "lerne" });
    await expect(m.seedDemo(NOW, media)).rejects.toThrow(/nur in die Demo-Datenbank/);
    expect(await m.db.skills.count()).toBe(1);
    m.db.close();
  });
  it("Demo schreibt nur in ihre Datenbank; nach „Demo beenden“ sind die echten Daten unverändert und die Demo-Datenbank gelöscht", async () => {
    const real = await load(false);
    const skill = await real.logic.createSkill({ name: "Echter Skill", kategorie: "Test", typ: "skill", status: "lerne" });
    await real.logic.addTodo("Echtes To-do", "list-allgemein", null);
    await real.db.sessions.add({ id: "echt-s", skillId: skill.id, start: NOW, minutes: 33 });
    const before = JSON.stringify([await real.db.skills.toArray(), await real.db.todos.toArray(), await real.db.sessions.toArray()]);
    real.db.close();

    const demo = await load(true);
    expect(demo.db.name).toBe("skill-app-demo");
    await demo.seedDemo(NOW, media);
    expect(await demo.db.skills.count()).toBeGreaterThan(12);
    expect(await demo.db.skills.filter((s) => s.title === "Echter Skill").count()).toBe(0);
    // die echte Datenbank ist während der Demo unberührt
    const probe = new Dexie("skill-app");
    await probe.open();
    expect(JSON.stringify([await probe.table("skills").toArray(), await probe.table("todos").toArray(), await probe.table("sessions").toArray()])).toBe(before);
    probe.close();
    // Demo-Einstellungen liegen unter eigenen Schlüsseln
    expect([...store.keys()].filter((k) => k.startsWith("flags.") || k.startsWith("cube."))).toEqual([]);
    expect(store.get("demo.flags.skillEnsured")).toBe("true");

    await demo.endDemo();
    expect(await Dexie.exists("skill-app-demo")).toBe(false);
    expect(store.get("skills.demo")).toBeUndefined();
    expect([...store.keys()].some((k) => k.startsWith("demo."))).toBe(false);
    const after = await load(false);
    expect(JSON.stringify([await after.db.skills.toArray(), await after.db.todos.toArray(), await after.db.sessions.toArray()])).toBe(before);
    after.db.close();
  });
});

describe("Demo-Inhalt", () => {
  it("Umfang: Skills in allen Status, Gewohnheiten mit Serien 12/5/2, To-dos, Inbox, Flaggen, Würfel, Klavierstück", async () => {
    const m = await load(true);
    await m.seedDemo(NOW, media);
    const { db, logic } = m;
    const skills = (await db.skills.toArray()).filter((s) => s.typ === "skill");
    expect(skills.length).toBeGreaterThanOrEqual(12);
    expect(skills.length).toBeLessThanOrEqual(15);
    const count = (st: string) => skills.filter((s) => s.status === st).length;
    expect(count("lerne")).toBe(4);
    expect(count("idee")).toBeGreaterThanOrEqual(4);
    expect(count("kann")).toBeGreaterThanOrEqual(3);
    expect(new Set(skills.map((s) => s.kategorie)).size).toBeGreaterThanOrEqual(5);
    // Gewohnheiten
    const habits = await db.skills.where("typ").equals("gewohnheit").toArray();
    expect(habits.length).toBe(3);
    const streak = async (title: string) => { const h = habits.find((x) => x.title === title)!; return logic.habitStats((await db.checks.where("skillId").equals(h.id).toArray()).map((c) => c.date), new Date(NOW)); };
    expect((await streak("Jeden Tag lesen"))).toEqual({ current: 12, best: 15 });
    expect((await streak("Wasser trinken")).current).toBe(5);
    expect((await streak("Kurz spazieren gehen")).current).toBe(2);
    // To-dos und Inbox
    const todos = await db.todos.toArray();
    expect(todos.length).toBeGreaterThanOrEqual(8);
    expect(todos.length).toBeLessThanOrEqual(10);
    expect(new Set(todos.map((t) => t.listId)).size).toBe(3);
    const today = logic.dayKey(new Date(NOW));
    expect(todos.some((t) => t.due === today && !t.done)).toBe(true);
    expect(todos.some((t) => t.due === logic.dayKey(new Date(NOW + 86400000)))).toBe(true);
    expect(todos.some((t) => t.due && t.due > logic.dayKey(new Date(NOW + 7 * 86400000)))).toBe(true);
    expect(await db.inbox.count()).toBe(4);
    // Flaggen: 70 sicher, einige schwierig
    const fl = await import("../src/trainer/flags/logic");
    const stats = await db.flagStats.toArray();
    expect(stats.filter((s) => fl.bandOf(s) === "sure").length).toBe(70);
    expect(stats.filter((s) => fl.isDifficult(s)).length).toBeGreaterThanOrEqual(5);
    // Würfel: genug Zeiten für Ao12, eine abgeschlossene Phase
    const cs = await import("../src/trainer/cube/stats");
    const times = (await db.cubeTimes.toArray()).map((t) => t.ms);
    const st = cs.statsOf(times);
    expect(st.best).not.toBeNull(); expect(st.ao5).not.toBeNull(); expect(st.ao12).not.toBeNull();
    const prog = await db.cubeProgress.toArray();
    expect(prog.some((p) => p.state === "kann")).toBe(true);
    // Klavierstück: Abschnitte mit Notizen, Metronom, Clip mit Schleife, zwei Aufnahmen
    const piano = skills.find((s) => s.title === "Klavierstück")!;
    expect(piano.useUnits).toBe(true);
    const units = await db.units.where("skillId").equals(piano.id).toArray();
    expect(units.length).toBeGreaterThanOrEqual(1);
    const parts = await db.parts.toArray();
    expect(parts.filter((p) => p.unitId === units[0].id).length).toBeGreaterThanOrEqual(4);
    expect(parts.some((p) => p.notes.length > 0)).toBe(true);
    expect(units[0].bpm).toBeTruthy();
    const clipPart = parts.find((p) => p.clips.length > 0)!;
    expect(clipPart.clips[0].start).toBeLessThan(clipPart.clips[0].end!);
    expect(await db.clipBlobs.get(clipPart.clips[0].id)).toBeTruthy();
    expect(await db.recordings.count()).toBe(2);
    expect(await db.recBlobs.count()).toBe(2);
    // Lernzeit-Verteilung: in der laufenden Woche gibt es Sessions, keine in der Zukunft
    const sessions = await db.sessions.toArray();
    expect(sessions.length).toBeGreaterThan(40);
    expect(sessions.every((s) => s.start <= NOW)).toBe(true);
    expect(sessions.some((s) => logic.dayKey(new Date(s.start)) === today)).toBe(true);
    // keine Sessions für Gewohnheiten (Tage statt Minuten)
    expect(sessions.some((s) => habits.some((h) => h.id === s.skillId))).toBe(false);
    m.db.close();
  });

  it("alle Zeitangaben sind relativ zu heute (an einem anderen Tag ergibt sich dasselbe Bild)", async () => {
    const sig = async (m: Awaited<ReturnType<typeof load>>, now: number) => {
      const days = (t: number) => Math.round((Date.parse(m.logic.dayKey(new Date(now)) + "T12:00:00") - Date.parse(m.logic.dayKey(new Date(t)) + "T12:00:00")) / 86400000);
      const dk = (k: string) => Math.round((Date.parse(m.logic.dayKey(new Date(now)) + "T12:00:00") - Date.parse(k + "T12:00:00")) / 86400000);
      const g = <T,>(xs: T[]) => xs.slice().sort();
      return JSON.stringify({
        sessions: g((await m.db.sessions.toArray()).map((s) => `${s.skillId}:${days(s.start)}:${s.minutes}`)),
        checks: g((await m.db.checks.toArray()).map((c) => `${c.skillId}:${dk(c.date)}`)),
        todos: g((await m.db.todos.toArray()).map((t) => `${t.id}:${t.due ? -dk(t.due) : "-"}:${t.done}`)),
        inbox: g((await m.db.inbox.toArray()).map((i) => days(i.createdAt))),
        cube: g((await m.db.cubeTimes.toArray()).map((t) => `${t.ms}:${days(t.at)}`)),
        rec: g((await m.db.recordings.toArray()).map((r) => days(r.at))),
      });
    };
    const m1 = await load(true);
    await m1.seedDemo(NOW, media);
    const a = await sig(m1, NOW);
    const later = at(2027, 1, 8, 9);
    await m1.seedDemo(later, media);
    const b = await sig(m1, later);
    expect(b).toBe(a);
    expect(a.length).toBeGreaterThan(500);
    m1.db.close();
  });

  it("Zurücksetzen: gleicher Anfangszustand, nichts doppelt", async () => {
    const m = await load(true);
    await m.seedDemo(NOW, media);
    const counts = async () => JSON.stringify(await Promise.all(m.db.tables.map(async (t) => [t.name, await t.count()])));
    const first = await counts();
    await m.db.todos.update("demo-t-1", { done: true });
    await m.db.skills.add({ ...(await m.db.skills.toArray())[0], id: "extra" });
    await m.seedDemo(NOW, media);
    expect(await counts()).toBe(first);
    expect((await m.db.todos.get("demo-t-1"))?.done).toBe(false);
    m.db.close();
  });

  it("ohne Mediendateien bleibt die Demo vollständig (nur ohne Clip und Aufnahmen)", async () => {
    const m = await load(true);
    await m.seedDemo(NOW);
    expect(await m.db.skills.count()).toBeGreaterThan(12);
    expect(await m.db.recordings.count()).toBe(0);
    m.db.close();
  });

  it("ensureDemo legt die Daten beim ersten Start an und erneuert sie an einem neuen Tag", async () => {
    const m = await load(true);
    await m.db.open();
    await m.ensureDemo();
    expect(await m.db.skills.count()).toBeGreaterThan(12);
    store.set("skills.demo.seeded", "2020-01-01");
    await m.db.todos.clear();
    await m.ensureDemo();
    expect(await m.db.todos.count()).toBeGreaterThan(5);
    m.db.close();
  });
});

describe("Datenschutz der Demo", () => {
  const files = ["mode.ts", "seed.ts", "control.ts"].map((f) => path.join(__dirname, "../src/demo", f));
  it("Demo-Dateien enthalten keine Links, E-Mail-Adressen oder persönlichen Namen", () => {
    for (const f of files) {
      const text = fs.readFileSync(f, "utf8");
      expect(text, f).not.toMatch(/https?:\/\//);
      expect(text, f).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
      expect(text, f).not.toMatch(/ruben|minholz|rubexskill|skills-private-seed/i);
    }
  });
  it("Medien sind klein (zusammen unter 400 KB) und vorhanden", () => {
    const dir = path.join(__dirname, "../public/demo");
    const names = ["clip.mp4", "take1.m4a", "take2.m4a"];
    const total = names.reduce((n, f) => n + fs.statSync(path.join(dir, f)).size, 0);
    expect(total).toBeGreaterThan(10_000);
    expect(total).toBeLessThan(400_000);
  });
  it("die Demo-Seed-Datei trägt die Markierung für die Datenschutz-Prüfung", () => {
    expect(fs.readFileSync(files[1], "utf8")).toMatch(/demo-data-generic/);
  });
});

describe("Aufnahme-Modus", () => {
  it("schaltet nur in der Demo, setzt die Klasse und merkt sich den Zustand", async () => {
    vi.resetModules();
    store.set("skills.demo", "1");
    const mode = await import("../src/demo/mode");
    const classes = new Set<string>();
    (globalThis as unknown as { document: unknown }).document = { documentElement: { classList: { toggle: (c: string, on: boolean) => (on ? classes.add(c) : classes.delete(c)) } } };
    expect(mode.recordMode()).toBe(false);
    mode.setRecordMode(true);
    expect(mode.recordMode()).toBe(true);
    expect(classes.has("demo-record")).toBe(true);
    mode.setRecordMode(false);
    expect(mode.recordMode()).toBe(false);
    expect(classes.has("demo-record")).toBe(false);
    store.delete("skills.demo");
    store.set("skills.demo.record", "1");
    expect(mode.recordMode()).toBe(false); // ohne Demo nie
  });
});
