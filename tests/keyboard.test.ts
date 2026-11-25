import { describe, expect, it } from "vitest";
import { kbHeight, scrollDelta } from "../src/keyboard";

describe("Tastatur", () => {
  it("Höhe aus dem sichtbaren Bereich", () => {
    expect(kbHeight(844, { height: 844, offsetTop: 0 })).toBe(0);
    expect(kbHeight(844, { height: 508, offsetTop: 0 })).toBe(336);
    expect(kbHeight(844, { height: 508, offsetTop: 40 })).toBe(296); // Seite wurde um 40 px hochgeschoben
    expect(kbHeight(844, null)).toBe(0);
    expect(kbHeight(600, { height: 900, offsetTop: 0 })).toBe(0);
  });
  it("Feld unter der Tastatur wird hochgeschoben, Feld über der Kopfzeile heruntergeholt, sichtbares bleibt", () => {
    expect(scrollDelta({ top: 600, bottom: 650 }, 844, 336)).toBe(650 - (844 - 336 - 16));
    expect(scrollDelta({ top: 200, bottom: 250 }, 844, 336)).toBe(0);
    expect(scrollDelta({ top: 20, bottom: 70 }, 844, 0)).toBe(-44);
    expect(scrollDelta({ top: 700, bottom: 750 }, 844, 0)).toBe(0);
  });
});
