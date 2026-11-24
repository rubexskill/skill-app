import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { addDays, bigTime, dayKey, isActiveSkill, longDate, minutesLabel, startOfWeek } from "../logic";
import { NavButton, NavPage, useNow } from "../components/ui";
import { Icon } from "../components/Icon";
import { CategoryIcon, catVars, shortCategory } from "../categories";
import { ALL, isAreaCategory, useNav } from "../nav";
import { ActiveCard, useTotals } from "./parts";
import { NewSkillSheet } from "./SkillSheets";
import { SuggestSheet } from "./Suggest";
import { TidyButton } from "./Tidy";

/** Kategorien mit Anzahl – nur Skills, ohne die eigenen Bereiche Gewohnheiten/Projekte */
export function useCategoryCounts() {
  const skills = useLiveQuery(() => db.skills.orderBy("createdAt").toArray(), []);
  return useMemo(() => {
    const m = new Map<string, number>();
    for (const s of skills ?? []) {
      if (s.typ !== "skill" || isAreaCategory(s.kategorie)) continue;
      m.set(s.kategorie, (m.get(s.kategorie) ?? 0) + 1);
    }
    return [...m.entries()];
  }, [skills]);
}

const LETTERS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function WeekStrip() {
  const from = startOfWeek();
  const sessions = useLiveQuery(() => db.sessions.where("start").aboveOrEqual(from.getTime()).toArray(), [from.getTime()]);
  const today = dayKey(new Date());
  const days = LETTERS.map((l, i) => {
    const k = dayKey(addDays(from, i));
    const min = (sessions ?? []).filter((s) => dayKey(new Date(s.start)) === k).reduce((a, s) => a + s.minutes, 0);
    return { l, k, min };
  });
  const total = days.reduce((a, d) => a + d.min, 0);
  const max = Math.max(30, ...days.map((d) => d.min));
  const t = bigTime(total);
  return (
    <div className="weekstrip" aria-label={`Diese Woche ${minutesLabel(total)}`}>
      <div className="weekstrip-total">
        <span className="num">{t.big}</span>
        <span className="unit">{t.unit}</span>
        <span className="weekstrip-label">diese Woche</span>
      </div>
      <div className="weekstrip-days">
        {days.map((d) => (
          <div key={d.k} className={`weekstrip-day${d.k === today ? " is-today" : ""}${d.k > today ? " is-future" : ""}`} title={`${d.l}: ${minutesLabel(d.min)}`}>
            <div className="weekstrip-bar"><i style={{ height: `${d.min ? Math.max(12, (d.min / max) * 100) : 0}%` }} /></div>
            <span>{d.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Overview() {
  const nav = useNav();
  const skills = useLiveQuery(() => db.skills.orderBy("createdAt").toArray(), []);
  const totals = useTotals();
  const cats = useCategoryCounts();
  const [newOpen, setNewOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);

  // Feste Reihenfolge (zuletzt bearbeitet zuerst), damit Karten beim Starten nicht springen
  const active = (skills ?? []).filter(isActiveSkill).sort((a, b) => b.updatedAt - a.updatedAt);
  const now = useNow(active.some((s) => s.timerStart));

  return (
    <NavPage
      title="Übersicht"
      eyebrow={longDate(new Date())}
      trailing={
        <>
          <NavButton icon="search" label="Alle Einträge durchsuchen" onClick={() => nav.push({ type: "category", name: ALL })} />
          <NavButton icon="plus" label="Neuer Eintrag" onClick={() => setNewOpen(true)} />
        </>
      }
      header={<div className="overview-head"><WeekStrip /></div>}
    >
      {skills && skills.length === 0 && (
        <section className="welcome">
          <h2 className="block-title">Willkommen</h2>
          <p>Hol deine Skills mit einem Backup hierher: in der bisherigen Version unter <b>Mehr › Backup exportieren</b>, hier unter <b>Mehr › Backup importieren</b>. Oder leg direkt los.</p>
          <div className="welcome-actions">
            <button className="btn btn-primary btn-small" onClick={() => nav.push({ type: "section", id: "mehr" })}>Backup importieren</button>
            <button className="btn btn-secondary btn-small" onClick={() => setNewOpen(true)}>Neuer Eintrag</button>
          </div>
        </section>
      )}

      <TidyButton />

      {skills && skills.length > 0 && <h2 className="section-title">Aktiv</h2>}
      {skills && skills.length === 0 ? null : skills && active.length === 0 ? (
        <div className="active-empty">
          <div className="active-empty-ring" />
          <div>
            <div className="active-empty-title">Noch nichts aktiv</div>
            <div className="active-empty-text">Setze bei einem Skill den Status auf „Aktiv“ oder lass dir unten etwas vorschlagen.</div>
          </div>
        </div>
      ) : (
        <div className={`acards ${active.length === 1 ? "n-1" : "n-many"}`}>
          {active.map((s) => (
            <ActiveCard key={s.id} skill={s} total={totals?.get(s.id) ?? 0} now={now} big={active.length === 1} />
          ))}
        </div>
      )}

      {skills && skills.length > 0 && <button className="random" onClick={() => setSuggestOpen(true)}>
        <span className="random-icon"><Icon name="dice" size={24} /></span>
        <span className="random-text">
          <span className="random-title">Was soll ich jetzt lernen?</span>
          <span className="random-sub">Passend zu Zeit, Ort und Material</span>
        </span>
        <Icon name="chevron-right" size={17} className="random-chevron" />
      </button>}

      {cats.length > 0 && <h2 className="section-title">Kategorien</h2>}
      <div className="tiles">
        {skills && skills.length > 0 && (
          <button className="tile tile-all cv" onClick={() => nav.push({ type: "category", name: ALL })}>
            <span className="tile-icon"><Icon name="stack" size={24} /></span>
            <span className="tile-count">{skills.length}</span>
            <span className="tile-name">Alle</span>
          </button>
        )}
        {cats.map(([name, count]) => (
          <button key={name} className="tile cv" style={catVars(name)} onClick={() => nav.push({ type: "category", name })}>
            <span className="tile-icon"><CategoryIcon name={name} size={24} /></span>
            <span className="tile-count">{count}</span>
            <span className="tile-name">{shortCategory(name)}</span>
          </button>
        ))}
      </div>

      <NewSkillSheet open={newOpen} onClose={() => setNewOpen(false)}
        onCreated={(s) => nav.push({ type: "skill", id: s.id })}
        onOpenExisting={(s) => nav.push({ type: "skill", id: s.id })} />
      <SuggestSheet open={suggestOpen} onClose={() => setSuggestOpen(false)} onStarted={(s) => nav.push({ type: "skill", id: s.id })} />
    </NavPage>
  );
}
