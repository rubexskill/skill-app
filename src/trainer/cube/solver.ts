// Löser nach der Anfängermethode (Schicht für Schicht) für jeden gültigen Würfelzustand.
// Ablauf: Zustand in die Arbeitslage drehen (Weiß unten, Gelb oben), sieben benannte Phasen lösen, Züge zurück auf den echten Würfel übertragen.
// Nie eine falsche Lösung: am Ende wird die ganze Zugfolge am Ausgangszustand nachgespielt; stimmt sie nicht, gibt es einen Fehler statt einer Lösung.
import {
  FACES, MOVES_18, STICKERS, applyMove, applyMoves, isSolved, parseMove, parseMoves, permutationOf, stickerIndex,
  type Cube, type Vec,
} from "./engine";

export interface SolvePhase { id: string; title: string; moves: string[] }
export type SolveResult =
  | { ok: true; moves: string[]; phases: SolvePhase[]; ms: number }
  | { ok: false; reason: string; ms: number; detail?: string };

export const PHASE_TITLES: { id: string; title: string }[] = [
  { id: "kreuz", title: "Weißes Kreuz" },
  { id: "ecken", title: "Weiße Ecken" },
  { id: "kanten", title: "Mittlere Kanten" },
  { id: "gelbes-kreuz", title: "Gelbes Kreuz" },
  { id: "kanten-ausrichten", title: "Gelbe Kante ausrichten" },
  { id: "ecken-platzieren", title: "Gelbe Ecken platzieren" },
  { id: "ecken-drehen", title: "Gelbe Ecken drehen" },
];

type Face = (typeof FACES)[number];
const NORMAL: Record<Face, Vec> = { U: [0, 1, 0], R: [1, 0, 0], F: [0, 0, 1], D: [0, -1, 0], L: [-1, 0, 0], B: [0, 0, -1] };
/** Farben der Mitten in der Arbeitslage: Weiß (0) unten, Gelb (3) oben, Grün (2) vorn. Farbnummern wie in der Engine. */
const CF: Record<Face, number> = { U: 3, R: 4, F: 2, D: 0, L: 1, B: 5 };
const FRONTS: Face[] = ["F", "R", "B", "L"];

class SolveError extends Error {}

const add = (...v: Vec[]): Vec => [v.reduce((s, a) => s + a[0], 0), v.reduce((s, a) => s + a[1], 0), v.reduce((s, a) => s + a[2], 0)];
const at = (c: Cube, pos: Vec, face: Face): number => c[stickerIndex(pos, NORMAL[face])];

const CUBIE_POSITIONS: Vec[] = (() => {
  const out: Vec[] = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) if (x || y || z) out.push([x, y, z]);
  return out;
})();
const facesAt = (pos: Vec): Face[] => FACES.filter((f) => NORMAL[f].some((v, a) => v !== 0 && pos[a] === v));
const colorsAt = (c: Cube, pos: Vec): number[] => facesAt(pos).map((f) => at(c, pos, f));
const key = (a: number[]) => [...a].sort((x, y) => x - y).join(",");

/** Position des Teils mit diesen Farben (Kante: 2, Ecke: 3 Farben) */
function findCubie(c: Cube, colors: number[]): Vec {
  const k = key(colors);
  for (const pos of CUBIE_POSITIONS) {
    if (facesAt(pos).length !== colors.length) continue;
    if (key(colorsAt(c, pos)) === k) return pos;
  }
  throw new SolveError("Teil nicht gefunden");
}

// ---------------- Zustand prüfen und in die Arbeitslage bringen ----------------

interface Frame { work: Cube; toReal: Record<Face, Face> }

function toWorkFrame(real: Cube): Frame | string {
  // Farbzähler
  const counts = new Array(6).fill(0);
  for (const v of real) counts[v]++;
  if (counts.some((n) => n !== 9)) return "Jede Farbe muss genau neunmal vorkommen.";
  // Mitten: Welche Fläche trägt welche Mittelfarbe?
  const faceOfCenter: Partial<Record<number, Face>> = {};
  FACES.forEach((f, i) => { faceOfCenter[real[i * 9 + 4]] = f; });
  if (Object.keys(faceOfCenter).length !== 6) return "Die sechs Mittelsteine müssen verschiedene Farben haben.";
  const toReal = {} as Record<Face, Face>;
  for (const w of FACES) toReal[w] = faceOfCenter[CF[w]]!;
  const gR = NORMAL[toReal.R], gU = NORMAL[toReal.U], gF = NORMAL[toReal.F];
  const cross: Vec = [gU[1] * gF[2] - gU[2] * gF[1], gU[2] * gF[0] - gU[0] * gF[2], gU[0] * gF[1] - gU[1] * gF[0]];
  const det = gR[0] * cross[0] + gR[1] * cross[1] + gR[2] * cross[2];
  const opposite = (a: Face, b: Face) => NORMAL[a].every((v, i) => v === -NORMAL[b][i]);
  if (det !== 1 || !opposite(toReal.U, toReal.D) || !opposite(toReal.R, toReal.L) || !opposite(toReal.F, toReal.B)) return "Die Mittelsteine sind in einer unmöglichen Anordnung (gespiegelt).";
  const map = (p: Vec): Vec => add(
    [gR[0] * p[0], gR[1] * p[0], gR[2] * p[0]], [gU[0] * p[1], gU[1] * p[1], gU[2] * p[1]], [gF[0] * p[2], gF[1] * p[2], gF[2] * p[2]],
  );
  const work = new Uint8Array(54);
  STICKERS.forEach((s, i) => { work[i] = real[stickerIndex(map(s.pos), map(s.normal))]; });
  // Teile: jede Kante und jede Ecke muss genau einmal vorkommen
  const solvedSets = new Set<string>();
  for (const pos of CUBIE_POSITIONS) solvedSets.add(key(facesAt(pos).map((f) => CF[f])));
  const seen = new Set<string>();
  for (const pos of CUBIE_POSITIONS) {
    if (facesAt(pos).length === 1) continue;
    const k = key(colorsAt(work, pos));
    if (!solvedSets.has(k)) return "Es gibt ein Teil mit einer Farbkombination, die es am echten Würfel nicht gibt.";
    if (seen.has(k)) return "Ein Teil kommt doppelt vor, ein anderes fehlt.";
    seen.add(k);
  }
  return { work, toReal };
}

// ---------------- Bausteine ----------------

/** Gleiche Zugfolge, aber mit anderer Vorderseite (k = 0: F vorn, 1: R vorn, 2: B vorn, 3: L vorn). */
function relabel(k: number, alg: string): string[] {
  return parseMoves(alg).map((m) => {
    const p = parseMove(m);
    const i = FRONTS.indexOf(p.letter as Face);
    const letter = i < 0 ? p.letter : FRONTS[(i + k) % 4];
    return `${letter}${p.turns === 2 ? "2" : p.turns === 3 ? "'" : ""}`;
  });
}
const frontOf = (k: number): Face => FRONTS[k % 4];
const rightOf = (k: number): Face => FRONTS[(1 + k) % 4];
const leftOf = (k: number): Face => FRONTS[(3 + k) % 4];

class Work {
  cube: Cube;
  out: string[] = [];
  constructor(c: Cube) { this.cube = c; }
  do(moves: string | string[]) {
    const list = typeof moves === "string" ? parseMoves(moves) : moves;
    for (const m of list) { this.cube = applyMove(this.cube, m); this.out.push(m); }
  }
  take(): string[] { const o = this.out; this.out = []; return o; }
}

const INVERSE = new Map<string, Uint8Array>();
for (const m of MOVES_18) {
  const perm = permutationOf(m);
  const inv = new Uint8Array(54);
  perm.forEach((from, to) => { inv[from] = to; });
  INVERSE.set(m, inv);
}

/** Kürzeste Zugfolge (alle 18 Züge), die die verfolgten Aufkleber auf ihre Zielplätze bringt (Breitensuche). */
function bfsTrack(start: number[], goal: number[], maxDepth: number): string[] {
  const enc = (a: number[]) => String.fromCharCode(...a);
  const target = enc(goal);
  const first = enc(start);
  if (first === target) return [];
  const parent = new Map<string, { p: string; m: string }>([[first, { p: "", m: "" }]]);
  let frontier: number[][] = [start];
  for (let depth = 0; depth < maxDepth; depth++) {
    const next: number[][] = [];
    for (const state of frontier) {
      const sk = enc(state);
      const lastMove = parent.get(sk)!.m;
      for (const m of MOVES_18) {
        if (lastMove && lastMove[0] === m[0]) continue;
        const inv = INVERSE.get(m)!;
        const ns = state.map((i) => inv[i]);
        const nk = enc(ns);
        if (parent.has(nk)) continue;
        parent.set(nk, { p: sk, m });
        if (nk === target) {
          const path: string[] = [];
          for (let k = nk; k !== first;) { const e = parent.get(k)!; path.push(e.m); k = e.p; }
          return path.reverse();
        }
        next.push(ns);
      }
    }
    frontier = next;
  }
  throw new SolveError("Keine Lösung gefunden");
}

/** Breitensuche über Bausteine (Zugfolgen); Ziel erreicht, wenn `goal` stimmt. Für die kleinen Zustandsräume der letzten Schicht. */
function macroSearch(w: Work, macros: string[][], goal: (c: Cube) => boolean, maxDepth: number, maxNodes = 60000): void {
  if (goal(w.cube)) return;
  const enc = (c: Cube) => String.fromCharCode(...c);
  const start = w.cube;
  const parent = new Map<string, { p: string; macro: number }>([[enc(start), { p: "", macro: -1 }]]);
  const cubes = new Map<string, Cube>([[enc(start), start]]);
  let frontier = [enc(start)];
  for (let depth = 0; depth < maxDepth; depth++) {
    const next: string[] = [];
    for (const sk of frontier) {
      const c = cubes.get(sk)!;
      for (let mi = 0; mi < macros.length; mi++) {
        const nc = applyMoves(c, macros[mi]);
        const nk = enc(nc);
        if (parent.has(nk)) continue;
        parent.set(nk, { p: sk, macro: mi });
        cubes.set(nk, nc);
        if (goal(nc)) {
          const seq: number[] = [];
          for (let k = nk; k !== enc(start);) { const e = parent.get(k)!; seq.push(e.macro); k = e.p; }
          for (const mi2 of seq.reverse()) w.do(macros[mi2]);
          return;
        }
        next.push(nk);
        if (parent.size > maxNodes) throw new SolveError("Zustand lässt sich nicht lösen");
      }
    }
    frontier = next;
  }
  throw new SolveError("Zustand lässt sich nicht lösen");
}

const U_TURNS: string[][] = [["U"], ["U'"], ["U2"]];

// ---------------- Phasen (Arbeitslage: Weiß unten, Gelb oben) ----------------

function phaseCross(w: Work) {
  const solved: [number, number][] = []; // schon gelöste Kanten (Aufkleber weiß, Aufkleber seitlich)
  for (let k = 0; k < 4; k++) {
    const side = FRONTS[k];
    const pos = findCubie(w.cube, [0, CF[side]]);
    const fs = facesAt(pos);
    const whiteFace = fs.find((f) => at(w.cube, pos, f) === 0)!;
    const sideFace = fs.find((f) => f !== whiteFace)!;
    const start = [...solved.flat(), stickerIndex(pos, NORMAL[whiteFace]), stickerIndex(pos, NORMAL[sideFace])];
    const target = add(NORMAL.D, NORMAL[side]);
    const goal = [...solved.flat(), stickerIndex(target, NORMAL.D), stickerIndex(target, NORMAL[side])];
    w.do(bfsTrack(start, goal, 9));
    solved.push([stickerIndex(target, NORMAL.D), stickerIndex(target, NORMAL[side])]);
  }
}

function phaseCorners(w: Work) {
  const SEXY = "R U R' U'";
  for (let k = 0; k < 4; k++) {
    const F = frontOf(k), R = rightOf(k);
    const colors = [0, CF[F], CF[R]];
    const slot = add(NORMAL.D, NORMAL[F], NORMAL[R]);
    const above = add(NORMAL.U, NORMAL[F], NORMAL[R]);
    const isDone = () => at(w.cube, slot, "D") === 0 && at(w.cube, slot, F) === CF[F] && at(w.cube, slot, R) === CF[R];
    for (let guard = 0; guard < 24 && !isDone(); guard++) {
      const p = findCubie(w.cube, colors);
      if (p[1] === -1) {
        const j = [0, 1, 2, 3].find((j) => add(NORMAL.D, NORMAL[frontOf(j)], NORMAL[rightOf(j)]).every((v, a) => v === p[a]))!;
        w.do(relabel(j, SEXY));
        continue;
      }
      if (!p.every((v, a) => v === above[a])) { w.do("U"); continue; }
      for (let n = 0; n < 6 && !isDone(); n++) w.do(relabel(k, SEXY));
    }
    if (!isDone()) throw new SolveError("Weiße Ecke lässt sich nicht einsetzen");
  }
}

function phaseMiddleEdges(w: Work) {
  const RIGHT = "U R U' R' U' F' U F";
  const LEFT = "U' L' U L U F U' F'";
  for (let k = 0; k < 4; k++) {
    const F = frontOf(k), R = rightOf(k);
    const colors = [CF[F], CF[R]];
    const slot = add(NORMAL[F], NORMAL[R]);
    const isDone = () => at(w.cube, slot, F) === CF[F] && at(w.cube, slot, R) === CF[R];
    for (let guard = 0; guard < 16 && !isDone(); guard++) {
      const p = findCubie(w.cube, colors);
      if (p[1] === 0) {
        const j = [0, 1, 2, 3].find((j) => add(NORMAL[frontOf(j)], NORMAL[rightOf(j)]).every((v, a) => v === p[a]))!;
        w.do(relabel(j, RIGHT));
        continue;
      }
      // obere Schicht: seitliche Farbe vor ihre Mitte drehen
      const x = facesAt(p).find((f) => f !== "U")!;
      const sideColor = at(w.cube, p, x);
      if (CF[x] !== sideColor) { w.do("U"); continue; }
      const other = at(w.cube, p, "U");
      const kk = FRONTS.indexOf(x);
      if (CF[rightOf(kk)] === other) w.do(relabel(kk, RIGHT));
      else if (CF[leftOf(kk)] === other) w.do(relabel(kk, LEFT));
      else throw new SolveError("Kante passt nicht");
    }
    if (!isDone()) throw new SolveError("Mittlere Kante lässt sich nicht einsetzen");
  }
}

const frames = (alg: string): string[][] => [0, 1, 2, 3].map((k) => relabel(k, alg));

function phaseYellowCross(w: Work) {
  const goal = (c: Cube) => FRONTS.every((f) => c[stickerIndex(add(NORMAL.U, NORMAL[f]), NORMAL.U)] === CF.U);
  macroSearch(w, [...U_TURNS, ...frames("F R U R' U' F'")], goal, 5);
}

function phaseAlignEdges(w: Work) {
  const goal = (c: Cube) => FRONTS.every((f) => at(c, add(NORMAL.U, NORMAL[f]), f) === CF[f]);
  macroSearch(w, [...U_TURNS, ...frames("R U R' U R U2 R'")], goal, 6);
}

function phasePlaceCorners(w: Work) {
  // Kanten müssen dabei ausgerichtet bleiben: die obere Schicht darf am Ende nicht verdreht stehen
  const goal = (c: Cube) => FRONTS.every((f) => at(c, add(NORMAL.U, NORMAL[f]), f) === CF[f]) && [0, 1, 2, 3].every((k) => {
    const pos = add(NORMAL.U, NORMAL[frontOf(k)], NORMAL[rightOf(k)]);
    return key(colorsAt(c, pos)) === key([CF.U, CF[frontOf(k)], CF[rightOf(k)]]);
  });
  macroSearch(w, [...U_TURNS, ...frames("U R U' L' U R' U' L")], goal, 5);
}

function phaseTwistCorners(w: Work) {
  const pos = add(NORMAL.U, NORMAL.F, NORMAL.R);
  for (let corner = 0; corner < 4; corner++) {
    // immer zwei Wiederholungen auf einmal: dann bleibt dieselbe Ecke an ihrem Platz und dreht sich nur
    for (let n = 0; n < 3 && at(w.cube, pos, "U") !== CF.U; n++) w.do("R' D' R D R' D' R D");
    if (at(w.cube, pos, "U") !== CF.U) throw new SolveError("Ecke lässt sich nicht drehen");
    w.do("U");
  }
  for (let n = 0; n < 3 && !isSolved(w.cube); n++) w.do("U");
  if (!isSolved(w.cube)) throw new SolveError("Würfel nach der letzten Phase nicht gelöst");
}

/** Gleiche Fläche hintereinander zusammenfassen (R R → R2, R R' → nichts). */
export function simplify(moves: string[]): string[] {
  const out: { letter: string; turns: number }[] = [];
  for (const m of moves) {
    const p = parseMove(m);
    const last = out[out.length - 1];
    if (last && last.letter === p.letter) {
      last.turns = (last.turns + p.turns) % 4;
      if (last.turns === 0) out.pop();
    } else out.push({ letter: p.letter, turns: p.turns });
  }
  return out.map((p) => `${p.letter}${p.turns === 2 ? "2" : p.turns === 3 ? "'" : ""}`);
}

const PHASES: ((w: Work) => void)[] = [phaseCross, phaseCorners, phaseMiddleEdges, phaseYellowCross, phaseAlignEdges, phasePlaceCorners, phaseTwistCorners];

export function solve(cube: Cube): SolveResult {
  const t0 = performance.now();
  const done = (r: Omit<Extract<SolveResult, { ok: true }>, "ms"> | Omit<Extract<SolveResult, { ok: false }>, "ms">): SolveResult => ({ ...r, ms: performance.now() - t0 } as SolveResult);
  if (cube.length !== 54) return done({ ok: false, reason: "Der Würfelzustand ist unvollständig." });
  if (isSolved(cube)) return done({ ok: true, moves: [], phases: [] });
  const frame = toWorkFrame(cube);
  if (typeof frame === "string") return done({ ok: false, reason: frame });
  const w = new Work(frame.work);
  const phases: SolvePhase[] = [];
  try {
    PHASES.forEach((run, i) => {
      try { run(w); } catch (e) { if (e instanceof SolveError) e.message = `Phase ${i + 1}: ${e.message}`; throw e; }
      const moves = simplify(w.take()).map((m) => {
        const p = parseMove(m);
        return `${frame.toReal[p.letter as Face]}${p.turns === 2 ? "2" : p.turns === 3 ? "'" : ""}`;
      });
      phases.push({ ...PHASE_TITLES[i], moves });
    });
  } catch (e) {
    if (e instanceof SolveError) return done({ ok: false, detail: e.message, reason: "Dieser Zustand lässt sich nicht lösen: Eine Ecke ist einzeln verdreht, eine Kante umgeklappt oder zwei Teile sind vertauscht." });
    throw e;
  }
  const moves = phases.flatMap((p) => p.moves);
  // Sicherheit: nur eine Lösung zeigen, die den echten Würfel wirklich löst
  if (!isSolved(applyMoves(cube, moves))) return done({ ok: false, reason: "Dieser Zustand lässt sich nicht lösen: Eine Ecke ist einzeln verdreht, eine Kante umgeklappt oder zwei Teile sind vertauscht." });
  return done({ ok: true, moves, phases });
}
