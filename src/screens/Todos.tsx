import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid, type Todo } from "../db";
import { addDays, addTodo, dayKey, dueLabel, loadSetting, saveSetting, setTodoDone, startOfDay } from "../logic";
import { parseQuickTodo, todoBucket, type TodoBucket } from "../quickparse";
import { catVars } from "../categories";
import { CheckCircle, EmptyState, Group, NavButton, NavPage, Row, Sheet, SwipeRow, useUI } from "../components/ui";
import { Icon } from "../components/Icon";

/** Abhaken mit kurzer Animation, erst danach wandert die Zeile nach „Erledigt“. */
export function useCompleting() {
  const [completing, setCompleting] = useState<Set<string>>(new Set());
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const complete = useCallback((id: string) => {
    setCompleting((s) => new Set(s).add(id));
    timers.current.push(
      window.setTimeout(() => {
        void setTodoDone(id, true);
        setCompleting((s) => {
          const n = new Set(s);
          n.delete(id);
          return n;
        });
      }, 650),
    );
  }, []);
  return { completing, complete };
}

const LIST_KEY = "todos.list";
const ALL_LISTS = "*";

/** Listenfarbe: stabil aus der Listen-ID abgeleitet, aus der Kategorie-Palette der App. */
const LIST_PALETTE = ["Kopf: Rechnen, Gedächtnis & Denken", "Natur, Erde & Himmel", "Körper & Sport", "Menschen, Sprache & Kommunikation", "Atmung, Sinne & Körperkontrolle", "Kreativ & Alltag", "Wissen & Verstehen", "Projekte & Besorgungen"];
function listStyle(id: string, lists: { id: string }[] = []): React.CSSProperties {
  const i = lists.findIndex((l) => l.id === id);
  return catVars(LIST_PALETTE[(i < 0 ? 0 : i) % LIST_PALETTE.length]);
}

const BUCKETS: { key: TodoBucket; title: string }[] = [
  { key: "overdue", title: "Überfällig" },
  { key: "today", title: "Heute" },
  { key: "week", title: "Diese Woche" },
  { key: "later", title: "Später" },
  { key: "none", title: "Ohne Datum" },
];

export function Todos() {
  const { undoable, actionSheet } = useUI();
  const lists = useLiveQuery(() => db.lists.orderBy("order").toArray(), []);
  const todos = useLiveQuery(() => db.todos.toArray(), []);
  const [listId, setListIdState] = useState<string>(() => loadSetting(LIST_KEY, ALL_LISTS));
  const [text, setText] = useState("");
  const [due, setDue] = useState<string | null | undefined>(undefined);
  const [editing, setEditing] = useState<Todo | null>(null);
  const [listsOpen, setListsOpen] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const { completing, complete } = useCompleting();

  const setListId = (id: string) => {
    setListIdState(id);
    saveSetting(LIST_KEY, id);
  };
  // Gelöschte Liste → zurück auf „Alle“
  useEffect(() => {
    if (lists && listId !== ALL_LISTS && !lists.some((l) => l.id === listId)) setListId(ALL_LISTS);
  }, [lists, listId]);

  const today = dayKey(new Date());
  const listName = (id: string) => lists?.find((l) => l.id === id)?.name ?? "";

  const visible = (todos ?? []).filter((t) => listId === ALL_LISTS || t.listId === listId);
  const groups = useMemo(() => {
    const open = visible.filter((t) => !t.done).sort((a, b) => (a.due ?? "9").localeCompare(b.due ?? "9") || a.createdAt - b.createdAt);
    const by: Record<TodoBucket, Todo[]> = { overdue: [], today: [], week: [], later: [], none: [] };
    for (const t of open) by[todoBucket(t.due)].push(t);
    return { by, done: visible.filter((t) => t.done).sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0)) };
  }, [visible, today]);

  // Schnelleingabe: „Zahnarzt morgen #gesundheit“
  const parsed = useMemo(() => (text.trim() ? parseQuickTodo(text, lists ?? []) : null), [text, lists]);
  const effDue: string | null = due !== undefined ? due : parsed?.due ?? null;
  const effList = parsed?.listId ?? (listId === ALL_LISTS ? lists?.[0]?.id ?? "list-allgemein" : listId);

  const add = async () => {
    if (!parsed || !parsed.text.trim()) return;
    await addTodo(parsed.text, effList, effDue);
    setText("");
    setDue(undefined);
  };

  const remove = (t: Todo) =>
    undoable("To-do gelöscht", async () => {
      await db.todos.delete(t.id);
      return async () => void (await db.todos.put(t));
    });

  const reschedule = (t: Todo) => {
    const mon = addDays(new Date(), ((8 - new Date().getDay()) % 7) || 7);
    actionSheet({
      title: t.text,
      message: "Verschieben auf …",
      choices: [
        { label: "Heute", onSelect: () => void db.todos.update(t.id, { due: today }) },
        { label: "Morgen", onSelect: () => void db.todos.update(t.id, { due: dayKey(addDays(new Date(), 1)) }) },
        { label: "Nächste Woche (Montag)", onSelect: () => void db.todos.update(t.id, { due: dayKey(mon) }) },
        { label: "Ohne Datum", onSelect: () => void db.todos.update(t.id, { due: null }) },
      ],
    });
  };

  const row = (t: Todo) => {
    const isOn = t.done || completing.has(t.id);
    const overdue = !t.done && !!t.due && t.due < today;
    const showDue = !!t.due && !t.done && t.due !== today;
    return (
      <SwipeRow key={t.id}
        leading={t.done ? { label: "Offen", tone: "gray", onClick: () => void setTodoDone(t.id, false) } : { label: "Erledigt", tone: "ok", onClick: () => complete(t.id) }}
        actions={[{ label: "Löschen", tone: "danger", onClick: () => remove(t) }, ...(t.done ? [] : [{ label: "Verschieben", tone: "gray" as const, onClick: () => reschedule(t) }])]}>
        <Row className={`todo-row${completing.has(t.id) ? " is-completing" : ""}`} title={t.text} muted={isOn}
          detail={(showDue || listId === ALL_LISTS) ? (
            <span className="todo-meta">
              {showDue && <span className={overdue ? "overdue" : ""}>{dueLabel(t.due!)}</span>}
              {listId === ALL_LISTS && <span className="todo-list cv" style={listStyle(t.listId, lists)}><i />{listName(t.listId)}</span>}
            </span>
          ) : undefined}
          leading={<CheckCircle checked={isOn} label={t.text} onToggle={() => (t.done ? void setTodoDone(t.id, false) : complete(t.id))} />}
          onClick={() => setEditing(t)} />
      </SwipeRow>
    );
  };

  const totalOpen = BUCKETS.reduce((n, b) => n + groups.by[b.key].length, 0);
  const count = (id: string) => (todos ?? []).filter((t) => !t.done && (id === ALL_LISTS || t.listId === id)).length;

  return (
    <NavPage title="To-dos" trailing={<NavButton icon="todo" label="Listen bearbeiten" onClick={() => setListsOpen(true)} />}
      header={
        <div className="list-pills">
          {[{ id: ALL_LISTS, name: "Alle" }, ...(lists ?? [])].map((l) => (
            <button key={l.id} className={`pill list-chip${l.id !== ALL_LISTS ? " cv" : ""}${listId === l.id ? " is-on" : ""}`}
              style={l.id !== ALL_LISTS ? listStyle(l.id, lists) : undefined} onClick={() => setListId(l.id)}>
              {l.id !== ALL_LISTS && <i className="chip-dot" />}
              {l.name}
              {count(l.id) > 0 && <span className="chip-count">{count(l.id)}</span>}
            </button>
          ))}
          <button className="pill pill-add" onClick={() => setListsOpen(true)} aria-label="Liste hinzufügen"><Icon name="plus" size={15} /></button>
        </div>
      }>
      <Group footer={parsed && (parsed.due || parsed.listId) ? (
        <span className="quick-hint">
          {parsed.due ? dueLabel(parsed.due) : ""}{parsed.due && parsed.listId ? " · " : ""}{parsed.listId ? `Liste „${listName(parsed.listId)}“` : ""}
        </span>
      ) : text.trim() ? undefined : "Tipp: „Zahnarzt morgen #gesundheit“ setzt Datum und Liste."}>
        <div className="row input-row compose">
          <input value={text} placeholder={listId === ALL_LISTS ? "Neues To-do" : `Neu in „${listName(listId)}“`} enterKeyHint="done"
            onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && void add()} />
          {text.trim() && <button className="inline-btn" onClick={() => void add()}>Sichern</button>}
        </div>
        {text.trim() && (
          <div className="row due-row">
            {[{ v: null, l: "Ohne Datum" }, { v: today, l: "Heute" }, { v: dayKey(addDays(new Date(), 1)), l: "Morgen" }].map((o) => (
              <button key={o.l} className={`mini-pill${effDue === o.v ? " is-on" : ""}`} onClick={() => setDue(o.v)}>{o.l}</button>
            ))}
            <label className={`mini-pill${effDue && effDue !== today && effDue !== dayKey(addDays(new Date(), 1)) ? " is-on" : ""}`}>
              <Icon name="calendar" size={14} />
              {effDue && effDue !== today && effDue !== dayKey(addDays(new Date(), 1)) ? dueLabel(effDue) : "Datum"}
              <input type="date" className="date-overlay" value={effDue ?? ""} onChange={(e) => setDue(e.target.value || null)} />
            </label>
          </div>
        )}
      </Group>

      {todos && totalOpen === 0 && groups.done.length === 0 && (
        <EmptyState icon="todo" title="Keine To-dos" text="Schreib oben etwas hinein. Mit Datum erscheint es auch unter „Heute“." />
      )}
      {todos && totalOpen === 0 && groups.done.length > 0 && <EmptyState icon="today" title="Alles erledigt" />}

      {BUCKETS.map((b) => groups.by[b.key].length > 0 && (
        <Group key={b.key} className="todo-group" header={
          <span className={b.key === "overdue" ? "overdue" : ""}>{b.title}<span className="section-count">{groups.by[b.key].length}</span></span>
        }>{groups.by[b.key].map(row)}</Group>
      ))}
      {groups.done.length > 0 && (
        <Group className={`todo-group${showDone ? "" : " is-collapsed"}`}
          header={<button className="section-toggle" onClick={() => setShowDone((v) => !v)} aria-expanded={showDone}>
            <span>Erledigt</span><span className="section-count">{groups.done.length}</span><Icon name="chevron-down" size={13} className="section-chevron" />
          </button>}>
          {showDone && groups.done.slice(0, 30).map(row)}
        </Group>
      )}

      <TodoSheet todo={editing} onClose={() => setEditing(null)} />
      <ListsSheet open={listsOpen} onClose={() => setListsOpen(false)} onCreated={setListId} />
    </NavPage>
  );
}

function TodoSheet({ todo, onClose }: { todo: Todo | null; onClose: () => void }) {
  const { undoable } = useUI();
  const lists = useLiveQuery(() => db.lists.orderBy("order").toArray(), []);
  const [text, setText] = useState("");
  const [listId, setListId] = useState("");
  const [due, setDue] = useState<string | null>(null);
  const [shown, setShown] = useState<Todo | null>(null);

  useEffect(() => {
    if (todo) {
      setShown(todo);
      setText(todo.text);
      setListId(todo.listId);
      setDue(todo.due);
    }
  }, [todo]);

  const save = async () => {
    if (shown && text.trim()) await db.todos.update(shown.id, { text: text.trim(), listId, due });
    onClose();
  };

  return (
    <Sheet open={!!todo} onClose={onClose} title="To-do" action={{ label: "Sichern", onClick: () => void save(), disabled: !text.trim() }}>
      <Group>
        <div className="row input-row"><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void save()} /></div>
      </Group>
      <Group header="Fällig">
        <Row title="Datum" detail={due ? dueLabel(due) : "Ohne"} trailing={
          <span className="date-wrap">
            <Icon name="calendar" size={18} />
            <input type="date" className="date-overlay" value={due ?? ""} onChange={(e) => setDue(e.target.value || null)} aria-label="Datum wählen" />
          </span>} />
        {due && <Row title="Datum entfernen" tone="accent" onClick={() => setDue(null)} />}
      </Group>
      <Group header="Liste">
        {(lists ?? []).map((l) => (
          <Row key={l.id} title={l.name} onClick={() => setListId(l.id)} trailing={l.id === listId ? <Icon name="check" size={18} className="row-check" /> : undefined} />
        ))}
      </Group>
      <Group>
        <Row title="To-do löschen" tone="danger" center onClick={() => {
          const copy = shown;
          onClose();
          if (copy) undoable("To-do gelöscht", async () => {
            await db.todos.delete(copy.id);
            return async () => void (await db.todos.put(copy));
          });
        }} />
      </Group>
    </Sheet>
  );
}

function ListsSheet({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const { actionSheet, toast } = useUI();
  const lists = useLiveQuery(() => db.lists.orderBy("order").toArray(), []);
  const [draft, setDraft] = useState("");

  const add = async () => {
    const n = draft.trim();
    if (!n) return;
    const id = uid();
    await db.lists.add({ id, name: n, order: (lists?.length ?? 0) + 1 });
    setDraft("");
    onCreated(id);
    toast(`Liste „${n}“ angelegt`);
  };

  const rename = (id: string, name: string) => {
    const n = name.trim();
    if (n) void db.lists.update(id, { name: n });
  };

  const remove = (id: string, name: string) =>
    actionSheet({
      title: `Liste „${name}“ löschen?`,
      message: "Alle To-dos in dieser Liste werden ebenfalls gelöscht.",
      choices: [{
        label: "Liste löschen", destructive: true, onSelect: () => void db.transaction("rw", db.lists, db.todos, async () => {
          await db.todos.where("listId").equals(id).delete();
          await db.lists.delete(id);
        }),
      }],
    });

  return (
    <Sheet open={open} onClose={onClose} title="Listen" cancelLabel="Fertig">
      <Group footer="Namen antippen zum Umbenennen.">
        {(lists ?? []).map((l) => (
          <div key={l.id} className="row input-row">
            <input defaultValue={l.name} onBlur={(e) => rename(l.id, e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
            {(lists?.length ?? 0) > 1 && (
              <button className="icon-btn-danger" aria-label={`${l.name} löschen`} onClick={() => remove(l.id, l.name)}><Icon name="trash" size={18} /></button>
            )}
          </div>
        ))}
      </Group>
      <Group>
        <div className="row input-row">
          <input value={draft} placeholder="Neue Liste" enterKeyHint="done" onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void add()} />
          {draft.trim() && <button className="inline-btn" onClick={() => void add()}>Hinzufügen</button>}
        </div>
      </Group>
    </Sheet>
  );
}

// Für „Heute“ und die Seitenleiste
export function useOpenTodoCount() {
  return useLiveQuery(async () => {
    const today = dayKey(new Date());
    return db.todos.filter((t) => !t.done && !!t.due && t.due <= today).count();
  }, [startOfDay(new Date()).getTime()]);
}
