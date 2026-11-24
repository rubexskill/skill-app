import { describe, expect, it } from "vitest";
import type { Todo, TodoList } from "../src/db";
import { allBucket, groupAll, originLabel, searchTodos, splitHits } from "../src/todoview";

const now = new Date(2026, 10, 24, 10); // Di, 24.11.2026
const lists: TodoList[] = [{ id: "a", name: "Allgemein", order: 0 }, { id: "s", name: "Schule", order: 1 }] as TodoList[];
let n = 0;
const t = (text: string, listId: string, due: string | null, extra: Partial<Todo> = {}): Todo =>
  ({ id: `t${++n}`, listId, text, due, done: false, doneAt: null, createdAt: n, ...extra }) as Todo;

describe("Alle: Gruppen und Sortierung", () => {
  it("ordnet nach Datum, listenübergreifend; ohne Datum zuletzt", () => {
    const todos = [
      t("ohne A", "a", null), t("Mathe: später", "s", "2026-12-20"), t("gestern", "a", "2026-11-23"),
      t("heute S", "s", "2026-11-24"), t("morgen", "a", "2026-11-25"), t("ohne S", "s", null),
      t("Freitag", "a", "2026-11-27"), t("heute A", "a", "2026-11-24"), t("erledigt", "a", "2026-11-24", { done: true }),
    ];
    const g = groupAll(todos, now);
    expect(g.map((x) => x.key)).toEqual(["overdue", "today", "tomorrow", "week", "later", "none"]);
    expect(g[1].items.map((x) => x.text)).toEqual(["heute S", "heute A"]);
    expect(g[5].items.map((x) => x.text)).toEqual(["ohne A", "ohne S"]);
    expect(g.flatMap((x) => x.items).some((x) => x.done)).toBe(false);
    const flat = g.flatMap((x) => x.items);
    expect(flat.findIndex((x) => x.due === null)).toBeGreaterThan(flat.findLastIndex((x) => x.due !== null));
  });
  it("leere Gruppen fehlen; Wochen-Grenze ist Sonntag", () => {
    expect(allBucket("2026-11-29", now)).toBe("week");
    expect(allBucket("2026-11-30", now)).toBe("later");
    expect(groupAll([t("x", "a", null)], now).map((x) => x.key)).toEqual(["none"]);
  });
  it("Herkunft: Liste, bei Schule das Fach", () => {
    expect(originLabel(t("Mathe: Aufgaben", "s", null), lists[1])).toBe("Mathe");
    expect(originLabel(t("Ohne Fach", "s", null), lists[1])).toBe("Schule");
    expect(originLabel(t("Mathe: x", "a", null), lists[0])).toBe("Allgemein");
  });
});

describe("Suche", () => {
  const todos = [t("Zahnarzt anrufen", "a", null), t("Mathe: Übung 3", "s", "2026-11-25", { note: "Buch Seite 12" }), t("Brief", "a", null, { done: true, doneAt: 5 })];
  it("findet in Titel, Notiz und Liste, unabhängig von Groß-/Kleinschreibung und Umlauten", () => {
    expect(searchTodos(todos, lists, "zahn").map((x) => x.text)).toEqual(["Zahnarzt anrufen"]);
    expect(searchTodos(todos, lists, "SEITE 12").map((x) => x.text)).toEqual(["Mathe: Übung 3"]);
    expect(searchTodos(todos, lists, "schule").map((x) => x.text)).toEqual(["Mathe: Übung 3"]);
    expect(searchTodos(todos, lists, "uebung")).toHaveLength(1);
    expect(searchTodos(todos, lists, "allgemein")).toHaveLength(2);
  });
  it("leere Eingabe und kein Treffer ergeben nichts; offene vor erledigten", () => {
    expect(searchTodos(todos, lists, "  ")).toEqual([]);
    expect(searchTodos(todos, lists, "xyz")).toEqual([]);
    expect(searchTodos(todos, lists, "allgemein").map((x) => x.done)).toEqual([false, true]);
  });
  it("Hervorhebung teilt den Text am Treffer", () => {
    expect(splitHits("Zahnarzt anrufen", "arzt")).toEqual([{ s: "Zahn", hit: false }, { s: "arzt", hit: true }, { s: " anrufen", hit: false }]);
    expect(splitHits("Übung", "uebung")).toEqual([{ s: "Übung", hit: true }]);
    expect(splitHits("abc", "")).toEqual([{ s: "abc", hit: false }]);
    expect(splitHits("aXbx", "x").filter((p) => p.hit)).toHaveLength(2);
  });
});
