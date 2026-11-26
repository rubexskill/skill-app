import { afterEach, describe, expect, it } from "vitest";
import { motionMs, prefersReducedMotion } from "../src/motion";

afterEach(() => { delete (globalThis as unknown as { matchMedia?: unknown }).matchMedia; });
const media = (reduce: boolean) => ((globalThis as unknown as { window: Record<string, unknown> }).window.matchMedia = (globalThis as unknown as { matchMedia: unknown }).matchMedia = () => ({ matches: reduce }));

describe("Bewegung reduzieren", () => {
  it("Einstellung wird erkannt, fehlende Unterstützung zählt als normal", () => {
    expect(prefersReducedMotion()).toBe(false);
    media(true);
    expect(prefersReducedMotion()).toBe(true);
    media(false);
    expect(prefersReducedMotion()).toBe(false);
  });
  it("Animationsdauer wird gekürzt, sonst unverändert", () => {
    expect(motionMs(380, false)).toBe(380);
    expect(motionMs(380, true)).toBe(90);
    expect(motionMs(60, true)).toBe(60);
  });
});
