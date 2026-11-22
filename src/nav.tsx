import { createContext, useContext } from "react";

export type Section = "overview" | "heute" | "todos" | "inbox" | "gewohnheiten" | "projekte" | "statistik" | "mehr";

export type Route =
  | { type: "skill"; id: string }
  | { type: "project"; id: string }
  | { type: "category"; name: string }
  | { type: "section"; id: Section }
  | { type: "apps" };

export interface NavCtx {
  push: (r: Route) => void;
  backLabel: string;
  /** iPad: aktuell rechts angezeigter Skill (nur in Listen mit drei Spalten) */
  selectedSkill: string | null;
  wide: boolean;
}

export const NavContext = createContext<NavCtx>({ push: () => {}, backLabel: "Zurück", selectedSkill: null, wide: false });
export const useNav = () => useContext(NavContext);

/** Alle Einträge statt einer einzelnen Kategorie */
export const ALL = "*";

/** Kategorien, die eigene Bereiche sind und nicht als Kachel erscheinen */
export const isAreaCategory = (k: string) => k === "Gewohnheiten" || k === "Projekte & Besorgungen";
