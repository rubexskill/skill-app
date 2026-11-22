import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid, type InboxItem, type Skill, type Todo } from "../db";
import { addTodo, createSkill, loadSetting, saveSetting, similarity } from "../logic";
import { parseQuickTodo, suggestCategory, suggestList } from "../quickparse";
import { catVars, CategoryIcon, shortCategory } from "../categories";
import { Icon } from "../components/Icon";
import { dueLabel } from "../logic";

/** Fortschritt der Sortier-Runde (nur auf diesem Gerät). */
export interface SortState {
  total: number;
  done: number;
  /** „Später“: bleiben in der Inbox, werden in dieser Runde übersprungen */
  deferred: string[];
}
export const SORT_KEY = "inbox.sort";
export const loadSortState = (): SortState | null => loadSetting<SortState | null>(SORT_KEY, null);

type Dir = "skill" | "todo" | "later" | "delete";
type Kind = Dir | "term" | "wish" | "project" | "habit";
const LABEL: Record<Dir, string> = { skill: "Skill", todo: "To-do", later: "Später", delete: "Löschen" };
const SUMMARY: Record<Kind, [string, string]> = {
  skill: ["Skill angelegt", "Skills angelegt"],
  todo: ["To-do angelegt", "To-dos angelegt"],
  later: ["für später in der Inbox", "für später in der Inbox"],
  delete: ["gelöscht", "gelöscht"],
  term: ["als Begriff", "als Begriffe"],
  wish: ["auf die Wunschliste", "auf die Wunschliste"],
  project: ["Projekt angelegt", "Projekte angelegt"],
  habit: ["Gewohnheit angelegt", "Gewohnheiten angelegt"],
};
const DONE_TEXT: Record<Kind, string> = {
  skill: "Skill angelegt", todo: "To-do angelegt", later: "Auf später gelegt", delete: "Gelöscht",
  term: "Als Begriff gespeichert", wish: "Auf die Wunschliste gelegt", project: "Als Projekt angelegt", habit: "Als Gewohnheit angelegt",
};
const AREA_CATS = new Set(["Gewohnheiten", "Projekte & Besorgungen", "Erst rausfinden, was das ist"]);
const UNSORTED = "Erst rausfinden, was das ist";
const THRESH = 96;

interface Undo { item: InboxItem; kind: Kind; undo: () => Promise<void> }

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function InboxSort({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lists = useLiveQuery(() => db.lists.orderBy("order").toArray(), []) ?? [];
  const skills = useLiveQuery(() => db.skills.toArray(), []) ?? [];
  const [queue, setQueue] = useState<InboxItem[]>([]);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(0);
  const [deferred, setDeferred] = useState<string[]>([]);
  const [stats, setStats] = useState<Partial<Record<Kind, number>>>({});
  const [history, setHistory] = useState<Undo[]>([]);
  const [pending, setPending] = useState<{ kind: "skill" | "todo"; item: InboxItem } | null>(null);
  const [note, setNote] = useState("");
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const noteTimer = useRef(0);

  // Beim Öffnen: Warteschlange aus der Datenbank aufbauen (ohne „Später“-Karten), Fortschritt fortsetzen.
  useEffect(() => {
    if (!open) { setReady(false); setShown(false); return; }
    let cancelled = false;
    void (async () => {
      const items = await db.inbox.orderBy("createdAt").toArray();
      const saved = loadSortState();
      const ids = new Set(items.map((i) => i.id));
      let def = (saved?.deferred ?? []).filter((id) => ids.has(id));
      let q = items.filter((i) => !def.includes(i.id));
      let dn = saved?.done ?? 0;
      let tot = saved?.total ?? 0;
      if (q.length === 0 && def.length > 0) { def = []; q = items; dn = 0; tot = 0; } // nur „Später“ übrig: neue Runde
      if (!saved || tot < dn + q.length + def.length) tot = dn + q.length + def.length;
      if (cancelled) return;
      setQueue(q); setDeferred(def); setDone(dn); setTotal(tot);
      setStats({}); setHistory([]); setPending(null); setNote("");
      setReady(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    })();
    return () => { cancelled = true; };
  }, [open]);

  const persist = useCallback((t: number, d: number, def: string[]) => saveSetting(SORT_KEY, { total: t, done: d, deferred: def } satisfies SortState), []);

  const flash = (text: string) => {
    setNote(text);
    window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => setNote(""), 1800);
  };

  const current = queue[0];
  const finished = ready && !current;

  // Zusammenfassung: Fortschritt zurücksetzen (Später-Karten beginnen eine neue Runde)
  useEffect(() => {
    if (finished) saveSetting(SORT_KEY, null);
  }, [finished]);

  // ---------- Aktionen ----------
  const perform = async (item: InboxItem, kind: Kind, opt: { category?: string | null; listId?: string } = {}): Promise<() => Promise<void>> => {
    const restoreItem = async () => void (await db.inbox.put(item));
    switch (kind) {
      case "skill":
      case "project":
      case "habit": {
        const cfg = kind === "skill"
          ? { kategorie: opt.category || UNSORTED, typ: "skill" as const, status: opt.category ? ("idee" as const) : ("rausfinden" as const) }
          : kind === "project"
            ? { kategorie: "Projekte & Besorgungen", typ: "projekt" as const, status: "idee" as const }
            : { kategorie: "Gewohnheiten", typ: "gewohnheit" as const, status: "lerne" as const };
        let created: Skill | null = null;
        await db.transaction("rw", db.skills, db.inbox, async () => {
          created = await createSkill({ name: item.text, ...cfg });
          await db.inbox.delete(item.id);
        });
        const sid = (created as Skill | null)!.id;
        return async () => void (await db.transaction("rw", db.skills, db.inbox, async () => { await db.skills.delete(sid); await db.inbox.put(item); }));
      }
      case "todo": {
        const q = parseQuickTodo(item.text, lists);
        let todo: Todo | null = null;
        await db.transaction("rw", db.todos, db.inbox, async () => {
          todo = await addTodo(q.text || item.text, opt.listId ?? lists[0]?.id ?? "list-allgemein", q.due);
          await db.inbox.delete(item.id);
        });
        const tid = (todo as Todo | null)!.id;
        return async () => void (await db.transaction("rw", db.todos, db.inbox, async () => { await db.todos.delete(tid); await db.inbox.put(item); }));
      }
      case "term": {
        const id = uid();
        await db.transaction("rw", db.terms, db.inbox, async () => {
          await db.terms.add({ id, term: item.text, explanation: "", understood: false, understoodAt: null, links: [], createdAt: Date.now() });
          await db.inbox.delete(item.id);
        });
        return async () => void (await db.transaction("rw", db.terms, db.inbox, async () => { await db.terms.delete(id); await db.inbox.put(item); }));
      }
      case "wish": {
        const id = uid();
        await db.transaction("rw", db.wishes, db.inbox, async () => {
          await db.wishes.add({ id, name: item.text, url: "", note: "", bought: false, boughtAt: null, createdAt: Date.now() });
          await db.inbox.delete(item.id);
        });
        return async () => void (await db.transaction("rw", db.wishes, db.inbox, async () => { await db.wishes.delete(id); await db.inbox.put(item); }));
      }
      case "delete":
        await db.inbox.delete(item.id);
        return restoreItem;
      case "later":
      default:
        return async () => {};
    }
  };

  /** Karte ist abgehandelt: Warteschlange weiter, Zähler hoch, Rückgängig merken. */
  const commit = async (item: InboxItem, kind: Kind, opt: { category?: string | null; listId?: string } = {}) => {
    const undo = await perform(item, kind, opt);
    const nextQueue = queue.filter((i) => i.id !== item.id);
    const nextDeferred = kind === "later" ? [...deferred, item.id] : deferred;
    // „Später“ zählt als bearbeitet (die Karte kommt in dieser Runde nicht zurück)
    const nextDone = done + 1;
    setQueue(nextQueue); setDeferred(nextDeferred); setDone(nextDone);
    setStats((s) => ({ ...s, [kind]: (s[kind] ?? 0) + 1 }));
    setHistory((h) => [...h, { item, kind, undo }]);
    setPending(null);
    flash(DONE_TEXT[kind]);
    if (nextQueue.length) persist(total, nextDone, nextDeferred);
    busy.current = false;
  };

  const undoLast = async () => {
    if (busy.current || pending) return;
    const last = history[history.length - 1];
    if (!last) return;
    busy.current = true;
    await last.undo();
    setHistory((h) => h.slice(0, -1));
    setStats((s) => ({ ...s, [last.kind]: Math.max(0, (s[last.kind] ?? 1) - 1) }));
    const nd = last.kind === "later" ? deferred.filter((id) => id !== last.item.id) : deferred;
    setDeferred(nd);
    setDone(done - 1);
    setQueue((q) => [last.item, ...q]);
    persist(total, done - 1, nd);
    flash("Rückgängig gemacht");
    busy.current = false;
  };

  // ---------- Karte fliegen lassen ----------
  const flyTo = (dir: Dir | "plain", then: () => void) => {
    const el = topRef.current;
    if (!el) { then(); return; }
    const w = window.innerWidth, h = window.innerHeight;
    const t = dir === "skill" ? `translate(${-w * 1.2}px, 0) rotate(-14deg)`
      : dir === "todo" ? `translate(${w * 1.2}px, 0) rotate(14deg)`
      : dir === "later" ? `translate(0, ${-h}px)`
      : dir === "delete" ? `translate(0, ${h}px) rotate(4deg)`
      : "scale(0.88)";
    if (dir !== "plain") el.dataset.dir = dir;
    el.style.setProperty("--p", "1");
    el.style.transition = reduceMotion() ? "none" : "transform 300ms cubic-bezier(.4,.1,.6,1), opacity 300ms ease";
    el.style.transform = t;
    if (dir === "plain") el.style.opacity = "0";
    window.setTimeout(then, reduceMotion() ? 0 : 280);
  };

  const springBack = () => {
    const el = topRef.current;
    if (!el) return;
    el.style.transition = "transform 420ms cubic-bezier(.34,1.5,.64,1)";
    el.style.transform = "";
    el.style.opacity = "";
    el.style.setProperty("--p", "0");
    window.setTimeout(() => { if (el) { delete el.dataset.dir; el.style.transition = ""; } }, 430);
  };

  const decide = (dir: Dir) => {
    if (busy.current || !current || pending) return;
    busy.current = true;
    const item = current;
    navigator.vibrate?.(8);
    if (dir === "skill" || dir === "todo") {
      flyTo(dir, () => { setPending({ kind: dir, item }); busy.current = false; });
    } else {
      flyTo(dir, () => void commit(item, dir));
    }
  };

  const quick = (kind: "term" | "wish" | "project" | "habit") => {
    if (busy.current || !current || pending) return;
    busy.current = true;
    const item = current;
    flyTo("plain", () => void commit(item, kind));
  };

  const cancelPending = () => {
    setPending(null);
    springBack();
  };

  const choose = (opt: { category?: string | null; listId?: string }) => {
    if (!pending) return;
    busy.current = true;
    const { kind, item } = pending;
    void commit(item, kind, opt);
  };

  const close = () => { onClose(); };

  // ---------- Ziehen ----------
  const drag = useRef({ id: -1, x: 0, y: 0, t: 0, dx: 0, dy: 0, vx: 0, vy: 0, lx: 0, ly: 0, lt: 0 });
  const dirOf = (dx: number, dy: number): Dir => (Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "skill" : "todo") : dy < 0 ? "later" : "delete");

  const onDown = (e: React.PointerEvent) => {
    if (busy.current || pending || e.button > 0) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, dy: 0, vx: 0, vy: 0, lx: e.clientX, ly: e.clientY, lt: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    (e.currentTarget as HTMLElement).style.transition = "none";
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    d.dx = e.clientX - d.x; d.dy = e.clientY - d.y;
    const now = performance.now();
    const dt = Math.max(1, now - d.lt);
    d.vx = (e.clientX - d.lx) / dt; d.vy = (e.clientY - d.ly) / dt; d.lx = e.clientX; d.ly = e.clientY; d.lt = now;
    const el = e.currentTarget as HTMLElement;
    el.style.transform = `translate(${d.dx}px, ${d.dy}px) rotate(${d.dx / 24}deg)`;
    const dist = Math.hypot(d.dx, d.dy);
    el.dataset.dir = dirOf(d.dx, d.dy);
    el.style.setProperty("--p", String(Math.min(1, Math.max(0, (dist - 18) / (THRESH - 18)))));
    el.parentElement?.style.setProperty("--lift", String(Math.min(1, dist / THRESH)));
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    d.id = -1;
    const el = e.currentTarget as HTMLElement;
    el.parentElement?.style.setProperty("--lift", "0");
    const dist = Math.hypot(d.dx, d.dy);
    const speed = Math.hypot(d.vx, d.vy);
    if (dist > THRESH || (speed > 0.6 && dist > 36)) decide(dirOf(d.dx, d.dy));
    else springBack();
  };

  // ---------- Tastatur (iPad, Mac) ----------
  useEffect(() => {
    if (!open || !shown) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const map: Record<string, Dir> = { ArrowLeft: "skill", ArrowRight: "todo", ArrowUp: "later", ArrowDown: "delete" };
      if (e.key === "Escape") { e.preventDefault(); if (pending) cancelPending(); else close(); }
      else if (map[e.key]) { e.preventDefault(); decide(map[e.key]); }
      else if ((e.key === "z" || e.key === "Z") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void undoLast(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Hintergrund sperren, solange offen
  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("has-sorter");
    return () => document.documentElement.classList.remove("has-sorter");
  }, [open]);

  // ---------- Vorschläge ----------
  const suggestedCat = useMemo(() => (pending?.kind === "skill" ? suggestCategory(pending.item.text, skills) : null), [pending, skills]);
  const similar = useMemo(() => {
    if (pending?.kind !== "skill") return null;
    return skills.find((s) => Math.max(similarity(pending.item.text, s.name), similarity(pending.item.text, s.title)) >= 80) ?? null;
  }, [pending, skills]);
  const categories = useMemo(() => {
    const first = new Map<string, number>();
    for (const s of skills) if (!AREA_CATS.has(s.kategorie) && (!first.has(s.kategorie) || first.get(s.kategorie)! > s.createdAt)) first.set(s.kategorie, s.createdAt);
    return [...first.entries()].sort((a, b) => a[1] - b[1]).map(([k]) => k);
  }, [skills]);
  const parsed = useMemo(() => (pending?.kind === "todo" ? parseQuickTodo(pending.item.text, lists) : null), [pending, lists]);
  const suggestedList = useMemo(() => {
    if (pending?.kind !== "todo") return null;
    return (parsed?.listId ? lists.find((l) => l.id === parsed.listId) : null) ?? suggestList(pending.item.text, lists) ?? lists[0] ?? null;
  }, [pending, parsed, lists]);

  if (!open) return null;

  const under = queue[1];
  const progress = total ? done / total : 0;
  const summary = (Object.keys(SUMMARY) as Kind[]).filter((k) => (stats[k] ?? 0) > 0);
  const text = current?.text ?? "";
  const size = text.length > 220 ? "s" : text.length > 90 ? "m" : "l";

  return createPortal(
    <div className={`sorter${shown ? " is-shown" : ""}`} role="dialog" aria-modal="true" aria-label="Inbox sortieren">
      <div className="sorter-bar">
        <button className="sorter-link" onClick={close}>{finished ? "Fertig" : "Abbrechen"}</button>
        <div className="sorter-count" aria-live="polite">{finished ? "Alles durch" : <><b>{Math.min(done + 1, total)}</b> / {total}</>}</div>
        <span className="sorter-link is-spacer" aria-hidden="true">Abbrechen</span>
      </div>
      <div className="sorter-progress" aria-hidden="true"><i style={{ width: `${progress * 100}%` }} /></div>

      {!finished && ready && (
        <>
          <div className="sorter-stage">
            {under && (
              <div key={under.id} className="sc-card sc-under" aria-hidden="true">
                <div className="sc-text is-l">{under.text}</div>
              </div>
            )}
            {current && (
              <div key={current.id} ref={topRef} className="sc-card sc-top" data-size={size}
                onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
                style={pending ? { visibility: "hidden" } : undefined}>
                <span className="sc-edge" aria-hidden="true" />
                {(Object.keys(LABEL) as Dir[]).map((d) => <span key={d} className="sc-badge" data-for={d} aria-hidden="true">{LABEL[d]}</span>)}
                <div className={`sc-text is-${size}`}>{current.text}</div>
              </div>
            )}
          </div>
          <div className="sorter-hint" aria-hidden="true">
            <span>← Skill</span><span>↑ Später</span><span>↓ Löschen</span><span>To-do →</span>
          </div>
          <div className={`sorter-note${note ? " is-on" : ""}`} role="status">{note || " "}</div>
          <div className="sorter-tools">
            {([["term", "Begriff", "term"], ["wish", "Wunschliste", "gift"], ["project", "Projekt", "checklist"], ["habit", "Gewohnheit", "repeat"]] as const).map(([k, l, i]) => (
              <button key={k} className="sorter-tool" onClick={() => quick(k)}><Icon name={i} size={22} /><span>{l}</span></button>
            ))}
            <button className="sorter-tool" onClick={() => void undoLast()} disabled={!history.length}><Icon name="undo" size={22} /><span>Rückgängig</span></button>
          </div>
        </>
      )}

      {finished && (
        <div className="sorter-summary">
          <div className="sorter-summary-title">Inbox durchgesehen</div>
          {summary.length === 0 ? (
            <div className="sorter-summary-text">Keine Ideen zum Sortieren.</div>
          ) : (
            <ul>
              {summary.map((k) => (
                <li key={k}><b>{stats[k]}</b><span>{SUMMARY[k][(stats[k] ?? 0) === 1 ? 0 : 1]}</span></li>
              ))}
            </ul>
          )}
          {history.length > 0 && <button className="sorter-link" onClick={() => void undoLast()}>Letzte Karte zurückholen</button>}
        </div>
      )}

      {/* Auswahl nach „Skill“ / „To-do“ */}
      <div className={`sorter-panel-layer${pending ? " is-open" : ""}`}>
        <div className="sorter-panel-backdrop" onClick={cancelPending} />
        {pending && (
          <div className="sorter-panel" role="group" aria-label={pending.kind === "skill" ? "Kategorie wählen" : "Liste wählen"}>
            <div className="sp-head">
              <button className="sorter-link" onClick={cancelPending}>Zurück</button>
              <div className="sp-title">{pending.kind === "skill" ? "Kategorie" : "Liste"}</div>
              <button className="sorter-link" onClick={() => choose(pending.kind === "skill" ? { category: null } : { listId: lists[0]?.id })}>Überspringen</button>
            </div>
            <div className="sp-idea">{pending.item.text}</div>
            {pending.kind === "skill" && (
              <>
                {similar && <div className="sp-note">Ähnlich vorhanden: „{similar.title}“</div>}
                <div className="sp-body">
                  {suggestedCat && (
                    <button className="sp-suggest cv" style={catVars(suggestedCat)} onClick={() => choose({ category: suggestedCat })}>
                      <span className="icon-tile tile-cat"><CategoryIcon name={suggestedCat} size={18} /></span>
                      <span className="sp-suggest-main"><small>Vorschlag</small>{suggestedCat}</span>
                      <Icon name="chevron-right" size={15} />
                    </button>
                  )}
                  <div className="sp-chips">
                    {categories.filter((k) => k !== suggestedCat).map((k) => (
                      <button key={k} className="sp-chip cv" style={catVars(k)} onClick={() => choose({ category: k })}>
                        <CategoryIcon name={k} size={16} />{shortCategory(k)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="sp-foot">Ohne Auswahl landet der Skill unter „Klären“.</div>
              </>
            )}
            {pending.kind === "todo" && (
              <>
                {parsed?.due && <div className="sp-note">Fällig: {dueLabel(parsed.due)}</div>}
                <div className="sp-body">
                  <div className="sp-chips">
                    {[...(suggestedList ? [suggestedList] : []), ...lists.filter((l) => l.id !== suggestedList?.id)].map((l, i) => (
                      <button key={l.id} className={`sp-chip${i === 0 ? " is-suggested" : ""}`} onClick={() => choose({ listId: l.id })}>
                        {i === 0 && <small>Vorschlag</small>}{l.name}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
