import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Skill } from "../db";
import { addDays, createSkill, dayKey, deleteSkill, startOfWeek, updateSkill } from "../logic";
import { EmptyState, Group, NavButton, NavPage, Row, Switch, SwipeRow, useUI } from "../components/ui";
import { useStack } from "../components/Stack";
import { useNav } from "../nav";

const WEEK = ["M", "D", "M", "D", "F", "S", "S"];

export function useHabitChecks() {
  const since = dayKey(addDays(new Date(), -120));
  const checks = useLiveQuery(() => db.checks.where("date").aboveOrEqual(since).toArray(), [since]);
  return useMemo(() => new Set((checks ?? []).map((c) => c.id)), [checks]);
}

export function habitStreak(id: string, checked: Set<string>): number {
  let d = new Date();
  if (!checked.has(`${id}|${dayKey(d)}`)) d = addDays(d, -1);
  let n = 0;
  while (checked.has(`${id}|${dayKey(d)}`)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

/** Sieben Punkte für Montag bis Sonntag der laufenden Woche */
export function WeekDots({ id, checked }: { id: string; checked: Set<string> }) {
  const start = startOfWeek();
  const today = dayKey(new Date());
  return (
    <span className="week-dots" aria-label="Diese Woche">
      {WEEK.map((l, i) => {
        const k = dayKey(addDays(start, i));
        return (
          <span key={i} className={`week-dot${checked.has(`${id}|${k}`) ? " is-on" : ""}${k === today ? " is-today" : ""}${k > today ? " is-future" : ""}`}>
            <i />
            <b>{l}</b>
          </span>
        );
      })}
    </span>
  );
}

export function Habits() {
  const nav = useNav();
  const { pop, depth } = useStack();
  const { undoable, toast } = useUI();
  const habits = useLiveQuery(() => db.skills.where("typ").equals("gewohnheit").sortBy("createdAt"), []);
  const checked = useHabitChecks();
  const [draft, setDraft] = useState("");

  const active = (habits ?? []).filter((h) => h.status === "lerne");
  const rest = (habits ?? []).filter((h) => h.status !== "lerne");

  const setActive = (h: Skill, on: boolean) => {
    void updateSkill(h.id, { status: on ? "lerne" : "idee" });
    toast(on ? `„${h.title}“ erscheint jetzt unter Heute` : `„${h.title}“ pausiert`);
  };

  const add = async () => {
    const t = draft.trim();
    if (!t) return;
    await createSkill({ name: t, kategorie: "Gewohnheiten", typ: "gewohnheit", status: "lerne" });
    setDraft("");
  };

  const row = (h: Skill) => {
    const s = habitStreak(h.id, checked);
    const on = h.status === "lerne";
    return (
      <SwipeRow key={h.id} actions={[{ label: "Löschen", tone: "danger", onClick: () => undoable(`„${h.title}“ gelöscht`, () => deleteSkill(h.id)) }]}>
        <Row title={h.title} muted={!on}
          subtitle={<span className="habit-sub"><WeekDots id={h.id} checked={checked} />{s >= 2 && <span className="streak">{s} Tage in Folge</span>}</span>}
          trailing={<Switch checked={on} onChange={(v) => setActive(h, v)} label={`${h.title} aktiv`} />}
          onClick={() => nav.push({ type: "skill", id: h.id })} />
      </SwipeRow>
    );
  };

  return (
    <NavPage title="Gewohnheiten" back={depth > 0 ? { label: nav.backLabel, onClick: pop } : undefined}
      trailing={<NavButton icon="plus" label="Neue Gewohnheit" onClick={() => document.getElementById("new-habit")?.focus()} />}>
      <Group footer="Aktive Gewohnheiten erscheinen unter „Heute“ zum Abhaken.">
        <div className="row input-row compose">
          <input id="new-habit" value={draft} placeholder="Neue Gewohnheit" enterKeyHint="done" onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void add()} />
          {draft.trim() && <button className="inline-btn" onClick={() => void add()}>Hinzufügen</button>}
        </div>
      </Group>
      {habits && habits.length === 0 && <EmptyState icon="repeat" title="Keine Gewohnheiten" text="Leg oben eine an." />}
      {active.length > 0 && <Group header={`Aktiv · ${active.length}`}>{active.map(row)}</Group>}
      {rest.length > 0 && <Group header="Pausiert">{rest.map(row)}</Group>}
    </NavPage>
  );
}
