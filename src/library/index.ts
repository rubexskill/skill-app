// Öffentliche Skill-Bibliothek: Originalname, Kurztitel, Schätzwerte und Steckbriefe (Schlüssel = Kurztitel).
// Enthält KEINE persönlichen Daten. Die Kategorien/Typen stehen in Skills.md (Überschriften).
import { META_ROWS as ROWS } from "./meta";
import { PROFILES_1 } from "./profiles1";
import { PROFILES_2 } from "./profiles2";
import { PROFILES_3 } from "./profiles3";
import type { MetaRow, P } from "./types";

export type { MetaRow, P };
export { default as LIBRARY_MD } from "./Skills.md?raw";
export const META_ROWS: MetaRow[] = ROWS;
export const PROFILES: Record<string, P> = { ...PROFILES_1, ...PROFILES_2, ...PROFILES_3 };
