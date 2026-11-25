// Zeiten wie bei Speedcubern: Bestzeit, Durchschnitt der letzten 5 (Ao5) und 12 (Ao12; beste und schlechteste Zeit fallen weg).

/** Zeit als „23,41“ bzw. „1:05,23“ (Hundertstel; immer abgerundet, wie auf einer Stoppuhr) */
export function formatTime(ms: number): string {
  const cs = Math.floor(Math.max(0, ms) / 10);
  const total = Math.floor(cs / 100), hundredths = String(cs % 100).padStart(2, "0");
  const min = Math.floor(total / 60), sec = total % 60;
  return min ? `${min}:${String(sec).padStart(2, "0")},${hundredths}` : `${sec},${hundredths}`;
}

export const bestOf = (times: number[]): number | null => (times.length ? Math.min(...times) : null);

/** Durchschnitt der letzten `n` Zeiten (neueste zuerst). Ab 5 fallen die beste und die schlechteste Zeit weg. Zu wenige Zeiten: null. */
export function averageOf(newestFirst: number[], n: number): number | null {
  if (newestFirst.length < n) return null;
  const last = newestFirst.slice(0, n);
  const used = n >= 5 ? [...last].sort((a, b) => a - b).slice(1, -1) : last;
  return used.reduce((a, b) => a + b, 0) / used.length;
}

export interface CubeStats { count: number; best: number | null; ao5: number | null; ao12: number | null; mean: number | null }

export function statsOf(newestFirst: number[]): CubeStats {
  return {
    count: newestFirst.length,
    best: bestOf(newestFirst),
    ao5: averageOf(newestFirst, 5),
    ao12: averageOf(newestFirst, 12),
    mean: newestFirst.length ? newestFirst.reduce((a, b) => a + b, 0) / newestFirst.length : null,
  };
}
