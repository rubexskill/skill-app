import { describe, expect, it } from "vitest";
import { IDLE, step, type Ev, type Fx, type GState } from "../src/trainer/cube/gesture";
import { DEFAULT_PITCH, DEFAULT_YAW, DEG, PITCH_LIMIT, blendToDefault, clampPitch, clampZoom, normalizeYaw, rotateView } from "../src/trainer/cube/view";

const run = (events: Ev[], start: GState = IDLE) => {
  let g = start; const fx: Fx[] = [];
  for (const e of events) { const r = step(g, e); g = r.g; fx.push(...r.fx); }
  return { g, fx };
};
const down = (id: number, o: Partial<Extract<Ev, { t: "down" }>> = {}): Ev => ({ t: "down", id, stale: false, onCube: true, busy: false, ...o });
const up = (id: number): Ev => ({ t: "up", id });

describe("Gestenautomat", () => {
  it("einzelner Finger: auf dem Würfel → pending → Schicht → Ende mit Zug", () => {
    const r = run([down(1), { t: "layerStart" }, up(1)]);
    expect(r.g).toEqual(IDLE);
    expect(r.fx).toEqual(["endLayerCommit"]);
  });
  it("Hintergrund: Ansicht, am Ende Trägheit", () => {
    const r = run([down(1, { onCube: false }), up(1)]);
    expect(r.g).toEqual(IDLE);
    expect(r.fx).toEqual(["startView", "endViewInertia"]);
  });
  it("Würfel berührt, während er sich bewegt: ignoriert bis zum Loslassen", () => {
    const r = run([down(1, { busy: true })]);
    expect(r.g.mode).toBe("ignored");
    expect(run([up(1)], r.g).g).toEqual(IDLE);
  });
  it("Pinch, dann sofort Ziehen: neuer Hauptfinger funktioniert", () => {
    const a = run([down(1), down(2), up(1), up(2)]);
    expect(a.g).toEqual(IDLE);
    const b = run([down(1, { onCube: false })], a.g);
    expect(b.g.mode).toBe("ansicht");
  });
  it("Ziehen, dann Pinch: Schicht wird verworfen (kein Zug), danach zoomen", () => {
    const r = run([down(1), { t: "layerStart" }, down(2)]);
    expect(r.g.mode).toBe("zoom");
    expect(r.fx).toEqual(["endLayerCancel", "startZoom"]);
    expect(run([up(2), up(1)], r.g).g).toEqual(IDLE);
  });
  it("Ansicht, dann zweiter Finger: Ansicht endet ohne Trägheit", () => {
    const r = run([down(1, { onCube: false }), down(2)]);
    expect(r.fx).toEqual(["startView", "endViewStop", "startZoom"]);
  });
  it("pointercancel mitten in jeder Geste führt zurück nach idle", () => {
    for (const start of [[down(1)], [down(1), { t: "layerStart" } as Ev], [down(1, { onCube: false })], [down(1), down(2)], [down(1, { busy: true })]]) {
      const r = run([...start, { t: "cancel" }]);
      expect(r.g).toEqual(IDLE);
      expect(run([down(1)], r.g).g.mode).toBe("pending");
    }
  });
  it("zwei Finger in beiden Reihenfolgen loslassen", () => {
    for (const order of [[1, 2], [2, 1]]) {
      const r = run([down(1), down(2), up(order[0]), up(order[1])]);
      expect(r.g).toEqual(IDLE);
      expect(run([down(1)], r.g).g.mode).toBe("pending");
    }
  });
  it("verlorenes pointerup: der nächste Hauptfinger setzt alles zurück statt als zweiter Finger zu zählen", () => {
    const stuck = run([down(1), down(2), up(2)]).g; // up von Finger 1 ging verloren
    expect(stuck.mode).toBe("ignored");
    const r = run([down(3, { stale: true })], stuck);
    expect(r.g.mode).toBe("pending");
    expect(r.g.ids).toEqual([3]);
    const s2 = run([down(1, { onCube: false })]).g; // ein Finger „hängt“ im Ansicht-Modus
    const r2 = run([down(4, { stale: true })], s2);
    expect(r2.g.mode).toBe("pending");
    expect(r2.fx).toEqual(["endViewStop"]);
  });
  it("doppeltes down derselben ID setzt zurück", () => {
    const r = run([down(1), { t: "layerStart" }, down(1)]);
    expect(r.g.mode).toBe("pending");
    expect(r.fx).toEqual(["endLayerCancel"]);
  });
  it("abort (Fokusverlust, Verlassen, Verstecken) beendet jede Geste", () => {
    for (const start of [[down(1), { t: "layerStart" } as Ev], [down(1), down(2)]]) {
      const r = run([...start, { t: "abort" }]);
      expect(r.g).toEqual(IDLE);
    }
  });
  it("dritter Finger stört den Pinch nicht; Loslassen führt immer nach idle", () => {
    const r = run([down(1), down(2), down(3), up(3), up(1), up(2)]);
    expect(r.g).toEqual(IDLE);
  });
  it("Zufallsfolgen enden nach allem Loslassen immer in idle, und ein neuer Finger startet nie im Zoom", () => {
    let seed = 1;
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    for (let n = 0; n < 500; n++) {
      let g: GState = IDLE;
      const events: Ev[] = [];
      for (let k = 0; k < 25; k++) {
        const r = rnd();
        const id = 1 + Math.floor(rnd() * 3);
        if (r < 0.4) events.push(down(id, { stale: rnd() < 0.2, onCube: rnd() < 0.5, busy: rnd() < 0.2 }));
        else if (r < 0.55) events.push({ t: "layerStart" });
        else if (r < 0.85) events.push(up(id));
        else if (r < 0.93) events.push({ t: "cancel" });
        else events.push({ t: "abort" });
      }
      for (const e of events) g = step(g, e).g;
      g = step(g, { t: "cancel" }).g;
      expect(g).toEqual(IDLE);
      expect(step(g, down(1)).g.mode).toBe("pending");
    }
  });
});

describe("Ansicht (Drehteller)", () => {
  it("Standardansicht ist ungefähr 10° seitlich und 10° von oben", () => {
    expect(DEFAULT_YAW / DEG).toBeCloseTo(-10, 5);
    expect(DEFAULT_PITCH / DEG).toBeCloseTo(10, 5);
  });
  it("Nicken ist auf ±80° begrenzt, seitlich dreht es beliebig oft", () => {
    expect(clampPitch(3)).toBeCloseTo(PITCH_LIMIT, 8);
    expect(clampPitch(-3)).toBeCloseTo(-PITCH_LIMIT, 8);
    let v = { yaw: 0, pitch: 0 };
    for (let i = 0; i < 100; i++) v = rotateView(v, 0.7, 0.4);
    expect(v.pitch).toBeLessThanOrEqual(PITCH_LIMIT + 1e-9);
    expect(Math.abs(v.yaw)).toBeLessThanOrEqual(Math.PI + 1e-9);
  });
  it("Zurücksetzen nimmt den kürzesten Weg und endet genau in der Standardansicht", () => {
    const start = { yaw: -150 * DEG, pitch: -60 * DEG };
    const mid = blendToDefault(start, 0.5);
    expect(Math.abs(normalizeYaw(DEFAULT_YAW - start.yaw))).toBeLessThan(Math.PI);
    // −150° → −10° sind 140° im Uhrzeigersinn, nicht 220° andersherum
    expect(mid.yaw).toBeCloseTo(-80 * DEG, 8);
    const end = blendToDefault(start, 1);
    expect(end.yaw).toBeCloseTo(DEFAULT_YAW, 8);
    expect(end.pitch).toBeCloseTo(DEFAULT_PITCH, 8);
  });
  it("Zoom bleibt begrenzt", () => {
    expect(clampZoom(0.1)).toBe(0.65);
    expect(clampZoom(9)).toBe(1.7);
  });
});
