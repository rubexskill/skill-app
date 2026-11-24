import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Skill, type Todo } from "../db";
import { dayKey, dueLabel, isActiveHabit, isActiveSkill, longDate, minutesLabel, setTodoDone, startOfDay, toggleCheck } from "../logic";
import { CheckCircle, EmptyState, Group, NavPage, Row, SwipeRow, useUI } from "../components/ui";
import { Icon } from "../components/Icon";
import { CategoryIcon, catVars } from "../categories";
import { useNav } from "../nav";
import { PlayButton, Ring } from "./parts";
import { useCompleting } from "./Todos";
import { habitStreak, useHabitChecks, WeekDots } from "./Habits";
import { TrainerSheet } from "../trainer/Trainer";
import { endOfToday } from "../srs";

export function Today() {
  const nav = useNav();
  const { undoable } = useUI();
  const today = dayKey(new Date());
  const dayStart = startOfDay(new Date()).getTime();
  const skills = useLiveQuery(() => db.skills.where("status").equals("lerne").sortBy("createdAt"), []);
  const checked = useHabitChecks();
  const todaySessions = useLiveQuery(() => db.sessions.where("start").aboveOrEqual(dayStart).toArray(), [dayStart]);
  const todos = useLiveQuery(() => db.todos.toArray(), []);
  const lists = useLiveQuery(() => db.lists.toArray(), []);
  const { completing, complete } = useCompleting();
  const dueCards = useLiveQuery(async () => {
    const end = endOfToday();
    const due = await db.cards.where("due").belowOrEqual(end).toArray();
    const per = new Map<string, number>();
    for (const c of due) per.set(c.skillId, (per.get(c.skillId) ?? 0) + 1);
    const skillsAll = await db.skills.bulkGet([...per.keys()]);
    return skillsAll.filter((s): s is Skill => !!s).map((s) => ({ skill: s, n: per.get(s.id) ?? 0 })).sort((a, b) => b.n - a.n);
  }, [today]);
  const [cardSkill, setCardSkill] = useState<Skill | null>(null);

  const practice = (skills ?? []).filter(isActiveSkill);
  const habits = (skills ?? []).filter(isActiveHabit);
  const minutesToday = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of todaySessions ?? []) m.set(s.skillId, (m.get(s.skillId) ?? 0) + s.minutes);
    return m;
  }, [todaySessions]);

  const dueTodos = (todos ?? [])
    .filter((t) => t.due && t.due <= today && (!t.done || (t.doneAt ?? 0) >= dayStart))
    .sort((a, b) => Number(a.done) - Number(b.done) || (a.due ?? "").localeCompare(b.due ?? ""));
  const listName = (id: string) => lists?.find((l) => l.id === id)?.name ?? "";

  const isDone = (s: Skill) => checked.has(`${s.id}|${today}`) || (s.typ === "skill" && (minutesToday.get(s.id) ?? 0) > 0);

  const removeTodo = (t: Todo) =>
    undoable("To-do gelöscht", async () => {
      await db.todos.delete(t.id);
      return async () => void (await db.todos.put(t));
    });

  const hasCards = (dueCards?.length ?? 0) > 0;
  const items = practice.length + habits.length + dueTodos.length;
  const done = practice.filter(isDone).length + habits.filter(isDone).length + dueTodos.filter((t) => t.done || completing.has(t.id)).length;
  const loaded = skills && todos;

  return (
    <NavPage title="Heute" eyebrow={longDate(new Date())}>
      {loaded && items === 0 && !hasCards ? (
        <>
          <EmptyState icon="today" title="Heute ist nichts geplant" text="Schalte Skills oder Gewohnheiten auf „Aktiv“ oder gib To-dos ein Datum – dann erscheinen sie hier." />
          <Group className="is-card"><Row title="Gewohnheiten verwalten" tone="accent" chevron onClick={() => nav.push({ type: "section", id: "gewohnheiten" })} /></Group>
        </>
      ) : loaded ? (
        <>
          <section className="today-summary">
            <Ring value={items ? done / items : 0} size={76} stroke={9} className="ring-ink" />
            <div>
              <div className="today-num">{done}<span> von {items}</span></div>
              <div className="today-label">{done === items ? "Alles erledigt" : "erledigt"}</div>
            </div>
          </section>

          {hasCards && (
            <Group className="is-card" header="Karteikarten" footer="Fällige Karten wiederholst du kurz – danach sind sie für heute erledigt.">
              {dueCards!.map(({ skill, n }) => (
                <Row key={skill.id} className="cv" style={catVars(skill.kategorie)} title={skill.title} subtitle={`${n} ${n === 1 ? "Karte" : "Karten"} fällig`}
                  leading={<span className="icon-tile tile-cat"><Icon name="cards" size={17} /></span>} chevron onClick={() => setCardSkill(skill)} />
              ))}
            </Group>
          )}

          {practice.length > 0 && (
            <Group className="is-card" header="Üben">
              {practice.map((s) => {
                const m = minutesToday.get(s.id) ?? 0;
                return (
                  <Row key={s.id} className="cv" style={catVars(s.kategorie)} title={s.title} muted={isDone(s)}
                    subtitle={m ? `Heute ${minutesLabel(m)} geübt` : `${s.sessionMinutes} min`}
                    leading={<CheckCircle checked={isDone(s)} label={s.title} onToggle={() => void toggleCheck(s.id, today)} />}
                    trailing={<><span className="row-caticon"><CategoryIcon name={s.kategorie} size={17} /></span><PlayButton skill={s} /></>}
                    onClick={() => nav.push({ type: "skill", id: s.id })} />
                );
              })}
            </Group>
          )}

          <Group className="is-card" header={<span className="head-with-link">Gewohnheiten<button className="text-btn" onClick={() => nav.push({ type: "section", id: "gewohnheiten" })}>Alle</button></span>}
            footer={habits.length ? undefined : "Unter „Gewohnheiten“ einschalten, was täglich hier stehen soll."}>
            {habits.map((h) => {
              const st = habitStreak(h.id, checked);
              return (
                <Row key={h.id} className="cv" style={catVars(h.kategorie)} title={h.title} muted={isDone(h)}
                  subtitle={<span className="habit-sub"><WeekDots id={h.id} checked={checked} />{st >= 2 && <span className="streak">{st} Tage in Folge</span>}</span>}
                  leading={<CheckCircle checked={isDone(h)} label={h.title} onToggle={() => void toggleCheck(h.id, today)} />}
                  onClick={() => nav.push({ type: "skill", id: h.id })} />
              );
            })}
            {habits.length === 0 && <Row title="Gewohnheiten auswählen" tone="accent" leading={<Icon name="repeat" size={18} />} onClick={() => nav.push({ type: "section", id: "gewohnheiten" })} />}
          </Group>

          {dueTodos.length > 0 && (
            <Group className="is-card" header="To-dos" footer="Nach links wischen zum Löschen.">
              {dueTodos.map((t) => {
                const isOn = t.done || completing.has(t.id);
                const overdue = !t.done && t.due! < today;
                return (
                  <SwipeRow key={t.id} actions={[{ label: "Löschen", tone: "danger", onClick: () => removeTodo(t) }]}>
                    <Row className={completing.has(t.id) ? "is-completing" : ""} title={t.text} muted={isOn}
                      subtitle={<>{overdue ? <span className="overdue">{dueLabel(t.due!)}</span> : null}{listName(t.listId) ? <span className={overdue ? "sep" : ""}>{listName(t.listId)}</span> : null}</>}
                      leading={<CheckCircle checked={isOn} label={t.text} onToggle={() => (t.done ? void setTodoDone(t.id, false) : complete(t.id))} />} />
                  </SwipeRow>
                );
              })}
            </Group>
          )}
        </>
      ) : null}
      {cardSkill && <TrainerSheet open={!!cardSkill} onClose={() => setCardSkill(null)} skill={cardSkill} initial="cards" />}
    </NavPage>
  );
}
