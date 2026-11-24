import { db, uid, withoutHooks, type LinkItem, type Milestone, type Movement, type Place, type Profile, type RecordEntry, type Session, type Skill, type Status, type Todo, type Typ, type Unit } from "./db";
import { defaultLists, withDefaults } from "./seed";

// ---------------- Zeit & Datum ----------------

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const WEEKDAYS_LONG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const MONTHS = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."];
const MONTHS_LONG = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

export function minutesLabel(min: number): string {
  const total = Math.max(0, Math.round(min));
  if (total < 60) return `${total} min`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Für große Zahlen: { big: "5:10", unit: "h" } bzw. { big: "45", unit: "min" } */
export function bigTime(min: number): { big: string; unit: string } {
  const total = Math.max(0, Math.round(min));
  if (total < 60) return { big: String(total), unit: "min" };
  const h = Math.floor(total / 60);
  const m = total % 60;
  return { big: m ? `${h}:${String(m).padStart(2, "0")}` : String(h), unit: "h" };
}

export function hoursLabel(min: number): string {
  if (min < 60) return `${Math.round(min)} min`;
  const h = min / 60;
  return `${h < 10 && h % 1 ? h.toFixed(1).replace(".", ",") : Math.round(h)} h`;
}

export function elapsedLabel(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

export function dayKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function todayKey(): string {
  return dayKey(new Date());
}

export function parseDay(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** „Heute“, „Gestern“, „Mo, 17. Nov.“ */
export function dayLabel(ts: number, now = new Date()): string {
  const d = new Date(ts);
  const diff = Math.round((startOfDay(now).getTime() - startOfDay(d).getTime()) / 86400000);
  if (diff === 0) return "Heute";
  if (diff === 1) return "Gestern";
  const base = `${WEEKDAYS[d.getDay()]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}`;
  return d.getFullYear() === now.getFullYear() ? base : `${base} ${d.getFullYear()}`;
}

/** Fälligkeit: „Heute“, „Morgen“, „Gestern“, „Fr, 28. Nov.“ */
export function dueLabel(key: string): string {
  const d = parseDay(key);
  const diff = Math.round((d.getTime() - startOfDay(new Date()).getTime()) / 86400000);
  if (diff === 0) return "Heute";
  if (diff === 1) return "Morgen";
  if (diff === -1) return "Gestern";
  return dayLabel(d.getTime());
}

export function longDate(d: Date): string {
  return `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()}. ${MONTHS_LONG[d.getMonth()]}`;
}

export function timeLabel(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function startOfWeek(d = new Date()): Date {
  const day = (d.getDay() + 6) % 7; // Montag = 0
  return addDays(startOfDay(d), -day);
}

// ---------------- Timer ----------------

export type StopResult = { skill: Skill; minutes: number; saved: boolean; sessionId: string | null; unit?: Unit | null };

export async function stopTimer(skillId: string): Promise<StopResult | null> {
  return db.transaction("rw", db.skills, db.sessions, db.units, async () => {
    const skill = await db.skills.get(skillId);
    if (!skill?.timerStart) return null;
    const unit = skill.timerUnit ? (await db.units.get(skill.timerUnit)) ?? null : null;
    const minutes = Math.round((Date.now() - skill.timerStart) / 60000);
    const saved = minutes >= 1;
    let sessionId: string | null = null;
    if (saved) {
      sessionId = uid();
      const session: Session = { id: sessionId, skillId, start: skill.timerStart, minutes, ...(unit ? { unitId: unit.id } : {}) };
      await db.sessions.add(session);
    }
    await db.skills.update(skillId, { timerStart: null, timerUnit: null });
    return { skill, minutes, saved, sessionId, unit };
  });
}

/** Es läuft immer nur ein Timer – ein laufender wird vorher gestoppt. */
export async function startTimer(skillId: string, unitId?: string): Promise<StopResult | null> {
  const running = await db.skills.filter((s) => s.timerStart != null && s.id !== skillId).toArray();
  let stopped: StopResult | null = null;
  for (const s of running) stopped = await stopTimer(s.id);
  await db.skills.update(skillId, { timerStart: Date.now(), timerUnit: unitId ?? null });
  return stopped;
}

export function stopMessage(r: StopResult): string {
  return r.saved ? `${minutesLabel(r.minutes)} für „${r.unit ? r.unit.title : r.skill.title}“ gespeichert` : "Unter 1 Minute – nicht gespeichert";
}

export async function saveSessionNote(r: StopResult, rating: 1 | 2 | 3 | null, text: string) {
  const note = text.trim();
  if (r.sessionId) await db.sessions.update(r.sessionId, { rating, note });
  if (note || rating) {
    const next = note ? { text: note, rating, at: Date.now() } : null;
    if (r.unit) await db.units.update(r.unit.id, { nextNote: next });
    else await db.skills.update(r.skill.id, { nextNote: next });
  }
}

// ---------------- Skills ----------------

export async function createSkill(input: { name: string; title?: string; kategorie: string; typ: Typ; status: Status; notes?: string; links?: LinkItem[]; unsorted?: boolean }) {
  const now = Date.now();
  const skill = withDefaults({
    id: uid(),
    name: input.name.trim(),
    title: (input.title ?? input.name).trim(),
    kategorie: input.kategorie.trim() || "Ohne Kategorie",
    typ: input.typ,
    status: input.status,
    notes: input.notes ?? "",
    links: input.links ?? [],
    unsorted: input.unsorted,
    createdAt: now,
    updatedAt: now,
  });
  await db.skills.add(skill);
  return skill;
}

export async function updateSkill(id: string, patch: Partial<Skill>) {
  await db.skills.update(id, { ...patch, updatedAt: Date.now() });
}

/** Löscht einen Eintrag samt Sessions, Häkchen und Rekorden. Gibt eine Funktion zum Wiederherstellen zurück. */
export async function deleteSkill(id: string): Promise<() => Promise<void>> {
  const skill = await db.skills.get(id);
  const sessions = await db.sessions.where("skillId").equals(id).toArray();
  const checks = await db.checks.where("skillId").equals(id).toArray();
  const records = await db.records.where("skillId").equals(id).toArray();
  const cards = await db.cards.where("skillId").equals(id).toArray();
  const units = await db.units.where("skillId").equals(id).toArray();
  const parts = (await Promise.all(units.map((u) => db.parts.where("unitId").equals(u.id).toArray()))).flat();
  const blobs = (await db.clipBlobs.bulkGet(parts.flatMap((p) => p.clips.map((c) => c.id)))).filter((b): b is NonNullable<typeof b> => !!b);
  const recs = (await Promise.all(units.map((u) => db.recordings.where("unitId").equals(u.id).toArray()))).flat();
  const recBlobs = (await db.recBlobs.bulkGet(recs.map((r) => r.id))).filter((b): b is NonNullable<typeof b> => !!b);
  const covers = (await db.covers.bulkGet(units.map((u) => u.id))).filter((b): b is NonNullable<typeof b> => !!b);
  const tables = [db.skills, db.sessions, db.checks, db.records, db.cards, db.units, db.parts, db.clipBlobs, db.recordings, db.recBlobs, db.covers];
  await db.transaction("rw", tables, async () => {
    await db.sessions.where("skillId").equals(id).delete();
    await db.checks.where("skillId").equals(id).delete();
    await db.records.where("skillId").equals(id).delete();
    await db.cards.where("skillId").equals(id).delete();
    await db.parts.bulkDelete(parts.map((p) => p.id));
    await db.clipBlobs.bulkDelete(blobs.map((b) => b.id));
    await db.recBlobs.bulkDelete(recBlobs.map((b) => b.id));
    await db.covers.bulkDelete(covers.map((b) => b.id));
    await db.recordings.bulkDelete(recs.map((r) => r.id));
    await db.units.bulkDelete(units.map((u) => u.id));
    await db.skills.delete(id);
  });
  return async () => {
    await db.transaction("rw", tables, async () => {
      if (skill) await db.skills.put(skill);
      await db.sessions.bulkPut(sessions);
      await db.checks.bulkPut(checks);
      await db.records.bulkPut(records);
      await db.cards.bulkPut(cards);
      await db.units.bulkPut(units);
      await db.parts.bulkPut(parts);
      await db.clipBlobs.bulkPut(blobs);
      await db.recordings.bulkPut(recs);
      await db.recBlobs.bulkPut(recBlobs);
      await db.covers.bulkPut(covers);
    });
  };
}

export async function toggleCheck(skillId: string, date: string) {
  const key = `${skillId}|${date}`;
  const existing = await db.checks.get(key);
  if (existing) await db.checks.delete(key);
  else await db.checks.add({ id: key, skillId, date });
}

export const isActiveSkill = (s: Skill) => s.status === "lerne" && s.typ === "skill";
export const isActiveHabit = (s: Skill) => s.status === "lerne" && s.typ === "gewohnheit";

// ---------------- To-dos ----------------

export async function addTodo(text: string, listId: string, due: string | null, unsorted?: boolean) {
  const t: Todo = { id: uid(), listId, text: text.trim(), due, done: false, doneAt: null, createdAt: Date.now(), ...(unsorted ? { unsorted: true } : {}) };
  await db.todos.add(t);
  return t;
}

export async function setTodoDone(id: string, done: boolean) {
  await db.todos.update(id, { done, doneAt: done ? Date.now() : null });
}

// ---------------- Vorschlag („Was soll ich jetzt lernen?“) ----------------

export type Where = "egal" | "zuhause" | "draussen" | "gym" | "unterwegs";
export type MoveWish = "egal" | 0 | 1 | 2;

export interface SuggestFilter {
  time: 5 | 15 | 30 | 60;
  move: MoveWish;
  where: Where;
  material: string[];
}

export function currentSeason(d = new Date()): "winter" | "sommer" | "uebergang" {
  const m = d.getMonth();
  if (m === 11 || m <= 1) return "winter";
  if (m >= 5 && m <= 7) return "sommer";
  return "uebergang";
}

const PLACE_OK: Record<Where, Place[]> = {
  egal: ["ueberall", "zuhause", "draussen", "gym"],
  zuhause: ["ueberall", "zuhause"],
  draussen: ["ueberall", "draussen"],
  gym: ["ueberall", "gym"],
  unterwegs: ["ueberall"],
};

export function suggestCandidates(skills: Skill[], f: SuggestFilter): { skill: Skill; weight: number }[] {
  const season = currentSeason();
  const have = new Set(f.material);
  return skills
    .filter((s) => s.typ === "skill" && (s.status === "lerne" || s.status === "idee"))
    .filter((s) => s.sessionMinutes <= f.time)
    .filter((s) => f.move === "egal" || (f.move === 2 ? s.movement === 2 : s.movement <= (f.move as Movement)))
    .filter((s) => PLACE_OK[f.where].includes(s.place))
    .filter((s) => s.material.every((m) => have.has(m)))
    .map((s) => {
      let w = 1;
      if (s.status === "lerne") w *= 2.5;
      if (s.season === "sommer") w *= season === "sommer" ? 2 : season === "winter" ? 0.15 : 1;
      if (s.season === "winter") w *= season === "winter" ? 2 : season === "sommer" ? 0.2 : 1;
      if (s.place === "draussen" && season === "winter") w *= 0.5;
      return { skill: s, weight: w };
    });
}

export function pickWeighted<T extends { weight: number }>(items: T[], avoid?: (t: T) => boolean): T | null {
  const pool = items.length > 1 && avoid ? items.filter((t) => !avoid(t)) : items;
  const total = pool.reduce((a, t) => a + t.weight, 0);
  if (!pool.length || total <= 0) return null;
  let r = Math.random() * total;
  for (const t of pool) {
    r -= t.weight;
    if (r <= 0) return t;
  }
  return pool[pool.length - 1];
}

export function seasonHint(s: Skill): string | null {
  const season = currentSeason();
  if (s.season === "winter" && season === "winter") return "Passt gut zum Winter";
  if (s.season === "sommer" && season === "sommer") return "Passt gut zum Sommer";
  return null;
}

// ---------------- Ähnlichkeit (offline, einfacher Wortvergleich) ----------------

const STOPWORDS = new Set([
  "und", "oder", "der", "die", "das", "den", "dem", "des", "ein", "eine", "einen", "einer", "eines",
  "fuer", "mit", "von", "vom", "zu", "zum", "zur", "im", "in", "am", "an", "auf", "als", "wie", "was",
  "lernen", "erlernen", "ueben", "spielen", "kurs", "grundlagen", "einfuehrung", "besser", "mehr", "alle",
  "how", "to", "learn", "learning", "the", "a", "an", "and", "your", "of", "eg", "for", "with", "my",
  "on", "at", "is", "what", "basics", "better", "more", "like", "e", "g",
]);

export function normalize(s: string): string {
  return s
    .normalize("NFC")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/e\.g\./g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function words(s: string): string[] {
  return normalize(s).split(" ").filter((w) => w.length >= 2 && !STOPWORDS.has(w));
}

function wordsMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.min(a.length, b.length) >= 4 && (a.startsWith(b) || b.startsWith(a))) return true;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i >= 5;
}

export function similarity(a: string, b: string): number {
  const ca = words(a).join("");
  const cb = words(b).join("");
  if (!ca || !cb) return 0;
  if (ca === cb) return 100;
  if (Math.min(ca.length, cb.length) >= 5 && (ca.includes(cb) || cb.includes(ca))) return 80;
  const wa = words(a);
  const wb = words(b);
  const hits = wa.filter((x) => wb.some((y) => wordsMatch(x, y))).length;
  return hits ? 40 + Math.round((hits / Math.max(wa.length, 1)) * 40) : 0;
}

export function findSimilar(name: string, skills: Skill[], limit = 4): Skill[] {
  if (words(name).join("").length < 3) return [];
  return skills
    .map((s) => ({ s, score: Math.max(similarity(name, s.name), similarity(name, s.title)) }))
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((x) => x.s);
}

// ---------------- Backup ----------------

const BACKUP_FORMAT = "skill-app-backup";

export async function exportBackup(): Promise<Blob> {
  const data = {
    format: BACKUP_FORMAT,
    version: 5,
    exportedAt: new Date().toISOString(),
    skills: await db.skills.toArray(),
    sessions: await db.sessions.toArray(),
    inbox: await db.inbox.toArray(),
    checks: await db.checks.toArray(),
    apps: await db.apps.toArray(),
    todos: await db.todos.toArray(),
    lists: await db.lists.toArray(),
    records: await db.records.toArray(),
    terms: await db.terms.toArray(),
    wishes: await db.wishes.toArray(),
    cards: await db.cards.toArray(),
    // Unterpunkte und Abschnitte samt Clip-Metadaten; die Videos selbst gehören nicht ins Backup
    units: await db.units.toArray(),
    parts: await db.parts.toArray(),
    recordings: await db.recordings.toArray(),
    tombs: await db.tombs.toArray(),
  };
  return new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
}

/** Datei über das Teilen-Menü (iOS) bzw. als Download sichern. Gibt false zurück, wenn abgebrochen wurde. */
export async function shareFile(blob: Blob, name: string, title: string): Promise<"shared" | "downloaded" | "cancelled"> {
  try {
    const file = new File([blob], name, { type: "application/json" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title });
      return "shared";
    }
  } catch (err) {
    if ((err as Error)?.name === "AbortError") return "cancelled";
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  return "downloaded";
}

export function backupFileName(): string {
  return `skills-backup-${dayKey(new Date())}.json`;
}

type Backup = {
  skills: Partial<Skill>[];
  sessions?: Session[];
  inbox?: unknown[];
  checks?: unknown[];
  apps?: unknown[];
  todos?: unknown[];
  lists?: unknown[];
  records?: unknown[];
  terms?: unknown[];
  wishes?: unknown[];
  cards?: unknown[];
  units?: unknown[];
  parts?: unknown[];
  recordings?: unknown[];
  tombs?: unknown[];
  exportedAt: string;
};

export async function readBackup(file: File): Promise<Backup> {
  const data = JSON.parse(await file.text());
  if (data?.format !== BACKUP_FORMAT || !Array.isArray(data.skills)) throw new Error("Das ist keine Backup-Datei dieser App.");
  return data as Backup;
}

/** Ersetzt alle Daten. Backups aus Version 1 werden um die neuen Felder ergänzt. */
export async function restoreBackup(data: Backup) {
  const tables = [db.skills, db.sessions, db.inbox, db.checks, db.apps, db.todos, db.lists, db.records, db.terms, db.wishes, db.cards, db.units, db.parts, db.recordings, db.tombs];
  // Fehlende Änderungszeit (alte Backups) aus dem Datum der Zeile schätzen
  const fix = <T,>(rows: unknown[] | undefined): T[] =>
    ((rows ?? []) as Record<string, number | undefined>[]).map((r) => (r.upd == null ? { ...r, upd: r.updatedAt ?? r.createdAt ?? r.start ?? r.at ?? 0 } : r)) as unknown as T[];
  await withoutHooks(() =>
    db.transaction("rw", tables, async () => {
      await Promise.all(tables.map((t) => t.clear()));
      await db.skills.bulkAdd(fix<Skill>(data.skills).map((x) => withDefaults(x)));
      await db.sessions.bulkAdd(fix<Session>(data.sessions));
      await db.inbox.bulkAdd(fix(data.inbox));
      await db.checks.bulkAdd(fix(data.checks));
      await db.apps.bulkAdd(fix(data.apps));
      await db.todos.bulkAdd(fix(data.todos));
      await db.lists.bulkAdd(data.lists?.length ? fix(data.lists) : defaultLists());
      await db.records.bulkAdd(fix(data.records));
      await db.terms.bulkAdd(fix(data.terms));
      await db.wishes.bulkAdd(fix(data.wishes));
      await db.cards.bulkAdd(fix(data.cards));
      await db.units.bulkAdd(fix(data.units));
      await db.parts.bulkAdd(fix(data.parts));
      await db.recordings.bulkAdd(fix(data.recordings));
      await db.tombs.bulkAdd((data.tombs ?? []) as never[]);
    }),
  );
}

// ---------------- Einstellungen (lokal) ----------------

export function loadSetting<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveSetting(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* privater Modus o. Ä. */
  }
}

// ---------------- Statistik ----------------

export function dailyMinutes(sessions: Session[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const s of sessions) {
    const k = dayKey(new Date(s.start));
    m.set(k, (m.get(k) ?? 0) + s.minutes);
  }
  return m;
}

const MONTHS_SHORT = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

export interface Bucket {
  label: string;
  minutes: number;
  current: boolean;
}

/** Letzte n Wochen (ab Montag), älteste zuerst */
export function weekBuckets(sessions: Session[], n = 12): Bucket[] {
  const start = startOfWeek();
  const out = Array.from({ length: n }, (_, i) => {
    const from = addDays(start, -7 * (n - 1 - i));
    return { from: from.getTime(), to: addDays(from, 7).getTime(), label: `${from.getDate()}.${from.getMonth() + 1}.`, minutes: 0, current: i === n - 1 };
  });
  for (const s of sessions) {
    const b = out.find((x) => s.start >= x.from && s.start < x.to);
    if (b) b.minutes += s.minutes;
  }
  return out.map(({ label, minutes, current }) => ({ label, minutes, current }));
}

/** Letzte n Monate, ältester zuerst */
export function monthBuckets(sessions: Session[], n = 12): Bucket[] {
  const now = new Date();
  const out = Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return { y: d.getFullYear(), m: d.getMonth(), label: MONTHS_SHORT[d.getMonth()], minutes: 0, current: i === n - 1 };
  });
  for (const s of sessions) {
    const d = new Date(s.start);
    const b = out.find((x) => x.y === d.getFullYear() && x.m === d.getMonth());
    if (b) b.minutes += s.minutes;
  }
  return out.map(({ label, minutes, current }) => ({ label, minutes, current }));
}

/** Tage in Folge mit Lernzeit (heute zählt, wenn schon geübt; sonst ab gestern) */
export function streakDays(days: Map<string, number>): number {
  let d = new Date();
  if (!days.get(dayKey(d))) d = addDays(d, -1);
  let n = 0;
  while ((days.get(dayKey(d)) ?? 0) > 0) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

// ---------------- Rekorde ----------------

export function bestOf(records: RecordEntry[], higher: boolean): number | null {
  if (!records.length) return null;
  return records.reduce((b, r) => (higher ? Math.max(b, r.value) : Math.min(b, r.value)), records[0].value);
}

export function formatValue(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1).replace(".", ",");
}

// ---------------- Steckbrief ----------------

export function youtubeUrl(q: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

export function profilePrompt(s: Skill): string {
  const extra = s.title !== s.name ? ` („${s.name}“)` : "";
  return [
    `Erstelle einen kurzen Steckbrief auf Deutsch für den Skill „${s.title}“${extra}, Kategorie „${s.kategorie}“.`,
    "Antworte genau in diesem Format, ohne Einleitung und ohne Schluss:",
    "",
    "WORUM: 2–3 Sätze, worum es geht.",
    "WARUM: 1 Satz, warum es nützlich ist.",
    "MEILENSTEINE:",
    "- 3 bis 6 konkrete Lernschritte vom Einstieg bis zum Können, je eine Zeile",
    "TIPPS: Typische Fehler und Tipps in 1–3 Sätzen.",
    "SUCHBEGRIFFE:",
    "- 2 bis 3 YouTube-Suchbegriffe, je eine Zeile",
    "SICHERHEIT: Nur wenn der Skill riskant ist, sonst die Zeile weglassen.",
  ].join("\n");
}

export interface ParsedProfile {
  about: string;
  why: string;
  tips: string;
  safety: string;
  searches: string[];
  milestones: string[];
}

const HEADS: Record<string, keyof ParsedProfile> = {
  WORUM: "about",
  WARUM: "why",
  MEILENSTEINE: "milestones",
  TIPPS: "tips",
  TIPP: "tips",
  SUCHBEGRIFFE: "searches",
  SICHERHEIT: "safety",
};

/** Liest die Antwort von Claude ein. Verträgt Markdown, Nummerierung und kleine Abweichungen. */
export function parseProfile(text: string): ParsedProfile | null {
  const out: ParsedProfile = { about: "", why: "", tips: "", safety: "", searches: [], milestones: [] };
  let key: keyof ParsedProfile | null = null;
  let found = 0;
  const add = (k: keyof ParsedProfile, value: string) => {
    const v = value.replace(/^([-*•–]|\d+[.)])\s*/, "").replace(/^\*\*|\*\*$/g, "").trim();
    if (!v) return;
    if (k === "searches" || k === "milestones") (out[k] as string[]).push(v.replace(/^[„"]|[“"]$/g, ""));
    else out[k] = out[k] ? `${out[k]} ${v}` : v;
  };
  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const h = /^[#*_\s]*(WORUM|WARUM|MEILENSTEINE|TIPPS?|SUCHBEGRIFFE|SICHERHEIT)\b[^:：]*[:：]?[*_\s]*(.*)$/i.exec(line);
    if (h) {
      key = HEADS[h[1].toUpperCase()];
      found++;
      const rest = h[2].replace(/[*_]+$/, "").trim();
      if (rest) add(key, rest);
      continue;
    }
    if (key) add(key, line);
  }
  return found && out.about ? out : null;
}

export function toProfile(p: ParsedProfile): Profile {
  return { about: p.about, why: p.why, tips: p.tips, safety: p.safety, searches: p.searches.slice(0, 4), ai: true };
}

export function toMilestones(texts: string[]): Milestone[] {
  return texts.slice(0, 8).map((text) => ({ id: uid(), text, done: false, doneAt: null }));
}

/** In die Zwischenablage – mit Ausweichweg für Verbindungen ohne HTTPS. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* Ausweichweg unten */
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  ta.remove();
  return ok;
}

// ---------------- Trainer ----------------

/**
 * Speichert einen Messwert. Hat der Skill schon einen Messwert mit anderer Einheit, wird nichts gespeichert.
 * Hat er noch keinen, wird der Messwert des Trainers angelegt.
 */
export async function saveRecord(
  skill: Skill,
  rec: { value: number; label: string; unit: string; higher: boolean },
): Promise<{ saved: boolean; isBest: boolean }> {
  const fresh = await db.skills.get(skill.id);
  if (!fresh) return { saved: false, isBest: false };
  const metric = fresh.metric ?? { label: rec.label, unit: rec.unit, higher: rec.higher };
  if (fresh.metric && fresh.metric.unit.trim() !== rec.unit) return { saved: false, isBest: false };
  if (!fresh.metric) await updateSkill(skill.id, { metric });
  const prev = bestOf(await db.records.where("skillId").equals(skill.id).toArray(), metric.higher);
  await db.records.add({ id: uid(), skillId: skill.id, value: rec.value, at: Date.now() });
  const isBest = prev !== null && (metric.higher ? rec.value > prev : rec.value < prev);
  return { saved: true, isBest };
}
