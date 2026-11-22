import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid, type InboxItem } from "../db";
import { addTodo, dayLabel, timeLabel } from "../logic";
import { AutoTextarea, EmptyState, Group, NavPage, Row, SwipeRow, useUI } from "../components/ui";
import { useNav } from "../nav";
import { NewSkillSheet } from "./SkillSheets";

export function Inbox() {
  const nav = useNav();
  const { toast, actionSheet, undoable } = useUI();
  const items = useLiveQuery(() => db.inbox.orderBy("createdAt").reverse().toArray(), []);
  const [text, setText] = useState("");
  const [asSkill, setAsSkill] = useState<InboxItem | null>(null);

  const add = async () => {
    const t = text.trim();
    if (!t) return;
    await db.inbox.add({ id: uid(), text: t, createdAt: Date.now() });
    setText("");
  };

  const remove = (item: InboxItem) =>
    undoable("Idee gelöscht", async () => {
      await db.inbox.delete(item.id);
      return async () => void (await db.inbox.put(item));
    });

  const asTodo = async (item: InboxItem) => {
    const first = await db.lists.orderBy("order").first();
    const todo = await addTodo(item.text, first?.id ?? "list-allgemein", null);
    await db.inbox.delete(item.id);
    toast(`Als To-do in „${first?.name ?? "Allgemein"}“`, {
      label: "Rückgängig",
      run: () => void db.transaction("rw", db.todos, db.inbox, async () => {
        await db.todos.delete(todo.id);
        await db.inbox.put(item);
      }),
    });
  };

  const sort = (item: InboxItem) =>
    actionSheet({
      title: item.text,
      choices: [
        { label: "Als Skill anlegen", onSelect: () => setAsSkill(item) },
        { label: "Als To-do anlegen", onSelect: () => void asTodo(item) },
        { label: "Löschen", destructive: true, onSelect: () => remove(item) },
      ],
    });

  return (
    <NavPage title="Inbox">
      <Group footer="Schnell festhalten, später einsortieren.">
        <div className="row input-row compose">
          <AutoTextarea value={text} placeholder="Neue Idee …" enterKeyHint="done" onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void add(); } }} />
          {text.trim() && <button className="inline-btn" onClick={() => void add()}>Sichern</button>}
        </div>
      </Group>

      {items && items.length === 0 && <EmptyState icon="tray" title="Inbox ist leer" text="Neue Ideen landen hier, bis du Zeit für sie hast." />}

      {items && items.length > 0 && (
        <Group header={`${items.length} ${items.length === 1 ? "Idee" : "Ideen"}`} footer="Tippen zum Einsortieren als Skill oder To-do.">
          {items.map((item) => (
            <SwipeRow key={item.id} actions={[
              { label: "Löschen", tone: "danger", onClick: () => remove(item) },
              { label: "To-do", tone: "gray", onClick: () => void asTodo(item) },
              { label: "Skill", tone: "accent", onClick: () => setAsSkill(item) },
            ]}>
              <Row title={item.text} subtitle={`${dayLabel(item.createdAt)}, ${timeLabel(item.createdAt)}`} chevron onClick={() => sort(item)} />
            </SwipeRow>
          ))}
        </Group>
      )}

      <NewSkillSheet open={!!asSkill} onClose={() => setAsSkill(null)} initialName={asSkill?.text ?? ""}
        onCreated={() => { if (asSkill) void db.inbox.delete(asSkill.id); }}
        onOpenExisting={(s) => nav.push({ type: "skill", id: s.id })} />
    </NavPage>
  );
}
