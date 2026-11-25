import { describe, expect, it } from "vitest";
import { applyMoves, invertMove, isSolved, scramble, solvedCube } from "../src/trainer/cube/engine";
import { arrowOf, hintFor, isPhaseBoundary, makeSession, phaseIndexAt, solutionSession } from "../src/trainer/cube/session";

const cube = (seed: number) => { let s = seed; return applyMoves(solvedCube(), scramble(25, () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; })); };

describe("Wiedergabe-Sitzung", () => {
  it("Zustände stimmen: states[i] = Start nach i Zügen, am Ende gelöst", () => {
    const r = solutionSession(cube(1));
    if (!r.ok) throw new Error(r.reason);
    const s = r.session;
    expect(s.states.length).toBe(s.moves.length + 1);
    expect(Array.from(s.states[0])).toEqual(Array.from(s.start));
    expect(isSolved(s.states[s.moves.length])).toBe(true);
    for (let i = 0; i < s.moves.length; i += 7) expect(Array.from(s.states[i])).toEqual(Array.from(applyMoves(s.start, s.moves.slice(0, i))));
  });
  it("Phasen: sieben, Beginn aufsteigend, Phasenindex am Rand", () => {
    const r = solutionSession(cube(2));
    if (!r.ok) throw new Error(r.reason);
    const s = r.session;
    expect(s.phases.length).toBeGreaterThan(3);
    expect(s.phases[0].from).toBe(0);
    for (let i = 1; i < s.phases.length; i++) expect(s.phases[i].from).toBeGreaterThan(s.phases[i - 1].from);
    s.phases.forEach((p, k) => { expect(phaseIndexAt(s, p.from)).toBe(k); if (p.from > 0) expect(phaseIndexAt(s, p.from - 1)).toBe(k - 1); expect(isPhaseBoundary(s, p.from)).toBe(p.from > 0); });
    expect(phaseIndexAt(s, s.moves.length)).toBe(s.phases.length - 1);
  });
  it("Weiter und Zurück: Zug und Umkehrzug heben sich auf", () => {
    const r = solutionSession(cube(3));
    if (!r.ok) throw new Error(r.reason);
    const s = r.session;
    for (let i = 0; i < s.moves.length; i += 5) expect(Array.from(applyMoves(s.states[i + 1], [invertMove(s.moves[i])]))).toEqual(Array.from(s.states[i]));
  });
  it("Algorithmus-Sitzung ohne Phasen", () => {
    const s = makeSession("algo", "Test", solvedCube(), ["R", "U", "R'", "U'"]);
    expect(s.phases).toEqual([]);
    expect(phaseIndexAt(s, 2)).toBe(0);
    expect(s.states.length).toBe(5);
  });
  it("Pfeilrichtung", () => {
    expect(arrowOf("R")).toEqual({ face: "R", dir: 1, double: false });
    expect(arrowOf("U'")).toEqual({ face: "U", dir: -1, double: false });
    expect(arrowOf("F2")).toEqual({ face: "F", dir: 1, double: true });
  });
  it("Tipp: nächster Zug passt zur Lösung; gelöster Würfel hat keinen", () => {
    expect(hintFor(solvedCube())).toBeNull();
    const c = cube(9);
    const r = solutionSession(c);
    if (!r.ok) throw new Error(r.reason);
    expect(hintFor(c)).toBe(r.session.moves[0]);
  });
  it("gelöster Würfel: leere Lösung", () => {
    const r = solutionSession(solvedCube());
    expect(r.ok && r.session.moves.length === 0).toBe(true);
  });
});
