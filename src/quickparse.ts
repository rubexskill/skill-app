import type { Skill, TodoList } from "./db";
import { addDays, dayKey, findSimilar, normalize } from "./logic";

const WEEKDAY_NAMES = ["sonntag", "montag", "dienstag", "mittwoch", "donnerstag", "freitag", "samstag"];
const FILLER = new Set(["am", "bis", "nächsten", "naechsten", "kommenden", "diesen", "bitte"]);

export interface QuickTodo {
  text: string;
  due: string | null;
  /** Liste aus „#name“, sonst null */
  listId: string | null;
}

/** Datum aus einem einzelnen Wort: „heute“, „morgen“, „übermorgen“, „freitag“ (nächster Freitag, heute zählt nicht). */
export function dateFromWord(word: string, now = new Date()): string | null {
  const w = word.toLowerCase().replace(/[.,!?]+$/, "");
  if (w === "heute") return dayKey(now);
  if (w === "morgen") return dayKey(addDays(now, 1));
  if (w === "übermorgen" || w === "uebermorgen") return dayKey(addDays(now, 2));
  const wd = WEEKDAY_NAMES.indexOf(w);
  if (wd < 0) return null;
  let diff = (wd - now.getDay() + 7) % 7;
  if (diff === 0) diff = 7;
  return dayKey(addDays(now, diff));
}

/** Findet eine Liste zu „#name“ (Anfang des Namens genügt, ohne Beachtung von Umlauten/Groß-/Kleinschreibung). */
export function matchList(tag: string, lists: TodoList[]): TodoList | null {
  const t = normalize(tag);
  if (!t) return null;
  return (
    lists.find((l) => normalize(l.name) === t) ??
    lists.find((l) => normalize(l.name).startsWith(t)) ??
    lists.find((l) => normalize(l.name).replace(/ /g, "") === t) ??
    null
  );
}

/**
 * Schnelleingabe: „Zahnarzt anrufen morgen #gesundheit“ → Text „Zahnarzt anrufen“, morgen, Liste Gesundheit.
 * Datumswörter werden nur am Anfang oder Ende erkannt, damit Sätze wie „Morgen-Routine planen“ heil bleiben.
 */
export function parseQuickTodo(input: string, lists: TodoList[], now = new Date()): QuickTodo {
  let listId: string | null = null;
  let words = input.trim().split(/\s+/).filter(Boolean);

  // #liste: überall erlaubt; unbekannte Tags bleiben im Text stehen
  words = words.filter((w) => {
    if (!w.startsWith("#") || w.length < 2) return true;
    const l = matchList(w.slice(1), lists);
    if (!l) return true;
    listId = l.id;
    return false;
  });

  let due: string | null = null;
  const filler = (w: string) => FILLER.has(w.toLowerCase());
  const take = (atEnd: boolean) => {
    if (words.length < 2) return false; // Text soll nicht leer werden
    // Am Anfang: „am Freitag …“ – Füllwörter vor dem Datum überspringen
    let i = atEnd ? words.length - 1 : 0;
    if (!atEnd) while (i < words.length - 1 && filler(words[i])) i++;
    const d = dateFromWord(words[i], now);
    if (!d || (i === words.length - 1 && !atEnd && i === 0)) return false;
    due = d;
    if (atEnd) words.pop();
    else words.splice(0, i + 1);
    // Füllwörter („am“, „bis“ …) am Ende mit entfernen
    while (atEnd && words.length > 1 && filler(words[words.length - 1])) words.pop();
    return words.length > 0;
  };
  if (!take(true)) take(false);

  return { text: words.join(" "), due, listId };
}

/** Kategorie-Vorschlag für eine Idee: nach ähnlichen vorhandenen Einträgen, sonst null. Sammelkategorien zählen nicht. */
export function suggestCategory(text: string, skills: Skill[]): string | null {
  const area = (k: string) => k === "Gewohnheiten" || k === "Projekte & Besorgungen" || k.startsWith("Erst rausfinden");
  const hits = findSimilar(text, skills.filter((s) => !area(s.kategorie)), 5);
  if (!hits.length) return null;
  const votes = new Map<string, number>();
  hits.forEach((s, i) => votes.set(s.kategorie, (votes.get(s.kategorie) ?? 0) + (hits.length - i)));
  return [...votes.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

/** Listen-Vorschlag: Listenname kommt im Text vor, sonst null. */
export function suggestList(text: string, lists: TodoList[]): TodoList | null {
  const n = " " + normalize(text) + " ";
  return lists.find((l) => normalize(l.name).length >= 3 && n.includes(" " + normalize(l.name) + " ")) ?? null;
}

export type TodoBucket = "overdue" | "today" | "week" | "later" | "none";

/** Gruppe eines To-dos: überfällig · heute · diese Woche (bis Sonntag) · später · ohne Datum. */
export function todoBucket(due: string | null, now = new Date()): TodoBucket {
  if (!due) return "none";
  const today = dayKey(now);
  if (due < today) return "overdue";
  if (due === today) return "today";
  const sunday = addDays(now, (7 - now.getDay()) % 7);
  return due <= dayKey(sunday) ? "week" : "later";
}
