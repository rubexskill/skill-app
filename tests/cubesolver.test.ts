import { describe, expect, it } from "vitest";
import {
  FACES, STICKERS, applyMove, applyMoves, cloneCube, isSolved, parseMoves, scramble, solvedCube, stickerIndex, type Cube, type Vec,
} from "../src/trainer/cube/engine";
import { PHASE_TITLES, simplify, solve } from "../src/trainer/cube/solver";

/** deterministischer Zufall */
function rng(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

const centerColor = (c: Cube, n: Vec) => c[stickerIndex(n, n)];
const NORMALS: Vec[] = [[0, 1, 0], [1, 0, 0], [0, 0, 1], [0, -1, 0], [-1, 0, 0], [0, 0, -1]];
const kind = (pos: Vec) => pos.filter((v) => v !== 0).length; // 1 Mitte, 2 Kante, 3 Ecke

/** Unabhängige Prüfung der Teilziele am echten Würfel: Weiß-Mitte bestimmt unten, gegenüber liegt Gelb */
function goalsReached(c: Cube) {
  const white = NORMALS.find((n) => centerColor(c, n) === 0)!;
  const yellow = white.map((v) => -v) as Vec;
  const axis = white.findIndex((v) => v !== 0);
  const inFirstLayers = (pos: Vec) => pos[axis] !== yellow[axis];
  const stickerOk = (i: number) => c[i] === centerColor(c, STICKERS[i].normal);
  const piecesOk = (filter: (pos: Vec) => boolean) => STICKERS.every((s, i) => !filter(s.pos) || stickerOk(i));
  const edgesOnWhite = (pos: Vec) => kind(pos) === 2 && pos[axis] === white[axis];
  const cornersOnWhite = (pos: Vec) => kind(pos) === 3 && pos[axis] === white[axis];
  const yellowEdges = (pos: Vec) => kind(pos) === 2 && pos[axis] === yellow[axis];
  const key = (xs: number[]) => [...xs].sort().join(",");
  const cornerPlaced = (pos: Vec) => {
    const here = STICKERS.map((s, i) => ({ s, i })).filter(({ s }) => s.pos.every((v, a) => v === pos[a]));
    const wanted = here.map(({ s }) => centerColor(c, s.normal));
    return key(here.map(({ i }) => c[i])) === key(wanted);
  };
  const lastCorners: Vec[] = [];
  for (let x = -1; x <= 1; x += 2) for (let y = -1; y <= 1; y += 2) for (let z = -1; z <= 1; z += 2) { const p: Vec = [x, y, z]; if (p[axis] === yellow[axis]) lastCorners.push(p); }
  return [
    piecesOk(edgesOnWhite) && STICKERS.every((s, i) => !(kind(s.pos) === 2 && s.pos[axis] === white[axis]) || stickerOk(i)),                     // 1 Kreuz
    piecesOk((p) => edgesOnWhite(p) || cornersOnWhite(p)),                                                                                          // 2 weiße Ecken
    piecesOk(inFirstLayers),                                                                                                                        // 3 zwei Schichten
    piecesOk(inFirstLayers) && STICKERS.every((s, i) => !(yellowEdges(s.pos) && s.normal.every((v, a) => v === yellow[a])) || stickerOk(i)), // 4 gelbes Kreuz
    piecesOk((p) => inFirstLayers(p) || yellowEdges(p)),                                                                                            // 5 Kanten ausgerichtet
    piecesOk((p) => inFirstLayers(p) || yellowEdges(p)) && lastCorners.every(cornerPlaced),                                                         // 6 Ecken am Platz
    isSolved(c),                                                                                                                                    // 7 gelöst
  ];
}

const scrambled = (seed: number, len = 25) => applyMoves(solvedCube(), scramble(len, rng(seed)));

describe("Löser", () => {
  it("löst 2000 Zufallsmischungen korrekt (Zug für Zug nachgespielt)", () => {
    let maxMs = 0;
    for (let i = 0; i < 2000; i++) {
      const cube = scrambled(i + 1, 20 + (i % 15));
      const r = solve(cube);
      if (!r.ok) throw new Error(`Mischung ${i + 1}: ${r.reason}`);
      expect(isSolved(applyMoves(cube, r.moves))).toBe(true);
      expect(r.phases.map((p) => p.title)).toEqual(PHASE_TITLES.map((p) => p.title));
      expect(r.moves.length).toBeLessThan(260);
      maxMs = Math.max(maxMs, r.ms);
    }
    expect(maxMs).toBeLessThan(1000);
  }, 120000);

  it("jede Phase erreicht ihr Teilziel (Kreuz, Ecken, zwei Schichten, gelbes Kreuz, Kanten, Eckenplätze, gelöst)", () => {
    for (let i = 0; i < 150; i++) {
      const cube = scrambled(5000 + i);
      const r = solve(cube);
      if (!r.ok) throw new Error(r.reason);
      let c = cube;
      r.phases.forEach((p, k) => {
        c = applyMoves(c, p.moves);
        const goals = goalsReached(c);
        for (let g = 0; g <= k; g++) expect(goals[g], `Mischung ${i}: nach Phase ${k + 1} ist Teilziel ${g + 1} nicht erreicht`).toBe(true);
      });
    }
  });

  it("Grenzfälle: gelöst, ein Zug entfernt, Schichten, gedrehte Lage", () => {
    const solved = solvedCube();
    const r0 = solve(solved);
    expect(r0.ok && r0.moves.length === 0).toBe(true);
    for (const m of ["R", "U'", "F2", "L", "D'", "B"]) {
      const c = applyMove(solved, m);
      const r = solve(c);
      expect(r.ok).toBe(true);
      if (r.ok) expect(isSolved(applyMoves(c, r.moves))).toBe(true);
    }
    // Mittelschicht und ganze Würfeldrehung verschieben die Mitten: Lösung muss trotzdem stimmen
    for (const alg of ["M", "E' R U", "S2 F", "x y R U R' U'", "z' M2 U R"]) {
      const c = applyMoves(solved, parseMoves(alg));
      const r = solve(c);
      expect(r.ok, alg).toBe(true);
      if (r.ok) expect(isSolved(applyMoves(c, r.moves)), alg).toBe(true);
    }
    // gedrehter, gemischter Würfel
    const rot = applyMoves(scrambled(77), parseMoves("x y2 z'"));
    const rr = solve(rot);
    expect(rr.ok).toBe(true);
    if (rr.ok) expect(isSolved(applyMoves(rot, rr.moves))).toBe(true);
  });

  it("erkennt ungültige Zustände und zeigt nie eine falsche Lösung", () => {
    const base = scrambled(9);
    // falsche Farbanzahl
    const a = cloneCube(base); a[0] = (a[0] + 1) % 6;
    const ra = solve(a);
    expect(ra.ok).toBe(false);
    if (!ra.ok) expect(ra.reason).toMatch(/neunmal/);
    // Ecke einzeln verdreht
    const t = cloneCube(base);
    const [i1, i2, i3] = [stickerIndex([1, 1, 1], [0, 1, 0]), stickerIndex([1, 1, 1], [1, 0, 0]), stickerIndex([1, 1, 1], [0, 0, 1])];
    [t[i1], t[i2], t[i3]] = [t[i2], t[i3], t[i1]];
    expect(solve(t).ok).toBe(false);
    // zwei Kanten vertauscht (Parität)
    const sw = cloneCube(base);
    const e1 = [stickerIndex([1, 1, 0], [0, 1, 0]), stickerIndex([1, 1, 0], [1, 0, 0])], e2 = [stickerIndex([-1, 1, 0], [0, 1, 0]), stickerIndex([-1, 1, 0], [-1, 0, 0])];
    [sw[e1[0]], sw[e2[0]]] = [sw[e2[0]], sw[e1[0]]]; [sw[e1[1]], sw[e2[1]]] = [sw[e2[1]], sw[e1[1]]];
    expect(solve(sw).ok).toBe(false);
    // Kante umgeklappt
    const fl = cloneCube(base);
    [fl[e1[0]], fl[e1[1]]] = [fl[e1[1]], fl[e1[0]]];
    expect(solve(fl).ok).toBe(false);
    // jede Antwort ist entweder gelöst oder abgelehnt, nie falsch
    const rng2 = rng(3);
    for (let n = 0; n < 40; n++) {
      const c = cloneCube(scrambled(100 + n));
      for (let k = 0; k < 3; k++) { const i = Math.floor(rng2() * 54), j = Math.floor(rng2() * 54); [c[i], c[j]] = [c[j], c[i]]; }
      const r = solve(c);
      if (r.ok) expect(isSolved(applyMoves(c, r.moves))).toBe(true);
    }
    expect(solve(new Uint8Array(10)).ok).toBe(false);
  });

  it("Zusammenfassen von Zügen", () => {
    expect(simplify(["R", "R"])).toEqual(["R2"]);
    expect(simplify(["R", "R'"])).toEqual([]);
    expect(simplify(["U", "R", "R", "R", "U'"])).toEqual(["U", "R'", "U'"]);
    expect(simplify(["F2", "F2", "U"])).toEqual(["U"]);
  });

  it("Weiter und Zurück beliebig hin und her ergibt immer den richtigen Zustand", () => {
    const cube = scrambled(31);
    const r = solve(cube);
    if (!r.ok) throw new Error(r.reason);
    const states: Cube[] = [cube];
    for (const m of r.moves) states.push(applyMove(states[states.length - 1], m));
    const rnd = rng(8);
    let idx = 0, c = cloneCube(cube);
    for (let n = 0; n < 3000; n++) {
      if (rnd() < 0.55 && idx < r.moves.length) { c = applyMove(c, r.moves[idx]); idx++; }
      else if (idx > 0) { idx--; c = applyMove(c, invert(r.moves[idx])); }
      expect(Array.from(c).join("")).toBe(Array.from(states[idx]).join(""));
    }
    function invert(m: string) { return m.endsWith("2") ? m : m.endsWith("'") ? m.slice(0, -1) : `${m}'`; }
  });

  it("Phasensprung: der Zustand am Phasenbeginn stimmt mit dem Nachspielen überein", () => {
    const cube = scrambled(55);
    const r = solve(cube);
    if (!r.ok) throw new Error(r.reason);
    let c = cube;
    const starts: Cube[] = [];
    for (const p of r.phases) { starts.push(c); c = applyMoves(c, p.moves); }
    for (let k = r.phases.length - 1; k >= 0; k--) {
      const before = r.phases.slice(0, k).flatMap((p) => p.moves);
      expect(Array.from(applyMoves(cube, before)).join("")).toBe(Array.from(starts[k]).join(""));
    }
    expect(FACES.length).toBe(6);
  });

  it("Neuberechnen nach einem eigenen Zug mitten in der Lösung", () => {
    const cube = scrambled(404);
    const r = solve(cube);
    if (!r.ok) throw new Error(r.reason);
    const half = Math.floor(r.moves.length / 2);
    const mid = applyMove(applyMoves(cube, r.moves.slice(0, half)), "R");
    const r2 = solve(mid);
    expect(r2.ok).toBe(true);
    if (r2.ok) expect(isSolved(applyMoves(mid, r2.moves))).toBe(true);
  });
});
