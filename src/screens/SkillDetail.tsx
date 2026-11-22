import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  db, MOVEMENT_LABEL, PLACES, PLACE_LABEL, SEASON_LABEL, STATUSES, STATUS_ICON, STATUS_LABEL, uid,
  type Movement, type Place, type Season, type Session, type Status, type Typ,
} from "../db";
import { bigTime, dailyMinutes, dayLabel, deleteSkill, elapsedLabel, hoursLabel, minutesLabel, timeLabel, updateSkill } from "../logic";
import { AutoTextarea, Disclosure, Group, NavPage, Row, Segmented, SwipeRow, useNow, useUI } from "../components/ui";
import { Icon } from "../components/Icon";
import { Heatmap } from "../components/Charts";
import { useStack } from "../components/Stack";
import { allCategoryColors, catVars, categoryStyle } from "../categories";
import { useNav } from "../nav";
import { useTimer } from "../timer";
import { CatBadge, Ring } from "./parts";
import { CategorySheet, LinkSheet, MaterialSheet, typOptions, useAllMaterials } from "./SkillSheets";
import { MetricSheet, SessionSheet } from "./EditSheets";
import { ProfileCard } from "./Profile";
import { MilestoneList } from "./Milestones";
import { Records } from "./Records";
import { ProjectDetail } from "./Projects";

const SESSION_PREVIEW = 6;
const EST_CHOICES = [30, 60, 120, 180, 300, 600, 900, 1200, 1800, 3000, 6000, 12000];
const UNIT_CHOICES = [5, 10, 15, 20, 30, 45, 60, 90, 120];
const RATING_LABEL = { 1: "Zäh", 2: "Okay", 3: "Gut" } as const;

const isVideo = (url: string) => /(youtube\.com|youtu\.be|vimeo\.com|tiktok\.com|twitch\.tv)/i.test(url);
const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export function SkillDetail({ id }: { id: string }) {
  const kind = useLiveQuery(() => db.skills.get(id).then((s) => s?.typ ?? null), [id]);
  if (kind === "projekt") return <ProjectDetail id={id} />;
  return <SkillPage id={id} />;
}

function SkillPage({ id }: { id: string }) {
  const { pop, depth } = useStack();
  const nav = useNav();
  const { actionSheet, toast, celebrate, undoable } = useUI();
  const timer = useTimer();
  const skill = useLiveQuery(() => db.skills.get(id), [id]);
  const sessions = useLiveQuery(() => db.sessions.where("skillId").equals(id).reverse().sortBy("start"), [id]);
  const allMaterials = useAllMaterials();
  const running = !!skill?.timerStart;
  const now = useNow(running);

  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [matOpen, setMatOpen] = useState(false);
  const [metricOpen, setMetricOpen] = useState(false);
  const [sessionEdit, setSessionEdit] = useState<{ open: boolean; session: Session | null }>({ open: false, session: null });
  const [showAll, setShowAll] = useState(false);
  const loaded = useRef<string | null>(null);
  const notesTimer = useRef(0);
  const days = useMemo(() => dailyMinutes(sessions ?? []), [sessions]);

  useEffect(() => {
    if (skill && loaded.current !== skill.id) {
      loaded.current = skill.id;
      setTitle(skill.title);
      setName(skill.name);
      setNotes(skill.notes);
    }
  }, [skill]);

  useEffect(() => {
    if (skill === undefined && loaded.current) pop();
  }, [skill, pop]);

  const back = depth > 0 ? { label: nav.backLabel, onClick: pop } : undefined;
  if (!skill) return <NavPage title="" back={back}><div /></NavPage>;

  const isSkill = skill.typ === "skill";
  const total = (sessions ?? []).reduce((a, s) => a + s.minutes, 0);
  const count = sessions?.length ?? 0;
  const visibleSessions = showAll ? sessions ?? [] : (sessions ?? []).slice(0, SESSION_PREVIEW);
  const elapsedMs = running ? now - skill.timerStart! : 0;
  const goalMs = skill.sessionMinutes * 60000;
  const ringValue = running ? Math.min(1, elapsedMs / goalMs) : total / Math.max(1, skill.estMinutes);
  const t = bigTime(total);
  const set = (patch: Parameters<typeof updateSkill>[1]) => void updateSkill(id, patch);

  const setStatus = (s: Status) => {
    if (s === skill.status) return;
    set({ status: s });
    if (s === "kann") {
      celebrate([categoryStyle(skill.kategorie).light, ...allCategoryColors().slice(0, 5)]);
      toast(`„${skill.title}“ geschafft`);
    }
  };

  const statusMenu = () =>
    actionSheet({
      title: "Status",
      choices: STATUSES.map((s) => ({ label: STATUS_LABEL[s], checked: s === skill.status, onSelect: () => setStatus(s) })),
    });

  const choose = <T,>(title: string, options: { value: T; label: string }[], current: T, apply: (v: T) => void) =>
    actionSheet({ title, choices: options.map((o) => ({ label: o.label, checked: o.value === current, onSelect: () => apply(o.value) })) });

  const saveText = (field: "title" | "name", value: string) => {
    const v = value.trim();
    if (!v) {
      if (field === "title") setTitle(skill.title);
      else setName(skill.name);
    } else if (v !== skill[field]) set({ [field]: v });
  };

  const onNotes = (v: string) => {
    setNotes(v);
    window.clearTimeout(notesTimer.current);
    notesTimer.current = window.setTimeout(() => set({ notes: v }), 400);
  };

  const removeSession = (s: Session) =>
    undoable(`Session (${minutesLabel(s.minutes)}) gelöscht`, async () => {
      await db.sessions.delete(s.id);
      return async () => void (await db.sessions.put(s));
    });

  const removeLink = (linkId: string) => {
    const before = skill.links;
    undoable("Link gelöscht", async () => {
      await updateSkill(id, { links: before.filter((x) => x.id !== linkId) });
      return async () => void (await updateSkill(id, { links: before }));
    });
  };

  const confirmDelete = () =>
    actionSheet({
      title: `„${skill.title}“ löschen?`,
      message: count ? `Auch ${count} Session${count === 1 ? "" : "s"} (${minutesLabel(total)}) werden gelöscht.` : undefined,
      choices: [{ label: "Eintrag löschen", destructive: true, onSelect: () => { pop(); undoable(`„${skill.title}“ gelöscht`, () => deleteSkill(id)); } }],
    });

  const allDone = () => {
    if (skill.status === "kann") return;
    actionSheet({
      title: "Alle Meilensteine erledigt",
      message: `„${skill.title}“ auf „Geschafft“ setzen?`,
      choices: [{ label: "Geschafft", onSelect: () => setStatus("kann") }],
    });
  };

  const info = [
    isSkill ? `ca. ${hoursLabel(skill.estMinutes)}` : null,
    `${skill.sessionMinutes} min/Einheit`,
    skill.place !== "ueberall" ? PLACE_LABEL[skill.place] : null,
    skill.material.length ? skill.material.join(", ") : null,
  ].filter(Boolean).join(" · ");

  return (
    <NavPage title={skill.title} back={back} eyebrow={<CatBadge name={skill.kategorie} />}
      sub={
        <div className="head-meta">
          <button className={`status-menu status-${skill.status}`} onClick={statusMenu} aria-label={`Status: ${STATUS_LABEL[skill.status]}`}>
            <Icon name={STATUS_ICON[skill.status]} size={16} />
            {STATUS_LABEL[skill.status]}
            <Icon name="chevron-down" size={12} />
          </button>
          <span className="info-line">{info}</span>
        </div>
      }>
      <div className="cv detail" style={catVars(skill.kategorie)}>
        {!isSkill && skill.profile?.about && <p className="one-liner">{skill.profile.about}</p>}

        {skill.nextNote && (
          <section className="next-note">
            <div className="next-note-head">
              <Icon name="note" size={16} />
              <span>Nächstes Mal</span>
              <span className="next-note-date">{dayLabel(skill.nextNote.at)}{skill.nextNote.rating ? ` · ${RATING_LABEL[skill.nextNote.rating]}` : ""}</span>
            </div>
            <div className="next-note-text">{skill.nextNote.text}</div>
            <button className="next-note-done" onClick={() => set({ nextNote: null })}>Erledigt</button>
          </section>
        )}

        <section className={`hero${running ? " is-running" : ""}`}>
          <Ring value={ringValue} size={236} stroke={16} className="hero-ring">
            {running ? (
              <>
                <div className="hero-num">{elapsedLabel(elapsedMs)}</div>
                <div className="hero-sub">{elapsedMs >= goalMs ? "Ziel erreicht" : `Ziel ${skill.sessionMinutes} min`}</div>
              </>
            ) : (
              <>
                <div className="hero-num">{t.big}<span className="hero-unit">{t.unit}</span></div>
                <div className="hero-sub">{isSkill ? `von ${hoursLabel(skill.estMinutes)}` : count ? `${count} Session${count === 1 ? "" : "s"}` : "noch nichts"}</div>
              </>
            )}
          </Ring>
          <button className="hero-btn" onClick={() => void timer.toggle(skill)} aria-label={running ? "Stoppen und speichern" : "Timer starten"}>
            <Icon name={running ? "pause" : "play"} size={28} />
          </button>
          <div className="hero-hint">{running ? `Seit ${timeLabel(skill.timerStart!)} · Pause speichert` : `Einheit ${skill.sessionMinutes} min`}</div>
        </section>

        {isSkill && <ProfileCard skill={skill} />}

        {(isSkill || skill.milestones.length > 0) && <MilestoneList skill={skill} onAllDone={allDone} />}

        <Records skill={skill} />

        <Group header="Notizen">
          <div className="row input-row">
            <AutoTextarea value={notes} placeholder="Gedanken, Ziele, Tipps …" onChange={(e) => onNotes(e.target.value)}
              onBlur={() => { window.clearTimeout(notesTimer.current); if (notes !== skill.notes) set({ notes }); }} />
          </div>
        </Group>

        <Group header="Links & Videos">
          {skill.links.map((l) => (
            <SwipeRow key={l.id} actions={[{ label: "Löschen", tone: "danger", onClick: () => removeLink(l.id) }]}>
              <Row title={l.title || host(l.url)} subtitle={l.title ? host(l.url) : undefined}
                leading={<span className="icon-tile tile-soft"><Icon name={isVideo(l.url) ? "video" : "link"} size={17} /></span>}
                onClick={() => window.open(l.url, "_blank", "noopener")} />
            </SwipeRow>
          ))}
          <Row title="Link hinzufügen" tone="accent" leading={<Icon name="plus" size={18} />} onClick={() => setLinkOpen(true)} />
        </Group>

        <Group header={<span className="head-with-count">Sessions{count > 0 && <span className="section-count">{minutesLabel(total)}</span>}</span>}
          footer={count ? "Antippen zum Bearbeiten, nach links wischen zum Löschen." : undefined}>
          {count > 0 && <div className="row heatmap-row"><Heatmap days={days} weeks={16} compact /></div>}
          {visibleSessions.map((s) => (
            <SwipeRow key={s.id} actions={[{ label: "Löschen", tone: "danger", onClick: () => removeSession(s) }]}>
              <Row title={<>{dayLabel(s.start)}<span className="dim"> · {minutesLabel(s.minutes)}</span></>}
                subtitle={s.note || undefined}
                leading={<span className={`rating-mini${s.rating ? "" : " is-empty"}`}><Icon name={`rate-${s.rating ?? 3}`} size={18} /></span>}
                detail={timeLabel(s.start)} onClick={() => setSessionEdit({ open: true, session: s })} />
            </SwipeRow>
          ))}
          {count > SESSION_PREVIEW && <Row title={showAll ? "Weniger anzeigen" : `Alle ${count} anzeigen`} tone="accent" onClick={() => setShowAll((v) => !v)} />}
          <Row title="Session hinzufügen" tone="accent" leading={<Icon name="plus" size={18} />} onClick={() => setSessionEdit({ open: true, session: null })} />
        </Group>

        <Disclosure title="Details bearbeiten">
          <Group>
            <div className="row input-row labeled">
              <span className="input-label">Titel</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => saveText("title", title)}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
            </div>
            <div className="row input-row labeled">
              <span className="input-label">Original</span>
              <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => saveText("name", name)}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
            </div>
          </Group>
          <Group header="Typ">
            <div className="row segmented-row">
              <Segmented options={typOptions} value={skill.typ} onChange={(v: Typ) => set({ typ: v })} />
            </div>
          </Group>
          <Group>
            <Row title="Kategorie" detail={skill.kategorie} chevron onClick={() => setCatOpen(true)} />
            <Row title="Bis ich es kann" detail={`ca. ${hoursLabel(skill.estMinutes)}`} chevron
              onClick={() => choose("Geschätzte Zeit, bis du es kannst", EST_CHOICES.map((m) => ({ value: m, label: hoursLabel(m) })), skill.estMinutes, (v) => set({ estMinutes: v }))} />
            <Row title="Übungseinheit" detail={minutesLabel(skill.sessionMinutes)} chevron
              onClick={() => choose("Dauer einer Übungseinheit", UNIT_CHOICES.map((m) => ({ value: m, label: minutesLabel(m) })), skill.sessionMinutes, (v) => set({ sessionMinutes: v }))} />
            <Row title="Bewegung" detail={MOVEMENT_LABEL[skill.movement]} chevron
              onClick={() => choose("Bewegung", ([0, 1, 2] as Movement[]).map((m) => ({ value: m, label: MOVEMENT_LABEL[m] })), skill.movement, (v) => set({ movement: v }))} />
            <Row title="Ort" detail={PLACE_LABEL[skill.place]} chevron
              onClick={() => choose("Ort", PLACES.map((p) => ({ value: p, label: PLACE_LABEL[p] })), skill.place, (v: Place) => set({ place: v }))} />
            <Row title="Material" detail={skill.material.length ? skill.material.join(", ") : "Keins"} chevron onClick={() => setMatOpen(true)} />
            <Row title="Jahreszeit" detail={SEASON_LABEL[skill.season]} chevron
              onClick={() => choose("Am besten im …", (["", "sommer", "winter"] as Season[]).map((s) => ({ value: s, label: SEASON_LABEL[s] })), skill.season, (v) => set({ season: v }))} />
            <Row title="Messwert" detail={skill.metric ? `${skill.metric.label}${skill.metric.unit ? ` (${skill.metric.unit})` : ""}` : "Keiner"} chevron onClick={() => setMetricOpen(true)} />
          </Group>
          <Group>
            <Row title="Eintrag löschen" tone="danger" center onClick={confirmDelete} />
          </Group>
        </Disclosure>
      </div>

      <CategorySheet open={catOpen} onClose={() => setCatOpen(false)} value={skill.kategorie} onSelect={(k) => set({ kategorie: k })} />
      <LinkSheet open={linkOpen} onClose={() => setLinkOpen(false)} onSave={(url, ttl) => set({ links: [...skill.links, { id: uid(), url, title: ttl, addedAt: Date.now() }] })} />
      <MaterialSheet open={matOpen} onClose={() => setMatOpen(false)} title="Benötigtes Material" options={allMaterials} value={skill.material} onChange={(material) => set({ material })} />
      <MetricSheet open={metricOpen} onClose={() => setMetricOpen(false)} metric={skill.metric} onSave={(metric) => set({ metric })} />
      <SessionSheet open={sessionEdit.open} onClose={() => setSessionEdit({ open: false, session: sessionEdit.session })} skillId={id}
        session={sessionEdit.session} defaultMinutes={skill.sessionMinutes} />
    </NavPage>
  );
}
