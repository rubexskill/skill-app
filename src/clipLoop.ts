/** Schleifen-Logik des Clip-Players, rein berechnet (gut testbar). */

export type LoopAction = "lap" | "stop" | "none";

/**
 * Was soll bei Zeit `t` passieren? `end` ist das gesetzte Ende des Ausschnitts (0 = ganzer Clip).
 * Am Ende des Ausschnitts: bei Schleife von vorn (lap), sonst anhalten (stop).
 */
export function loopAction(t: number, end: number, duration: number, loop: boolean): LoopAction {
  const partial = end > 0 && duration > 0 && end < duration - 0.05;
  if (partial && t >= end - 0.04) return loop ? "lap" : "stop";
  return "none";
}

/** Der Clip ist zu Ende gelaufen (ended): bei Schleife von vorn. */
export const onEnded = (loop: boolean): LoopAction => (loop ? "lap" : "none");

export const fmtTime = (s: number): string => {
  const v = Math.max(0, Number.isFinite(s) ? s : 0);
  return `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, "0")}`;
};

/** Start und Ende so setzen, dass mindestens `gap` Sekunden dazwischen liegen und alles im Clip bleibt. */
export function clampRange(start: number, end: number, duration: number, moved: "start" | "end", gap = 0.3): [number, number] {
  let a = Math.max(0, Math.min(start, duration));
  let b = Math.max(0, Math.min(end, duration));
  if (moved === "start") a = Math.min(a, Math.max(0, b - gap));
  else b = Math.max(b, Math.min(duration, a + gap));
  return [a, b];
}
