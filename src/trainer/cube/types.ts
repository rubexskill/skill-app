/** Eine gespeicherte Lösungszeit (Tabelle `cubeTimes`) */
export interface CubeTime {
  id: string;
  /** Zeit in Millisekunden */
  ms: number;
  at: number;
  /** Mischung als Notation */
  scramble: string;
  upd?: number;
}

/** Fortschritt eines Algorithmus im Lernpfad (Tabelle `cubeProgress`, id = Algorithmus-ID) */
export interface CubeProgress {
  id: string;
  state: "kann" | "ueben";
  at: number;
  upd?: number;
}
