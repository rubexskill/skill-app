import { describe, expect, it } from "vitest";
import {
  FACES, MOVES_18, STICKERS, applyMove, applyMoves, cubeFromString, cubeToString, formatMoves, invertMove, invertMoves, isSolved, layerMove, normalizeMove, parseMove, parseMoves,
  permutationOf, quarterTurns, sameCube, scramble, solvedCube,
} from "../src/trainer/cube/engine";

const rng = (seed: number) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const solved = solvedCube();
const run = (text: string) => applyMoves(solved, parseMoves(text));
const repeat = (text: string, n: number) => Array(n).fill(text).join(" ");

describe("Würfel: Aufbau", () => {
  it("54 verschiedene Aufkleber, gelöst hat jede Farbe neunmal", () => {
    expect(STICKERS.length).toBe(54);
    expect(new Set(STICKERS.map((s) => `${s.pos}|${s.normal}`)).size).toBe(54);
    for (let c = 0; c < 6; c++) expect(solved.filter((v) => v === c).length).toBe(9);
    expect(isSolved(solved)).toBe(true);
    expect(FACES.length).toBe(6);
  });
  it("Zustand lässt sich als Text speichern und lesen", () => {
    const c = run("R U R' U' F2");
    expect(sameCube(cubeFromString(cubeToString(c))!, c)).toBe(true);
    expect(cubeFromString("abc")).toBeNull();
    expect(cubeFromString("9".repeat(54))).toBeNull();
  });
});

describe("Würfel: Züge", () => {
  it("jeder der 18 Züge: viermal = Ausgangszustand, Zug und Umkehrzug = gelöst, Zug verändert den Würfel", () => {
    expect(MOVES_18.length).toBe(18);
    for (const m of MOVES_18) {
      expect(isSolved(applyMove(solved, m)), `${m} verändert nichts`).toBe(false);
      expect(sameCube(applyMoves(solved, [m, m, m, m]), solved), `${m}⁴`).toBe(true);
      expect(sameCube(applyMoves(solved, [m, invertMove(m)]), solved), `${m} ${invertMove(m)}`).toBe(true);
    }
  });
  it("auch auf einem gemischten Würfel: viermal = unverändert", () => {
    const base = applyMoves(solved, scramble(25, rng(3)));
    for (const m of [...MOVES_18, "M", "E", "S", "x", "y", "z"]) expect(sameCube(applyMoves(base, [m, m, m, m]), base), m).toBe(true);
  });
  it("Zugrichtung stimmt: U im Uhrzeigersinn bringt Vorne nach Links, R bringt Vorne nach Oben", () => {
    const u = applyMove(solved, "U"); // oberste Reihe der Vorderseite (F, Index 18..20 = x -1..1 bei y=1) bekommt die Farbe der rechten Seite
    const idx = (face: number, x: number, y: number, z: number) => STICKERS.findIndex((s, i) => Math.floor(i / 9) === face && s.pos[0] === x && s.pos[1] === y && s.pos[2] === z);
    expect(u[idx(2, 0, 1, 1)]).toBe(1); // Vorne oben-Mitte zeigt jetzt Rot (R): Rechts → Vorne
    const r = applyMove(solved, "R");
    expect(r[idx(0, 1, 1, 0)]).toBe(2); // Oben rechts-Mitte zeigt jetzt Grün: Vorne → Oben
    const f = applyMove(solved, "F");
    expect(f[idx(1, 1, 0, 1)]).toBe(0); // Rechts vorn-Mitte zeigt jetzt Weiß: Oben → Rechts
  });
  it("Ein Zug berührt genau die richtigen Aufkleber: Fläche 20, Mittelschicht 12, ganzer Würfel 52", () => {
    const moved = (m: string) => [...permutationOf(m)].filter((v, i) => v !== i).length;
    for (const m of ["U", "D", "L", "R", "F", "B"]) expect(moved(m), m).toBe(20);
    for (const m of ["M", "E", "S"]) expect(moved(m), m).toBe(12);
    for (const m of ["x", "y", "z"]) expect(moved(m), m).toBe(52);
  });
  it("Mittelschichten und Würfeldrehungen passen zusammen: x = R M' L', y = U E' D', z = F S B'", () => {
    expect(sameCube(run("x"), run("R M' L'"))).toBe(true);
    expect(sameCube(run("y"), run("U E' D'"))).toBe(true);
    expect(sameCube(run("z"), run("F S B'"))).toBe(true);
  });
  it("gegenüberliegende Flächen vertauschen, benachbarte nicht", () => {
    expect(sameCube(run("R L"), run("L R"))).toBe(true);
    expect(sameCube(run("U D'"), run("D' U"))).toBe(true);
    expect(sameCube(run("R U"), run("U R"))).toBe(false);
  });
  it("bekannte Algorithmen: (R U R' U') ×6, Sune ×6, (R U) ×105, Superflip-Paar ×2 = gelöst", () => {
    expect(isSolved(run(repeat("R U R' U'", 6)))).toBe(true);
    expect(isSolved(run(repeat("R U R' U'", 5)))).toBe(false);
    expect(isSolved(run(repeat("R U R' U R U2 R'", 6)))).toBe(true);
    expect(isSolved(run(repeat("R U", 105)))).toBe(true);
    expect(isSolved(run(repeat("R U", 35)))).toBe(false);
    expect(isSolved(run(repeat("R2 L2 U2 D2 F2 B2", 2)))).toBe(true);
    expect(isSolved(run(repeat("F R U R' U' F'", 6)))).toBe(true);
  });
  it("Zug verändert den übergebenen Zustand nicht", () => {
    const c = run("R U");
    const before = cubeToString(c);
    applyMove(c, "F");
    expect(cubeToString(c)).toBe(before);
  });
});

describe("Würfel: Gelöst-Erkennung", () => {
  it("auch bei gedrehter Ausrichtung des ganzen Würfels", () => {
    for (const rot of ["x", "y", "z", "x y", "z' x2", "y2 z x'", "x y z x y z"]) expect(isSolved(run(rot)), rot).toBe(true);
    expect(isSolved(run("M"))).toBe(false); // eine Mittelschicht gedreht ist nicht gelöst
    expect(isSolved(run("M2 E2"))).toBe(false);
    expect(isSolved(run("R U R' U'"))).toBe(false);
  });
  it("gemischt + Umkehrung ist gelöst, auch wenn danach der ganze Würfel gedreht wird", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const s = scramble(25, rng(seed));
      const there = applyMoves(solved, s);
      expect(isSolved(there)).toBe(false);
      expect(isSolved(applyMoves(there, invertMoves(s)))).toBe(true);
      expect(isSolved(applyMoves(applyMoves(there, invertMoves(s)), ["x", "y'", "z2"]))).toBe(true);
    }
  });
});

describe("Notation", () => {
  it("liest Leerzeichen, Zeilenumbrüche, Kommas, Klammern und typografische Striche", () => {
    expect(parseMoves("R U R' U'")).toEqual(["R", "U", "R'", "U'"]);
    expect(parseMoves("  R   U\n\tR’  U' ")).toEqual(["R", "U", "R'", "U'"]);
    expect(parseMoves("(R U R' U'), (R U R' U')")).toEqual(["R", "U", "R'", "U'", "R", "U", "R'", "U'"]);
    expect(parseMoves("RUR'U'")).toEqual(["R", "U", "R'", "U'"]);
    expect(parseMoves("R2' U2 F2'")).toEqual(["R2", "U2", "F2"]);
    expect(parseMoves("M E' S2 x y' z2")).toEqual(["M", "E'", "S2", "x", "y'", "z2"]);
    expect(parseMoves("")).toEqual([]);
    expect(parseMoves("   \n ")).toEqual([]);
  });
  it("weist Unsinn ab", () => {
    for (const bad of ["Q", "R3", "R''", "r", "R U X", "2R", "R-", "U 3", "R'2"]) expect(() => parseMoves(bad), bad).toThrow(/Unbekannter Zug/);
    expect(() => parseMove("")).toThrow();
  });
  it("Ausgabe und Normalisieren", () => {
    expect(formatMoves(["R", "U'", "F2"])).toBe("R U' F2");
    expect(normalizeMove("R2'")).toBe("R2");
    expect(parseMove("U'")).toEqual({ letter: "U", turns: 3 });
  });
  it("Zugfolge umkehren: rückwärts, jeder Zug gedreht", () => {
    expect(invertMoves(["R", "U'", "F2", "B"])).toEqual(["B'", "F2", "U", "R'"]);
    expect(invertMoves([])).toEqual([]);
    expect(invertMove("R2")).toBe("R2");
    expect(invertMoves(invertMoves(["R", "U", "L'"]))).toEqual(["R", "U", "L'"]);
  });
  it("Schicht und Drehsinn → Zug (für das Ziehen am Würfel)", () => {
    for (const m of [...MOVES_18, "M", "E", "S", "M'", "E'", "S'", "M2", "E2", "S2"]) {
      const { spec, q } = quarterTurns(m);
      expect(layerMove(spec.axis, spec.layer as -1 | 0 | 1, q), m).toBe(normalizeMove(m));
    }
    expect(() => layerMove(0, 1, 4)).toThrow();
  });
});

describe("Mischung", () => {
  it("25 Züge, nie dieselbe Fläche hintereinander, nie dreimal dieselbe Achse („R L R“)", () => {
    const axis = (m: string) => ({ U: 1, D: 1, L: 0, R: 0, F: 2, B: 2 } as Record<string, number>)[m[0]];
    for (let seed = 1; seed <= 400; seed++) {
      const s = scramble(25, rng(seed));
      expect(s.length).toBe(25);
      for (const m of s) expect(MOVES_18).toContain(m);
      for (let i = 1; i < s.length; i++) expect(s[i][0], `Seed ${seed} Zug ${i}`).not.toBe(s[i - 1][0]);
      for (let i = 2; i < s.length; i++) expect(axis(s[i]) === axis(s[i - 1]) && axis(s[i - 1]) === axis(s[i - 2]), `Seed ${seed} Zug ${i}`).toBe(false);
    }
  });
  it("alle Flächen und Drehungen kommen vor, andere Längen gehen", () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 60; seed++) scramble(25, rng(seed)).forEach((m) => seen.add(m));
    expect(seen.size).toBe(18);
    expect(scramble(5, rng(1)).length).toBe(5);
    expect(scramble(0).length).toBe(0);
  });
  it("Mischung + Umkehrung = gelöst; die Mischung löst sich nicht von selbst", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const s = scramble(25, rng(seed));
      expect(isSolved(applyMoves(applyMoves(solved, s), invertMoves(s)))).toBe(true);
    }
  });
});
