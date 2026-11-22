import { describe, expect, it } from "vitest";
import { centuryAnchor, doomsdaySteps, monthAnchor, weekdayOf, yearDoomsday } from "../src/trainer/doomsday";
import { KOCH_ORDER, MORSE, farnsworthUnit, groupCredit, kochGroups, morseEvents, morseOf, unitSec } from "../src/trainer/morse";
import { endOfToday, intervalLabel, newCardState, schedule } from "../src/srs";

describe("Doomsday", () => {
  it("Jahrhundert-Anker: 1800 Fr, 1900 Mi, 2000 Di, 2100 So", () => {
    expect([1800, 1900, 2000, 2100, 1700].map(centuryAnchor)).toEqual([5, 3, 2, 0, 0]);
  });
  it("bekannte Doomsdays", () => {
    expect(yearDoomsday(2000)).toBe(2); // Dienstag
    expect(yearDoomsday(2024)).toBe(4); // Donnerstag
    expect(yearDoomsday(1969)).toBe(5); // Freitag
  });
  it("Merktage im Schaltjahr", () => {
    expect(monthAnchor(0, 2024)).toBe(4);
    expect(monthAnchor(0, 2023)).toBe(3);
    expect(monthAnchor(1, 2024)).toBe(29);
    expect(monthAnchor(1, 1900)).toBe(28); // 1900 war kein Schaltjahr
  });
  it("stimmt für jeden Monat von 1700 bis 2400 mit Date überein", () => {
    let n = 0;
    for (let y = 1700; y <= 2400; y += 1) {
      for (let m = 0; m < 12; m++) {
        const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
        for (const d of [1, 7, 14, 15, 28, last]) {
          expect(weekdayOf(y, m, d)).toBe(new Date(Date.UTC(y, m, d)).getUTCDay());
          n++;
        }
      }
    }
    expect(n).toBeGreaterThan(40000);
  });
  it("Erklärung nennt das richtige Ergebnis (20.7.1969 war ein Sonntag)", () => {
    const steps = doomsdaySteps(1969, 6, 20);
    expect(steps).toHaveLength(5);
    expect(steps[4]).toContain("Sonntag");
  });
});

describe("Morse", () => {
  it("Tabelle ist eindeutig und enthält A-Z, 0-9", () => {
    const codes = Object.values(MORSE);
    expect(new Set(codes).size).toBe(codes.length);
    expect(MORSE.A).toBe(".-");
    expect(MORSE.S).toBe("...");
    expect(MORSE["0"]).toBe("-----");
    for (const c of "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") expect(MORSE[c]).toBeTruthy();
    expect(morseOf("SOS")).toBe("... --- ...");
  });
  it("Koch-Reihenfolge: jedes Zeichen genau einmal, beginnt mit K M", () => {
    expect(new Set(KOCH_ORDER).size).toBe(KOCH_ORDER.length);
    expect(KOCH_ORDER.slice(0, 2)).toEqual(["K", "M"]);
    for (const c of KOCH_ORDER) expect(MORSE[c]).toBeTruthy();
    for (const c of "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") expect(KOCH_ORDER).toContain(c);
  });
  it("PARIS dauert bei vollem Tempo 50 Einheiten", () => {
    const { beeps } = morseEvents("PARIS PARIS", 20, 20);
    const u = unitSec(20);
    expect(beeps[beeps.length / 2].start / u).toBeCloseTo(50, 5);
    expect(50 * u).toBeCloseTo(60 / 20, 5);
  });
  it("Farnsworth: Zeichen im Zeichentempo, Gesamttempo wie gewünscht", () => {
    const { beeps } = morseEvents("PARIS PARIS", 20, 10);
    expect(beeps[0].dur).toBeCloseTo(unitSec(20), 6);
    expect(beeps[beeps.length / 2].start).toBeCloseTo(60 / 10, 5);
    expect(farnsworthUnit(20, 20)).toBeCloseTo(unitSec(20), 9);
    expect(farnsworthUnit(20, 25)).toBeCloseTo(unitSec(20), 9);
  });
  it("Koch-Gruppen nutzen nur freigeschaltete Zeichen", () => {
    const groups = kochGroups(4, 20, 5);
    const allowed = new Set(KOCH_ORDER.slice(0, 4));
    expect(groups).toHaveLength(20);
    for (const g of groups) {
      expect(g).toHaveLength(5);
      for (const c of g) expect(allowed.has(c)).toBe(true);
    }
    expect(groups.some((g) => g.includes(KOCH_ORDER[3]))).toBe(true);
  });
  it("Teilpunkte pro Gruppe", () => {
    expect(groupCredit("KMKMK", "kmkmk")).toBe(1);
    expect(groupCredit("KMKMK", "KMKMM")).toBeCloseTo(0.8);
    expect(groupCredit("KMKMK", "")).toBe(0);
    expect(groupCredit("KMKMK", "K M K M K")).toBe(1);
  });
});

describe("Wiederholungsplan", () => {
  const card = () => ({ ...newCardState() });
  it("Gut: 1, 3, dann wachsend", () => {
    let c = card();
    const days: number[] = [];
    for (let i = 0; i < 5; i++) {
      const s = schedule(c, 2, 0);
      days.push(s.interval);
      c = { ...c, ...s };
    }
    expect(days.slice(0, 2)).toEqual([1, 3]);
    for (let i = 1; i < days.length; i++) expect(days[i]).toBeGreaterThan(days[i - 1]);
  });
  it("Nochmal: 10 Minuten, zählt als Fehler, Faktor nie unter 1,3", () => {
    let c = card();
    for (let i = 0; i < 12; i++) c = { ...c, ...schedule(c, 0, 1000) };
    expect(c.ease).toBe(1.3);
    expect(c.lapses).toBe(12);
    expect(schedule(card(), 0, 0).due).toBe(10 * 60000);
    expect(intervalLabel(card(), 0)).toBe("10 min");
  });
  it("Leicht springt weiter als Gut, Schwer nicht weiter", () => {
    const base = { ...card(), ...schedule(card(), 2, 0) };
    const [h, g, e] = [1, 2, 3].map((x) => schedule(base, x as 1 | 2 | 3, 0).interval);
    expect(h).toBeLessThanOrEqual(g);
    expect(e).toBeGreaterThan(g);
  });
  it("Ende des Tages", () => {
    const t = new Date(2025, 2, 30, 10).getTime();
    const end = new Date(endOfToday(t));
    expect([end.getDate(), end.getHours(), end.getMinutes()]).toEqual([30, 23, 59]);
  });
});
