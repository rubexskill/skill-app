import { META } from "./seed";
import type { Skill, Term, Todo, Wish } from "./db";
import type { Table } from "dexie";

/** Rückwirkende Markierung „Unaufgeräumt“ (Version 5). Die Herkunft aus der Inbox wurde bisher nicht gespeichert. */
export const BACKFILL_FROM = new Date(2026, 10, 22).getTime();

const norm = (s: string) => s.normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim();

/** Skill: Status „Klären“, oder seit dem 22.11. neu und nicht aus der ursprünglichen Bibliothek. */
export function skillNeedsTidy(s: Pick<Skill, "status" | "name" | "createdAt">): boolean {
  if (s.status === "rausfinden") return true;
  return s.createdAt >= BACKFILL_FROM && !META.has(norm(s.name));
}

export async function backfillUnsorted(t: { skills: Table<Skill>; todos: Table<Todo>; terms: Table<Term>; wishes: Table<Wish> }) {
  await t.skills.toCollection().modify((s) => {
    if (s.unsorted === undefined && skillNeedsTidy(s)) s.unsorted = true;
  });
  for (const tbl of [t.todos, t.terms, t.wishes] as Table<{ unsorted?: boolean; createdAt: number }>[]) {
    await tbl.toCollection().modify((r) => {
      if (r.unsorted === undefined && r.createdAt >= BACKFILL_FROM) r.unsorted = true;
    });
  }
}
