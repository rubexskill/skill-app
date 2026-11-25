// Lernpfad für Anfänger: Schicht für Schicht. Weiß liegt unten, Gelb oben (Schritt 1–2: Weiß unten bauen, ab Schritt 3 Gelb oben).
import { invertMoves, parseMoves } from "./engine";
import type { CubeProgress } from "./types";

export interface Algo {
  id: string;
  name: string;
  notation: string;
  /** ein kurzer Hinweis, wann man ihn braucht */
  hint: string;
}

export interface Step {
  id: string;
  title: string;
  /** höchstens drei Sätze */
  text: string;
  algos: Algo[];
}

export const STEPS: Step[] = [
  {
    id: "kreuz", title: "Weißes Kreuz",
    text: "Baue das weiße Kreuz auf der unteren Seite. Jede weiße Kante muss zusätzlich zur Mittelfarbe der Seitenfläche passen. Steht eine Kante oben richtig vor ihrer Mitte, genügt eine halbe Drehung.",
    algos: [{ id: "kreuz-f2", name: "Kante einsetzen", notation: "F2", hint: "Weiße Kante oben, Seitenfarbe passt zur Mitte vorn." }],
  },
  {
    id: "ecken", title: "Weiße Ecken",
    text: "Setze die vier weißen Ecken in die untere Schicht. Bring die Ecke oben rechts vorn über ihren Platz und wiederhole den Algorithmus, bis sie sitzt. Die untere Schicht ist danach komplett weiß.",
    algos: [
      { id: "ecken-rechts", name: "Ecke einsetzen", notation: "R U R' U'", hint: "Bis zu fünfmal wiederholen, bis die Ecke sitzt." },
      { id: "ecken-links", name: "Ecke einsetzen (andere Seite)", notation: "R' D' R D", hint: "Wenn die weiße Ecke unten falsch herum sitzt." },
    ],
  },
  {
    id: "kanten", title: "Mittlere Kantenstücke",
    text: "Drehe den Würfel mit Gelb nach oben. Suche eine Kante oben ohne Gelb und stelle sie vor ihre Mittelfarbe. Dann schiebst du sie nach rechts oder links in die mittlere Schicht.",
    algos: [
      { id: "kanten-rechts", name: "Kante nach rechts", notation: "U R U' R' U' F' U F", hint: "Die Kante soll nach rechts in die Mitte." },
      { id: "kanten-links", name: "Kante nach links", notation: "U' L' U L U F U' F'", hint: "Die Kante soll nach links in die Mitte." },
    ],
  },
  {
    id: "gelbes-kreuz", title: "Gelbes Kreuz",
    text: "Forme oben ein gelbes Kreuz, die Ecken sind noch egal. Siehst du einen Punkt, eine Linie oder einen Winkel, hilft immer derselbe Algorithmus. Bei der Linie liegt sie waagerecht, beim Winkel zeigt er nach hinten links.",
    algos: [{ id: "gelbes-kreuz", name: "Kreuz bilden", notation: "F R U R' U' F'", hint: "Wiederholen, bis das Kreuz da ist." }],
  },
  {
    id: "kanten-ausrichten", title: "Gelbe Kante ausrichten",
    text: "Drehe die obere Schicht, bis mindestens zwei gelbe Kanten zu ihren Mittelfarben passen. Passen genau zwei nebeneinander, halte sie nach hinten und rechts. Der Algorithmus tauscht die übrigen, bis alle vier stimmen.",
    algos: [{ id: "kanten-ausrichten", name: "Kanten tauschen", notation: "R U R' U R U2 R' U", hint: "Wiederholen, bis alle Kanten passen." }],
  },
  {
    id: "ecken-platzieren", title: "Gelbe Ecken platzieren",
    text: "Bringe die gelben Ecken an ihren richtigen Platz, auch wenn sie noch falsch gedreht sind. Eine Ecke stimmt, wenn ihre drei Farben zu den umliegenden Mitten passen. Halte diese Ecke vorn rechts und wiederhole den Algorithmus.",
    algos: [{ id: "ecken-platzieren", name: "Ecken platzieren", notation: "U R U' L' U R' U' L", hint: "Wiederholen, bis alle vier Ecken am richtigen Platz sind." }],
  },
  {
    id: "ecken-drehen", title: "Gelbe Ecken drehen",
    text: "Halte eine falsch gedrehte Ecke vorn rechts oben und wiederhole den Algorithmus, bis sie gelb nach oben zeigt. Drehe dann nur die obere Schicht zur nächsten Ecke. Zwischendurch wirkt der Würfel durcheinander; am Ende dreht eine letzte Drehung der oberen Schicht alles zurecht.",
    algos: [{ id: "ecken-drehen", name: "Ecke drehen", notation: "R' D' R D", hint: "Je Ecke zwei- oder viermal, bis Gelb oben ist." }],
  },
];

export const ALGOS: Algo[] = STEPS.flatMap((s) => s.algos);
export const stepOfAlgo = (algoId: string): Step | undefined => STEPS.find((s) => s.algos.some((a) => a.id === algoId));

/** Zugfolge eines Algorithmus */
export const movesOf = (a: Algo): string[] => parseMoves(a.notation);
/** Der Fall zum Üben: Umkehrung des Algorithmus – der Algorithmus löst ihn wieder. */
export const setupOf = (a: Algo): string[] => invertMoves(movesOf(a));

export type StepState = "kann" | "ueben" | "neu";
/** Ein Schritt ist „kann ich“, wenn alle seine Algorithmen es sind; „noch üben“, sobald einer markiert ist. */
export function stepState(step: Step, progress: Map<string, CubeProgress>): StepState {
  const states = step.algos.map((a) => progress.get(a.id)?.state);
  if (states.every((s) => s === "kann")) return "kann";
  return states.some((s) => s) ? "ueben" : "neu";
}
