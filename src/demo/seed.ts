// Demo-Daten für Aufnahmen (Werbevideo): alles erfunden, neutral und deutsch, ohne echte Namen, Firmen oder Links.
// Alle Zeitangaben werden relativ zu „heute“ erzeugt, damit Serien, „Heute“, Wochenbalken und „vor 2 Tagen“ immer stimmen.
// demo-data-generic: Diese Datei und public/demo/* enthalten ausdrücklich nur generische Beispieldaten (siehe Datenschutz-Prüfung in der Action).
import { db, withoutHooks, type ClipMeta, type Part, type Recording, type Session, type Skill, type Status, type Typ, type Unit } from "../db";
import { META_ROWS } from "../library/meta";
import { defaultLists, withDefaults } from "../seed";
import { FLAGS } from "../trainer/flags/data";
import { scramble } from "../trainer/cube/engine";
import { STEPS } from "../trainer/cube/path";
import { dayKey, saveSetting } from "../logic";
import { DEMO_DB, markSeeded } from "./mode";

/** Vorschaubild des Clips (kleines JPEG, selbst erzeugt) */
const CLIP_THUMB = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD//gAQTGF2YzYwLjMxLjEwMgD/2wBDAAgQEBMQExYWFhYWFhoYGhsbGxoaGhobGxsdHR0iIiIdHR0bGx0dICAiIiUmJSMjIiMmJigoKDAwLi44ODpFRVP/xABaAAEBAQEBAQEAAAAAAAAAAAAAAwIEAQYHAQADAQEBAAAAAAAAAAAAAAAAAwQCBQEQAQEAAAAAAAAAAAAAAAAAAAABEQEBAQEBAAAAAAAAAAAAAAAAAQJBMf/AABEIAFoAoAMBIgACEQADEQD/2gAMAwEAAhEDEQA/AP2EBKcAACVVRr14hXNXRXNW09TAZoyAELInU1Kmqym0m8evFqQAAAAH1ADmuiAAPEas569ZqFc9XrnpiesgMVrI8evCeq+JpqVKrMpNMAKkwAAAAPqAHNdEAAZrnrornrTFc9c9XqFbT14AVTcjNaZpc9U8TTqiVXZRaZAUEAAAAA+oAc10QABiuer1z1piueoLVFtOAE0/IxW06xDqwm2m6GUOngBxQAAAAPqAHNdEAASrmrormrRVQqKtSaIegE1TkTradGW9MJt1N0ModABjAAAAAPqAHNdEePXgCFc9dFc1bJrnrLVZelACeqsvE6okZkaYqbdYXxFQBtgAAAAH/9k=";

export interface DemoMedia { clip: Blob | null; takes: (Blob | null)[] }

const mediaUrl = (name: string) => new URL(`demo/${name}`, document.baseURI).href;
async function load(name: string): Promise<Blob | null> {
  try {
    const r = await fetch(mediaUrl(name));
    if (!r.ok) return null;
    const b = await r.blob();
    return b.size > 1000 ? b : null; // eine HTML-Fehlerseite ist kein Medium
  } catch { return null; }
}
/** Kurzes, selbst erzeugtes Animationsvideo und zwei selbst erzeugte Aufnahmen; fehlt eine Datei, bleibt die Demo trotzdem vollständig */
export async function fetchDemoMedia(): Promise<DemoMedia> {
  const [clip, t1, t2] = await Promise.all([load("clip.mp4"), load("take1.m4a"), load("take2.m4a")]);
  return { clip: clip && new Blob([clip], { type: "video/mp4" }), takes: [t1 && new Blob([t1], { type: "audio/mp4" }), t2 && new Blob([t2], { type: "audio/mp4" })] };
}

const MIN = 60000;
/** Zeitpunkt: vor `d` Tagen um hh:mm (heute nie in der Zukunft) */
function stamp(now: number, d: number, h = 9, m = 0): number {
  const t = new Date(now);
  const at = new Date(t.getFullYear(), t.getMonth(), t.getDate() - d, h, m).getTime();
  return d === 0 ? Math.min(at, now - MIN) : at;
}
const keyOf = (now: number, d: number) => { const t = new Date(now); return dayKey(new Date(t.getFullYear(), t.getMonth(), t.getDate() - d, 12)); };
const dueKey = (now: number, plus: number) => keyOf(now, -plus);

const originalOf = (title: string) => META_ROWS.find((r) => r[1] === title)?.[0] ?? title;

export async function seedDemo(now = Date.now(), media: DemoMedia = { clip: null, takes: [null, null] }): Promise<void> {
  // Sicherheitsnetz: niemals die echte Datenbank anfassen
  if (db.name !== DEMO_DB) throw new Error("Demo-Daten dürfen nur in die Demo-Datenbank geschrieben werden.");
  const upd = now;
  const skills: Skill[] = [];
  const mk = (title: string, kategorie: string, status: Status, ageDays: number, extra: Partial<Skill> = {}, typ: Typ = "skill"): Skill => {
    const s = withDefaults({ id: `demo-s-${skills.length + 1}`, name: typ === "skill" ? originalOf(title) : title, title, kategorie, typ, status, createdAt: stamp(now, ageDays, 8), updatedAt: stamp(now, Math.max(0, ageDays - 3), 8), upd, ...extra });
    skills.push(s);
    return s;
  };

  // ---- Skills: 4 aktiv, 5 später, 1 klären, 3 geschafft ----
  const piano = mk("Klavierstück", "Kreativ & Alltag", "lerne", 52);
  const cube = mk("Zauberwürfel", "Tricks, Geschick & Mentalismus", "lerne", 47);
  const flags = mk("Flaggen & Geografie", "Natur, Erde & Himmel", "lerne", 40);
  const stretch = mk("Dehnen", "Körper & Sport", "lerne", 33);
  mk("Jonglieren", "Tricks, Geschick & Mentalismus", "idee", 30);
  mk("Bäume bestimmen", "Natur, Erde & Himmel", "idee", 26);
  mk("Frei reden", "Menschen, Sprache & Kommunikation", "idee", 22);
  mk("Ein Bild malen", "Kreativ & Alltag", "idee", 19);
  mk("Box Breathing", "Atmung, Sinne & Körperkontrolle", "idee", 12);
  mk("Besser schlafen", "Atmung, Sinne & Körperkontrolle", "rausfinden", 9);
  const tie = mk("Krawatte binden", "Kreativ & Alltag", "kann", 58);
  const egg = mk("Ei einhändig aufschlagen", "Kreativ & Alltag", "kann", 55);
  const morse = mk("Morsecode", "Kopf: Rechnen, Gedächtnis & Denken", "kann", 50);

  // ---- Gewohnheiten ----
  const hRead = mk("Jeden Tag lesen", "Gewohnheiten", "lerne", 45, {}, "gewohnheit");
  const hWater = mk("Wasser trinken", "Gewohnheiten", "lerne", 44, {}, "gewohnheit");
  const hWalk = mk("Kurz spazieren gehen", "Gewohnheiten", "lerne", 43, {}, "gewohnheit");
  const checks: { id: string; skillId: string; date: string; upd: number }[] = [];
  const check = (s: Skill, days: number[]) => { for (const d of days) checks.push({ id: `${s.id}|${keyOf(now, d)}`, skillId: s.id, date: keyOf(now, d), upd }); };
  const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  check(hRead, [...range(1, 12), ...range(20, 34)]);      // heute noch offen: 12 Tage in Folge, beste Serie 15
  check(hWater, [...range(0, 4), ...range(8, 10), ...range(14, 18)]); // 5 in Folge
  check(hWalk, [0, 1, 5, 6, 7, 9, 12]);                    // 2 in Folge

  // ---- Sessions (Lernzeit) ----
  const sessions: Session[] = [];
  const add = (s: Skill, days: number[], minutes: number[], extra: Partial<Session> = {}, hour = 17) => days.forEach((d, i) => sessions.push({ id: `demo-x-${sessions.length + 1}`, skillId: s.id, start: stamp(now, d, hour, (i * 7) % 50), minutes: minutes[i % minutes.length], rating: ([3, 2, 3, 3, 2] as const)[i % 5], upd, ...extra }));
  // Klavierstück: Sessions den Unterpunkten zuordnen (unten)
  const pianoDays = [0, 1, 2, 4, 5, 7, 8, 9, 11, 13, 14, 16, 18, 21, 23, 25];
  add(cube, [0, 1, 3, 4, 6, 8, 10, 12, 15, 17, 20, 24], [15, 20, 12, 18, 10], {}, 19);
  add(flags, [1, 2, 3, 5, 6, 9, 11, 12, 14, 19, 22, 26], [10, 12, 8, 15], {}, 12);
  add(stretch, [0, 2, 3, 5, 7, 8, 10, 12, 13, 15, 19, 21, 27], [10, 10, 12, 8], {}, 7);
  add(tie, [31, 34, 38, 41], [20, 15, 25, 15]);
  add(egg, [33, 36, 40], [10, 10, 15]);
  add(morse, [29, 32, 35, 39, 44], [12, 15, 10, 15, 12]);

  // ---- Klavierstück: zwei Stücke, Abschnitte, Notizen, Metronom, Clip, Aufnahmen ----
  const units: Unit[] = [
    { id: "demo-u-1", skillId: piano.id, title: "Sommerlied", status: "lerne", note: "", notes: [{ id: "demo-n-1", text: "Rechte Hand zuerst, die linke später dazunehmen.", at: stamp(now, 6, 18) }], nextNote: { text: "Im Refrain die Pausen genau zählen.", rating: 2, at: stamp(now, 1, 18) }, bpm: 84, meter: "4/4", order: 0, createdAt: stamp(now, 50, 9), upd },
    { id: "demo-u-2", skillId: piano.id, title: "Kleine Etüde", status: "auffrischen", note: "", notes: [], nextNote: null, bpm: 96, meter: "3/4", order: 1, createdAt: stamp(now, 30, 9), upd },
  ];
  const clipMeta: ClipMeta | null = media.clip ? { id: "demo-c-1", name: "strophe.mp4", title: "Strophe langsam", size: media.clip.size, addedAt: stamp(now, 3, 18), duration: 8, thumb: CLIP_THUMB, start: 1.5, end: 5.5 } : null;
  const partNotes = (t: string[], d: number) => t.map((text, i) => ({ id: `demo-pn-${d}-${i}`, text, at: stamp(now, d + i, 18) }));
  const parts: Part[] = [
    { id: "demo-p-1", unitId: "demo-u-1", name: "Intro", order: 0, solid: true, notes: partNotes(["Ruhig anschlagen, Pedal erst ab Takt 3."], 12), links: [], clips: [], loops: 0, createdAt: stamp(now, 49, 9), upd },
    { id: "demo-p-2", unitId: "demo-u-1", name: "Strophe", order: 1, solid: false, notes: partNotes(["Übergang in Takt 7 langsam üben.", "Mit Metronom 72, dann 84."], 5), links: [], clips: clipMeta ? [clipMeta] : [], loops: 34, bpm: 72, meter: "4/4", createdAt: stamp(now, 49, 9), upd },
    { id: "demo-p-3", unitId: "demo-u-1", name: "Refrain", order: 2, solid: false, notes: partNotes(["Dynamik: leise beginnen, am Ende lauter."], 2), links: [], clips: [], loops: 12, createdAt: stamp(now, 48, 9), upd },
    { id: "demo-p-4", unitId: "demo-u-1", name: "Schluss", order: 3, solid: false, notes: [], links: [], clips: [], loops: 0, createdAt: stamp(now, 48, 9), upd },
    { id: "demo-p-5", unitId: "demo-u-2", name: "Takt 1–8", order: 0, solid: true, notes: [], links: [], clips: [], loops: 20, createdAt: stamp(now, 29, 9), upd },
    { id: "demo-p-6", unitId: "demo-u-2", name: "Takt 9–16", order: 1, solid: true, notes: [], links: [], clips: [], loops: 8, createdAt: stamp(now, 29, 9), upd },
  ];
  pianoDays.forEach((d, i) => sessions.push({ id: `demo-x-${sessions.length + 1}`, skillId: piano.id, unitId: i % 5 === 4 ? "demo-u-2" : "demo-u-1", start: stamp(now, d, 18, (i * 11) % 45), minutes: [25, 20, 30, 15, 20][i % 5], rating: ([3, 2, 3, 3, 2] as const)[i % 5], upd }));

  const recordings: Recording[] = [];
  const recBlobs: { id: string; blob: Blob }[] = [];
  media.takes.forEach((b, i) => {
    if (!b) return;
    const r: Recording = { id: `demo-r-${i + 1}`, unitId: "demo-u-1", partId: "demo-p-2", name: `Aufnahme ${i + 1}`, note: i === 0 ? "Noch etwas zu schnell." : "Ruhiger, nur ein falscher Ton.", at: stamp(now, i === 0 ? 4 : 1, 18, 20), duration: i === 0 ? 18.7 : 17.2, size: b.size, mime: "audio/mp4", upd };
    recordings.push(r);
    recBlobs.push({ id: r.id, blob: b });
  });

  // ---- To-dos, Inbox ----
  const lists = [...defaultLists(), { id: "list-haushalt", name: "Haushalt", order: 2 }];
  const todo = (i: number, listId: string, text: string, plus: number | null, done = false, age = 3) => ({ id: `demo-t-${i}`, listId, text, due: plus === null ? null : dueKey(now, plus), done, doneAt: done ? stamp(now, 0, 8, 30) : null, createdAt: stamp(now, age, 10), upd });
  const todos = [
    todo(1, "list-allgemein", "Fahrradreifen aufpumpen", 0),
    todo(2, "list-allgemein", "Paket abholen", 1),
    todo(3, "list-allgemein", "Zahnarzttermin vereinbaren", 3),
    todo(4, "list-allgemein", "Rechnung bezahlen", 0, true),
    todo(5, "list-schule", "Mathe: Aufgaben 4–6", 0),
    todo(6, "list-schule", "Deutsch: Gedicht lernen", 1),
    todo(7, "list-schule", "Bio: Referat vorbereiten", 6),
    todo(8, "list-haushalt", "Pflanzen gießen", 0),
    todo(9, "list-haushalt", "Bücher zurückbringen", 12, false, 5),
  ];
  const inbox = [
    { id: "demo-i-1", text: "Stricken lernen?", createdAt: stamp(now, 0, 8, 12), upd },
    { id: "demo-i-2", text: "Podcast über Sternbilder suchen", createdAt: stamp(now, 0, 7, 40), upd },
    { id: "demo-i-3", text: "Am Sonntag eine Wanderung planen", createdAt: stamp(now, 1, 21, 5), upd },
    { id: "demo-i-4", text: "Fotos von Pflanzen sammeln", createdAt: stamp(now, 3, 16, 30), upd },
  ];

  // ---- Flaggen: 70 sicher, einige lernend, ein paar schwierig ----
  const order = FLAGS.filter((f) => !f.territory).map((f, i) => ({ iso: f.iso, k: (i * 2654435761) % 4294967296 })).sort((a, b) => a.k - b.k).map((x) => x.iso);
  const flagStats = order.slice(0, 110).map((iso, i) => {
    if (i < 70) return { id: iso, level: i % 3 === 0 ? 4 : 3, seen: 5 + (i % 4), right: 5 + (i % 4) - (i % 5 === 0 ? 1 : 0), wrong: i % 5 === 0 ? 1 : 0, last: stamp(now, i % 12, 12), upd };
    if (i < 100) return { id: iso, level: 2 - (i % 2), seen: 3, right: 2, wrong: 1, last: stamp(now, i % 6, 12), upd };
    return { id: iso, level: 0, seen: 4 + (i % 2), right: 1, wrong: 3 + (i % 2), last: stamp(now, i % 4, 12), upd };
  });

  // ---- Würfel: 14 Zeiten (werden schneller), erste Anleitungs-Phase abgeschlossen ----
  let seed = 7;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const cubeMs = [71.4, 68.9, 66.2, 69.8, 63.5, 61.9, 64.3, 58.8, 60.1, 57.4, 55.9, 58.2, 54.6, 52.9];
  const cubeTimes = cubeMs.map((s, i) => ({ id: `demo-z-${i + 1}`, ms: Math.round(s * 1000), at: stamp(now, Math.round((cubeMs.length - 1 - i) * 1.7), 19, 10 + i), scramble: scramble(25, rnd).join(" "), upd }));
  const cubeProgress = [{ id: STEPS[0].algos[0].id, state: "kann" as const, at: stamp(now, 8, 19), upd }, { id: STEPS[1].algos[0].id, state: "ueben" as const, at: stamp(now, 2, 19), upd }];

  // ---- Schreiben (alles in einer Transaktion, ohne Änderungszeit-Hooks) ----
  await withoutHooks(() => db.transaction("rw", db.tables, async () => {
    await Promise.all(db.tables.map((t) => t.clear()));
    await db.skills.bulkAdd(skills);
    await db.sessions.bulkAdd(sessions);
    await db.checks.bulkAdd(checks);
    await db.lists.bulkAdd(lists.map((l) => ({ ...l, upd })));
    await db.todos.bulkAdd(todos);
    await db.inbox.bulkAdd(inbox);
    await db.units.bulkAdd(units);
    await db.parts.bulkAdd(parts);
    await db.recordings.bulkAdd(recordings);
    await db.flagStats.bulkAdd(flagStats);
    await db.cubeTimes.bulkAdd(cubeTimes);
    await db.cubeProgress.bulkAdd(cubeProgress);
  }));
  // Mediendateien getrennt schreiben: scheitert das (z. B. Browser ohne Blob-Speicher), bleibt die Demo ohne Clip und Aufnahmen vollständig, nichts zeigt auf fehlende Dateien
  try {
    await db.transaction("rw", [db.recBlobs, db.clipBlobs], async () => {
      if (recBlobs.length) await db.recBlobs.bulkAdd(recBlobs);
      if (clipMeta && media.clip) await db.clipBlobs.add({ id: clipMeta.id, blob: media.clip });
    });
  } catch {
    await withoutHooks(async () => {
      await db.recordings.clear();
      if (clipMeta) await db.parts.update("demo-p-2", { clips: [] });
    });
  }
  // eingebaute Skills sind schon da: nicht noch einmal anlegen
  saveSetting("flags.skillEnsured", true);
  saveSetting("cube.skillEnsured", true);
  markSeeded(dayKey(new Date(now)));
}
