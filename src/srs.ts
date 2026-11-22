/** Wiederholungsplan für Karteikarten (vereinfacht nach SM-2). Keine Datenbank-Abhängigkeit. */

export type Grade = 0 | 1 | 2 | 3; // Nochmal · Schwer · Gut · Leicht

export const GRADE_LABEL: Record<Grade, string> = { 0: "Nochmal", 1: "Schwer", 2: "Gut", 3: "Leicht" };

export interface CardState {
  interval: number;
  ease: number;
  reps: number;
  lapses: number;
}

const DAY = 86400000;
const AGAIN_MS = 10 * 60000;

export function schedule(c: CardState, g: Grade, now = Date.now()): CardState & { due: number } {
  let { interval, ease, reps, lapses } = c;
  if (g === 0) {
    return { interval: 0, ease: Math.max(1.3, ease - 0.2), reps: 0, lapses: lapses + 1, due: now + AGAIN_MS };
  }
  if (g === 1) {
    ease = Math.max(1.3, ease - 0.15);
    interval = reps === 0 ? 1 : Math.max(1, Math.round(interval * 1.2));
  } else if (g === 2) {
    interval = reps === 0 ? 1 : reps === 1 ? 3 : Math.max(interval + 1, Math.round(interval * ease));
  } else {
    ease = ease + 0.15;
    interval = reps === 0 ? 3 : reps === 1 ? 6 : Math.max(interval + 2, Math.round(interval * ease * 1.3));
  }
  return { interval, ease, reps: reps + 1, lapses, due: now + interval * DAY };
}

/** Kurzform für Knöpfe: „10 min“, „1 T“, „3 Wo.“, „2 Mon.“ */
export function intervalLabel(c: CardState, g: Grade): string {
  if (g === 0) return "10 min";
  const d = schedule(c, g, 0).interval;
  if (d < 14) return `${d} T`;
  if (d < 60) return `${Math.round(d / 7)} Wo.`;
  return `${Math.round(d / 30)} Mon.`;
}

export function newCardState(): CardState & { due: number } {
  return { interval: 0, ease: 2.5, reps: 0, lapses: 0, due: Date.now() };
}

export function endOfToday(now = Date.now()): number {
  const d = new Date(now);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() - 1;
}
