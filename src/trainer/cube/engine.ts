// Würfel-Engine (3×3): Zustand als 54 Aufkleber, alle Drehungen als Permutationen aus der Geometrie, Notation, Mischung.
// Koordinaten: x nach rechts, y nach oben, z zum Betrachter (Vorderseite F = +z). Farben: 0 U, 1 R, 2 F, 3 D, 4 L, 5 B.

export type Cube = Uint8Array;
export type Vec = [number, number, number];

export const FACES = ["U", "R", "F", "D", "L", "B"] as const;
export type Face = (typeof FACES)[number];
const NORMAL: Record<Face, Vec> = { U: [0, 1, 0], R: [1, 0, 0], F: [0, 0, 1], D: [0, -1, 0], L: [-1, 0, 0], B: [0, 0, -1] };
/** Standardfarben: Weiß oben, Grün vorn (Würfel mit Weiß oben/Grün vorn: Rot rechts, Blau hinten, Orange links, Gelb unten) */
export const FACE_COLORS = ["#f4f4f0", "#c41e3a", "#009b48", "#ffd500", "#ff5800", "#0046ad"] as const;
export const COLOR_NAMES = ["Weiß", "Rot", "Grün", "Gelb", "Orange", "Blau"] as const;

export interface Sticker { pos: Vec; normal: Vec }

/** Die 54 Aufkleber in fester Reihenfolge (je Fläche 3×3). */
export const STICKERS: Sticker[] = (() => {
  const out: Sticker[] = [];
  for (const f of FACES) {
    const n = NORMAL[f];
    const axis = n.findIndex((v) => v !== 0);
    const others = [0, 1, 2].filter((a) => a !== axis);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
      const pos: Vec = [0, 0, 0];
      pos[axis] = n[axis];
      pos[others[0]] = i;
      pos[others[1]] = j;
      out.push({ pos, normal: [...n] as Vec });
    }
  }
  return out;
})();

const key = (p: Vec, n: Vec) => `${p.join(",")}|${n.join(",")}`;
const INDEX = new Map(STICKERS.map((s, i) => [key(s.pos, s.normal), i]));
export const stickerIndex = (pos: Vec, normal: Vec): number => INDEX.get(key(pos, normal))!;

export const solvedCube = (): Cube => Uint8Array.from(STICKERS.map((s) => FACES.findIndex((f) => NORMAL[f].every((v, i) => v === s.normal[i]))));

// ---------------- Drehungen ----------------

/** Drehung um eine Achse (0 x, 1 y, 2 z) um `q` Vierteldrehungen im mathematischen Drehsinn (+90° = Rechte-Hand-Regel). */
export function rotateVec(v: Vec, axis: number, q: number): Vec {
  let [x, y, z] = v;
  const turns = ((q % 4) + 4) % 4;
  for (let t = 0; t < turns; t++) {
    if (axis === 0) [y, z] = [-z, y];
    else if (axis === 1) [x, z] = [z, -x];
    else [x, y] = [-y, x];
  }
  return [x + 0, y + 0, z + 0] as Vec; // + 0 macht aus -0 eine 0
}

export interface MoveSpec {
  axis: number;
  /** Schicht entlang der Achse: -1, 0, 1 oder null für den ganzen Würfel */
  layer: -1 | 0 | 1 | null;
  /** Vierteldrehungen im Uhrzeigersinn dieser Bewegung (Schichtblick), ausgedrückt als Drehung um die +Achse: +1 oder −1 */
  dir: 1 | -1;
}

// Uhrzeigersinn der Fläche von außen gesehen = −90° um ihre Außennormale. D, L, B zeigen entlang der −Achse, also +90° um +Achse.
const BASE: Record<string, MoveSpec> = {
  U: { axis: 1, layer: 1, dir: -1 }, D: { axis: 1, layer: -1, dir: 1 },
  R: { axis: 0, layer: 1, dir: -1 }, L: { axis: 0, layer: -1, dir: 1 },
  F: { axis: 2, layer: 1, dir: -1 }, B: { axis: 2, layer: -1, dir: 1 },
  M: { axis: 0, layer: 0, dir: 1 }, E: { axis: 1, layer: 0, dir: 1 }, S: { axis: 2, layer: 0, dir: -1 },
  x: { axis: 0, layer: null, dir: -1 }, y: { axis: 1, layer: null, dir: -1 }, z: { axis: 2, layer: null, dir: -1 },
};

export const MOVE_LETTERS = Object.keys(BASE);
/** Die 18 Grundzüge */
export const MOVES_18: string[] = FACES.flatMap((f) => [f, `${f}'`, `${f}2`]);

export interface Parsed { letter: string; turns: 1 | 2 | 3 }

export function parseMove(token: string): Parsed {
  const m = /^([UDLRFBMESxyz])(2'?|'|2)?$/.exec(token.replace(/[’‘´`]/g, "'"));
  if (!m) throw new Error(`Unbekannter Zug: „${token}“`);
  const suffix = m[2] ?? "";
  return { letter: m[1], turns: suffix.startsWith("2") ? 2 : suffix === "'" ? 3 : 1 };
}

export const formatMove = (p: Parsed): string => `${p.letter}${p.turns === 2 ? "2" : p.turns === 3 ? "'" : ""}`;
export const normalizeMove = (token: string): string => formatMove(parseMove(token));

/** Notation lesen: Leerzeichen, Zeilenumbrüche und Kommas trennen; „R2'“, typografische Striche und Klammern sind erlaubt. */
export function parseMoves(text: string): string[] {
  const clean = text.replace(/[()[\]{}.,;]/g, " ").trim();
  if (!clean) return [];
  const tokens: string[] = [];
  for (const part of clean.split(/\s+/)) {
    // „RUR'U'“ ohne Leerzeichen: zerlegen
    let rest = part.replace(/[’‘´`]/g, "'");
    while (rest) {
      const m = /^([UDLRFBMESxyz])(2'?|'|2)?/.exec(rest);
      if (!m) throw new Error(`Unbekannter Zug: „${part}“`);
      tokens.push(normalizeMove(m[0]));
      rest = rest.slice(m[0].length);
    }
  }
  return tokens;
}

export const formatMoves = (moves: string[]): string => moves.join(" ");

export function invertMove(token: string): string {
  const p = parseMove(token);
  return formatMove({ letter: p.letter, turns: p.turns === 1 ? 3 : p.turns === 3 ? 1 : 2 });
}

/** Umkehrung einer Zugfolge: rückwärts, jeder Zug gedreht. */
export const invertMoves = (moves: string[]): string[] => [...moves].reverse().map(invertMove);

/** Vierteldrehungen um die +Achse (positiv = +90°), die ein Zug bewirkt. */
export function quarterTurns(token: string): { spec: MoveSpec; q: number } {
  const p = parseMove(token);
  const spec = BASE[p.letter];
  const cw = p.turns === 3 ? -1 : p.turns === 2 ? 2 : 1;
  return { spec, q: spec.dir * cw };
}

/** Zug zu einer gedrehten Schicht (Achse, Schicht, Vierteldrehungen um die +Achse). */
export function layerMove(axis: number, layer: -1 | 0 | 1, q: number): string {
  const qq = ((q % 4) + 4) % 4;
  if (qq === 0) throw new Error("keine Drehung");
  const letter = Object.keys(BASE).find((l) => BASE[l].axis === axis && BASE[l].layer === layer)!;
  if (qq === 2) return `${letter}2`;
  const cw = (qq === 1 ? 1 : -1) * BASE[letter].dir; // +1 = Uhrzeigersinn
  return cw === 1 ? letter : `${letter}'`;
}

const PERMS = new Map<string, Uint8Array>();
/** Permutation eines Zugs: neu[i] = alt[perm[i]] */
export function permutationOf(token: string): Uint8Array {
  const norm = normalizeMove(token);
  let perm = PERMS.get(norm);
  if (perm) return perm;
  const { spec, q } = quarterTurns(norm);
  perm = new Uint8Array(54);
  STICKERS.forEach((s, i) => {
    const inLayer = spec.layer === null || s.pos[spec.axis] === spec.layer;
    if (!inLayer) { perm![i] = i; return; }
    const to = stickerIndex(rotateVec(s.pos, spec.axis, q), rotateVec(s.normal, spec.axis, q));
    perm![to] = i;
  });
  PERMS.set(norm, perm);
  return perm;
}

export function applyMove(cube: Cube, token: string): Cube {
  const perm = permutationOf(token);
  const out = new Uint8Array(54);
  for (let i = 0; i < 54; i++) out[i] = cube[perm[i]];
  return out;
}

export function applyMoves(cube: Cube, moves: string[]): Cube {
  let c = cube;
  for (const m of moves) c = applyMove(c, m);
  return c;
}

export const cloneCube = (c: Cube): Cube => Uint8Array.from(c);
export const sameCube = (a: Cube, b: Cube): boolean => a.every((v, i) => v === b[i]);

/** Gelöst: jede Fläche einfarbig – egal, wie der Würfel gerade ausgerichtet ist. */
export function isSolved(cube: Cube): boolean {
  for (let f = 0; f < 6; f++) {
    const c = cube[f * 9];
    for (let k = 1; k < 9; k++) if (cube[f * 9 + k] !== c) return false;
  }
  return true;
}

// ---------------- Mischung ----------------

const faceOf = (token: string) => parseMove(token).letter;
const axisOfFace = (f: string) => BASE[f].axis;

/**
 * Mischung aus `length` Zügen (Standard 25): nie dieselbe Fläche zweimal hintereinander und nie dreimal dieselbe Achse
 * hintereinander (kein „R L R“). `rnd` liefert Zahlen in [0, 1).
 */
export function scramble(length = 25, rnd: () => number = Math.random): string[] {
  const out: string[] = [];
  while (out.length < length) {
    const f = FACES[Math.floor(rnd() * 6)];
    const prev = out[out.length - 1] && faceOf(out[out.length - 1]);
    const prev2 = out[out.length - 2] && faceOf(out[out.length - 2]);
    if (f === prev) continue;
    if (prev && prev2 && axisOfFace(prev) === axisOfFace(prev2) && axisOfFace(f) === axisOfFace(prev)) continue;
    out.push(`${f}${["", "'", "2"][Math.floor(rnd() * 3)]}`);
  }
  return out;
}

/** Zustand als Text (für Tests und Speicherung): 54 Ziffern */
export const cubeToString = (c: Cube): string => Array.from(c).join("");
export const cubeFromString = (s: string): Cube | null => (/^[0-5]{54}$/.test(s) ? Uint8Array.from([...s].map(Number)) : null);
