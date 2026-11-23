import { describe, expect, it } from "vitest";
import { DOSSIERS } from "../src/library/dossiers";
import { META_ROWS } from "../src/library";

describe("Wissens-Dossiers", () => {
  const titles = new Set(META_ROWS.map((r) => r[1]));
  for (const [title, d] of Object.entries(DOSSIERS)) {
    it(`${title}: vollständig, Quellenhinweise stimmen`, () => {
      expect(titles.has(title)).toBe(true);
      expect(d.date).toMatch(/\d{4}$/);
      expect(d.sources.length).toBeGreaterThanOrEqual(1);
      expect(d.videos.length).toBeLessThanOrEqual(3);
      if (d.videos.length < 3) expect(d.videoNote).toBeTruthy();
      expect(new Set(d.videos.map((v) => v.id)).size).toBe(d.videos.length);
      for (const s of d.sources) expect(s.url).toMatch(/^https:\/\//);
      const all = JSON.stringify([d.learn, d.evidence, d.plan, d.myths, d.safety, d.conflicts, d.trainer]);
      const refs = [...all.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1]));
      expect(refs.length).toBeGreaterThan(0);
      for (const n of refs) expect(n).toBeGreaterThanOrEqual(1), expect(n).toBeLessThanOrEqual(d.sources.length);
      expect(d.steps.length).toBeGreaterThan(2);
      expect(d.myths.length).toBeGreaterThanOrEqual(2);
    });
  }
});
