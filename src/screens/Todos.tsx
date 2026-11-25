import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid, type Todo } from "../db";
import { addDays, addTodo, normalize, dayKey, longDate, dueLabel, loadSetting, saveSetting, setTodoDone, startOfDay } from "../logic";
import { parseQuickTodo, todoBucket, type TodoBucket } from "../quickparse";
import { catVars } from "../categories";
import { Ring } from "./parts";
import { groupAll, originLabel, searchTodos, splitHits, subjectOf as subjectParts } from "../todoview";
import { TidyItemRows, TidyStrip, UnsortedMark } from "./Tidy";
import { AutoTextarea, CheckCircle, EmptyState, Group, NavButton, NavPage, Row, Sheet, SwipeRow, useCaps, useFrozen, useUI } from "../components/ui";
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
  const { undoable } = useUI();
  const caps = useCaps(80);
  const lists = useLiveQuery(() => db.lists.orderBy("order").toArray(), []);
  const liveTodos = useLiveQuery(() => db.todos.toArray(), []);
  const [todos, gesture] = useFrozen(liveTodos);
  const [listId, setListIdState] = useState<string>(() => loadSetting(LIST_KEY, ALL_LISTS));
  const [text, setText] = useState("");
  const [due, setDue] = useState<string | null | undefined>(undefined);
  const [editing, setEditing] = useState<Todo | null>(null);
  const [listsOpen, setListsOpen] = useState(false);
  const [showDoneIn, setShowDoneIn] = useState<Set<string>>(new Set());
  const [only, setOnly] = useState(false);
  const { completing, complete } = useCompleting();
  const [swiped, setSwiped] = useState<boolean>(() => loadSetting("todos.swiped", false));
  const markSwiped = () => { if (!swiped) { setSwiped(true); saveSetting("todos.swiped", true); } };
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searching = searchOpen && query.trim().length > 0;
  const closeSearch = () => { setSearchOpen(false); setQuery(""); };

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

  // Aktionen arbeiten mit der ID aus der Geste und lesen das To-do erst jetzt aus der Datenbank.
  const remove = (id: string) =>
    undoable("To-do gelöscht", async () => {
      const cur = await db.todos.get(id);
      if (!cur) return async () => {};
      await db.todos.delete(id);
      return async () => void (await db.todos.put(cur));
    });

  const tomorrow = (id: string) =>
    undoable("Auf morgen verschoben", async () => {
      const cur = await db.todos.get(id);
      if (!cur) return async () => {};
      await db.todos.update(id, { due: dayKey(addDays(new Date(), 1)) });
      return async () => void (await db.todos.update(id, { due: cur.due }));
    });

  /** In der Liste „Schule“ steht das Fach vor dem Doppelpunkt: „Mathe: Aufgaben 3“. */
  const subjectOf = (t: Todo) => subjectParts(t.text);

  const hl = (text: string): React.ReactNode =>
    searching ? splitHits(text, query).map((p, i) => (p.hit ? <mark key={i} className="hit">{p.s}</mark> : <Fragment key={i}>{p.s}</Fragment>)) : text;

  const row = (t: Todo, shown: string = t.text, opts: { origin?: boolean; hideDue?: boolean } = {}) => {
    const lst = opts.origin ? lists?.find((l) => l.id === t.listId) : undefined;
    const origin = lst ? originLabel(t, lst) : "";
    const isOn = t.done || completing.has(t.id);
    const overdue = !t.done && !!t.due && t.due < today;
    const isToday = !t.done && t.due === today;
    return (
      <SwipeRow key={t.id} id={t.id} trigger={0.3} style={listStyle(t.listId, lists)} onGesture={(ph) => { gesture(ph); if (ph === "end") markSwiped(); }}
        leading={t.done ? undefined : { label: "Morgen", tone: "soft", icon: "calendar", onClick: (gid) => tomorrow(gid ?? t.id) }}
        actions={[{ label: "Löschen", tone: "soft-danger", icon: "trash", onClick: (gid) => remove(gid ?? t.id) }]}>
        <Row className={`todo-row${completing.has(t.id) ? " is-completing" : ""}`} title={<>{hl(shown)}<UnsortedMark on={t.unsorted} /></>} muted={isOn}
          subtitle={origin ? <span className="todo-origin cv" style={listStyle(t.listId, lists)}><i className="chip-dot" />{hl(origin)}</span> : undefined}
          detail={t.due && !t.done && !opts.hideDue ? <span className={`todo-due${overdue ? " is-overdue" : isToday ? " is-today" : ""}`}>{dueLabel(t.due)}</span> : undefined}
          leading={<CheckCircle checked={isOn} label={t.text} onToggle={() => (t.done ? void setTodoDone(t.id, false) : complete(t.id))} />}
          onClick={() => setEditing(t)} />
      </SwipeRow>
    );
  };

  const openSort = (a: Todo, b: Todo) => (a.due ?? "9").localeCompare(b.due ?? "9") || a.createdAt - b.createdAt;

  /** Eine Karte pro Liste: Ring, Titel, Anzahl offen, darunter die To-dos. */
  const listCard = (l: { id: string; name: string }) => {
    const all = (todos ?? []).filter((t) => t.listId === l.id && (!only || t.unsorted));
    const open = all.filter((t) => !t.done).sort(openSort);
    const done = all.filter((t) => t.done).sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0));
    const isSchool = normalize(l.name) === "schule";
    const total = all.length;
    const subjects = isSchool ? [...new Set(open.map((t) => subjectOf(t).subject))].sort((a, b) => (a ? 0 : 1) - (b ? 0 : 1) || a.localeCompare(b, "de")) : [];
    const doneOpen = showDoneIn.has(l.id);
    return (
      <Group key={l.id} className="is-card todo-card cv"
        header={
          <span className="todo-card-head cv" style={listStyle(l.id, lists)}>
            <Ring value={total ? done.length / total : 0} size={30} stroke={4} className="todo-ring" />
            <span className="todo-card-title">{l.name}</span>
            <span className="todo-card-count">{open.length === 0 ? (total ? "alles erledigt" : "leer") : `${open.length} offen`}</span>
          </span>
        }>
        {open.length === 0 && done.length === 0 && <div className="todo-empty">Noch nichts in dieser Liste.</div>}
        {isSchool
          ? subjects.map((sub) => (
              <Fragment key={sub || "_"}>
                <div className="todo-sub is-subject">{sub || "Ohne Fach"}</div>
                {caps.view(`${l.id}/${sub}`, open.filter((t) => subjectOf(t).subject === sub)).map((t) => row(t, subjectOf(t).text))}
                {caps.more(`${l.id}/${sub}`, open.filter((t) => subjectOf(t).subject === sub).length)}
              </Fragment>
            ))
          : BUCKETS.map((b) => {
              const items = open.filter((t) => todoBucket(t.due) === b.key);
              return items.length ? (
                <Fragment key={b.key}>
                  {(open.length > 4 || b.key === "overdue") && <div className={`todo-sub${b.key === "overdue" ? " is-overdue" : ""}`}>{b.title}</div>}
                  {caps.view(`${l.id}/${b.key}`, items).map((t) => row(t))}
                  {caps.more(`${l.id}/${b.key}`, items.length)}
                </Fragment>
              ) : null;
            })}
        {done.length > 0 && (
          <button className="todo-done-toggle" onClick={() => setShowDoneIn((p) => { const n = new Set(p); if (n.has(l.id)) n.delete(l.id); else n.add(l.id); return n; })} aria-expanded={doneOpen}>
            Erledigt · {done.length}<Icon name="chevron-down" size={12} className="section-chevron" />
          </button>
        )}
        {doneOpen && done.slice(0, 30).map((t) => row(t, isSchool ? subjectOf(t).text : t.text))}
      </Group>
    );
  };

  /** „Alle“: eine gemeinsame Übersicht über alle Listen, Einträge mit Datum zuerst. */
  const allView = () => {
    const base = (todos ?? []).filter((t) => !only || t.unsorted);
    const groups = groupAll(base);
    if (groups.length === 0) return <Group className="is-card todo-card"><div className="todo-empty">Nichts offen.</div></Group>;
    return (
      <Group className="is-card todo-card all-card">
        {groups.map((g) => {
          const stamp = g.key === "today" ? longDate(new Date()) : g.key === "tomorrow" ? longDate(addDays(new Date(), 1)) : "";
          return (
            <Fragment key={g.key}>
              <div className={`todo-sub${g.key === "overdue" ? " is-overdue" : ""}`}>{g.title}{stamp && <span className="todo-sub-date">{stamp}</span>}</div>
              {caps.view(`all/${g.key}`, g.items).map((t) => row(t, subjectOf(t).subject && normalize(listName(t.listId)) === "schule" ? subjectOf(t).text : t.text, { origin: true, hideDue: g.key === "today" || g.key === "tomorrow" || g.key === "none" }))}
              {caps.more(`all/${g.key}`, g.items.length)}
            </Fragment>
          );
        })}
      </Group>
    );
  };

  const results = useMemo(() => (searching && todos && lists ? searchTodos(todos, lists, query) : []), [searching, todos, lists, query]);

  const searchView = () =>
    results.length === 0 ? (
      <div className="search-empty">Nichts gefunden für „{query.trim()}“.</div>
    ) : (
      <Group className="is-card todo-card" footer={`${results.length === 1 ? "1 Treffer" : `${results.length} Treffer`} in allen Listen`}>
        {caps.view("search", results).map((t) => row(t, t.text, { origin: true }))}
        {caps.more("search", results.length)}
      </Group>
    );

  const count = (id: string) => (todos ?? []).filter((t) => !t.done && (id === ALL_LISTS || t.listId === id)).length;

  return (
    <NavPage title="To-dos" trailing={<>
      <NavButton icon="search" label="To-dos durchsuchen" onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))} />
      <NavButton icon="todo" label="Listen bearbeiten" onClick={() => setListsOpen(true)} />
    </>}
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
      {searchOpen && (
        <div className="todo-search" role="search">
          <Icon name="search" size={16} />
          <input autoFocus type="search" value={query} placeholder="Titel, Notiz oder Liste" aria-label="To-dos durchsuchen" enterKeyHint="search" onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Escape" && closeSearch()} />
          <button className="todo-search-x" aria-label="Suche schließen" onClick={closeSearch}><Icon name="close" size={14} /></button>
        </div>
      )}
      {!searching && <TidyStrip kinds={["todo"]} only={only} onToggle={setOnly} />}
      {!searching && <Group className="is-card compose-card" footer={parsed && (parsed.due || parsed.listId) ? (
        <span className="quick-hint">
          {parsed.due ? dueLabel(parsed.due) : ""}{parsed.due && parsed.listId ? " · " : ""}{parsed.listId ? `Liste „${listName(parsed.listId)}“` : ""}
        </span>
      ) : text.trim() ? undefined : "Tipp: „Zahnarzt morgen #gesundheit“ setzt Datum und Liste. In „Schule“ ordnet „Mathe: Aufgabe“ nach Fach."}>
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
      </Group>}
      {!searching && !swiped && (todos?.length ?? 0) > 0 && <p className="swipe-hint">Rechts wischen: morgen · Links wischen: löschen</p>}

      {todos && lists && (searching ? searchView() : listId === ALL_LISTS ? allView() : lists.filter((l) => l.id === listId).map(listCard))}
      {todos && lists && lists.length === 0 && <EmptyState icon="todo" title="Keine Listen" text="Lege über das Plus oben eine Liste an." />}

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
  const [note, setNote] = useState("");

  useEffect(() => {
    if (todo) {
      setShown(todo);
      setNote(todo.note ?? "");
      setText(todo.text);
      setListId(todo.listId);
      setDue(todo.due);
    }
  }, [todo]);

  const save = async () => {
    if (shown && text.trim()) await db.todos.update(shown.id, { text: text.trim(), listId, due, ...(note.trim() !== (shown.note ?? "").trim() ? { note: note.trim() } : {}) });
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
      {(note || shown?.unsorted) && (
        <Group header="Notiz">
          <div className="row input-row"><AutoTextarea value={note} placeholder="Notiz" onChange={(e) => setNote(e.target.value)} /></div>
        </Group>
      )}
      <Group header="Liste">
        {(lists ?? []).map((l) => (
          <Row key={l.id} title={l.name} onClick={() => setListId(l.id)} trailing={l.id === listId ? <Icon name="check" size={18} className="row-check" /> : undefined} />
        ))}
      </Group>
      {shown && <Group><TidyItemRows kind="todo" id={shown.id} unsorted={shown.unsorted} /></Group>}
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
