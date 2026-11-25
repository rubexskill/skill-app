// Detailseite einer Gewohnheit: nur Status, „Heute erledigt“, Serie in Tagen, Woche und Notizen – kein Timer, keine Minuten.
import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, STATUS_ICON, type Typ } from "../db";
import { dayKey, deleteSkill, habitStats, toggleCheck, updateSkill } from "../logic";
import { AutoTextarea, Fold, Group, NavPage, Row, Segmented, useUI } from "../components/ui";
import { Icon } from "../components/Icon";
import { useStack } from "../components/Stack";
import { catVars } from "../categories";
import { useNav } from "../nav";
import { CatBadge } from "./parts";
import { CategorySheet, typOptions } from "./SkillSheets";
import { MilestoneList } from "./Milestones";
import { WeekDots } from "./Habits";

export default function HabitDetail({ id }: { id: string }) {
  const { pop, depth } = useStack();
  const nav = useNav();
  const { actionSheet, undoable } = useUI();
  const skill = useLiveQuery(() => db.skills.get(id), [id]);
  const checks = useLiveQuery(() => db.checks.where("skillId").equals(id).toArray(), [id]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const loaded = useRef<string | null>(null);
  const notesTimer = useRef(0);

  useEffect(() => {
    if (skill && loaded.current !== skill.id) { loaded.current = skill.id; setTitle(skill.title); setNotes(skill.notes); }
  }, [skill]);
  useEffect(() => { if (skill === undefined && loaded.current) pop(); }, [skill, pop]);

  const back = depth > 0 ? { label: nav.backLabel, onClick: pop } : undefined;
  if (!skill) return <NavPage title="" back={back}><div /></NavPage>;

  const today = dayKey(new Date());
  const set = new Set((checks ?? []).map((c) => c.id));
  const done = set.has(`${id}|${today}`);
  const { current, best } = habitStats((checks ?? []).map((c) => c.date));
  const active = skill.status === "lerne";
  const days = (n: number) => `${n} ${n === 1 ? "Tag" : "Tage"}`;
  const setStatus = (on: boolean) => void updateSkill(id, { status: on ? "lerne" : "idee" });

  return (
    <NavPage title={skill.title} back={back} eyebrow={<CatBadge name={skill.kategorie} />}
      sub={
        <div className="head-meta">
          <button className={`status-menu status-${skill.status}`} aria-label={`Status: ${active ? "Aktiv" : "Pausiert"}`}
            onClick={() => actionSheet({ title: "Status", choices: [{ label: "Aktiv", checked: active, onSelect: () => setStatus(true) }, { label: "Pausiert", checked: !active, onSelect: () => setStatus(false) }] })}>
            <Icon name={STATUS_ICON[skill.status]} size={16} />
            {active ? "Aktiv" : "Pausiert"}
            <Icon name="chevron-down" size={12} />
          </button>
        </div>
      }>
      <div className="cv detail habit-detail" style={catVars(skill.kategorie)}>
        {skill.profile?.about && <p className="one-liner">{skill.profile.about}</p>}

        <section className="habit-hero">
          <button className={`habit-check${done ? " is-done" : ""}`} aria-pressed={done} onClick={() => { navigator.vibrate?.(8); void toggleCheck(id, today); }}>
            <span className="habit-check-mark"><Icon name="check" size={30} /></span>
            <span className="habit-check-label">{done ? "Heute erledigt" : "Heute erledigt?"}</span>
          </button>
          <div className="habit-nums">
            <div><b>{days(current)}</b><span>in Folge</span></div>
            <div><b>{days(best)}</b><span>Beste Serie</span></div>
          </div>
          <WeekDots id={id} checked={set} big />
        </section>

        {skill.milestones.length > 0 && (
          <Fold title="Unterpunkte" icon="checklist" summary={`${skill.milestones.filter((m) => m.done).length} von ${skill.milestones.length}`}>
            <MilestoneList skill={skill} onAllDone={() => undefined} />
          </Fold>
        )}

        <Fold title="Notizen" icon="note" summary={notes.trim().split("\n")[0].slice(0, 40)}>
          <Group>
            <div className="row input-row">
              <AutoTextarea value={notes} placeholder="Gedanken, Ziele, Tipps …"
                onChange={(e) => { const v = e.target.value; setNotes(v); window.clearTimeout(notesTimer.current); notesTimer.current = window.setTimeout(() => void updateSkill(id, { notes: v }), 400); }}
                onBlur={() => { window.clearTimeout(notesTimer.current); if (notes !== skill.notes) void updateSkill(id, { notes }); }} />
            </div>
          </Group>
        </Fold>

        <Fold title="Details bearbeiten" icon="more">
          <Group>
            <div className="row input-row labeled">
              <span className="input-label">Titel</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => { const v = title.trim(); if (!v) setTitle(skill.title); else if (v !== skill.title) void updateSkill(id, { title: v }); }}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
            </div>
          </Group>
          <Group header="Typ">
            <div className="row segmented-row">
              <Segmented options={typOptions} value={skill.typ} onChange={(v: Typ) => void updateSkill(id, { typ: v })} />
            </div>
          </Group>
          <Group><Row title="Kategorie" detail={skill.kategorie} chevron onClick={() => setCatOpen(true)} /></Group>
          <Group>
            <Row title="Eintrag löschen" tone="danger" center onClick={() => actionSheet({
              title: `„${skill.title}“ löschen?`,
              choices: [{ label: "Eintrag löschen", destructive: true, onSelect: () => { pop(); undoable(`„${skill.title}“ gelöscht`, () => deleteSkill(id)); } }],
            })} />
          </Group>
        </Fold>
      </div>
      <CategorySheet open={catOpen} onClose={() => setCatOpen(false)} value={skill.kategorie} onSelect={(k) => void updateSkill(id, { kategorie: k })} />
    </NavPage>
  );
}
