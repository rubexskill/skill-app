import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { addDays, bigTime, dailyMinutes, dayKey, minutesLabel, monthBuckets, startOfWeek, streakDays, weekBuckets } from "../logic";
import { EmptyState, Group, NavPage, Row, Segmented } from "../components/ui";
import { BarChart, Heatmap } from "../components/Charts";
import { useStack } from "../components/Stack";
import { CategoryIcon, catVars, shortCategory } from "../categories";
import { useNav } from "../nav";

export function Stats() {
  const nav = useNav();
  const { pop, depth } = useStack();
  const sessions = useLiveQuery(() => db.sessions.orderBy("start").toArray(), []);
  const sessionCount = useLiveQuery(() => db.sessions.count(), []);
  const skills = useLiveQuery(() => db.skills.toArray(), []);
  const since = dayKey(addDays(new Date(), -29));
  const checks = useLiveQuery(() => db.checks.where("date").aboveOrEqual(since).toArray(), [since]);
  const [range, setRange] = useState<"woche" | "monat">("woche");

  const data = useMemo(() => {
    const s = sessions ?? [];
    const days = dailyMinutes(s);
    const weekFrom = startOfWeek().getTime();
    const now = new Date();
    const monthFrom = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const per = new Map<string, number>();
    const habitIds = new Set((skills ?? []).filter((k) => k.typ === "gewohnheit").map((k) => k.id)); // Gewohnheiten zählen in Tagen, nicht in Minuten
    for (const x of s) if (!habitIds.has(x.skillId)) per.set(x.skillId, (per.get(x.skillId) ?? 0) + x.minutes);
    const top = [...per.entries()]
      .map(([id, min]) => ({ skill: skills?.find((k) => k.id === id), min }))
      .filter((x) => x.skill)
      .sort((a, b) => b.min - a.min)
      .slice(0, 5);
    return {
      days,
      week: s.filter((x) => x.start >= weekFrom).reduce((a, x) => a + x.minutes, 0),
      month: s.filter((x) => x.start >= monthFrom).reduce((a, x) => a + x.minutes, 0),
      total: s.reduce((a, x) => a + x.minutes, 0),
      streak: streakDays(days),
      top,
      weeks: weekBuckets(s, 12),
      months: monthBuckets(s, 12),
    };
  }, [sessions, skills]);

  const habitDays = (skills ?? []).filter((k) => k.typ === "gewohnheit" && k.status === "lerne")
    .map((k) => ({ k, n: new Set((checks ?? []).filter((c) => c.skillId === k.id).map((c) => c.date)).size }))
    .sort((a, b) => b.n - a.n);
  const done = (skills ?? []).filter((k) => k.status === "kann" && k.typ === "skill");
  const topMax = data.top[0]?.min ?? 1;
  const tile = (label: string, min: number) => {
    const t = bigTime(min);
    return (
      <div className="stat">
        <div className="stat-label">{label}</div>
        <div className="stat-value"><span className="num">{t.big}</span><span className="unit">{t.unit}</span></div>
      </div>
    );
  };

  return (
    <NavPage title="Statistik" back={depth > 0 ? { label: nav.backLabel, onClick: pop } : undefined}>
      {sessionCount === 0 ? (
        <EmptyState icon="chart" title="Noch keine Lernzeit" text="Sobald du den Timer nutzt, siehst du hier Wochen, Monate und deine Lieblings-Skills." />
      ) : (
        <>
          <div className="stats-grid">
            {tile("Diese Woche", data.week)}
            {tile("Dieser Monat", data.month)}
            {tile("Gesamt", data.total)}
            <div className="stat">
              <div className="stat-label">Serie</div>
              <div className="stat-value"><span className="num">{data.streak}</span><span className="unit">{data.streak === 1 ? "Tag" : "Tage"}</span></div>
            </div>
          </div>

          <section className="panel">
            <div className="section-head-row">
              <h2 className="block-title">Lernzeit</h2>
              <div className="panel-seg">
                <Segmented options={[{ value: "woche", label: "Wochen" }, { value: "monat", label: "Monate" }]} value={range} onChange={setRange} />
              </div>
            </div>
            <BarChart data={range === "woche" ? data.weeks : data.months}
              caption={(b) => (range === "woche" ? (b.current ? "diese Woche" : `Woche ab ${b.label}`) : b.current ? "dieser Monat" : b.label)} />
          </section>

          <section className="panel">
            <h2 className="block-title">Kalender</h2>
            <Heatmap days={data.days} weeks={26} />
          </section>

          {data.top.length > 0 && (
            <Group header="Am meisten geübt">
              {data.top.map(({ skill, min }) => (
                <Row key={skill!.id} className="cv" style={catVars(skill!.kategorie)} title={skill!.title}
                  subtitle={<span className="top-bar"><i style={{ width: `${(min / topMax) * 100}%` }} /></span>}
                  leading={<span className="icon-tile tile-cat"><CategoryIcon name={skill!.kategorie} size={17} /></span>}
                  detail={minutesLabel(min)} onClick={() => nav.push({ type: "skill", id: skill!.id })} />
              ))}
            </Group>
          )}

          {habitDays.length > 0 && (
            <Group header="Gewohnheiten · letzte 30 Tage">
              {habitDays.slice(0, 8).map(({ k, n }) => (
                <Row key={k.id} className="cv" style={catVars(k.kategorie)} title={k.title}
                  leading={<span className="icon-tile tile-cat"><CategoryIcon name={k.kategorie} size={17} /></span>}
                  detail={`${n} ${n === 1 ? "Tag" : "Tage"}`} onClick={() => nav.push({ type: "skill", id: k.id })} />
              ))}
            </Group>
          )}

          <Group header={`Geschafft · ${done.length}`} footer={done.length ? undefined : "Setze einen Skill auf „Geschafft“, wenn du ihn kannst."}>
            {done.slice(0, 10).map((k) => (
              <Row key={k.id} className="cv" style={catVars(k.kategorie)} title={k.title} subtitle={shortCategory(k.kategorie)}
                leading={<span className="icon-tile tile-cat"><CategoryIcon name={k.kategorie} size={17} /></span>}
                chevron onClick={() => nav.push({ type: "skill", id: k.id })} />
            ))}
          </Group>
        </>
      )}
    </NavPage>
  );
}
