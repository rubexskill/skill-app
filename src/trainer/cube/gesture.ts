// Zustandsautomat für die Bedienung des 3D-Würfels. Rein und ohne Browser, damit sich jede Reihenfolge von Fingern testen lässt.
// Zustände: idle (nichts), pending (Finger auf dem Würfel, noch offen ob Schicht), schicht (eine Schicht wird gedreht),
// ansicht (Hintergrund: Würfel drehen), zoom (zwei Finger), ignored (Finger, der nichts auslösen soll, bis alle oben sind).
// Jedes Ende (up, cancel, abort bei Fokusverlust/Verlassen/Verstecken) führt sauber zurück nach idle.

export type Mode = "idle" | "pending" | "schicht" | "ansicht" | "zoom" | "ignored";
export interface GState { mode: Mode; ids: number[] }
export type Ev =
  | { t: "down"; id: number; /** der Berührungsbeginn kommt, obwohl alte Finger lange nichts mehr gemeldet haben: ein Loslassen ging verloren */ stale: boolean; onCube: boolean; busy: boolean }
  | { t: "layerStart" }
  | { t: "up"; id: number }
  | { t: "cancel" }
  | { t: "abort" };
export type Fx = "endLayerCommit" | "endLayerCancel" | "endViewInertia" | "endViewStop" | "startView" | "startZoom" | "endZoom" | "tap";

export const IDLE: GState = { mode: "idle", ids: [] };

/** Laufende Geste verwerfen (ohne Zug, ohne Trägheit) */
function drop(mode: Mode): Fx[] {
  if (mode === "schicht") return ["endLayerCancel"];
  if (mode === "ansicht") return ["endViewStop"];
  if (mode === "zoom") return ["endZoom"];
  return [];
}

export function step(g: GState, e: Ev): { g: GState; fx: Fx[] } {
  switch (e.t) {
    case "down": {
      let fx: Fx[] = [];
      let cur = g;
      // Ein neuer Finger, obwohl alte „offen“ sind und sich lange nicht gemeldet haben (oder gleiche ID): ein up ging verloren. Alles zurücksetzen.
      if ((e.stale && cur.ids.length > 0) || cur.ids.includes(e.id)) { fx = drop(cur.mode); cur = IDLE; }
      if (cur.ids.length === 0) {
        if (e.onCube) return { g: { mode: e.busy ? "ignored" : "pending", ids: [e.id] }, fx };
        return { g: { mode: "ansicht", ids: [e.id] }, fx: [...fx, "startView"] };
      }
      // zweiter Finger: Schicht oder Ansicht beenden, zoomen
      if (cur.mode === "zoom") return { g: { mode: "zoom", ids: [...cur.ids, e.id] }, fx };
      fx = [...fx, ...drop(cur.mode), "startZoom"];
      return { g: { mode: "zoom", ids: [...cur.ids, e.id] }, fx };
    }
    case "layerStart":
      return g.mode === "pending" ? { g: { ...g, mode: "schicht" }, fx: [] } : { g, fx: [] };
    case "up": {
      if (!g.ids.includes(e.id)) return { g, fx: [] };
      const ids = g.ids.filter((i) => i !== e.id);
      if (g.mode === "zoom") {
        if (ids.length === 0) return { g: IDLE, fx: ["endZoom"] };
        return { g: { mode: ids.length >= 2 ? "zoom" : "ignored", ids }, fx: ids.length >= 2 ? [] : ["endZoom"] };
      }
      if (ids.length > 0) return { g: { ...g, ids }, fx: [] };
      const fx: Fx[] = g.mode === "schicht" ? ["endLayerCommit"] : g.mode === "ansicht" ? ["endViewInertia"] : g.mode === "pending" ? ["tap"] : [];
      return { g: IDLE, fx };
    }
    case "cancel":
    case "abort":
      return { g: IDLE, fx: drop(g.mode) };
  }
}
