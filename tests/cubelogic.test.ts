import { describe, expect, it } from "vitest";
import { STEPS, ALGOS, movesOf, setupOf, stepOfAlgo, stepState } from "../src/trainer/cube/path";
import { averageOf, bestOf, formatTime, statsOf } from "../src/trainer/cube/stats";
import { STICKERS, applyMoves, invertMoves, isSolved, permutationOf, rotateVec, solvedCube, stickerIndex } from "../src/trainer/cube/engine";
import { DRAG_THRESHOLD, chooseLayerDrag, dragAngle, moveForDrag, snapQuarters, type DragInput } from "../src/trainer/cube/drag";
import type { CubeProgress } from "../src/trainer/cube/types";

describe("Zeiten: Anzeige und Durchschnitte", () => {
  it("Anzeige in Hundertsteln, ab einer Minute mit Minuten", () => {
    expect([formatTime(0), formatTime(9), formatTime(10), formatTime(23415), formatTime(59999), formatTime(60000), formatTime(65230), formatTime(754999)]).toEqual(["0,00", "0,00", "0,01", "23,41", "59,99", "1:00,00", "1:05,23", "12:34,99"]);
    expect(formatTime(-5)).toBe("0,00");
  });
  it("Bestzeit", () => {
    expect(bestOf([])).toBeNull();
    expect(bestOf([30000, 21000, 25000])).toBe(21000);
  });
  it("Ao5: die letzten fünf, beste und schlechteste fallen weg; zu wenige = leer", () => {
    expect(averageOf([10, 20, 30, 40], 5)).toBeNull();
    // neueste zuerst: 10 sek, 12, 14, 30 (schlechteste), 9 (beste) → (10+12+14)/3 = 12
    expect(averageOf([10000, 12000, 14000, 30000, 9000, 99999], 5)).toBe(12000);
    // nur die letzten fünf zählen
    expect(averageOf([10000, 10000, 10000, 10000, 10000, 1], 5)).toBe(10000);
  });
  it("Ao12", () => {
    const t = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 99].map((x) => x * 1000);
    expect(averageOf(t, 12)).toBe(25500); // ohne 20 und 99
    expect(averageOf(t.slice(0, 11), 12)).toBeNull();
  });
  it("Überblick", () => {
    const s = statsOf([30000, 25000, 20000]);
    expect(s).toMatchObject({ count: 3, best: 20000, ao5: null, ao12: null });
    expect(s.mean).toBe(25000);
    expect(statsOf([])).toEqual({ count: 0, best: null, ao5: null, ao12: null, mean: null });
  });
});

describe("Lernpfad", () => {
  const titles = ["Weißes Kreuz", "Weiße Ecken", "Mittlere Kantenstücke", "Gelbes Kreuz", "Gelbe Kante ausrichten", "Gelbe Ecken platzieren", "Gelbe Ecken drehen"];
  it("sieben Schritte mit den vorgesehenen Titeln, höchstens drei Sätze Erklärung", () => {
    expect(STEPS.map((s) => s.title)).toEqual(titles);
    for (const s of STEPS) {
      expect(s.text.split(/[.!?](?:\s|$)/).filter((x) => x.trim()).length, s.title).toBeLessThanOrEqual(3);
      expect(s.algos.length, s.title).toBeGreaterThanOrEqual(1);
    }
  });
  it("jeder Algorithmus ist gültige Notation, IDs sind eindeutig", () => {
    expect(new Set(ALGOS.map((a) => a.id)).size).toBe(ALGOS.length);
    for (const a of ALGOS) { expect(movesOf(a).length, a.id).toBeGreaterThan(0); expect(stepOfAlgo(a.id)).toBeTruthy(); }
  });
  it("Üben: Der Fall (Umkehrung) ist nicht gelöst, der Algorithmus löst ihn wieder", () => {
    for (const a of ALGOS) {
      const start = applyMoves(solvedCube(), setupOf(a));
      expect(isSolved(start), `${a.id}: Fall ist schon gelöst`).toBe(false);
      expect(isSolved(applyMoves(start, movesOf(a))), `${a.id}: löst nicht`).toBe(true);
      expect(setupOf(a)).toEqual(invertMoves(movesOf(a)));
    }
  });
  it("bekannte Eigenschaften der Algorithmen: Kreuz-Algorithmus und Sune lassen die untere Schicht unberührt", () => {
    // Algorithmus „Kanten tauschen“ (Sune + U) und „Kreuz bilden“ verändern keine Aufkleber der unteren Schicht (y = −1), solange man ihn auf einem gelösten Würfel beginnt
    const solved = solvedCube();
    for (const id of ["gelbes-kreuz", "kanten-ausrichten"]) {
      const a = ALGOS.find((x) => x.id === id)!;
      const after = applyMoves(solved, movesOf(a));
      expect(after.slice(27, 36)).toEqual(solved.slice(27, 36)); // Fläche D bleibt
    }
  });
  it("Schrittstand: kann / noch üben / neu", () => {
    const step = STEPS[1]; // zwei Algorithmen
    const p = (state: CubeProgress["state"], id: string): [string, CubeProgress] => [id, { id, state, at: 1 }];
    expect(stepState(step, new Map())).toBe("neu");
    expect(stepState(step, new Map([p("kann", step.algos[0].id)]))).toBe("ueben");
    expect(stepState(step, new Map([p("ueben", step.algos[0].id), p("kann", step.algos[1].id)]))).toBe("ueben");
    expect(stepState(step, new Map(step.algos.map((a) => p("kann", a.id))))).toBe("kann");
  });
});

describe("Ziehen am Würfel", () => {
  // Blick von vorn (Orthogonal): Bildschirm-x = x, Bildschirm-y = −y (Pixel, y nach unten)
  const front = (p: [number, number, number]): [number, number] => [p[0] * 100, -p[1] * 100];
  // Blick von oben: Bildschirm-x = x, Bildschirm-y = z (vorn = unten)
  const top = (p: [number, number, number]): [number, number] => [p[0] * 100, p[2] * 100];
  // Blick von rechts: Bildschirm-x = −z, Bildschirm-y = −y
  const right = (p: [number, number, number]): [number, number] => [-p[2] * 100, -p[1] * 100];
  const move = (inp: Omit<DragInput, "normal"> & { normal: [number, number, number] }, quarters = 1) => {
    const d = chooseLayerDrag(inp);
    expect(d).not.toBeNull();
    const angle = dragAngle(d!, inp.drag);
    return moveForDrag(d!, Math.sign(angle) * quarters);
  };
  const F = (coord: [number, number, number], drag: [number, number]) => ({ normal: [0, 0, 1] as [number, number, number], point: [coord[0], coord[1], 1.5] as [number, number, number], coord, drag, project: front });

  it("Vorderseite: nach rechts ziehen in der obersten Reihe = U', unten = D, Mitte = E", () => {
    expect(move(F([0, 1, 1], [40, 0]))).toBe("U'");
    expect(move(F([0, -1, 1], [40, 0]))).toBe("D");
    expect(move(F([0, 0, 1], [40, 0]))).toBe("E");
    expect(move(F([0, 1, 1], [-40, 0]))).toBe("U");
  });
  it("Vorderseite: nach oben ziehen rechts = R, links = L', Mitte = M'", () => {
    expect(move(F([1, 0, 1], [0, -40]))).toBe("R");
    expect(move(F([1, 0, 1], [0, 40]))).toBe("R'");
    expect(move(F([-1, 0, 1], [0, -40]))).toBe("L'");
    expect(move(F([0, 0, 1], [0, -40]))).toBe("M'");
  });
  it("Oberseite: Ziehen nach rechts in der vorderen Reihe dreht die vordere Schicht (F), in der hinteren die hintere (B')", () => {
    // Auf der Oberseite lässt sich nur eine Seitenschicht drehen, nie die obere selbst.
    const T = (coord: [number, number, number], drag: [number, number]) => ({ normal: [0, 1, 0] as [number, number, number], point: [coord[0], 1.5, coord[2]] as [number, number, number], coord, drag, project: top });
    expect(move(T([0, 1, 1], [40, 0]))).toBe("F");
    expect(move(T([0, 1, -1], [40, 0]))).toBe("B'");
    expect(move(T([1, 1, 0], [0, 40]))).toBe("R'");
  });
  it("Rechte Seite: nach oben ziehen vorn (links im Bild) = F', hinten = B", () => {
    const R = (coord: [number, number, number], drag: [number, number]) => ({ normal: [1, 0, 0] as [number, number, number], point: [1.5, coord[1], coord[2]] as [number, number, number], coord, drag, project: right });
    expect(move(R([1, 0, 1], [0, -40]))).toBe("F'");
    expect(move(R([1, 0, -1], [0, -40]))).toBe("B");
  });
  it("Physik: Die gewählte Drehung bewegt die berührte Stelle zunächst in Richtung des Fingers, und der Zug dreht genau diese Schicht in diesem Sinn (schräge Ansicht, alle sichtbaren Flächen und Aufkleber)", () => {
    const dir = [1, 1.2, 1.6], dl = Math.hypot(...dir), fwd = dir.map((v) => -v / dl);
    const cr = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const rv = cr(fwd, [0, 1, 0]), r = rv.map((v) => v / Math.hypot(...rv)), u = cr(r, fwd);
    const project = (p: [number, number, number]): [number, number] => [100 * (p[0] * r[0] + p[1] * r[1] + p[2] * r[2]), -100 * (p[0] * u[0] + p[1] * u[1] + p[2] * u[2])];
    let checked = 0;
    for (const n of [[0, 1, 0], [1, 0, 0], [0, 0, 1]] as [number, number, number][]) {
      const na = n.findIndex((v) => v !== 0);
      const others = [0, 1, 2].filter((a) => a !== na);
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
        const coord: [number, number, number] = [0, 0, 0]; coord[na] = 1; coord[others[0]] = i; coord[others[1]] = j;
        const point: [number, number, number] = [...coord] as [number, number, number]; point[na] = 1.5;
        for (const drag of [[40, 0], [-40, 0], [0, 40], [0, -40], [30, 30], [-30, 25]] as [number, number][]) {
          const d = chooseLayerDrag({ normal: n, point, coord, drag, project })!;
          const sign = Math.sign(dragAngle(d, drag));
          // 1) infinitesimal: Punkt um +Achse drehen (Vorzeichen des Drehsinns) → Bildschirmbewegung zeigt in Fingerrichtung
          const axisVec: [number, number, number] = [0, 0, 0]; axisVec[d.axis] = 1;
          const t = cr(axisVec, point);
          const a = project(point), b = project([point[0] + sign * t[0] * 0.02, point[1] + sign * t[1] * 0.02, point[2] + sign * t[2] * 0.02]);
          expect((b[0] - a[0]) * drag[0] + (b[1] - a[1]) * drag[1], `${n} ${coord} ${drag}`).toBeGreaterThan(0);
          // 2) der Zug (Schicht und Drehsinn) bewegt genau diesen Aufkleber wie die geometrische Drehung um die +Achse
          const m = moveForDrag(d, sign)!;
          const from = STICKERS.findIndex((s) => s.normal.every((v, k) => v === n[k]) && s.pos.every((v, k) => v === (k === na ? 1 : coord[k])));
          const to = permutationOf(m).findIndex((src) => src === from);
          const expected = stickerIndex(rotateVec(STICKERS[from].pos, d.axis, sign), rotateVec(STICKERS[from].normal, d.axis, sign));
          expect(to, `Zug ${m} bei ${n} ${coord}`).toBe(expected);
          checked++;
        }
      }
    }
    expect(checked).toBe(3 * 9 * 6);
  });
  it("Achse folgt der Ziehrichtung: eher waagerecht = Reihe, eher senkrecht = Spalte", () => {
    expect(chooseLayerDrag(F([0, 0, 1], [30, 8]))!.axis).toBe(1);
    expect(chooseLayerDrag(F([0, 0, 1], [8, 30]))!.axis).toBe(0);
    expect(chooseLayerDrag(F([1, 1, 1], [-30, -4]))!.layer).toBe(1);
  });
  it("erst ab 8 Pixeln Bewegung wird gewählt", () => {
    expect(DRAG_THRESHOLD).toBe(8);
    expect(chooseLayerDrag(F([0, 0, 1], [5, 5]))).toBeNull();
    expect(chooseLayerDrag(F([0, 0, 1], [0, 0]))).toBeNull();
    expect(chooseLayerDrag(F([0, 0, 1], [8, 0]))).not.toBeNull();
  });
  it("live folgt die Schicht dem Finger: Winkel wächst mit dem Weg, 90° entspricht etwa dem Weg einer Würfelkante", () => {
    const d = chooseLayerDrag(F([0, 1, 1], [20, 0]))!;
    const small = Math.abs(dragAngle(d, [20, 0])), big = Math.abs(dragAngle(d, [80, 0]));
    expect(big).toBeCloseTo(small * 4, 5);
    expect(Math.abs(dragAngle(d, [Math.PI / 2 * d.pxPerRad, 0]))).toBeCloseTo(Math.PI / 2, 5);
    expect(dragAngle(d, [-20, 0])).toBeCloseTo(-dragAngle(d, [20, 0]), 8);
  });
  it("Einrasten: nächster 90°-Schritt, kurzer Flick genügt, höchstens 180°", () => {
    const q = Math.PI / 2;
    expect([snapQuarters(0.1 * q), snapQuarters(0.4 * q), snapQuarters(0.6 * q), snapQuarters(-0.6 * q), snapQuarters(1.4 * q), snapQuarters(1.6 * q), snapQuarters(5 * q)]).toEqual([0, 0, 1, -1, 1, 2, 2]);
    expect(snapQuarters(0.15, 4)).toBe(1); // kurzer schneller Flick
    expect(snapQuarters(-0.15, -4)).toBe(-1);
    expect(snapQuarters(0.15, 0.2)).toBe(0); // langsam und kurz: zurück
    expect(snapQuarters(0.5 * q, 3)).toBe(1);
    expect(snapQuarters(0, 10)).toBe(0); // ohne Bewegung kein Zug
  });
  it("0 Vierteldrehungen ergibt keinen Zug", () => {
    const d = chooseLayerDrag(F([0, 0, 1], [30, 0]))!;
    expect(moveForDrag(d, 0)).toBeNull();
    expect(moveForDrag(d, 2)).toMatch(/2$/);
  });
});
