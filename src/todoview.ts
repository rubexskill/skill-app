import type { Todo, TodoList } from "./db";
import { addDays, dayKey, normalize } from "./logic";

export type AllBucket = "overdue" | "today" | "tomorrow" | "week" | "later" | "none";

export const ALL_BUCKETS: { key: AllBucket; title: string }[] = [
  { key: "overdue", title: "Überfällig" },
  { key: "today", title: "Heute" },
  { key: "tomorrow", title: "Morgen" },
  { key: "week", title: "Diese Woche" },
  { key: "later", title: "Später" },
  { key: "none", title: "Ohne Datum" },
];

/** Gruppe für die gemeinsame Übersicht: überfällig · heute · morgen · bis Sonntag · später · ohne Datum. */
export function allBucket(due: string | null, now = new Date()): AllBucket {
  if (!due) return "none";
  const today = dayKey(now);
  if (due < today) return "overdue";
  if (due === today) return "today";
  if (due === dayKey(addDays(now, 1))) return "tomorrow";
  const sunday = addDays(now, (7 - now.getDay()) % 7);
  return due <= dayKey(sunday) ? "week" : "later";
}

/** Offene Einträge: Datum zuerst (aufsteigend), danach ohne Datum; jeweils nach Anlage. Listenübergreifend. */
export function sortOpen(a: Todo, b: Todo): number {
  if (!!a.due !== !!b.due) return a.due ? -1 : 1;
  return (a.due ?? "").localeCompare(b.due ?? "") || a.createdAt - b.createdAt;
}

export function groupAll(todos: Todo[], now = new Date()): { key: AllBucket; title: string; items: Todo[] }[] {
  const open = todos.filter((t) => !t.done).sort(sortOpen);
  return ALL_BUCKETS.map((b) => ({ ...b, items: open.filter((t) => allBucket(t.due, now) === b.key) })).filter((g) => g.items.length > 0);
}

/** Zeigt dezent, woher ein Eintrag kommt: bei „Schule“ das Fach (Präfix vor dem Doppelpunkt), sonst der Listenname. */
export function subjectOf(text: string): { subject: string; text: string } {
  const m = /^([^:\n]{2,24}):\s+(\S.*)$/.exec(text);
  return m ? { subject: m[1].trim(), text: m[2] } : { subject: "", text };
}

export function originLabel(t: Todo, list: TodoList | undefined): string {
  if (!list) return "";
  if (normalize(list.name) === "schule") return subjectOf(t.text).subject || list.name;
  return list.name;
}

/** Live-Suche in Titel, Notiz und Listenname, über alle Listen. Offene zuerst, dann erledigte. */
export function searchTodos(todos: Todo[], lists: TodoList[], query: string): Todo[] {
  const q = normalize(query.trim());
  if (!q) return [];
  const name = new Map(lists.map((l) => [l.id, l.name]));
  return todos
    .filter((t) => normalize(`${t.text}\n${t.note ?? ""}\n${name.get(t.listId) ?? ""}`).includes(q))
    .sort((a, b) => Number(a.done) - Number(b.done) || (a.done ? (b.doneAt ?? 0) - (a.doneAt ?? 0) : sortOpen(a, b)));
}

/** Teilt Text in Stücke, Treffer markiert (ohne Beachtung von Groß-/Kleinschreibung und Akzenten). */
export function splitHits(text: string, query: string): { s: string; hit: boolean }[] {
  const q = normalize(query.trim());
  if (!q) return [{ s: text, hit: false }];
  // normalize kann Längen ändern; deshalb Zeichen für Zeichen vergleichen
  const norm = [...text].map((c) => normalize(c));
  const flat = norm.join("");
  const starts: number[] = [];
  norm.forEach((n, i) => { for (let k = 0; k < n.length; k++) starts.push(i); });
  const out: { s: string; hit: boolean }[] = [];
  let pos = 0;
  let from = 0;
  const chars = [...text];
  for (;;) {
    const at = flat.indexOf(q, from);
    if (at < 0) break;
    const a = starts[at];
    const b = starts[at + q.length - 1] + 1;
    if (a >= pos) {
      if (a > pos) out.push({ s: chars.slice(pos, a).join(""), hit: false });
      out.push({ s: chars.slice(a, b).join(""), hit: true });
      pos = b;
    }
    from = at + q.length;
  }
  if (pos < chars.length) out.push({ s: chars.slice(pos).join(""), hit: false });
  return out;
}
