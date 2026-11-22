// Leere Startdaten für die öffentliche Version (GitHub Pages).
// Die persönlichen Daten liegen in src/seed/private/ und werden nicht veröffentlicht.

/** [Originalname, Kurztitel, Stunden bis man es kann, Minuten pro Einheit, Bewegung, Ort, Material, Jahreszeit] */
export type MetaRow = [string, string, number, number, 0 | 1 | 2, "u" | "h" | "d" | "g", string?, ("s" | "w")?];

/** Steckbrief: a Worum · w Warum · m Meilensteine · t Tipps · s Suchbegriffe · x Sicherheit · r Messwert */
export interface P {
  a: string;
  w?: string;
  m?: string[];
  t?: string;
  s?: string[];
  x?: string;
  r?: [string, string, 0 | 1];
}

export const HAS_SEED: boolean = false;
export const SKILLS_MD: string = "";
export const APPS_MD: string = "";
export const META_ROWS: MetaRow[] = [];
export const PROFILES: Record<string, P> = {};
