// Logik des Flaggen-Trainers: Auswahl, Falschantworten, Lernstufen (Leitner, einfach), Durchgang. Alles rein berechnet und testbar.
import { BY_ISO, FLAGS, confusedWith, inSimilarGroup, lookalikes, type Continent, type Flag } from "./data";

export const MAX_LEVEL = 4;

/** Lernstand einer Flagge (Tabelle `flagStats`, id = ISO-Code) */
export interface Stat {
  id: string;
  /** 0 neu/falsch … 4 sicher */
  level: number;
  seen: number;
  right: number;
  wrong: number;
  last: number;
  upd?: number;
}

export type Direction = "flag" | "country" | "mixed";
export type Scope = "all" | "continent" | "difficult" | "new" | "similar";
export type Amount = 10 | 25 | 50 | "all" | "endless";

export interface Prefs {
  /** flag: Flagge → Land · country: Land → Flagge */
  direction: Direction;
  amount: Amount;
  scope: Scope;
  continent: Continent;
  /** bekannte Gebiete (Taiwan, Grönland …) einbeziehen */
  territories: boolean;
}

export const DEFAULT_PREFS: Prefs = { direction: "mixed", amount: 10, scope: "all", continent: "Europa", territories: false };

type Rnd = () => number;
type Stats = Map<string, Stat>;

export const nextLevel = (level: number, correct: boolean): number => (correct ? Math.min(MAX_LEVEL, level + 1) : 0);

export function applyAnswer(stat: Stat | undefined, iso: string, correct: boolean, now: number): Stat {
  const base: Stat = stat ?? { id: iso, level: 0, seen: 0, right: 0, wrong: 0, last: 0 };
  return { ...base, level: nextLevel(base.level, correct), seen: base.seen + 1, right: base.right + (correct ? 1 : 0), wrong: base.wrong + (correct ? 0 : 1), last: now };
}

/** „Schwierig“: Stufe 0–1 und mehr als ein Fehler */
export const isDifficult = (s?: Stat): boolean => !!s && s.level <= 1 && s.wrong > 1;
export const isNew = (s?: Stat): boolean => !s || s.seen === 0;
export const bandOf = (s?: Stat): "new" | "learning" | "sure" => (isNew(s) ? "new" : s!.level >= 3 ? "sure" : "learning");

export const shuffled = <T,>(list: T[], rnd: Rnd): T[] => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/** Alle Flaggen, die als Antwort vorkommen dürfen (Gebiete nur, wenn eingeschaltet). */
export const universeFor = (prefs: Pick<Prefs, "territories">): Flag[] => FLAGS.filter((f) => prefs.territories || !f.territory);

/** Flaggen, aus denen die Fragen gezogen werden */
export function poolFor(prefs: Prefs, stats: Stats): Flag[] {
  return universeFor(prefs).filter((f) => {
    switch (prefs.scope) {
      case "continent": return f.continent === prefs.continent;
      case "difficult": return isDifficult(stats.get(f.iso));
      case "new": return isNew(stats.get(f.iso));
      case "similar": return inSimilarGroup(f.iso);
      default: return true;
    }
  });
}

/**
 * Falsche Antworten: etwa die Hälfte aus der Verwechslungsgruppe der richtigen Flagge, dann gleicher Kontinent, dann beliebig.
 * Nie die richtige, nie doppelt, nie zwei Flaggen, die praktisch gleich aussehen.
 */
export function distractors(correct: Flag, universe: Flag[], rnd: Rnd, n = 3): Flag[] {
  const ban = new Set([correct.iso, ...lookalikes(correct.iso)]);
  const candidates = universe.filter((f) => !ban.has(f.iso));
  const chosen: Flag[] = [];
  const ok = (f: Flag) => !chosen.some((c) => c.iso === f.iso || lookalikes(c.iso).includes(f.iso));
  const take = (list: Flag[], max: number) => { for (const f of list) { if (max <= 0 || chosen.length >= n) break; if (ok(f)) { chosen.push(f); max--; } } };
  const group = new Set(confusedWith(correct.iso));
  take(shuffled(candidates.filter((f) => group.has(f.iso)), rnd), Math.ceil(n / 2));
  take(shuffled(candidates.filter((f) => f.continent === correct.continent), rnd), n);
  take(shuffled(candidates, rnd), n);
  return shuffled(chosen, rnd);
}

export interface Question {
  /** flag: Flagge zeigen, Land wählen · country: Land nennen, Flagge wählen */
  dir: "flag" | "country";
  iso: string;
  /** vier ISO-Codes in zufälliger Reihenfolge */
  options: string[];
}

export const resolveDir = (d: Direction, rnd: Rnd): "flag" | "country" => (d === "mixed" ? (rnd() < 0.5 ? "flag" : "country") : d);

export function makeQuestion(iso: string, dir: "flag" | "country", universe: Flag[], rnd: Rnd): Question {
  const correct = BY_ISO.get(iso)!;
  const options = shuffled([correct, ...distractors(correct, universe, rnd)], rnd).map((f) => f.iso);
  return { dir, iso, options };
}

// ---------------- Durchgang ----------------

export interface Run {
  prefs: Prefs;
  /** noch offene Fragen (ISO-Codes), vorn die nächste */
  queue: string[];
  done: number;
  /** geplante Fragen ohne Wiederholungen (Endlos: 0) */
  total: number;
  endless: boolean;
  /** Ergebnis des ersten Versuchs je Flagge */
  first: Record<string, boolean>;
  /** wie oft eine falsche Flagge schon wieder eingeplant wurde */
  retries: Record<string, number>;
  last?: string;
  startedAt: number;
  /** aktive Übungszeit in Millisekunden */
  activeMs: number;
  /** davon schon als Lernzeit gespeichert */
  reported: number;
}

const ENDLESS_BATCH = 12;
const MAX_RETRIES = 2;

/** Zufallsauswahl ohne Zurücklegen; schwächere Flaggen (niedrige Stufe, ungesehen) sind wahrscheinlicher. */
function weightedSample(ids: string[], n: number, stats: Stats, rnd: Rnd): string[] {
  const keyed = ids.map((id) => ({ id, key: Math.pow(Math.max(rnd(), 1e-9), 1 / (MAX_LEVEL + 1 - (stats.get(id)?.level ?? 0))) }));
  keyed.sort((a, b) => b.key - a.key);
  return keyed.slice(0, n).map((k) => k.id);
}

export function startRun(prefs: Prefs, stats: Stats, rnd: Rnd, now: number): Run | null {
  const ids = poolFor(prefs, stats).map((f) => f.iso);
  if (!ids.length) return null;
  const endless = prefs.amount === "endless";
  const n = prefs.amount === "all" ? ids.length : prefs.amount === "endless" ? ENDLESS_BATCH : prefs.amount;
  const queue = shuffled(prefs.amount === "all" ? ids : weightedSample(ids, Math.min(n, ids.length), stats, rnd), rnd);
  return { prefs, queue, done: 0, total: endless ? 0 : queue.length, endless, first: {}, retries: {}, startedAt: now, activeMs: 0, reported: 0 };
}

/** Nur die falschen Flaggen noch einmal */
export function retryRun(prefs: Prefs, wrong: string[], rnd: Rnd, now: number): Run | null {
  if (!wrong.length) return null;
  const queue = shuffled(wrong, rnd);
  return { prefs: { ...prefs, amount: "all", scope: "all" }, queue, done: 0, total: queue.length, endless: false, first: {}, retries: {}, startedAt: now, activeMs: 0, reported: 0 };
}

export const currentIso = (run: Run): string | null => run.queue[0] ?? null;
export const isFinished = (run: Run): boolean => !run.endless && run.queue.length === 0;
export const progressOf = (run: Run): number => (run.endless ? 0 : run.queue.length === 0 ? 1 : run.done / (run.done + run.queue.length));

/** Antwort verbuchen: falsche Flaggen kommen 1–2 Mal später noch einmal (frühestens nach drei anderen), nie direkt hintereinander. */
export function answerRun(run: Run, iso: string, correct: boolean, rnd: Rnd, stats: Stats = new Map()): Run {
  const queue = [...run.queue];
  const at = queue.indexOf(iso);
  if (at >= 0) queue.splice(at, 1);
  const first = iso in run.first ? run.first : { ...run.first, [iso]: correct };
  const retries = { ...run.retries };
  if (!correct && (retries[iso] ?? 0) < MAX_RETRIES && queue.length > 0) {
    let idx = Math.min(queue.length, 3 + Math.floor(rnd() * 4));
    while (idx < queue.length && (queue[idx] === iso || queue[idx - 1] === iso)) idx++;
    if (!(idx >= queue.length && queue[idx - 1] === iso)) {
      queue.splice(idx, 0, iso);
      retries[iso] = (retries[iso] ?? 0) + 1;
    }
  }
  if (run.endless && queue.length < 3) {
    const tail = queue[queue.length - 1] ?? iso;
    const inQueue = new Set(queue);
    const batch = shuffled(poolFor(run.prefs, stats).map((f) => f.iso).filter((x) => x !== iso && !inQueue.has(x)), rnd).slice(0, ENDLESS_BATCH);
    if (batch[0] === tail && batch.length > 1) [batch[0], batch[1]] = [batch[1], batch[0]];
    if (batch.length && batch[0] !== tail) queue.push(...batch);
    else if (!queue.length) { const any = shuffled(poolFor(run.prefs, stats).map((f) => f.iso).filter((x) => x !== iso), rnd); queue.push(...any.slice(0, ENDLESS_BATCH)); }
  }
  return { ...run, queue, done: run.done + 1, first, retries, last: iso };
}

export function summaryOf(run: Run): { total: number; right: number; wrong: string[]; percent: number } {
  const entries = Object.entries(run.first);
  const right = entries.filter(([, ok]) => ok).length;
  return { total: entries.length, right, wrong: entries.filter(([, ok]) => !ok).map(([iso]) => iso), percent: entries.length ? Math.round((100 * right) / entries.length) : 0 };
}

const DIRECTIONS = ["flag", "country", "mixed"], SCOPES = ["all", "continent", "difficult", "new", "similar"], AMOUNTS = [10, 25, 50, "all", "endless"];

export function parsePrefs(raw: unknown): Prefs {
  const p = (raw && typeof raw === "object" ? raw : {}) as Partial<Prefs>;
  return {
    direction: DIRECTIONS.includes(p.direction as string) ? (p.direction as Direction) : DEFAULT_PREFS.direction,
    amount: AMOUNTS.includes(p.amount as never) ? (p.amount as Amount) : DEFAULT_PREFS.amount,
    scope: SCOPES.includes(p.scope as string) ? (p.scope as Scope) : DEFAULT_PREFS.scope,
    continent: FLAGS.some((f) => f.continent === p.continent) ? (p.continent as Continent) : DEFAULT_PREFS.continent,
    territories: p.territories === true,
  };
}

/** Gespeicherten Zwischenstand lesen; Unsinn ergibt null (dann beginnt ein neuer Durchgang). */
export function parseRun(text: string): Run | null {
  try {
    const r = JSON.parse(text) as Partial<Run>;
    if (!r || typeof r !== "object" || !Array.isArray(r.queue) || !r.prefs || typeof r.prefs !== "object") return null;
    if (!r.queue.every((i) => typeof i === "string" && BY_ISO.has(i))) return null;
    const num = (v: unknown, d = 0) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : d);
    const first: Record<string, boolean> = {}, retries: Record<string, number> = {};
    for (const [k, v] of Object.entries(r.first ?? {})) if (BY_ISO.has(k) && typeof v === "boolean") first[k] = v;
    for (const [k, v] of Object.entries(r.retries ?? {})) if (BY_ISO.has(k) && typeof v === "number") retries[k] = Math.min(MAX_RETRIES, Math.max(0, v));
    const prefs = parsePrefs(r.prefs);
    return {
      prefs, queue: r.queue, done: num(r.done), total: num(r.total, r.queue.length), endless: prefs.amount === "endless" && r.endless === true, first, retries,
      ...(typeof r.last === "string" && BY_ISO.has(r.last) ? { last: r.last } : {}), startedAt: num(r.startedAt), activeMs: num(r.activeMs), reported: num(r.reported),
    };
  } catch {
    return null;
  }
}
