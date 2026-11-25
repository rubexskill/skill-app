// Ziehen auf dem Würfel: aus berührter Fläche, Schicht und Ziehrichtung wird Achse, Schicht und Drehsinn.
// Rein berechnet (ohne three.js), die Projektion auf den Bildschirm wird übergeben.
import { layerMove, type Vec } from "./engine";

export interface DragInput {
  /** Außennormale der berührten Fläche im Würfelraum (achsenparallel, beliebige Länge) */
  normal: Vec;
  /** Berührpunkt im Würfelraum */
  point: Vec;
  /** Koordinate des berührten Teilwürfels (−1, 0, 1 je Achse) */
  coord: Vec;
  /** Ziehen in Bildschirmpixeln seit dem Aufsetzen */
  drag: [number, number];
  /** Würfelraum → Bildschirm (Pixel) */
  project: (p: Vec) => [number, number];
}

export interface LayerDrag {
  axis: number;
  layer: -1 | 0 | 1;
  /** Bildschirmrichtung, in der die Fläche bei positiver Drehung um +Achse wandert (Einheitsvektor) */
  unit: [number, number];
  /** Bildschirmpixel, die der berührte Punkt je Radiant zurücklegt */
  pxPerRad: number;
}

const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unitAxis = (a: number): Vec => (a === 0 ? [1, 0, 0] : a === 1 ? [0, 1, 0] : [0, 0, 1]);

/** Erst ab so vielen Pixeln wird die Richtung festgelegt. */
export const DRAG_THRESHOLD = 8;

/** Wählt Achse und Schicht für eine Ziehbewegung; null, solange die Bewegung zu klein ist. */
export function chooseLayerDrag(input: DragInput): LayerDrag | null {
  const { normal, point, coord, drag, project } = input;
  const len = Math.hypot(drag[0], drag[1]);
  if (len < DRAG_THRESHOLD) return null;
  const na = [0, 1, 2].reduce((best, a) => (Math.abs(normal[a]) > Math.abs(normal[best]) ? a : best), 0);
  const eps = 0.05;
  const base = project(point);
  let best: (LayerDrag & { score: number }) | null = null;
  for (const a of [0, 1, 2].filter((x) => x !== na)) {
    const t = cross(unitAxis(a), point);
    const moved = project([point[0] + t[0] * eps, point[1] + t[1] * eps, point[2] + t[2] * eps]);
    const s: [number, number] = [moved[0] - base[0], moved[1] - base[1]];
    const sl = Math.hypot(s[0], s[1]);
    if (sl < 1e-6) continue;
    const unit: [number, number] = [s[0] / sl, s[1] / sl];
    const score = Math.abs(drag[0] * unit[0] + drag[1] * unit[1]);
    if (!best || score > best.score) best = { axis: a, layer: Math.round(coord[a]) as -1 | 0 | 1, unit, pxPerRad: sl / eps, score };
  }
  return best ? { axis: best.axis, layer: best.layer, unit: best.unit, pxPerRad: best.pxPerRad } : null;
}

/** Drehwinkel (Radiant um die +Achse) für die aktuelle Ziehbewegung */
export const dragAngle = (d: LayerDrag, drag: [number, number]): number => (drag[0] * d.unit[0] + drag[1] * d.unit[1]) / d.pxPerRad;

/** Einrasten auf Vierteldrehungen: Schwung (Radiant pro Sekunde) wird berücksichtigt, ein kurzer Flick genügt für 90°. Höchstens ±180°. */
export function snapQuarters(angle: number, velocity = 0): number {
  if (Math.abs(angle) < 0.05) return 0; // praktisch nicht bewegt: kein Zug
  const projected = angle + velocity * 0.1;
  let q = Math.round(projected / (Math.PI / 2));
  // ein deutlicher Flick in Ziehrichtung zählt mindestens als eine Vierteldrehung
  if (q === 0 && Math.abs(velocity) > 2.5 && Math.abs(angle) > 0.08) q = Math.sign(velocity);
  return Math.max(-2, Math.min(2, q));
}

/** Zug zu einer gedrehten Schicht, oder null bei null Vierteldrehungen */
export const moveForDrag = (d: LayerDrag, quarters: number): string | null => (quarters === 0 ? null : layerMove(d.axis, d.layer, quarters));
