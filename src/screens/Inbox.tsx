import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid, type InboxItem } from "../db";
import { addTodo, dayLabel } from "../logic";
import { AutoTextarea, EmptyState, Group, NavPage, SwipeRow, useUI } from "../components/ui";
import { useNav } from "../nav";
import { NewSkillSheet } from "./SkillSheets";
import { InboxSort, loadSortState } from "./InboxSort";
import { Icon } from "../components/Icon";

export function Inbox() {
  const nav = useNav();
  const { toast, actionSheet, undoable } = useUI();
  const items = useLiveQuery(() => db.inbox.orderBy("createdAt").reverse().toArray(), []);
  const [text, setText] = useState("");
  const [asSkill, setAsSkill] = useState<InboxItem | null>(null);
  const [sorting, setSorting] = useState(false);
  const [, bump] = useState(0);

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
    const todo = await addTodo(item.text, first?.id ?? "list-allgemein", null, true);
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

      {items && items.length > 0 && (() => {
        const st = loadSortState();
        const open = items.filter((i) => !st?.deferred.includes(i.id)).length;
        const resume = !!st && st.done > 0 && open > 0;
        return (
          <button className="sort-cta" onClick={() => setSorting(true)}>
            <Icon name="stack" size={20} />
            <span>{resume ? `Weitermachen – ${open} übrig` : `Sortieren (${items.length})`}</span>
            <Icon name="chevron-right" size={15} className="sort-cta-chev" />
          </button>
        );
      })()}

      {items && items.length === 0 && <EmptyState icon="tray" title="Inbox ist leer" text="Neue Ideen landen hier, bis du Zeit für sie hast." />}

      {items && items.length > 0 && (
        <Group className="inbox-group" header={`${items.length} ${items.length === 1 ? "Idee" : "Ideen"}`} footer="Tippen zum Einsortieren, wischen für Schnellaktionen.">
          {items.map((item) => (
            <SwipeRow key={item.id} actions={[
              { label: "Löschen", tone: "danger", onClick: () => remove(item) },
              { label: "To-do", tone: "gray", onClick: () => void asTodo(item) },
              { label: "Skill", tone: "accent", onClick: () => setAsSkill(item) },
            ]}>
              <div className="row inbox-row is-tappable" role="button" tabIndex={0} onClick={() => sort(item)}
                onKeyDown={(e) => { if (e.key === "Enter" && e.target === e.currentTarget) sort(item); }}>
                <div className="inbox-text">{item.text}</div>
                <div className="inbox-date">{dayLabel(item.createdAt)}</div>
              </div>
            </SwipeRow>
          ))}
        </Group>
      )}

      <InboxSort open={sorting} onClose={() => { setSorting(false); bump((n) => n + 1); }} />

      <NewSkillSheet open={!!asSkill} onClose={() => setAsSkill(null)} initialName={asSkill?.text ?? ""}
        onCreated={(s) => { if (asSkill) void db.inbox.delete(asSkill.id); void db.skills.update(s.id, { unsorted: true }); }}
        onOpenExisting={(s) => nav.push({ type: "skill", id: s.id })} />
    </NavPage>
  );
}
