import { db, SYNC_TABLES, withoutHooks, type Skill, type SyncTable, type Tomb } from "./db";
import { withDefaults } from "./seed";

/**
 * Abgleich zwischen Geräten per Datei:
 * - Jede Zeile hat eine Änderungszeit (upd). Beim Zusammenführen gewinnt die neuere.
 * - Neue Zeilen (Sessions, To-dos, Häkchen …) von beiden Seiten bleiben erhalten.
 * - Gelöschtes wird als Löschvermerk mitgeführt und bleibt gelöscht, außer es wurde danach neu angelegt/bearbeitet.
 * - Ein laufender Timer bleibt auf dem Gerät, auf dem er läuft.
 */

const SYNC_FORMAT = "skill-app-sync";

type Row = { id: string; upd?: number; [k: string]: unknown };

export interface ParsedSync {
  tables: Partial<Record<SyncTable, Row[]>>;
  tombs: Tomb[];
  exportedAt: string;
}

export async function exportSync(): Promise<Blob> {
  const tables: Record<string, unknown[]> = {};
  for (const name of SYNC_TABLES) {
    const rows = (await db.table(name).toArray()) as Row[];
    tables[name] = name === "skills" ? rows.map((s) => ({ ...s, timerStart: null, timerUnit: null })) : rows;
  }
  const data = { format: SYNC_FORMAT, version: 1, exportedAt: new Date().toISOString(), tables, tombs: await db.tombs.toArray() };
  return new Blob([JSON.stringify(data)], { type: "application/json" });
}

export function syncFileName(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `skills-abgleich-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
}

/** Liest eine Sync-Datei – oder ein Backup, das sich genauso zusammenführen lässt. */
export function parseSync(text: string): ParsedSync {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Die Datei konnte nicht gelesen werden.");
  }
  const isSync = data?.format === SYNC_FORMAT;
  const isBackup = data?.format === "skill-app-backup";
  if (!isSync && !isBackup) throw new Error("Das ist keine Sync-Datei dieser App.");
  const source = (isSync ? data.tables : data) as Record<string, unknown>;
  const tables: ParsedSync["tables"] = {};
  for (const name of SYNC_TABLES) {
    const rows = source?.[name];
    if (Array.isArray(rows)) tables[name] = rows.filter((r): r is Row => !!r && typeof r === "object" && typeof (r as Row).id === "string");
  }
  const tombs = Array.isArray(data.tombs) ? (data.tombs as Tomb[]).filter((t) => t && typeof t.id === "string" && typeof t.at === "number") : [];
  return { tables, tombs, exportedAt: typeof data.exportedAt === "string" ? data.exportedAt : "" };
}

export interface SyncReport {
  added: Partial<Record<SyncTable, number>>;
  updated: Partial<Record<SyncTable, number>>;
  removed: Partial<Record<SyncTable, number>>;
  highlights: string[];
  total: number;
}

/** Inhalt ohne Änderungszeit und ohne laufenden Timer, mit sortierten Schlüsseln */
function content(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(content).join(",")}]`;
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o).filter((k) => k !== "upd" && k !== "timerStart").sort().map((k) => `${JSON.stringify(k)}:${content(o[k])}`).join(",")}}`;
  }
  return JSON.stringify(v) ?? "null";
}

const bump = (o: Partial<Record<SyncTable, number>>, k: SyncTable) => {
  o[k] = (o[k] ?? 0) + 1;
};

/** Tabellen mit Verweis auf einen Skill – verwaiste Zeilen werden nach dem Abgleich entfernt */
const CHILDREN: SyncTable[] = ["sessions", "checks", "records", "cards", "units"];

export async function applySync(p: ParsedSync): Promise<SyncReport> {
  const report: SyncReport = { added: {}, updated: {}, removed: {}, highlights: [], total: 0 };
  const added: { table: SyncTable; row: Row }[] = [];

  await withoutHooks(async () => {
    const tables = [...SYNC_TABLES.map((n) => db.table(n)), db.tombs];
    await db.transaction("rw", tables, async () => {
      // 1. Löschvermerke zusammenführen (der spätere gewinnt)
      const tombs = new Map((await db.tombs.toArray()).map((t) => [t.id, t]));
      for (const t of p.tombs) {
        const cur = tombs.get(t.id);
        if (!cur || t.at > cur.at) {
          tombs.set(t.id, t);
          await db.tombs.put(t);
        }
      }

      for (const name of SYNC_TABLES) {
        const table = db.table(name);
        const local = new Map(((await table.toArray()) as Row[]).map((r) => [r.id, r]));

        // 2. Zeilen vom anderen Gerät
        for (const raw of p.tables[name] ?? []) {
          const row = (name === "skills" ? withDefaults(raw as unknown as Partial<Skill>) : raw) as Row;
          const remoteUpd = row.upd ?? 0;
          const tomb = tombs.get(`${name}:${row.id}`);
          if (tomb && tomb.at >= remoteUpd) continue; // wurde danach gelöscht
          const cur = local.get(row.id);
          if (!cur) {
            await table.put(name === "skills" ? { ...row, timerStart: null, timerUnit: null } : row);
            bump(report.added, name);
            added.push({ table: name, row });
          } else if (remoteUpd > (cur.upd ?? 0) && content(row) !== content(cur)) {
            await table.put(name === "skills" ? { ...row, timerStart: (cur as unknown as Skill).timerStart, timerUnit: (cur as unknown as Skill).timerUnit ?? null } : row);
            bump(report.updated, name);
          }
        }

        // 3. Hier vorhandene Zeilen, die dort später gelöscht wurden
        for (const [id, cur] of local) {
          const tomb = tombs.get(`${name}:${id}`);
          if (tomb && tomb.at > (cur.upd ?? 0)) {
            await table.delete(id);
            bump(report.removed, name);
          }
        }
      }

      // 4. Zeilen zu gelöschten Skills aufräumen (z. B. Session von hier, Skill dort gelöscht)
      const skillIds = new Set((await db.skills.toArray()).map((s) => s.id));
      for (const name of CHILDREN) {
        const table = db.table(name);
        for (const r of (await table.toArray()) as (Row & { skillId?: string })[]) {
          if (r.skillId && !skillIds.has(r.skillId)) {
            await table.delete(r.id);
            await db.tombs.put({ id: `${name}:${r.id}`, table: name, itemId: r.id, at: Date.now() });
            bump(report.removed, name);
          }
        }
      }
      // Aufnahmen gelöschter Unterpunkte
      for (const rec of await db.recordings.toArray()) {
        if (!(await db.units.get(rec.unitId))) {
          await db.recordings.delete(rec.id);
          await db.tombs.put({ id: `recordings:${rec.id}`, table: "recordings", itemId: rec.id, at: Date.now() });
          bump(report.removed, "recordings");
        }
      }
      // Abschnitte gelöschter Unterpunkte
      const unitIds = new Set((await db.units.toArray()).map((u) => u.id));
      for (const part of await db.parts.toArray()) {
        if (!unitIds.has(part.unitId)) {
          await db.parts.delete(part.id);
          await db.tombs.put({ id: `parts:${part.id}`, table: "parts", itemId: part.id, at: Date.now() });
          bump(report.removed, "parts");
        }
      }
    });
  });

  // Was kam neu? Kurze Liste mit Namen
  const titles = new Map((await db.skills.toArray()).map((s) => [s.id, s.title]));
  const names: string[] = [];
  for (const { table, row } of added) {
    const r = row as Record<string, unknown>;
    if (table === "skills") names.push(String(r.title ?? r.name));
    else if (table === "todos" || table === "inbox") names.push(String(r.text));
    else if (table === "terms") names.push(String(r.term));
    else if (table === "wishes" || table === "apps") names.push(String(r.name));
    else if (table === "cards") names.push(String(r.front));
    else if (table === "units") names.push(String(r.title));
    else if (table === "parts" || table === "recordings") names.push(String(r.name));
    else if (table === "sessions") names.push(`${titles.get(String(r.skillId)) ?? "Session"} · ${r.minutes} min`);
  }
  report.highlights = names;
  const sum = (o: Partial<Record<SyncTable, number>>) => Object.values(o).reduce((a, b) => a + (b ?? 0), 0);
  report.total = sum(report.added) + sum(report.updated) + sum(report.removed);
  return report;
}

const LABEL: Record<SyncTable, [string, string]> = {
  skills: ["Eintrag", "Einträge"],
  sessions: ["Session", "Sessions"],
  inbox: ["Inbox-Idee", "Inbox-Ideen"],
  checks: ["Häkchen", "Häkchen"],
  apps: ["App", "Apps"],
  todos: ["To-do", "To-dos"],
  lists: ["Liste", "Listen"],
  records: ["Messwert", "Messwerte"],
  terms: ["Begriff", "Begriffe"],
  wishes: ["Wunsch", "Wünsche"],
  cards: ["Karteikarte", "Karteikarten"],
  units: ["Unterpunkt", "Unterpunkte"],
  parts: ["Abschnitt", "Abschnitte"],
  recordings: ["Aufnahme", "Aufnahmen"],
  flagStats: ["Flaggen-Lernstand", "Flaggen-Lernstände"],
};

/** „3 Sessions, 1 To-do“ */
export function describeCounts(o: Partial<Record<SyncTable, number>>): string[] {
  return SYNC_TABLES.filter((t) => (o[t] ?? 0) > 0).map((t) => `${o[t]} ${LABEL[t][o[t] === 1 ? 0 : 1]}`);
}
