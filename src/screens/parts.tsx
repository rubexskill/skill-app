import type { ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, STATUS_ICON, STATUS_LABEL, TYP_LABEL, type Skill, type Status } from "../db";
import { bigTime, dayLabel, elapsedLabel, hoursLabel, minutesLabel } from "../logic";
import { Row } from "../components/ui";
import { Icon } from "../components/Icon";
import { CategoryIcon, catVars, shortCategory } from "../categories";
import { useNav } from "../nav";
import { useTimer } from "../timer";

/** Summe der Lernzeit pro Skill */
export function useTotals() {
  return useLiveQuery(async () => {
    const m = new Map<string, number>();
    await db.sessions.each((s) => m.set(s.skillId, (m.get(s.skillId) ?? 0) + s.minutes));
    return m;
  }, []);
}

export function Ring({ value, size, stroke, children, className }: { value: number; size: number; stroke: number; children?: ReactNode; className?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={`cring ${className ?? ""}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle className="cring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" />
        <circle className="cring-val" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - v)} strokeOpacity={v <= 0 ? 0 : 1} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      {children && <div className="cring-center">{children}</div>}
    </div>
  );
}

export function StatusIcon({ status, size = 20 }: { status: Status; size?: number }) {
  return (
    <span className={`status-icon status-${status}`}>
      <Icon name={STATUS_ICON[status]} size={size} />
    </span>
  );
}

export function StatusPill({ status }: { status: Status }) {
  return (
    <span className={`status-pill status-${status}`}>
      <Icon name={STATUS_ICON[status]} size={14} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PlayButton({ skill, size = "s" }: { skill: Skill; size?: "s" | "m" }) {
  const { toggle } = useTimer();
  const running = !!skill.timerStart;
  return (
    <button className={`play play-${size}${running ? " is-running" : ""}`} aria-label={running ? `${skill.title} stoppen` : `${skill.title} starten`}
      onClick={(e) => { e.stopPropagation(); void toggle(skill); }}>
      <Icon name={running ? "pause" : "play"} size={size === "m" ? 17 : 13} />
    </button>
  );
}

/** Farbige Karte für aktive Skills. `big` = einzige aktive Karte, breit und groß. */
export function ActiveCard({ skill, total, now, big }: { skill: Skill; total: number; now: number; big?: boolean }) {
  const nav = useNav();
  const running = !!skill.timerStart;
  const t = bigTime(total);
  const open = () => nav.push({ type: "skill", id: skill.id });
  return (
    <div className={`acard cv${running ? " is-running" : ""}${big ? " is-big" : ""}`} style={catVars(skill.kategorie)}
      role="button" tabIndex={0} onClick={open} onKeyDown={(e) => e.key === "Enter" && open()}>
      <Ring value={total / Math.max(1, skill.estMinutes)} size={big ? 104 : 64} stroke={big ? 10 : 7} className="on-color acard-ring">
        <CategoryIcon name={skill.kategorie} size={big ? 34 : 22} />
      </Ring>
      <div className="acard-body">
        <div className="acard-cat">{shortCategory(skill.kategorie)}</div>
        <div className="acard-title">{skill.title}</div>
        <div className="acard-time">
          {running ? (
            <>
              <span className="num">{elapsedLabel(now - (skill.timerStart ?? now))}</span>
              <span className="unit">läuft</span>
            </>
          ) : (
            <>
              <span className="num">{t.big}</span>
              <span className="unit">{t.unit}</span>
              <span className="of">von {hoursLabel(skill.estMinutes)}</span>
            </>
          )}
        </div>
      </div>
      <div className="acard-play"><PlayButton skill={skill} size="m" /></div>
    </div>
  );
}

/** Zeile in Listen. Play-Knopf nur bei aktiven Skills. */
import { UnsortedMark } from "./Tidy";
export function SkillRow({ skill, total, now, showCategory }: { skill: Skill; total: number; now: number; showCategory?: boolean }) {
  const nav = useNav();
  const running = !!skill.timerStart;
  const active = skill.status === "lerne";
  let subtitle: ReactNode = null;
  if (running) subtitle = <span className="running-label">Läuft · {elapsedLabel(now - (skill.timerStart ?? now))}</span>;
  else if (active && skill.typ === "skill") subtitle = `${minutesLabel(total)} von ${hoursLabel(skill.estMinutes)}`;
  else if (skill.typ !== "skill") subtitle = TYP_LABEL[skill.typ];
  if (showCategory) subtitle = <>{shortCategory(skill.kategorie)}{subtitle ? <span className="sep">{subtitle}</span> : null}</>;

  return (
    <Row className="cv skill-row" style={catVars(skill.kategorie)} title={<>{skill.title}<UnsortedMark on={skill.unsorted} /></>} subtitle={subtitle}
      selected={nav.selectedSkill === skill.id}
      leading={<StatusIcon status={skill.status} />}
      detail={!active && total > 0 ? minutesLabel(total) : undefined}
      trailing={active ? <PlayButton skill={skill} /> : undefined}
      chevron={!active}
      onClick={() => nav.push(skill.typ === "projekt" ? { type: "project", id: skill.id } : { type: "skill", id: skill.id })} />
  );
}

export function CatBadge({ name }: { name: string }) {
  return (
    <span className="cat-badge cv" style={catVars(name)}>
      <CategoryIcon name={name} size={15} />
      {shortCategory(name)}
    </span>
  );
}

const RATING_LABEL = { 1: "Zäh", 2: "Okay", 3: "Gut" } as const;

/** Ruhiger Rückblick auf die letzte Session: Text, Bewertung, Datum klein. */
export function NextNoteCard({ note }: { note: { text: string; rating: 1 | 2 | 3 | null; at: number } }) {
  return (
    <section className="next-note">
      <p className="next-note-text">Zuletzt: {note.text}{note.rating ? ` · ${RATING_LABEL[note.rating]}` : ""}</p>
      <div className="next-note-date">{dayLabel(note.at)}</div>
    </section>
  );
}

