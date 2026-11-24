import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid, UNIT_STATUSES, UNIT_STATUS_LABEL, type ClipMeta, type Part, type Skill, type UnitStatus } from "../db";
import { dayLabel, elapsedLabel, minutesLabel, bigTime } from "../logic";
import {
  addClip, addLoop, addPartNote, addUnitNote, migrateUnitNote, removeUnitNote, clipStorage, createPart, createUnit, deletePart, deleteUnit, LOOP_SPEEDS, movePart, missingClipIds, removeClip, removePartNote,
  renameClip, setClipRange, sizeLabel, storageWarning, unitProgress, updatePart, updateUnit, type ClipStorage,
} from "../units";
import { AutoTextarea, CheckCircle, Fold, Group, NavButton, NavPage, Row, Segmented, Sheet, Switch, SwipeRow, useNow, useUI } from "../components/ui";
import { Icon } from "../components/Icon";
import { useStack } from "../components/Stack";
import { catVars } from "../categories";
import { useNav } from "../nav";
import { useTimer } from "../timer";
import { LinkSheet } from "./SkillSheets";
import { CatBadge, NextNoteCard, Ring } from "./parts";

const host = (url: string) => {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return url; }
};

/** Kleines Eingabeblatt für einen Namen (neues Stück, neuer Abschnitt). */
function NameSheet({ open, onClose, title, label, placeholder, initial = "", onSave }: { open: boolean; onClose: () => void; title: string; label: string; placeholder: string; initial?: string; onSave: (name: string) => void }) {
  const [text, setText] = useState(initial);
  useEffect(() => { if (open) setText(initial); }, [open, initial]);
  const save = () => { onSave(text.trim()); onClose(); };
  return (
    <Sheet open={open} onClose={onClose} title={title} action={{ label, onClick: save }}>
      <Group>
        <div className="row input-row">
          <input value={text} placeholder={placeholder} enterKeyHint="done" autoFocus onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && save()} />
        </div>
      </Group>
    </Sheet>
  );
}

// ---------------- Unterpunkte auf der Skill-Seite ----------------

export function UnitsSection({ skill }: { skill: Skill }) {
  const nav = useNav();
  const units = useLiveQuery(() => db.units.where("skillId").equals(skill.id).sortBy("order"), [skill.id]);
  const parts = useLiveQuery(async () => {
    const ids = (await db.units.where("skillId").equals(skill.id).primaryKeys()) as string[];
    return db.parts.where("unitId").anyOf(ids).toArray();
  }, [skill.id]);
  const sessions = useLiveQuery(() => db.sessions.where("skillId").equals(skill.id).toArray(), [skill.id]);
  const [adding, setAdding] = useState(false);
  const minutes = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of sessions ?? []) if (s.unitId) m.set(s.unitId, (m.get(s.unitId) ?? 0) + s.minutes);
    return m;
  }, [sessions]);
  const total = (sessions ?? []).reduce((n, s) => n + s.minutes, 0);
  const assigned = [...minutes.values()].reduce((n, v) => n + v, 0);

  return (
    <section className="units">
      <div className="units-head">
        <h2 className="block-title">Unterpunkte</h2>
        <button className="text-btn" onClick={() => setAdding(true)}>+ Neues Stück</button>
      </div>
      {units && units.length === 0 && <p className="units-empty">Noch kein Stück. Mit „+ Neues Stück“ legst du eins an und teilst es in Abschnitte.</p>}
      {(units ?? []).map((u) => {
        const mine = (parts ?? []).filter((p) => p.unitId === u.id);
        const pr = unitProgress(mine);
        return (
          <button key={u.id} className="unit-card" onClick={() => nav.push({ type: "unit", id: u.id })}>
            <span className="unit-main">
              <span className="unit-title">{u.title}</span>
              <span className="unit-meta">
                <span className={`unit-status is-${u.status}`}><i className="unit-dot" />{UNIT_STATUS_LABEL[u.status]}</span>
                <span>{minutesLabel(minutes.get(u.id) ?? 0)}</span>
                {pr.total === 0 && <span>Noch keine Abschnitte</span>}
              </span>
            </span>
            {pr.total > 0 && (
              <Ring value={pr.solid / pr.total} size={44} stroke={5} className="unit-ring">
                <span className="unit-ring-num">{pr.solid}/{pr.total}</span>
              </Ring>
            )}
            <Icon name="chevron-right" size={14} className="unit-chev" />
          </button>
        );
      })}
      {assigned < total && units && units.length > 0 && <p className="units-foot">Gesamt {minutesLabel(total)}, davon {minutesLabel(total - assigned)} ohne Stück.</p>}
      <NameSheet open={adding} onClose={() => setAdding(false)} title="Neues Stück" label="Anlegen" placeholder="Titel, z. B. Name des Stücks"
        onSave={(name) => void createUnit(skill.id, name).then((u) => nav.push({ type: "unit", id: u.id }))} />
    </section>
  );
}

// ---------------- Unterpunkt-Seite ----------------

export function UnitPage({ id }: { id: string }) {
  const { pop, depth } = useStack();
  const nav = useNav();
  const { actionSheet, toast, undoable } = useUI();
  const timer = useTimer();
  const unit = useLiveQuery(() => db.units.get(id), [id]);
  const skill = useLiveQuery(() => (unit ? db.skills.get(unit.skillId) : undefined), [unit?.skillId]);
  const parts = useLiveQuery(() => db.parts.where("unitId").equals(id).sortBy("order"), [id]);
  const sessions = useLiveQuery(() => db.sessions.where("unitId").equals(id).toArray(), [id]);
  const running = !!skill?.timerStart && skill.timerUnit === id;
  const now = useNow(running);
  const [adding, setAdding] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [title, setTitle] = useState("");
  const [draft, setDraft] = useState("");
  const loaded = useRef<string | null>(null);

  useEffect(() => {
    if (unit && loaded.current !== unit.id) { loaded.current = unit.id; setTitle(unit.title); void migrateUnitNote(unit); }
  }, [unit]);
  useEffect(() => { if (unit === undefined && loaded.current) pop(); }, [unit, pop]);

  const back = depth > 0 ? { label: nav.backLabel, onClick: pop } : undefined;
  if (!unit || !skill) return <NavPage title="" back={back}><div /></NavPage>;

  const total = (sessions ?? []).reduce((n, s) => n + s.minutes, 0);
  const pr = unitProgress(parts ?? []);
  const t = bigTime(total);
  const elapsed = running ? now - skill.timerStart! : 0;
  const goal = skill.sessionMinutes * 60000;
  const ring = running ? Math.min(1, elapsed / goal) : pr.total ? pr.solid / pr.total : 0;

  const statusMenu = () =>
    actionSheet({
      title: "Status",
      choices: UNIT_STATUSES.map((s) => ({ label: UNIT_STATUS_LABEL[s], checked: s === unit.status, onSelect: () => void updateUnit(id, { status: s }) })),
    });

  const removeUnit = () => {
    pop();
    undoable(`„${unit.title}“ gelöscht`, () => deleteUnit(id));
  };
  const removePart = (p: Part) => undoable(`„${p.name}“ gelöscht`, () => deletePart(p.id));

  return (
    <NavPage title={unit.title} back={back} eyebrow={<CatBadge name={skill.kategorie} />}
      trailing={(parts?.length ?? 0) > 1 ? <NavButton label={sorting ? "Fertig" : "Sortieren"} onClick={() => setSorting((v) => !v)} bold={sorting} /> : undefined}
      sub={
        <div className="head-meta">
          <button className={`unit-status-btn is-${unit.status}`} onClick={statusMenu} aria-label={`Status: ${UNIT_STATUS_LABEL[unit.status]}`}>
            <i className="unit-dot" />{UNIT_STATUS_LABEL[unit.status]}<Icon name="chevron-down" size={12} />
          </button>
          <span className="info-line">{skill.title}</span>
        </div>
      }>
      <div className="cv detail" style={catVars(skill.kategorie)}>
        {unit.nextNote && <NextNoteCard note={unit.nextNote} />}

        <section className={`hero${running ? " is-running" : ""}`}>
          <Ring value={ring} size={157} stroke={11} className="hero-ring">
            {running ? (
              <>
                <div className="hero-num">{elapsedLabel(elapsed)}</div>
                <div className="hero-sub">{elapsed >= goal ? "Ziel erreicht" : `Ziel ${skill.sessionMinutes} min`}</div>
              </>
            ) : (
              <>
                <div className="hero-num">{t.big}<span className="hero-unit">{t.unit}</span></div>
              </>
            )}
          </Ring>
          <button className="hero-btn" onClick={() => void timer.toggle(skill, id)} aria-label={running ? "Stoppen und speichern" : "Timer starten"}>
            <Icon name={running ? "pause" : "play"} size={28} />
          </button>
          <div className="hero-hint">{running ? "Pause speichert die Einheit" : `Einheit ${skill.sessionMinutes} min${pr.total ? ` · ${pr.solid} von ${pr.total} sitzen` : ""}`}</div>
        </section>

        <section className="units">
          <div className="units-head">
            <h2 className="block-title">Abschnitte</h2>
            <button className="text-btn" onClick={() => setAdding(true)}>+ Abschnitt hinzufügen</button>
          </div>
          {parts && parts.length === 0 && <p className="units-empty">Teile das Stück in benannte Abschnitte, etwa „Intro“, „Strophe 1“ oder „Takt 12–16“. Zu jedem Abschnitt gehören Notizen, Links und Clips.</p>}
          {(parts ?? []).map((p, i) => (
            <div key={p.id} className={`part-card${p.solid ? " is-solid" : ""}`}>
              <SwipeRow actions={[{ label: "Löschen", tone: "danger", onClick: () => removePart(p) }]}>
                <div className="part-row">
                  <CheckCircle checked={p.solid} label={`${p.name}: sitzt`} onToggle={() => void updatePart(p.id, { solid: !p.solid })} />
                  <button className="part-main" onClick={() => nav.push({ type: "part", id: p.id })}>
                    <span className="part-name">{p.name}</span>
                    <span className="part-meta">
                      {p.solid ? "sitzt" : "üben"}
                      {p.notes.length > 0 && <span>{p.notes.length} {p.notes.length === 1 ? "Notiz" : "Notizen"}</span>}
                      {p.clips.length > 0 && <span>{p.clips.length} {p.clips.length === 1 ? "Clip" : "Clips"}</span>}
                      {p.loops > 0 && <span>{p.loops}×</span>}
                    </span>
                  </button>
                  {sorting ? (
                    <span className="part-sort">
                      <button aria-label="Nach oben" disabled={i === 0} onClick={() => void movePart(p.id, -1)}><Icon name="chevron-down" size={16} className="flip" /></button>
                      <button aria-label="Nach unten" disabled={i === (parts?.length ?? 0) - 1} onClick={() => void movePart(p.id, 1)}><Icon name="chevron-down" size={16} /></button>
                    </span>
                  ) : (
                    <Icon name="chevron-right" size={14} className="unit-chev" />
                  )}
                </div>
              </SwipeRow>
            </div>
          ))}
        </section>

        <Fold title="Notizen zum Stück" icon="note" summary={unit.notes?.length ? String(unit.notes.length) : ""}>
          <Group>
            <div className="row input-row compose">
              <AutoTextarea value={draft} placeholder="Gedanken zum Stück, Noten, Tempo …" onChange={(e) => setDraft(e.target.value)} />
              {draft.trim() && <button className="inline-btn" onClick={() => { void addUnitNote(id, draft); setDraft(""); }}>Sichern</button>}
            </div>
            {(unit.notes ?? []).map((n) => (
              <SwipeRow key={n.id} actions={[{ label: "Löschen", tone: "danger", onClick: () => undoable("Notiz gelöscht", () => removeUnitNote(id, n.id)) }]}>
                <Row title={<span className="note-text">{n.text}</span>} subtitle={dayLabel(n.at)} />
              </SwipeRow>
            ))}
          </Group>
        </Fold>

        <Fold title="Details" icon="more">
          <Group>
            <div className="row input-row labeled">
              <span className="input-label">Titel</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => { const v = title.trim(); if (!v) setTitle(unit.title); else if (v !== unit.title) void updateUnit(id, { title: v }); }}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
            </div>
          </Group>
          <Group header="Status">
            <div className="row segmented-row">
              <Segmented options={UNIT_STATUSES.map((s) => ({ value: s, label: UNIT_STATUS_LABEL[s] }))} value={unit.status} onChange={(v: UnitStatus) => void updateUnit(id, { status: v })} />
            </div>
          </Group>
          <Group footer="Die Übezeit bleibt beim Skill.">
            <Row title="Unterpunkt löschen" tone="danger" center onClick={removeUnit} />
          </Group>
        </Fold>
      </div>
      <NameSheet open={adding} onClose={() => setAdding(false)} title="Neuer Abschnitt" label="Hinzufügen" placeholder="Name, z. B. Strophe 1"
        onSave={(name) => void createPart(id, name).then((p) => { toast(`„${p.name}“ angelegt`); nav.push({ type: "part", id: p.id }); })} />
    </NavPage>
  );
}

// ---------------- Abschnitt-Seite ----------------

export function PartPage({ id }: { id: string }) {
  const { pop, depth } = useStack();
  const nav = useNav();
  const { toast, undoable } = useUI();
  const part = useLiveQuery(() => db.parts.get(id), [id]);
  const unit = useLiveQuery(() => (part ? db.units.get(part.unitId) : undefined), [part?.unitId]);
  const skill = useLiveQuery(() => (unit ? db.skills.get(unit.skillId) : undefined), [unit?.skillId]);
  const [name, setName] = useState("");
  const [draft, setDraft] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [player, setPlayer] = useState<string | null>(null);
  const [storage, setStorage] = useState<ClipStorage | null>(null);
  const missing = useLiveQuery(() => missingClipIds(), [part?.clips.length]);
  const loaded = useRef<string | null>(null);
  const pickRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);
  const { actionSheet } = useUI();

  useEffect(() => {
    if (part && loaded.current !== part.id) { loaded.current = part.id; setName(part.name); }
  }, [part]);
  useEffect(() => { if (part === undefined && loaded.current) pop(); }, [part, pop]);
  useEffect(() => { void clipStorage().then(setStorage); }, [part?.clips.length]);

  const back = depth > 0 ? { label: nav.backLabel, onClick: pop } : undefined;
  if (!part || !unit || !skill) return <NavPage title="" back={back}><div /></NavPage>;

  const addFiles = async (files: FileList | null) => {
    for (const f of Array.from(files ?? [])) {
      const est = await clipStorage();
      const warn = storageWarning(est, f.size);
      if (warn && warn.startsWith("Dafür ist nicht genug")) { toast(warn); continue; }
      await addClip(id, f);
      toast(warn ?? `Clip „${f.name || "Clip"}“ gespeichert – nur auf diesem Gerät.`);
    }
    if (pickRef.current) pickRef.current.value = "";
    if (camRef.current) camRef.current.value = "";
  };

  const clipMenu = () =>
    actionSheet({
      title: "Clip hinzufügen",
      message: "Kurze Clips (wenige Sekunden bis eine Minute) reichen. Sie bleiben nur auf diesem Gerät.",
      choices: [
        { label: "Aus der Mediathek wählen", onSelect: () => pickRef.current?.click() },
        { label: "Neu aufnehmen", onSelect: () => camRef.current?.click() },
      ],
    });

  const warn = storage ? storageWarning(storage) : null;
  const playerClip = part.clips.find((c) => c.id === player) ?? null;

  return (
    <NavPage title={part.name} back={back} eyebrow={<span className="eyebrow-cat cv" style={catVars(skill.kategorie)}>{unit.title}</span>}
      sub={<div className="head-meta"><span className={`unit-status is-${part.solid ? "kann" : "lerne"}`}><i className="unit-dot" />{part.solid ? "sitzt" : "üben"}</span>{part.loops > 0 && <span className="info-line">{part.loops}× in der Schleife</span>}</div>}>
      <div className="cv detail" style={catVars(skill.kategorie)}>
        <Group className="is-card">
          <div className="row input-row labeled">
            <span className="input-label">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => { const v = name.trim(); if (!v) setName(part.name); else if (v !== part.name) void updatePart(id, { name: v }); }}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
          </div>
          <Row title="Sitzt" subtitle={part.solid ? "Läuft sicher" : "Noch üben"} trailing={<Switch checked={part.solid} onChange={(v) => void updatePart(id, { solid: v })} label="Sitzt" />} />
        </Group>

        <Group className="is-card" header={<span className="head-with-count">Clips{part.clips.length > 0 && <span className="section-count">{part.clips.length}</span>}</span>}
          footer={storage ? (
            <span className={warn ? "clip-warn" : undefined}>
              Clips: {sizeLabel(storage.clipBytes)}{storage.quota != null && storage.usage != null ? ` · frei ${sizeLabel(Math.max(0, storage.quota - storage.usage))}` : ""}. {warn ?? "Nur auf diesem Gerät, kein Upload, nicht im Backup."}
            </span>
          ) : undefined}>
          {part.clips.map((c) => (
            <SwipeRow key={c.id} actions={[{ label: "Löschen", tone: "danger", onClick: () => undoable("Clip gelöscht", () => removeClip(id, c.id)) }]}>
              <Row title={c.name} subtitle={missing?.has(c.id) ? "Video fehlt auf diesem Gerät" : `${sizeLabel(c.size)}${c.duration ? ` · ${Math.round(c.duration)} s` : ""}`}
                leading={<span className="icon-tile tile-soft"><Icon name="video" size={17} /></span>} chevron onClick={() => setPlayer(c.id)} />
            </SwipeRow>
          ))}
          <Row title="Clip hinzufügen" tone="accent" leading={<Icon name="plus" size={18} />} onClick={clipMenu} />
        </Group>
        <input ref={pickRef} type="file" accept="video/*" multiple hidden onChange={(e) => void addFiles(e.target.files)} />
        <input ref={camRef} type="file" accept="video/*" capture="environment" hidden onChange={(e) => void addFiles(e.target.files)} />

        <Group className="is-card" header="Notizen">
          <div className="row input-row compose">
            <AutoTextarea value={draft} placeholder="Neue Notiz …" onChange={(e) => setDraft(e.target.value)} />
            {draft.trim() && <button className="inline-btn" onClick={() => { void addPartNote(id, draft); setDraft(""); }}>Sichern</button>}
          </div>
          {part.notes.map((n) => (
            <SwipeRow key={n.id} actions={[{ label: "Löschen", tone: "danger", onClick: () => undoable("Notiz gelöscht", () => removePartNote(id, n.id)) }]}>
              <Row title={<span className="note-text">{n.text}</span>} subtitle={dayLabel(n.at)} />
            </SwipeRow>
          ))}
        </Group>

        <Group className="is-card" header="Links & Videos">
          {part.links.map((l) => (
            <SwipeRow key={l.id} actions={[{ label: "Löschen", tone: "danger", onClick: () => {
              const before = part.links;
              undoable("Link gelöscht", async () => { await updatePart(id, { links: before.filter((x) => x.id !== l.id) }); return async () => void (await updatePart(id, { links: before })); });
            } }]}>
              <Row title={l.title || host(l.url)} subtitle={l.title ? host(l.url) : undefined} leading={<span className="icon-tile tile-soft"><Icon name="link" size={17} /></span>}
                onClick={() => window.open(l.url, "_blank", "noopener")} />
            </SwipeRow>
          ))}
          <Row title="Link hinzufügen" tone="accent" leading={<Icon name="plus" size={18} />} onClick={() => setLinkOpen(true)} />
        </Group>

        <Group className="is-card">
          <Row title="Abschnitt löschen" tone="danger" center onClick={() => { pop(); undoable(`„${part.name}“ gelöscht`, () => deletePart(id)); }} />
        </Group>
      </div>
      <LinkSheet open={linkOpen} onClose={() => setLinkOpen(false)} onSave={(url, title) => void updatePart(id, { links: [...part.links, { id: uid(), url, title, addedAt: Date.now() }] })} />
      <ClipPlayer open={!!playerClip} onClose={() => setPlayer(null)} part={part} clip={playerClip} />
    </NavPage>
  );
}

// ---------------- Clip-Player ----------------

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function ClipPlayer({ open, onClose, part, clip }: { open: boolean; onClose: () => void; part: Part; clip: ClipMeta | null }) {
  const [shown, setShown] = useState<ClipMeta | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [absent, setAbsent] = useState(false);
  const [loop, setLoop] = useState(true);
  const [speed, setSpeed] = useState<number>(1);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const [renaming, setRenaming] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const loopRef = useRef(loop);
  loopRef.current = loop;
  const rangeRef = useRef(range);
  rangeRef.current = range;

  useEffect(() => {
    if (!open || !clip) return;
    let obj: string | null = null;
    let cancelled = false;
    setShown(clip); setAbsent(false); setPlaying(false); setUrl(null);
    setRange([clip.start ?? 0, clip.end ?? clip.duration ?? 0]);
    setDuration(clip.duration ?? 0);
    void db.clipBlobs.get(clip.id).then((b) => {
      if (cancelled) return;
      if (!b) return setAbsent(true);
      obj = URL.createObjectURL(b.blob);
      setUrl(obj);
    });
    return () => { cancelled = true; if (obj) URL.revokeObjectURL(obj); };
  }, [open, clip?.id]);

  const apply = () => {
    const v = video.current;
    if (!v) return;
    v.playbackRate = speed;
    v.preservesPitch = true;
    (v as HTMLVideoElement & { webkitPreservesPitch?: boolean }).webkitPreservesPitch = true;
  };
  useEffect(apply, [speed, url]);

  const onMeta = () => {
    const v = video.current;
    if (!v) return;
    apply();
    const d = v.duration;
    if (isFinite(d)) {
      setDuration(d);
      setRange(([a, b]) => [a, b > 0 && b <= d ? b : d]);
    }
  };

  const lap = () => {
    const v = video.current;
    if (!v) return;
    v.currentTime = rangeRef.current[0];
    void addLoop(part.id);
    void v.play();
  };

  const onTime = () => {
    const v = video.current;
    if (!v) return;
    const [a, b] = rangeRef.current;
    if (b > 0 && b < (v.duration || Infinity) && v.currentTime >= b - 0.04) {
      if (loopRef.current) lap();
      else { v.pause(); v.currentTime = a; }
    }
  };
  const onEnded = () => {
    if (loopRef.current) lap();
    else setPlaying(false);
  };

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      if (v.currentTime < rangeRef.current[0] || v.currentTime >= (rangeRef.current[1] || v.duration)) v.currentTime = rangeRef.current[0];
      void v.play();
    } else v.pause();
  };

  const saveRange = (r: [number, number]) => {
    if (!shown) return;
    const whole = r[0] <= 0.05 && Math.abs(r[1] - duration) < 0.05;
    void setClipRange(part.id, shown.id, whole ? undefined : r[0], whole ? undefined : r[1]);
  };

  return (
    <Sheet open={open} onClose={() => { video.current?.pause(); onClose(); }} title={shown?.name ?? "Clip"} cancelLabel="Fertig">
      {shown && (
        <div className="player">
          {absent ? (
            <p className="player-missing">Dieses Video liegt nicht auf diesem Gerät. Clips werden nicht synchronisiert; über Mehr → „Clips importieren“ lassen sie sich wieder einspielen.</p>
          ) : (
            <div className="player-stage">
              <video ref={video} src={url ?? undefined} playsInline preload="auto" onLoadedMetadata={onMeta} onTimeUpdate={onTime} onEnded={onEnded}
                onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onClick={toggle} />
              <button className={`player-play${playing ? " is-playing" : ""}`} onClick={toggle} aria-label={playing ? "Pause" : "Abspielen"}>
                <Icon name={playing ? "pause" : "play"} size={34} />
              </button>
            </div>
          )}

          <div className="player-loops" aria-live="polite">{part.loops > 0 ? `${part.loops}× in der Schleife` : "Noch keine Schleife"}</div>

          <Group className="is-card">
            <Row title="Dauerschleife" trailing={<Switch checked={loop} onChange={setLoop} label="Dauerschleife" />} />
            <div className="row segmented-row">
              <Segmented options={LOOP_SPEEDS.map((v) => ({ value: String(v), label: `${v === 1 ? "1" : String(v).replace(".", ",")}×` }))} value={String(speed)} onChange={(v) => setSpeed(Number(v))} />
            </div>
          </Group>

          {duration > 0 && (
            <Group className="is-card" header="Ausschnitt" footer="Start und Ende der Schleife. Ohne Änderung läuft der ganze Clip.">
              <div className="row range-row">
                <span className="range-label">Start</span>
                <input type="range" min={0} max={duration} step={0.1} value={range[0]} aria-label="Start"
                  onChange={(e) => { const a = Math.min(Number(e.target.value), range[1] - 0.3); setRange([Math.max(0, a), range[1]]); if (video.current && !playing) video.current.currentTime = Math.max(0, a); }}
                  onPointerUp={() => saveRange(rangeRef.current)} onKeyUp={() => saveRange(rangeRef.current)} />
                <span className="range-time">{fmt(range[0])}</span>
              </div>
              <div className="row range-row">
                <span className="range-label">Ende</span>
                <input type="range" min={0} max={duration} step={0.1} value={range[1]} aria-label="Ende"
                  onChange={(e) => setRange([range[0], Math.max(Number(e.target.value), range[0] + 0.3)])}
                  onPointerUp={() => saveRange(rangeRef.current)} onKeyUp={() => saveRange(rangeRef.current)} />
                <span className="range-time">{fmt(range[1])}</span>
              </div>
            </Group>
          )}
          <Group className="is-card"><Row title="Clip umbenennen" tone="accent" onClick={() => setRenaming(true)} /></Group>
        </div>
      )}
      <NameSheet open={renaming} onClose={() => setRenaming(false)} title="Clip umbenennen" label="Sichern" placeholder="Name" initial={shown?.name ?? ""}
        onSave={(n) => { if (shown && n) void renameClip(part.id, shown.id, n).then(() => setShown({ ...shown, name: n })); }} />
    </Sheet>
  );
}
