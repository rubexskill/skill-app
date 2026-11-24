import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid, UNIT_STATUSES, UNIT_STATUS_LABEL, type ClipMeta, type Part, type Skill, type Unit, type UnitStatus } from "../db";
import { dayLabel, elapsedLabel, minutesLabel, bigTime } from "../logic";
import {
  addClip, addPartNote, clipTitle, ensureThumbs, initials, removeUnitCover, setUnitCover, coverCrop, addUnitNote, migrateUnitNote, removeUnitNote, sortUnits, clipStorage, createPart, createUnit, deletePart, deleteUnit, movePart, missingClipIds, removeClip, removePartNote,
  renameClip, setPartMetronome, setUnitMetronome, sizeLabel, storageWarning, unitProgress, updatePart, updateUnit, type ClipStorage,
} from "../units";
import { AutoTextarea, CheckCircle, Fold, Group, NavButton, NavPage, Row, Segmented, Sheet, Switch, SwipeRow, useNow, useUI } from "../components/ui";
import { Icon } from "../components/Icon";
import { useStack } from "../components/Stack";
import { catVars } from "../categories";
import { useNav } from "../nav";
import { useTimer } from "../timer";
import { LinkSheet } from "./SkillSheets";
import { ClipPlayer } from "./ClipPlayer";
import { fmtTime } from "../clipLoop";
import { MetronomeFold, RecordingsFold } from "./Practice";
import { effectiveMetronome } from "../metronome";
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

// ---------------- Titelbild ----------------

/** Lädt das Titelbild aus der lokalen Datenbank; ohne Bild ruhiger Platzhalter in Kategorie-Farbe. */
export function UnitCover({ unit, kategorie, size = "grid" }: { unit: { id: string; title: string; hasCover?: boolean }; kategorie: string; size?: "grid" | "head" }) {
  const blob = useLiveQuery(async () => (unit.hasCover ? (await db.covers.get(unit.id)) ?? null : undefined), [unit.id, unit.hasCover]);
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!blob?.blob) { setUrl(null); return; }
    const u = URL.createObjectURL(blob.blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  const gone = !!unit.hasCover && blob === null;
  return (
    <span className={`ucover is-${size}${url ? "" : " is-empty"}`} style={catVars(kategorie)} data-missing={gone ? "1" : undefined}>
      {url ? <img src={url} alt="" draggable={false} /> : <span className="ucover-ph">{initials(unit.title)}</span>}
      {gone && size === "grid" && <span className="ucover-note">Bild fehlt auf diesem Gerät</span>}
    </span>
  );
}

/** Zuschneiden auf ein Quadrat: Bild mit einem Finger schieben, Regler zum Vergrößern. */
function CropSheet({ file, onClose, onDone }: { file: File | null; onClose: () => void; onDone: (b: Blob) => void }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [view, setView] = useState(280);
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number; px: number; py: number } | null>(null);
  useEffect(() => {
    setZoom(1); setPos({ x: 0, y: 0 }); setImg(null);
    if (!file) return;
    const u = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => setImg(im);
    im.src = u;
    return () => URL.revokeObjectURL(u);
  }, [file]);
  useEffect(() => { if (img && frame.current) setView(frame.current.clientWidth || 280); }, [img]);
  const c = img ? coverCrop(img.naturalWidth, img.naturalHeight, view, zoom, pos.x, pos.y) : null;
  const save = () => {
    if (!img || !c) return;
    const cv = document.createElement("canvas");
    cv.width = cv.height = 800;
    cv.getContext("2d")?.drawImage(img, c.sx, c.sy, c.size, c.size, 0, 0, 800, 800);
    cv.toBlob((b) => { if (b) onDone(b); onClose(); }, "image/jpeg", 0.85);
  };
  return (
    <Sheet open={!!file} onClose={onClose} title="Titelbild" action={{ label: "Sichern", onClick: save }}>
      <div className="crop">
        <div ref={frame} className="crop-frame"
          onPointerDown={(e) => { drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, px: pos.x, py: pos.y }; e.currentTarget.setPointerCapture(e.pointerId); }}
          onPointerMove={(e) => { const d = drag.current; if (d && d.id === e.pointerId) setPos({ x: d.px + e.clientX - d.x, y: d.py + e.clientY - d.y }); }}
          onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
          {img && c && <img src={img.src} alt="" draggable={false} style={{ width: img.naturalWidth * c.scale, height: img.naturalHeight * c.scale, left: c.left, top: c.top }} />}
        </div>
        <input className="crop-zoom" type="range" min={1} max={3} step={0.01} value={zoom} aria-label="Vergrößern" onChange={(e) => setZoom(Number(e.target.value))} />
      </div>
    </Sheet>
  );
}

/** Auswahl, Zuschnitt und Entfernen des Titelbilds (für ein beliebiges Stück, das beim Öffnen übergeben wird). */
function useCoverPicker() {
  const { actionSheet, undoable } = useUI();
  const [file, setFile] = useState<File | null>(null);
  const idRef = useRef("");
  const input = useRef<HTMLInputElement>(null);
  const node = (
    <>
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); e.target.value = ""; }} />
      <CropSheet file={file} onClose={() => setFile(null)} onDone={(b) => void setUnitCover(idRef.current, b)} />
    </>
  );
  const open = (unitId: string, hasCover: boolean) => {
    idRef.current = unitId;
    actionSheet({
      title: "Titelbild",
      choices: [
        { label: "Aus der Mediathek wählen", onSelect: () => input.current?.click() },
        ...(hasCover ? [{ label: "Bild entfernen", destructive: true, onSelect: () => undoable("Titelbild entfernt", () => removeUnitCover(unitId)) }] : []),
      ],
    });
  };
  return { open, node };
}

/** Langes Drücken (≈ 0,5 s) öffnet ein Menü, kurzes Tippen bleibt ein normaler Klick. */
function useLongPress(onLong: () => void) {
  const timer = useRef(0);
  const fired = useRef(false);
  const cancel = () => window.clearTimeout(timer.current);
  return {
    onPointerDown: () => { fired.current = false; cancel(); timer.current = window.setTimeout(() => { fired.current = true; navigator.vibrate?.(8); onLong(); }, 520); },
    onPointerUp: cancel, onPointerLeave: cancel, onPointerCancel: cancel,
    onPointerMove: (e: React.PointerEvent) => { if (Math.abs(e.movementX) + Math.abs(e.movementY) > 3) cancel(); },
    onContextMenu: (e: React.SyntheticEvent) => e.preventDefault(),
    onClickCapture: (e: React.SyntheticEvent) => { if (fired.current) { fired.current = false; e.stopPropagation(); e.preventDefault(); } },
  };
}

function UnitTile({ unit, kategorie, pr, onOpen, onMenu }: { unit: Unit; kategorie: string; pr: { solid: number; total: number }; onOpen: () => void; onMenu: () => void }) {
  const lp = useLongPress(onMenu);
  return (
    <button className="unit-tile" onClick={onOpen} {...lp}>
      <UnitCover unit={unit} kategorie={kategorie} />
      <span className="unit-tile-title">{unit.title}</span>
      <span className="unit-tile-meta">
        <span className={`unit-status is-${unit.status}`}><i className="unit-dot" />{UNIT_STATUS_LABEL[unit.status]}</span>
        {pr.total > 0 && <span className="unit-tile-prog">{pr.solid}/{pr.total}</span>}
      </span>
      {pr.total > 0 && <span className="unit-bar" aria-hidden="true"><i style={{ width: `${(pr.solid / pr.total) * 100}%` }} /></span>}
    </button>
  );
}

export function UnitsSection({ skill }: { skill: Skill }) {
  const nav = useNav();
  const units = useLiveQuery(() => db.units.where("skillId").equals(skill.id).sortBy("order"), [skill.id]);
  const parts = useLiveQuery(async () => {
    const ids = (await db.units.where("skillId").equals(skill.id).primaryKeys()) as string[];
    return db.parts.where("unitId").anyOf(ids).toArray();
  }, [skill.id]);
  const sessions = useLiveQuery(() => db.sessions.where("skillId").equals(skill.id).toArray(), [skill.id]);
  const [adding, setAdding] = useState(false);
  const [renaming, setRenaming] = useState<Unit | null>(null);
  const { actionSheet, undoable } = useUI();
  const cover = useCoverPicker();
  const unitMenu = (u: Unit) =>
    actionSheet({
      title: u.title,
      choices: [
        { label: "Titelbild ändern", onSelect: () => cover.open(u.id, !!u.hasCover) },
        { label: "Umbenennen", onSelect: () => setRenaming(u) },
        { label: "Löschen", destructive: true, onSelect: () => undoable(`„${u.title}“ gelöscht`, () => deleteUnit(u.id)) },
      ],
    });
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
      </div>
      <div className="unit-grid">
        {(() => {
          const sorted = sortUnits(units ?? []);
          const tiles = sorted.map((u) => (
            <UnitTile key={u.id} unit={u} kategorie={skill.kategorie} pr={unitProgress((parts ?? []).filter((p) => p.unitId === u.id))}
              onOpen={() => nav.push({ type: "unit", id: u.id })} onMenu={() => unitMenu(u)} />
          ));
          const add = (
            <button key="add" className="unit-add" onClick={() => setAdding(true)}><Icon name="plus" size={18} /><span>Neues Stück</span></button>
          );
          // „Neues Stück“ steht direkt neben dem ersten Stück
          return [...tiles.slice(0, 1), add, ...tiles.slice(1)];
        })()}
      </div>
      {assigned < total && units && units.length > 0 && <p className="units-foot">Gesamt {minutesLabel(total)}, davon {minutesLabel(total - assigned)} ohne Stück.</p>}
      {cover.node}
      <NameSheet open={!!renaming} onClose={() => setRenaming(null)} title="Stück umbenennen" label="Sichern" placeholder="Titel" initial={renaming?.title ?? ""}
        onSave={(t) => { if (renaming && t) void updateUnit(renaming.id, { title: t }); }} />
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
  const cover = useCoverPicker();
  const saveUnitMetro = useCallback((patch: { bpm?: number; meter?: string }) => void setUnitMetronome(id, patch), [id]);

  useEffect(() => {
    if (unit && loaded.current !== unit.id) { loaded.current = unit.id; setTitle(unit.title); void migrateUnitNote(unit); }
  }, [unit]);
  useEffect(() => { if (unit === undefined && loaded.current) pop(); }, [unit, pop]);

  const back = depth > 0 ? { label: nav.backLabel, onClick: pop } : undefined;
  if (!unit || !skill) return <NavPage title="" back={back}><div /></NavPage>;

  const total = (sessions ?? []).reduce((n, s) => n + s.minutes, 0);
  const um = effectiveMetronome(null, unit);
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
      cover={<button className="ucover-btn" onClick={() => cover.open(id, !!unit.hasCover)} aria-label="Titelbild ändern"><UnitCover unit={unit} kategorie={skill.kategorie} size="head" /></button>}
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

        <MetronomeFold bpm={um.bpm} meter={um.meter} onSave={saveUnitMetro} />
        <RecordingsFold unitId={id} partId={null} />

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
          <Group>
            <Row title="Titelbild" detail={unit.hasCover ? "Ändern" : "Wählen"} chevron onClick={() => cover.open(id, !!unit.hasCover)} />
          </Group>
          <Group header="Status">
            <div className="row segmented-row">
              <Segmented options={UNIT_STATUSES.map((s) => ({ value: s, label: UNIT_STATUS_LABEL[s] }))} value={unit.status} onChange={(v: UnitStatus) => void updateUnit(id, { status: v })} />
            </div>
          </Group>
          <StorageNote />
          <Group footer="Die Übezeit bleibt beim Skill.">
            <Row title="Unterpunkt löschen" tone="danger" center onClick={removeUnit} />
          </Group>
        </Fold>
      </div>
      {cover.node}
      <NameSheet open={adding} onClose={() => setAdding(false)} title="Neuer Abschnitt" label="Hinzufügen" placeholder="Name, z. B. Strophe 1"
        onSave={(name) => void createPart(id, name).then((p) => { toast(`„${p.name}“ angelegt`); nav.push({ type: "part", id: p.id }); })} />
    </NavPage>
  );
}

// ---------------- Speicher (klein, grau, nur unter Details) ----------------

export function StorageNote() {
  const [st, setSt] = useState<ClipStorage | null>(null);
  useEffect(() => { void clipStorage().then(setSt); }, []);
  if (!st) return null;
  const media = st.clipBytes + (st.recBytes ?? 0);
  const free = st.quota != null && st.usage != null ? ` · frei ${sizeLabel(Math.max(0, st.quota - st.usage))}` : "";
  return <div className="fold-note">{media > 0 ? `Clips und Aufnahmen: ${sizeLabel(media)}${free}. ` : free ? `Speicher${free.replace(" · ", ": ")}. ` : ""}Nur auf diesem Gerät, kein Upload, nicht im Backup.</div>;
}

// ---------------- Abschnitt-Seite ----------------

function ClipRow({ clip, index, missing, onOpen, onMenu }: { clip: ClipMeta; index: number; missing: boolean; onOpen: () => void; onMenu: () => void }) {
  // Langes Drücken = Menü (Umbenennen), kurzes Tippen = Player
  const timer = useRef(0);
  const fired = useRef(false);
  const start = () => { fired.current = false; window.clearTimeout(timer.current); timer.current = window.setTimeout(() => { fired.current = true; navigator.vibrate?.(8); onMenu(); }, 520); };
  const cancel = () => window.clearTimeout(timer.current);
  return (
    <div className="clip-row" role="button" tabIndex={0} onPointerDown={start} onPointerUp={cancel} onPointerLeave={cancel} onPointerMove={(e) => { if (Math.abs(e.movementX) + Math.abs(e.movementY) > 3) cancel(); }}
      onClick={() => { if (fired.current) { fired.current = false; return; } onOpen(); }}
      onKeyDown={(e) => { if (e.key === "Enter" && e.target === e.currentTarget) onOpen(); }}>
      <span className={`clip-thumb${clip.thumb ? "" : " is-empty"}`}>
        {clip.thumb ? <img src={clip.thumb} alt="" draggable={false} /> : <Icon name="video" size={20} />}
      </span>
      <span className="clip-main">
        <span className="clip-title">{clipTitle(clip, index)}</span>
        <span className="clip-sub">{missing ? "Video fehlt auf diesem Gerät" : clip.duration ? fmtTime(clip.duration) : "Video"}</span>
      </span>
      <button className="clip-more" aria-label={`${clipTitle(clip, index)}: Menü`} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onMenu(); }}><span aria-hidden="true">···</span></button>
    </div>
  );
}

export function PartPage({ id }: { id: string }) {
  const { pop, depth } = useStack();
  const nav = useNav();
  const { toast, undoable, actionSheet } = useUI();
  const part = useLiveQuery(() => db.parts.get(id), [id]);
  const unit = useLiveQuery(() => (part ? db.units.get(part.unitId) : undefined), [part?.unitId]);
  const skill = useLiveQuery(() => (unit ? db.skills.get(unit.skillId) : undefined), [unit?.skillId]);
  const [name, setName] = useState("");
  const [draft, setDraft] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [player, setPlayer] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState(false);
  const [renaming, setRenaming] = useState<ClipMeta | null>(null);
  const savePartMetro = useCallback((patch: { bpm?: number; meter?: string }) => void setPartMetronome(id, patch), [id]);
  const [storage, setStorage] = useState<ClipStorage | null>(null);
  const missing = useLiveQuery(() => missingClipIds(), [part?.clips.length]);
  const loaded = useRef<string | null>(null);
  const pickRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (part && loaded.current !== part.id) { loaded.current = part.id; setName(part.name); }
  }, [part]);
  useEffect(() => { if (part === undefined && loaded.current) pop(); }, [part, pop]);
  useEffect(() => { void clipStorage().then(setStorage); }, [part?.clips.length]);
  // Standbilder für ältere Clips nachziehen
  useEffect(() => { if (!player && part?.clips.some((c) => !c.thumb)) void ensureThumbs(id); }, [id, part?.clips.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const back = depth > 0 ? { label: nav.backLabel, onClick: pop } : undefined;
  if (!part || !unit || !skill) return <NavPage title="" back={back}><div /></NavPage>;

  const addFiles = async (files: FileList | null) => {
    for (const f of Array.from(files ?? [])) {
      const warn = storageWarning(await clipStorage(), f.size);
      if (warn && warn.startsWith("Dafür ist nicht genug")) { toast(warn); continue; }
      await addClip(id, f);
      toast(warn ?? "Clip gespeichert.");
    }
    if (pickRef.current) pickRef.current.value = "";
    if (camRef.current) camRef.current.value = "";
  };

  const addMenu = () =>
    actionSheet({
      title: "Clip hinzufügen",
      choices: [
        { label: "Aus der Mediathek wählen", onSelect: () => pickRef.current?.click() },
        { label: "Neu aufnehmen", onSelect: () => camRef.current?.click() },
      ],
    });

  const clipMenu = (c: ClipMeta, i: number) =>
    actionSheet({
      title: clipTitle(c, i),
      choices: [
        { label: "Umbenennen", onSelect: () => setRenaming(c) },
        { label: "Löschen", destructive: true, onSelect: () => undoable("Clip gelöscht", () => removeClip(id, c.id)) },
      ],
    });

  const pm = effectiveMetronome(part, unit);
  const warn = storage ? storageWarning(storage) : null;
  const playerIndex = part.clips.findIndex((c) => c.id === player);
  const playerClip = playerIndex >= 0 ? part.clips[playerIndex] : null;

  return (
    <NavPage title={part.name} back={back} eyebrow={<span className="eyebrow-cat cv" style={catVars(skill.kategorie)}>{unit.title}</span>}
      sub={part.loops > 0 ? <div className="head-meta"><span className="info-line">{part.loops}× in der Schleife</span></div> : undefined}>
      <div className="cv detail" style={catVars(skill.kategorie)}>
        <Group className="is-card">
          <Row title="Sitzt" trailing={<Switch checked={part.solid} onChange={(v) => void updatePart(id, { solid: v })} label="Sitzt" />} />
        </Group>

        <Group className="is-card" header={<span className="head-with-count">Clips{part.clips.length > 0 && <span className="section-count">{part.clips.length}</span>}</span>}
          footer={warn ? <span className="clip-warn">{warn}</span> : undefined}>
          {part.clips.map((c, i) => (
            <SwipeRow key={c.id} actions={[{ label: "Löschen", tone: "danger", onClick: () => undoable("Clip gelöscht", () => removeClip(id, c.id)) }]}>
              <ClipRow clip={c} index={i} missing={!!missing?.has(c.id)} onOpen={() => setPlayer(c.id)} onMenu={() => clipMenu(c, i)} />
            </SwipeRow>
          ))}
          <Row title="Clip hinzufügen" tone="accent" leading={<Icon name="plus" size={18} />} onClick={addMenu} />
        </Group>
        <input ref={pickRef} type="file" accept="video/*" multiple hidden onChange={(e) => void addFiles(e.target.files)} />
        <input ref={camRef} type="file" accept="video/*" capture="environment" hidden onChange={(e) => void addFiles(e.target.files)} />

        <MetronomeFold bpm={pm.bpm} meter={pm.meter} onSave={savePartMetro} hasClip={part.clips.length > 0}
          onStartWithClip={() => { setAutoplay(true); setPlayer(part.clips[0]?.id ?? null); }} />
        <RecordingsFold unitId={part.unitId} partId={id} />

        <Fold title="Notizen" icon="note" summary={part.notes.length ? String(part.notes.length) : ""}>
          <Group>
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
        </Fold>

        <Fold title="Links" icon="link" summary={part.links.length ? String(part.links.length) : ""}>
          <Group>
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
        </Fold>

        <Fold title="Details" icon="more">
          <Group>
            <div className="row input-row labeled">
              <span className="input-label">Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => { const v = name.trim(); if (!v) setName(part.name); else if (v !== part.name) void updatePart(id, { name: v }); }}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
            </div>
          </Group>
          <StorageNote />
          <Group>
            <Row title="Abschnitt löschen" tone="danger" center onClick={() => { pop(); undoable(`„${part.name}“ gelöscht`, () => deletePart(id)); }} />
          </Group>
        </Fold>
      </div>
      <LinkSheet open={linkOpen} onClose={() => setLinkOpen(false)} onSave={(url, title) => void updatePart(id, { links: [...part.links, { id: uid(), url, title, addedAt: Date.now() }] })} />
      <ClipPlayer open={!!playerClip} onClose={() => { setPlayer(null); setAutoplay(false); }} part={part} clip={playerClip} index={Math.max(0, playerIndex)} autoplay={autoplay} />
      <NameSheet open={!!renaming} onClose={() => setRenaming(null)} title="Clip umbenennen" label="Sichern" placeholder="Titel" initial={renaming ? clipTitle(renaming, part.clips.findIndex((c) => c.id === renaming.id)) : ""}
        onSave={(t) => { if (renaming && t) void renameClip(id, renaming.id, t); }} />
    </NavPage>
  );
}
