// Backup-Datei prüfen, bevor etwas überschrieben wird: kaputte oder zu große Dateien, neuere Versionen, doppelte oder unbrauchbare Zeilen.
// Reine Funktionen ohne Datenbank, damit sich alle Härtefälle testen lassen.
import type { Session, Skill } from "./db";

export const BACKUP_FORMAT = "skill-app-backup";
export const BACKUP_VERSION = 5;
/** Größer als das ist keine sinnvolle Sicherung dieser App (Videos stehen nie darin); schützt den Arbeitsspeicher. */
export const MAX_BACKUP_BYTES = 200 * 1024 * 1024;

export type Backup = {
  skills: Partial<Skill>[];
  sessions?: Session[];
  inbox?: unknown[];
  checks?: unknown[];
  apps?: unknown[];
  todos?: unknown[];
  lists?: unknown[];
  records?: unknown[];
  terms?: unknown[];
  wishes?: unknown[];
  cards?: unknown[];
  units?: unknown[];
  parts?: unknown[];
  recordings?: unknown[];
  flagStats?: unknown[];
  cubeTimes?: unknown[];
  cubeProgress?: unknown[];
  tombs?: unknown[];
  exportedAt: string;
  version?: number;
};

export const BACKUP_TABLES = ["skills", "sessions", "inbox", "checks", "apps", "todos", "lists", "records", "terms", "wishes", "cards", "units", "parts", "recordings", "flagStats", "cubeTimes", "cubeProgress", "tombs"] as const;
type TableKey = (typeof BACKUP_TABLES)[number];

export const TABLE_LABEL: Record<TableKey, string> = {
  skills: "Einträge", sessions: "Sessions", inbox: "Inbox", checks: "Haken", apps: "Apps", todos: "To-dos", lists: "Listen", records: "Rekorde", terms: "Begriffe",
  wishes: "Wünsche", cards: "Karteikarten", units: "Stücke", parts: "Abschnitte", recordings: "Aufnahmen", flagStats: "Flaggen-Lernstand", cubeTimes: "Würfelzeiten",
  cubeProgress: "Anleitungs-Stand", tombs: "Löschvermerke",
};

export type ParsedBackup =
  | { ok: true; data: Backup; dropped: number; duplicates: number; version: number }
  | { ok: false; message: string };

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);

export function parseBackupText(text: string, size = text.length): ParsedBackup {
  if (size > MAX_BACKUP_BYTES) return { ok: false, message: `Die Datei ist mit ${Math.round(size / 1048576)} MB viel zu groß für ein Backup dieser App.` };
  if (!text.trim()) return { ok: false, message: "Die Datei ist leer." };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, message: "Die Datei ist beschädigt oder unvollständig (kein gültiges JSON). Es wurde nichts geändert." };
  }
  if (!isObj(raw) || raw.format !== BACKUP_FORMAT || !Array.isArray(raw.skills)) return { ok: false, message: "Das ist keine Backup-Datei dieser App." };
  const version = typeof raw.version === "number" ? raw.version : 1;
  if (version > BACKUP_VERSION) return { ok: false, message: "Dieses Backup stammt aus einer neueren Version der App. Schließe die App, öffne sie neu (Update) und versuche es noch einmal." };
  let dropped = 0, duplicates = 0;
  const out: Record<string, unknown> = { ...raw };
  for (const key of BACKUP_TABLES) {
    const rows = raw[key];
    if (rows === undefined || rows === null) { if (key === "skills") out.skills = []; continue; }
    if (!Array.isArray(rows)) return { ok: false, message: `Die Tabelle „${TABLE_LABEL[key]}“ in der Datei ist beschädigt. Es wurde nichts geändert.` };
    const byId = new Map<string, unknown>();
    for (const r of rows) {
      if (!isObj(r) || typeof r.id !== "string" || !r.id) { dropped++; continue; }
      if (byId.has(r.id)) duplicates++;
      byId.set(r.id, r); // bei doppelten IDs gewinnt die letzte Zeile
    }
    out[key] = [...byId.values()];
  }
  if (typeof out.exportedAt !== "string" || Number.isNaN(Date.parse(out.exportedAt))) out.exportedAt = "";
  return { ok: true, data: out as unknown as Backup, dropped, duplicates, version };
}

export function countsOf(data: Partial<Record<TableKey, unknown[] | undefined>>): Record<TableKey, number> {
  const c = {} as Record<TableKey, number>;
  for (const k of BACKUP_TABLES) c[k] = (data[k] ?? []).length;
  return c;
}

const SHOWN: TableKey[] = ["skills", "todos", "sessions", "units", "recordings", "cubeTimes", "flagStats"];
const phrase = (c: Record<TableKey, number>) => SHOWN.filter((k) => c[k] > 0).map((k) => `${c[k]} ${TABLE_LABEL[k]}`).join(", ") || "nichts";

/** Zusammenfassung vor dem Überschreiben: was in der Datei steht und was dafür auf diesem Gerät ersetzt wird. */
export function describeBackup(file: Backup, current: Record<TableKey, number>, extra?: { dropped: number; duplicates: number }): string {
  const when = file.exportedAt ? new Date(file.exportedAt).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" }) : "unbekanntem Datum";
  const notes: string[] = [];
  if (extra?.duplicates) notes.push(`${extra.duplicates} doppelte Zeile${extra.duplicates === 1 ? "" : "n"} zusammengelegt`);
  if (extra?.dropped) notes.push(`${extra.dropped} unbrauchbare Zeile${extra.dropped === 1 ? "" : "n"} übersprungen`);
  return `Backup vom ${when}: ${phrase(countsOf(file))}.\nAuf diesem Gerät sind jetzt ${phrase(current)}; das wird ersetzt.${notes.length ? `\n(${notes.join(", ")})` : ""}`;
}
