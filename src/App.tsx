import { UpdateNotice } from "./update";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";
import { elapsedLabel } from "./logic";
import { Stack, StackContext, type StackPage } from "./components/Stack";
import { UIProvider, useNow } from "./components/ui";
import { Icon } from "./components/Icon";
import { CategoryIcon, catVars, shortCategory } from "./categories";
import { ALL, NavContext, type NavCtx, type Route, type Section } from "./nav";
import { TimerProvider, useTimer } from "./timer";
import { Overview, useCategoryCounts } from "./screens/Overview";
import { SkillDetail } from "./screens/SkillDetail";
import { SkillList } from "./screens/SkillList";
import { Today } from "./screens/Today";
import { Todos, useOpenTodoCount } from "./screens/Todos";
import { Inbox } from "./screens/Inbox";
import { PartPage, UnitPage } from "./screens/Units";
import { Apps, More } from "./screens/More";
import { Habits } from "./screens/Habits";
import { ProjectDetail, Projects } from "./screens/Projects";
import { Stats } from "./screens/Stats";
import { NewSkillSheet } from "./screens/SkillSheets";
import { Terms } from "./screens/Terms";
import { Wishes } from "./screens/Wishes";
import { QuickCapture } from "./quick";

interface SectionDef {
  id: Section;
  label: string;
  icon: string;
  root: () => ReactNode;
}

const SECTIONS: SectionDef[] = [
  { id: "overview", label: "Übersicht", icon: "overview", root: () => <Overview /> },
  { id: "heute", label: "Heute", icon: "today", root: () => <Today /> },
  { id: "todos", label: "To-dos", icon: "todo", root: () => <Todos /> },
  { id: "inbox", label: "Inbox", icon: "tray", root: () => <Inbox /> },
  { id: "gewohnheiten", label: "Gewohnheiten", icon: "repeat", root: () => <Habits /> },
  { id: "projekte", label: "Projekte", icon: "checklist", root: () => <Projects /> },
  { id: "begriffe", label: "Begriffe", icon: "term", root: () => <Terms /> },
  { id: "wunschliste", label: "Wunschliste", icon: "gift", root: () => <Wishes /> },
  { id: "statistik", label: "Statistik", icon: "chart", root: () => <Stats /> },
  { id: "mehr", label: "Mehr", icon: "more", root: () => <More /> },
];
const sectionDef = (id: Section) => SECTIONS.find((s) => s.id === id)!;

/** iPhone: fünf Tabs, der Rest liegt unter „Mehr“ */
const PHONE_TABS: Section[] = ["overview", "heute", "todos", "inbox", "mehr"];

let routeSeq = 0;
type KeyedRoute = Route & { key: string };
const keyed = (r: Route): KeyedRoute => ({ ...r, key: `r${++routeSeq}` });

function renderRoute(r: KeyedRoute): ReactNode {
  switch (r.type) {
    case "skill":
      return <SkillDetail id={r.id} />;
    case "project":
      return <ProjectDetail id={r.id} />;
    case "unit":
      return <UnitPage id={r.id} />;
    case "part":
      return <PartPage id={r.id} />;
    case "category":
      return <SkillList category={r.name} />;
    case "section":
      return sectionDef(r.id).root();
    default:
      return <Apps />;
  }
}

function useMedia(q: string) {
  const [match, setMatch] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setMatch(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [q]);
  return match;
}

function loadSection(): Section {
  try {
    const s = localStorage.getItem("app.section") as Section | null;
    return s && SECTIONS.some((x) => x.id === s) ? s : "overview";
  } catch {
    return "overview";
  }
}
const saveSection = (s: Section) => {
  try { localStorage.setItem("app.section", s); } catch { /* egal */ }
};

function useRunning() {
  const running = useLiveQuery(() => db.skills.filter((s) => s.timerStart != null).first(), []);
  const now = useNow(!!running);
  return { running, now };
}

// ---------------- iPhone: Tab-Leiste ----------------

function PhoneShell() {
  const [tab, setTab] = useState<Section>(() => {
    const s = loadSection();
    return PHONE_TABS.includes(s) ? s : "overview";
  });
  const [stacks, setStacks] = useState<Record<string, KeyedRoute[]>>({});
  const inboxCount = useLiveQuery(() => db.inbox.count(), []) ?? 0;
  const todoCount = useOpenTodoCount() ?? 0;
  const { running, now } = useRunning();
  const timer = useTimer();

  const push = useCallback((t: Section, r: Route) => setStacks((s) => ({ ...s, [t]: [...(s[t] ?? []), keyed(r)] })), []);
  const pop = useCallback((t: Section) => setStacks((s) => ({ ...s, [t]: (s[t] ?? []).slice(0, -1) })), []);

  const select = (t: Section) => {
    if (t === tab) return setStacks((s) => ({ ...s, [t]: [] }));
    setTab(t);
    saveSection(t);
  };

  const navs = useMemo(() => {
    const out = {} as Record<string, NavCtx>;
    for (const id of PHONE_TABS) out[id] = { push: (r) => push(id, r), backLabel: sectionDef(id).label, selectedSkill: null, wide: false };
    return out;
  }, [push]);

  const current = stacks[tab] ?? [];
  const top = current[current.length - 1];
  const showMini = !!running && !(top?.type === "skill" && top.id === running.id) && !(top?.type === "unit" && top.id === running.timerUnit);

  return (
    <div className="app-shell">
      {PHONE_TABS.map((id) => (
        <div key={id} className="tab-pane" hidden={id !== tab}>
          <NavContext.Provider value={navs[id]}>
            <Stack pages={[{ key: "root", node: sectionDef(id).root() }, ...(stacks[id] ?? []).map((r) => ({ key: r.key, node: renderRoute(r) }))] as StackPage[]}
              onPop={() => pop(id)} />
          </NavContext.Provider>
        </div>
      ))}

      <div className={`mini${showMini ? " is-shown" : ""}`} aria-hidden={!showMini} inert={!showMini}>
        {running && (
          <div className="mini-inner cv" style={catVars(running.kategorie)} role="button" tabIndex={0} onClick={() => push(tab, { type: "skill", id: running.id })}>
            <span className="mini-icon"><CategoryIcon name={running.kategorie} size={18} /></span>
            <span className="mini-name">{running.title}</span>
            <span className="mini-time">{elapsedLabel(now - (running.timerStart ?? now))}</span>
            <button className="mini-btn" aria-label="Stoppen und speichern" onClick={(e) => { e.stopPropagation(); void timer.toggle(running); }}>
              <Icon name="pause" size={16} />
            </button>
          </div>
        )}
      </div>

      <nav className="tabbar" aria-label="Bereiche">
        {PHONE_TABS.map((id) => {
          const s = sectionDef(id);
          const badge = id === "inbox" ? inboxCount : id === "todos" ? todoCount : 0;
          return (
            <button key={id} className={`tab${id === tab ? " is-active" : ""}`} onClick={() => select(id)} aria-current={id === tab ? "page" : undefined}>
              <span className="tab-icon">
                <Icon name={id === tab ? `${s.icon}-fill` : s.icon} size={25} />
                {badge > 0 && <span className="badge">{badge > 99 ? "99+" : badge}</span>}
              </span>
              <span className="tab-label">{s.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ---------------- iPad: Seitenleiste + Inhalt (+ Detail bei Listen) ----------------

type Sel = { kind: "section"; id: Section } | { kind: "category"; name: string };

function WideShell() {
  const threeCol = useMedia("(min-width: 1100px)");
  const [sel, setSel] = useState<Sel>(() => ({ kind: "section", id: loadSection() }));
  const [stack, setStack] = useState<KeyedRoute[]>([]);
  const [detail, setDetail] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const inboxCount = useLiveQuery(() => db.inbox.count(), []) ?? 0;
  const todoCount = useOpenTodoCount() ?? 0;
  const cats = useCategoryCounts();
  const { running, now } = useRunning();
  const timer = useTimer();

  const choose = useCallback((s: Sel) => {
    setSel(s);
    setStack([]);
    setDetail(null);
    if (s.kind === "section") saveSection(s.id);
  }, []);

  const split = sel.kind === "category" && threeCol;

  const push = useCallback(
    (r: Route) => {
      if (r.type === "category") return choose({ kind: "category", name: r.name });
      if (r.type === "section") return choose({ kind: "section", id: r.id });
      if (r.type === "skill" && split) return setDetail(r.id);
      setStack((m) => [...m, keyed(r)]);
    },
    [choose, split],
  );

  const selKey = sel.kind === "section" ? sel.id : `cat:${sel.name}`;
  const label = sel.kind === "section" ? sectionDef(sel.id).label : sel.name === ALL ? "Alle" : shortCategory(sel.name);
  const nav: NavCtx = { push, backLabel: label, selectedSkill: split ? detail : null, wide: true };
  const root = sel.kind === "section" ? sectionDef(sel.id).root() : <SkillList category={sel.name} isRoot />;
  const pages: StackPage[] = [{ key: "root", node: root }, ...stack.map((r) => ({ key: r.key, node: renderRoute(r) }))];

  const isOn = (s: Sel) => s.kind === sel.kind && (s.kind === "section" ? s.id === (sel as typeof s).id : s.name === (sel as typeof s).name);
  const item = (s: Sel, icon: ReactNode, text: string, count?: number, style?: React.CSSProperties) => (
    <button key={s.kind === "section" ? s.id : s.name} className={`side-item${isOn(s) ? " is-active" : ""}${s.kind === "category" ? " cv" : ""}`} style={style}
      onClick={() => (isOn(s) ? setStack([]) : choose(s))} aria-current={isOn(s) ? "page" : undefined}>
      {icon}
      <span className="side-text">{text}</span>
      {!!count && <span className="side-count">{count}</span>}
    </button>
  );
  const sec = (id: Section, count?: number) => item({ kind: "section", id }, <Icon name={sectionDef(id).icon} size={21} />, sectionDef(id).label, count);

  return (
    <div className={`app-shell is-wide${split ? " is-split" : ""}`}>
      <aside className="sidebar">
        <div className="side-head">
          <div className="side-title">Skills</div>
          <button className="nav-btn" aria-label="Neuer Eintrag" onClick={() => setNewOpen(true)}><Icon name="plus" size={24} /></button>
        </div>
        <div className="side-scroll">
          {sec("overview")}
          {sec("heute")}
          {sec("todos", todoCount)}
          {sec("inbox", inboxCount)}
          <div className="side-label">Bereiche</div>
          {sec("gewohnheiten")}
          {sec("projekte")}
          {sec("begriffe")}
          {sec("wunschliste")}
          {sec("statistik")}
          <div className="side-label">Kategorien</div>
          {item({ kind: "category", name: ALL }, <span className="side-caticon is-all"><Icon name="stack" size={16} /></span>, "Alle Einträge")}
          {cats.map(([name, count]) => item({ kind: "category", name }, <span className="side-caticon"><CategoryIcon name={name} size={16} /></span>, shortCategory(name), count, catVars(name)))}
          <div className="side-gap" />
          {sec("mehr")}
        </div>
        {running && (
          <div className="side-timer cv" style={catVars(running.kategorie)} role="button" tabIndex={0}
            onClick={() => (split ? setDetail(running.id) : setStack((m) => [...m, keyed({ type: "skill", id: running.id })]))}>
            <span className="mini-icon"><CategoryIcon name={running.kategorie} size={18} /></span>
            <span className="side-timer-text">
              <span className="side-timer-name">{running.title}</span>
              <span className="side-timer-time">{elapsedLabel(now - (running.timerStart ?? now))}</span>
            </span>
            <button className="mini-btn" aria-label="Stoppen und speichern" onClick={(e) => { e.stopPropagation(); void timer.toggle(running); }}>
              <Icon name="pause" size={16} />
            </button>
          </div>
        )}
      </aside>

      <section className="column-main">
        <NavContext.Provider value={nav}>
          <Stack key={selKey} pages={pages} onPop={() => setStack((m) => m.slice(0, -1))} />
        </NavContext.Provider>
      </section>

      {split && (
        <section className="column-detail">
          {detail ? (
            <NavContext.Provider value={nav}>
              <StackContext.Provider value={{ pop: () => setDetail(null), depth: 0 }}>
                <div key={detail} className="detail-pane"><SkillDetail id={detail} /></div>
              </StackContext.Provider>
            </NavContext.Provider>
          ) : (
            <div className="detail-empty">
              <Icon name="stack" size={40} />
              <div>Wähle einen Eintrag</div>
            </div>
          )}
        </section>
      )}

      <NavContext.Provider value={nav}>
        <NewSkillSheet open={newOpen} onClose={() => setNewOpen(false)} onCreated={(s) => push({ type: "skill", id: s.id })} onOpenExisting={(s) => push({ type: "skill", id: s.id })} />
      </NavContext.Provider>
    </div>
  );
}

function Shell() {
  return useMedia("(min-width: 768px) and (min-height: 560px)") ? <WideShell /> : <PhoneShell />;
}

export default function App() {
  return (
    <UIProvider>
      <TimerProvider>
        <QuickCapture />
        <Shell />
        <UpdateNotice />
      </TimerProvider>
    </UIProvider>
  );
}
