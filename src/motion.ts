// „Bewegung reduzieren“ (iOS-Einstellung): keine Trägheit, keine langen Dreh-Animationen.
export const prefersReducedMotion = (): boolean => {
  try { return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
};
/** Animationsdauer: bei reduzierter Bewegung höchstens `cap` ms */
export const motionMs = (ms: number, reduced = prefersReducedMotion(), cap = 90): number => (reduced ? Math.min(ms, cap) : ms);
