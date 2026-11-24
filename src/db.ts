import Dexie, { type EntityTable } from "dexie";
import { buildSeed, defaultLists, withDefaults } from "./seed";
import { backfillUnsorted } from "./backfill";
import { moveToFirstUnit } from "./unitsMigrate";

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

/** Änderungszeit (ms) – wird automatisch gesetzt und für den Abgleich zwischen Geräten genutzt. */
export interface Synced {
  upd?: number;
}

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

export interface RecordEntry extends Synced {
  id: string;
  skillId: string;
  value: number;
  at: number;
  unitId?: string;
}

export interface Skill extends Synced {
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
  test: ExamTest | null;
  /** Aus der Inbox einsortiert, noch nicht aufgeräumt */
  unsorted?: boolean;
  /** Unterpunkte („Stücke“) an: der Skill hat eigene Unterpunkte mit Abschnitten und Clips */
  useUnits?: boolean;
  /** Läuft der Timer für einen Unterpunkt, steht hier dessen id (Timer selbst: timerStart) */
  timerUnit?: string | null;
}

export interface ExamQuestion {
  id: string;
  text: string;
  options: string[];
  /** Index der richtigen Antwort */
  answer: number;
  explanation: string;
}

export interface ExamTask {
  id: string;
  text: string;
  criteria: string[];
}

export interface ExamAttempt {
  at: number;
  percent: number;
  passed: boolean;
}

export interface ExamTest {
  title: string;
  passPercent: number;
  questions: ExamQuestion[];
  tasks: ExamTask[];
  attempts: ExamAttempt[];
  createdAt: number;
}

export interface Session extends Synced {
  id: string;
  skillId: string;
  start: number;
  minutes: number;
  rating?: 1 | 2 | 3 | null;
  note?: string;
  /** Session gehört zu einem Unterpunkt (Skill-Summe bleibt über skillId) */
  unitId?: string;
}

export interface InboxItem extends Synced {
  id: string;
  text: string;
  createdAt: number;
}

export interface HabitCheck extends Synced {
  /** `${skillId}|${YYYY-MM-DD}` */
  id: string;
  skillId: string;
  date: string;
}

export interface AppIdea extends Synced {
  id: string;
  name: string;
  note: string;
  done: boolean;
  order: number;
}

export interface TodoList extends Synced {
  id: string;
  name: string;
  order: number;
}

export interface Todo extends Synced {
  id: string;
  listId: string;
  text: string;
  /** YYYY-MM-DD oder null */
  due: string | null;
  done: boolean;
  doneAt: number | null;
  createdAt: number;
  note?: string;
  unsorted?: boolean;
}

export interface Term extends Synced {
  id: string;
  term: string;
  /** Erklärung in eigenen Worten */
  explanation: string;
  understood: boolean;
  understoodAt: number | null;
  links: LinkItem[];
  createdAt: number;
  note?: string;
  unsorted?: boolean;
}

export interface Wish extends Synced {
  id: string;
  name: string;
  url: string;
  note: string;
  bought: boolean;
  boughtAt: number | null;
  createdAt: number;
  unsorted?: boolean;
}

export interface Card extends Synced {
  id: string;
  skillId: string;
  front: string;
  back: string;
  createdAt: number;
  /** Fällig ab (ms) */
  due: number;
  /** Abstand in Tagen */
  interval: number;
  ease: number;
  reps: number;
  lapses: number;
}

/** Löschvermerk: damit Gelöschtes beim Abgleich gelöscht bleibt */
export interface Tomb {
  /** `${tabelle}:${id}` */
  id: string;
  table: string;
  itemId: string;
  at: number;
}

export type UnitStatus = "lerne" | "kann" | "auffrischen";
export const UNIT_STATUSES: UnitStatus[] = ["lerne", "auffrischen", "kann"];
export const UNIT_STATUS_LABEL: Record<UnitStatus, string> = { lerne: "Lerne ich", auffrischen: "Auffrischen", kann: "Kann ich" };

/** Unterpunkt eines Skills, z. B. ein Klavierstück. */
export interface Unit extends Synced {
  id: string;
  skillId: string;
  title: string;
  status: UnitStatus;
  note: string;
  nextNote: NextNote | null;
  order: number;
  createdAt: number;
}

export interface PartNote {
  id: string;
  text: string;
  at: number;
}

/** Metadaten eines Clips. Das Video selbst liegt nur lokal in `clipBlobs` (nie im Backup, nie online). */
export interface ClipMeta {
  id: string;
  name: string;
  size: number;
  addedAt: number;
  duration?: number;
  /** Schleife von … bis … Sekunden */
  start?: number;
  end?: number;
}

/** Sollnoten für spätere Erkennung (noch ungenutzt): Tonhöhe als MIDI-Nummer, Abstand zum nächsten Ton in ms. */
export interface NoteEvent {
  midi: number;
  gapMs: number;
}

/** Benannter Abschnitt eines Unterpunkts (z. B. „Strophe“, „Takt 12–16“). */
export interface Part extends Synced {
  id: string;
  unitId: string;
  name: string;
  order: number;
  /** „sitzt“ */
  solid: boolean;
  notes: PartNote[];
  links: LinkItem[];
  clips: ClipMeta[];
  /** Wie oft die Clip-Schleife durchlief (Übungszähler) */
  loops: number;
  /** Vorbereitet für eine spätere Notenfolge */
  sequence?: NoteEvent[];
  createdAt: number;
}

export interface ClipBlob {
  id: string;
  blob: Blob;
}

export const SYNC_TABLES = ["skills", "sessions", "inbox", "checks", "apps", "todos", "lists", "records", "terms", "wishes", "cards", "units", "parts"] as const;
export type SyncTable = (typeof SYNC_TABLES)[number];

let hooksOff = false;
/** Führt `fn` ohne automatische Änderungszeiten/Löschvermerke aus (für Abgleich und Backup-Import). */
export async function withoutHooks<T>(fn: () => Promise<T>): Promise<T> {
  hooksOff = true;
  try {
    return await fn();
  } finally {
    hooksOff = false;
  }
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
  terms!: EntityTable<Term, "id">;
  wishes!: EntityTable<Wish, "id">;
  cards!: EntityTable<Card, "id">;
  units!: EntityTable<Unit, "id">;
  parts!: EntityTable<Part, "id">;
  clipBlobs!: EntityTable<ClipBlob, "id">;
  tombs!: EntityTable<Tomb, "id">;

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

    // Version 4: Begriffe, Wunschliste, Karteikarten, Abschlusstest; Änderungszeiten + Löschvermerke für den Abgleich.
    this.version(4)
      .stores({
        terms: "id, createdAt",
        wishes: "id, createdAt",
        cards: "id, skillId, due",
        tombs: "id",
      })
      .upgrade(async (tx) => {
        await tx.table("skills").toCollection().modify((s: Partial<Skill>) => {
          Object.assign(s, withDefaults(s));
        });
        for (const name of ["skills", "sessions", "inbox", "checks", "apps", "todos", "lists", "records"]) {
          await tx.table(name).toCollection().modify((r: Record<string, number | undefined>) => {
            if (r.upd == null) r.upd = r.updatedAt ?? r.createdAt ?? r.start ?? r.at ?? 0;
          });
        }
      });

    // Version 5: Markierung „Unaufgeräumt“ (nicht indiziert, nur neue Felder). Rückwirkend gesetzt, siehe backfill.ts.
    this.version(5)
      .stores({})
      .upgrade(async (tx) => {
        await backfillUnsorted({ skills: tx.table("skills"), todos: tx.table("todos"), terms: tx.table("terms"), wishes: tx.table("wishes") });
      });

    // Version 6: Unterpunkte, Abschnitte, Clips. Bisherige Übezeit des Skills „Klavierstück“ wandert in den ersten Unterpunkt.
    this.version(6)
      .stores({
        sessions: "id, skillId, start, unitId",
        units: "id, skillId, createdAt",
        parts: "id, unitId, order",
        clipBlobs: "id",
      })
      .upgrade(async (tx) => {
        await moveToFirstUnit({ skills: tx.table("skills"), sessions: tx.table("sessions"), records: tx.table("records"), units: tx.table("units") });
      });

    // Änderungszeit setzen und Löschungen vermerken – automatisch für alle abgleichbaren Tabellen.
    for (const name of SYNC_TABLES) {
      const t = this.table(name) as unknown as { hook: (n: string, fn: unknown) => void };
      t.hook("creating", (_pk: unknown, obj: Record<string, unknown>) => {
        if (!hooksOff) obj.upd = Date.now();
      });
      t.hook("updating", (mods: Record<string, unknown>) => {
        if (!hooksOff && !("upd" in mods)) return { upd: Date.now() };
        return undefined;
      });
      t.hook("deleting", function (this: { onsuccess?: () => void }, pk: unknown) {
        if (hooksOff) return;
        this.onsuccess = () => {
          setTimeout(() => void db.tombs.put({ id: `${name}:${String(pk)}`, table: name, itemId: String(pk), at: Date.now() }), 0);
        };
      });
    }

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
