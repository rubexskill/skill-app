import { useEffect } from "react";
import { db, uid } from "./db";
import { addTodo } from "./logic";
import { useUI } from "./components/ui";

let handled = false;

/** Versteht ?neu=TEXT (Inbox) und ?todo=TEXT (To-dos). Mehrere Zeilen = mehrere Einträge. */
export function QuickCapture() {
  const { toast } = useUI();

  useEffect(() => {
    if (handled) return;
    handled = true;
    const q = new URLSearchParams(location.search);
    const neu = q.get("neu");
    const todo = q.get("todo");
    if (neu === null && todo === null) return;

    const lines = (v: string | null) => (v ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    // Adresse aufräumen, damit ein Neuladen nichts doppelt anlegt
    history.replaceState(null, "", location.pathname + location.hash);

    void (async () => {
      const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
      const note = standalone ? "" : " Hinweis: In der Safari-Version gespeichert – mit „Abgleichen“ übernehmen.";
      const inbox = lines(neu);
      const todos = lines(todo);
      const now = Date.now();
      if (inbox.length) await db.inbox.bulkAdd(inbox.map((text, i) => ({ id: uid(), text, createdAt: now + i })));
      if (todos.length) {
        const first = await db.lists.orderBy("order").first();
        for (const text of todos) await addTodo(text, first?.id ?? "list-allgemein", null);
      }
      const parts = [
        inbox.length ? (inbox.length === 1 ? "1 Idee in der Inbox" : `${inbox.length} Ideen in der Inbox`) : "",
        todos.length ? (todos.length === 1 ? "1 To-do angelegt" : `${todos.length} To-dos angelegt`) : "",
      ].filter(Boolean);
      if (parts.length) toast(parts.join(" · ") + "." + note);
    })();
  }, [toast]);

  return null;
}
