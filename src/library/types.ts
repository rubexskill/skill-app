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
