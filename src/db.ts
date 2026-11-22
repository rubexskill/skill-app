import Dexie, { type EntityTable } from "dexie";
import { buildSeed, defaultLists, withDefaults } from "./seed";

// Interne Schlüssel bleiben wie in Version 1 (Backups bleiben kompatibel), die Anzeige ist neu.
export type Status = "rausfinden" | "idee" | "lerne" | "kann";
export type Typ = "skill" | "gewohnheit" | "projekt";
export type Movement = 0 | 1 | 2;
export type Place = "ueberall" | "zuhause" | "draussen" | "gym";
export type Season = "" | "sommer" | "winter";

export const STATUSES: Status[] = ["lerne", "idee", "rausfinden", "kann"];
export const STATUS_LABEL: Record<Status, string> = {
  lerne: "Aktiv",
  idee: "Später",
  rausfinden: "Klären",
  kann: "Geschafft",
};
export const STATUS_ICON: Record<Status, string> = {
  lerne: "st-active",
  idee: "st-later",
  rausfinden: "st-clarify",
  kann: "st-done",
};

export const TYPES: Typ[] = ["skill", "gewohnheit", "projekt"];
export const TYP_LABEL: Record<Typ, string> = { skill: "Skill", gewohnheit: "Gewohnheit", projekt: "Projekt" };

export const MOVEMENT_LABEL: Record<Movement, string> = { 0: "Keine", 1: "Wenig", 2: "Viel" };
export const PLACES: Place[] = ["ueberall", "zuhause", "draussen", "gym"];
export const PLACE_LABEL: Record<Place, string> = { ueberall: "Überall", zuhause: "Zu Hause", draussen: "Draußen", gym: "Gym" };
export const SEASON_LABEL: Record<Season, string> = { "": "Immer", sommer: "Sommer", winter: "Winter" };

export interface LinkItem {
  id: string;
  url: string;
  title: string;
  addedAt: number;
}

export interface NextNote {
  text: string;
  rating: 1 | 2 | 3 | null;
  at: number;
}

export interface Milestone {
  id: string;
  text: string;
  done: boolean;
  doneAt: number | null;
}

export interface Profile {
  about: string;
  why: string;
  tips: string;
  safety: string;
  searches: string[];
  /** true = von KI erstellt und noch nicht bearbeitet */
  ai: boolean;
}

export interface Metric {
  label: string;
  unit: string;
  /** true = höher ist besser */
  higher: boolean;
}

export interface RecordEntry {
  id: string;
  skillId: string;
  value: number;
  at: number;
}

export interface Skill {
  id: string;
  /** Originalname (z. B. aus der Skills.md) */
  name: string;
  /** Kurzer Anzeigetitel */
  title: string;
  kategorie: string;
  typ: Typ;
  status: Status;
  notes: string;
  links: LinkItem[];
  createdAt: number;
  updatedAt: number;
  timerStart: number | null;
  estMinutes: number;
  sessionMinutes: number;
  movement: Movement;
  place: Place;
  material: string[];
  season: Season;
  nextNote: NextNote | null;
  milestones: Milestone[];
  profile: Profile | null;
  metric: Metric | null;
}

export interface Session {
  id: string;
  skillId: string;
  start: number;
  minutes: number;
  rating?: 1 | 2 | 3 | null;
  note?: string;
}

export interface InboxItem {
  id: string;
  text: string;
  createdAt: number;
}

export interface HabitCheck {
  /** `${skillId}|${YYYY-MM-DD}` */
  id: string;
  skillId: string;
  date: string;
}

export interface AppIdea {
  id: string;
  name: string;
  note: string;
  done: boolean;
  order: number;
}

export interface TodoList {
  id: string;
  name: string;
  order: number;
}

export interface Todo {
  id: string;
  listId: string;
  text: string;
  /** YYYY-MM-DD oder null */
  due: string | null;
  done: boolean;
  doneAt: number | null;
  createdAt: number;
}

export class SkillDB extends Dexie {
  skills!: EntityTable<Skill, "id">;
  sessions!: EntityTable<Session, "id">;
  inbox!: EntityTable<InboxItem, "id">;
  checks!: EntityTable<HabitCheck, "id">;
  apps!: EntityTable<AppIdea, "id">;
  todos!: EntityTable<Todo, "id">;
  lists!: EntityTable<TodoList, "id">;
  records!: EntityTable<RecordEntry, "id">;

  constructor() {
    // Ohne optimistischen Abfrage-Cache: Listen und Statistik lesen immer direkt aus der Datenbank.
    super("skill-app", { cache: "disabled" });
    this.version(1).stores({
      skills: "id, name, kategorie, typ, status, createdAt",
      sessions: "id, skillId, start",
      inbox: "id, createdAt",
      checks: "id, skillId, date",
      apps: "id, order",
    });

    // Version 2: neue Felder für Skills, To-dos mit Listen. Bestehende Daten werden nur ergänzt.
    this.version(2)
      .stores({
        todos: "id, listId, due, createdAt",
        lists: "id, order",
      })
      .upgrade(async (tx) => {
        await tx.table("skills").toCollection().modify((s: Partial<Skill>) => {
          Object.assign(s, withDefaults(s));
        });
        await tx.table("lists").bulkAdd(defaultLists());
      });

    // Version 3: Steckbriefe, Meilensteine, Messwerte und Rekorde. Bestehendes bleibt.
    this.version(3)
      .stores({ records: "id, skillId, at" })
      .upgrade(async (tx) => {
        await tx.table("skills").toCollection().modify((s: Partial<Skill>) => {
          Object.assign(s, withDefaults(s));
        });
      });

    // Nur bei einer ganz neuen Datenbank.
    this.on("populate", (tx) => {
      const seed = buildSeed();
      void tx.table("skills").bulkAdd(seed.skills);
      void tx.table("sessions").bulkAdd(seed.sessions);
      void tx.table("apps").bulkAdd(seed.apps);
      void tx.table("lists").bulkAdd(defaultLists());
    });
  }
}

export const db = new SkillDB();

// Öffnet ein anderes Fenster (z. B. nach einem Update) eine neuere Datenbank-Version,
// wird dieses Fenster neu geladen statt mit veraltetem Stand weiterzulaufen.
db.on("versionchange", () => {
  db.close();
  window.location.reload();
  return false;
});

// Entwicklungsserver: Ändert sich diese Datei, die Seite komplett neu laden
// (sonst könnten zwei Datenbank-Verbindungen mit unterschiedlichem Stand parallel laufen).
if (import.meta.hot) import.meta.hot.accept(() => window.location.reload());

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
