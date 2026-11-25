// Wiedergabe-Sitzung: eine Zugfolge mit Phasen, gespielt am 3D-Würfel (Lösung oder Algorithmus aus dem Lernpfad).
// Alle Zustände werden vorab berechnet, damit Springen, Weiter und Zurück nie vom Zustand der Grafik abhängen.
import { applyMove, cloneCube, invertMove, parseMove, type Cube } from "./engine";
import { solve, type SolveResult } from "./solver";

export interface SessionPhase { id: string; title: string; /** Nummer der Phase (1 bis 7) */ no: number; /** Index des ersten Zugs der Phase */ from: number }
export interface Session {
  kind: "solution" | "algo";
  title: string;
  start: Cube;
  moves: string[];
  phases: SessionPhase[];
  /** states[i] = Würfel nach i Zügen (states[0] = Start) */
  states: Cube[];
}

export function makeSession(kind: Session["kind"], title: string, start: Cube, moves: string[], phases: { id: string; title: string; moves: string[] }[] = []): Session {
  const states: Cube[] = [cloneCube(start)];
  for (const m of moves) states.push(applyMove(states[states.length - 1], m));
  const out: SessionPhase[] = [];
  let at = 0;
  phases.forEach((p, i) => { if (p.moves.length > 0) out.push({ id: p.id, title: p.title, no: i + 1, from: at }); at += p.moves.length; });
  return { kind, title, start: cloneCube(start), moves, phases: out, states };
}

/** Lösung für den aktuellen Würfel als Sitzung (oder Fehlertext) */
export function solutionSession(cube: Cube): { ok: true; session: Session; ms: number } | { ok: false; reason: string } {
  const r: SolveResult = solve(cube);
  if (!r.ok) return { ok: false, reason: r.reason };
  return { ok: true, session: makeSession("solution", "Lösung", cube, r.moves, r.phases), ms: r.ms };
}

/** Phase, zu der der Zug mit diesem Index gehört (der „nächste Zug“); am Ende die letzte Phase. */
export function phaseIndexAt(s: Session, idx: number): number {
  let k = 0;
  for (let i = 0; i < s.phases.length; i++) if (s.phases[i].from <= Math.min(idx, s.moves.length - 1)) k = i;
  return k;
}
/** Gehört idx genau auf einen Phasenbeginn (außer den ersten)? Dann kurz anhalten beim Abspielen. */
export const isPhaseBoundary = (s: Session, idx: number): boolean => idx > 0 && s.phases.some((p) => p.from === idx);

/** Zahl der Vierteldrehungen und Richtung für die Anzeige: dir 1 = im Uhrzeigersinn, -1 = dagegen */
export function arrowOf(move: string): { face: string; dir: 1 | -1; double: boolean } {
  const p = parseMove(move);
  return { face: p.letter, dir: p.turns === 3 ? -1 : 1, double: p.turns === 2 };
}

/** Nächster Zug für den aktuellen Würfel (Tipp) oder null, wenn gelöst / nicht lösbar */
export function hintFor(cube: Cube): string | null {
  const r = solve(cube);
  return r.ok && r.moves.length ? r.moves[0] : null;
}

/** Zug rückgängig = Umkehrzug */
export const undoOf = invertMove;
