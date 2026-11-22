import { describe, expect, it } from "vitest";
import type { TodoList } from "../src/db";
import { dateFromWord, parseQuickTodo, suggestList, todoBucket } from "../src/quickparse";

const lists: TodoList[] = [
  { id: "a", name: "Allgemein", order: 1 },
  { id: "g", name: "Gesundheit", order: 2 },
  { id: "h", name: "Haus & Garten", order: 3 },
];
// Mittwoch, 25. Nov. 2026
const now = new Date(2026, 10, 25, 10, 0);

describe("Schnelleingabe", () => {
  it("versteht heute, morgen, übermorgen", () => {
    expect(dateFromWord("heute", now)).toBe("2026-11-25");
    expect(dateFromWord("Morgen", now)).toBe("2026-11-26");
    expect(dateFromWord("übermorgen", now)).toBe("2026-11-27");
  });
  it("Wochentag = nächster solcher Tag", () => {
    expect(dateFromWord("freitag", now)).toBe("2026-11-27");
    expect(dateFromWord("mittwoch", now)).toBe("2026-12-02");
    expect(dateFromWord("montag", now)).toBe("2026-11-30");
  });
  it("zerlegt Text, Datum und #liste", () => {
    expect(parseQuickTodo("Zahnarzt anrufen morgen #gesund", lists, now)).toEqual({ text: "Zahnarzt anrufen", due: "2026-11-26", listId: "g" });
    expect(parseQuickTodo("am Freitag Müll rausbringen", lists, now)).toEqual({ text: "Müll rausbringen", due: "2026-11-27", listId: null });
    expect(parseQuickTodo("#haus Rasen mähen bis Sonntag", lists, now)).toEqual({ text: "Rasen mähen", due: "2026-11-29", listId: "h" });
  });
  it("lässt Normales in Ruhe", () => {
    expect(parseQuickTodo("Morgen-Routine planen", lists, now).due).toBeNull();
    expect(parseQuickTodo("morgen", lists, now)).toEqual({ text: "morgen", due: null, listId: null });
    expect(parseQuickTodo("Issue #42 prüfen", lists, now).text).toBe("Issue #42 prüfen");
  });
});

describe("Gruppen und Vorschläge", () => {
  it("ordnet To-dos Gruppen zu", () => {
    expect(todoBucket(null, now)).toBe("none");
    expect(todoBucket("2026-11-24", now)).toBe("overdue");
    expect(todoBucket("2026-11-25", now)).toBe("today");
    expect(todoBucket("2026-11-29", now)).toBe("week");
    expect(todoBucket("2026-11-30", now)).toBe("later");
  });
  it("Sonntag: Rest der Woche ist leer, Montag ist später", () => {
    const sun = new Date(2026, 10, 29);
    expect(todoBucket("2026-11-30", sun)).toBe("later");
  });
  it("schlägt Liste anhand des Namens vor", () => {
    expect(suggestList("Gesundheit prüfen lassen", lists)?.id).toBe("g");
    expect(suggestList("Brot kaufen", lists)).toBeNull();
  });
});
