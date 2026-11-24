import { useCallback, useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Recording } from "../db";
import { dateLabel, loadSetting, saveSetting, timeLabel, whenLabel } from "../logic";
import { Metronome, BPM_MAX, BPM_MIN, METERS, clampBpm, meterOf, stopAllMetronomes } from "../metronome";
import { RECORDER_HINT, errorTip, recorderSupported, startRecording, type ActiveRecording, type RecorderError } from "../recorder";
import { addRecording, clipStorage, missingRecordingIds, recordingsOf, recordingsOfUnit, removeRecording, removeRecordings, sizeLabel, storageWarning, updateRecording, type ClipStorage } from "../units";
import { AutoTextarea, Fold, Group, Row, Sheet, Switch, SwipeRow, useUI } from "../components/ui";
import { Icon } from "../components/Icon";
import { Wheel } from "../components/Wheel";

const fmtDur = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// ---------------- Metronom ----------------

export function MetronomeFold({ bpm, meter, onSave, hasClip, onStartWithClip }: {
  bpm: number; meter: string; onSave: (patch: { bpm?: number; meter?: string }) => void; hasClip?: boolean; onStartWithClip?: () => void;
}) {
  const { actionSheet } = useUI();
  const engine = useRef<Metronome | null>(null);
  if (!engine.current) engine.current = new Metronome();
  const [value, setValue] = useState(clampBpm(bpm));
  const [meterId, setMeterId] = useState(meter);
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState<number | null>(null);
  const [muted, setMuted] = useState(() => loadSetting("metro.mute", false));
  const [withClip, setWithClip] = useState(() => loadSetting("metro.withClip", false));
  const beats = meterOf(meterId).beats;

  // anderer Abschnitt bzw. gespeicherter Wert von außen
  useEffect(() => { setValue(clampBpm(bpm)); }, [bpm]);
  useEffect(() => { setMeterId(meter); }, [meter]);

  useEffect(() => {
    const m = engine.current!;
    m.onBeat = (b) => { setBeat(b); window.setTimeout(() => setBeat((cur) => (cur === b ? null : cur)), 110); };
    m.onStop = () => { setRunning(false); setBeat(null); };
    return () => m.stop();
  }, []);
  useEffect(() => { engine.current!.setBpm(value); }, [value]);
  useEffect(() => { engine.current!.setBeats(beats); }, [beats]);
  useEffect(() => { engine.current!.muted = muted; saveSetting("metro.mute", muted); }, [muted]);
  useEffect(() => { saveSetting("metro.withClip", withClip); }, [withClip]);

  // Tempo merken (kurz verzögert, damit das Drehen nicht jedes Mal schreibt)
  const saved = useRef(clampBpm(bpm));
  useEffect(() => { saved.current = clampBpm(bpm); }, [bpm]);
  useEffect(() => {
    if (value === saved.current) return;
    const t = window.setTimeout(() => { saved.current = value; onSave({ bpm: value }); }, 350);
    return () => window.clearTimeout(t);
  }, [value, onSave]);

  const toggle = () => {
    const m = engine.current!;
    if (m.running) { m.stop(); setRunning(false); setBeat(null); return; }
    m.muted = muted;
    m.start(value, beats);
    setRunning(true);
    if (withClip && hasClip) onStartWithClip?.();
  };

  const pickMeter = () =>
    actionSheet({
      title: "Taktart",
      message: "Jeder Schlag klickt, die Eins ist betont. Bei x/8-Takten zählt das Tempo die Achtel.",
      choices: METERS.map((m) => ({ label: m.id, checked: m.id === meterId, onSelect: () => { setMeterId(m.id); onSave({ meter: m.id }); } })),
    });

  return (
    <Fold title="Metronom" icon="metronome" summary={`${value} · ${meterId}`}>
      <div className="metro">
        <div className="metro-main">
          <div className="metro-wheel">
            <Wheel min={BPM_MIN} max={BPM_MAX} value={value} onChange={setValue} label="Tempo in Schlägen pro Minute" />
            <span className="metro-bpm">BPM</span>
          </div>
          <div className="metro-side">
            <button className={`metro-btn${running ? " is-running" : ""}`} onClick={toggle} aria-label={running ? "Metronom stoppen" : "Metronom starten"}>
              <Icon name={running ? "pause" : "play"} size={26} />
            </button>
            <button className="metro-meter" onClick={pickMeter} aria-label={`Taktart ${meterId}`}>{meterId}<Icon name="chevron-down" size={12} /></button>
          </div>
        </div>
        <div className="metro-dots" aria-hidden="true">
          {Array.from({ length: beats }, (_, i) => <i key={i} className={`${i === 0 ? "is-accent " : ""}${beat === i ? "is-on" : ""}`} />)}
        </div>
      </div>
      <Group>
        <Row title="Ton aus" subtitle="Nur die Anzeige blinkt" trailing={<Switch checked={muted} onChange={setMuted} label="Ton aus" />} />
        {hasClip && <Row title="Mit Clip starten" trailing={<Switch checked={withClip} onChange={setWithClip} label="Mit Clip starten" />} />}
      </Group>
    </Fold>
  );
}

// ---------------- Aufnahmen ----------------

export function RecordingsFold({ unitId, partId }: { unitId: string; partId: string | null }) {
  const { toast, undoable, actionSheet } = useUI();
  const recs = useLiveQuery(() => recordingsOf(unitId, partId), [unitId, partId]);
  const unitRecs = useLiveQuery(() => recordingsOfUnit(unitId), [unitId]);
  const missing = useLiveQuery(() => missingRecordingIds(), [recs?.length]);
  const [storage, setStorage] = useState<ClipStorage | null>(null);
  const [active, setActive] = useState<ActiveRecording | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ name: string; tip: string } | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [editing, setEditing] = useState<Recording | null>(null);
  const [compare, setCompare] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const url = useRef<string | null>(null);

  useEffect(() => { void clipStorage().then(setStorage); }, [recs?.length]);
  useEffect(() => {
    if (!active) return;
    const t0 = performance.now();
    const t = window.setInterval(() => setElapsed((performance.now() - t0) / 1000), 250);
    return () => window.clearInterval(t);
  }, [active]);
  useEffect(() => () => { active?.cancel(); stopPlayback(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopPlayback = () => {
    audio.current?.pause();
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = null;
    setPlaying(null);
  };

  const play = async (r: Recording) => {
    if (playing === r.id) return stopPlayback();
    stopPlayback();
    const b = await db.recBlobs.get(r.id);
    if (!b) return toast("Aufnahme fehlt auf diesem Gerät.");
    url.current = URL.createObjectURL(b.blob);
    const a = audio.current ?? (audio.current = new Audio());
    a.src = url.current;
    a.onended = () => stopPlayback();
    setPlaying(r.id);
    void a.play().catch(() => stopPlayback());
  };

  /** Direkt im Tipp-Handler, ohne vorheriges await: iOS verlangt die Berührung für den Mikrofonzugriff. */
  const begin = () => {
    setHint(null);
    setDetail(null);
    stopAllMetronomes();
    stopPlayback();
    const warn = storage ? storageWarning(storage, 5 * 1024 * 1024) : null;
    if (warn && warn.startsWith("Dafür ist nicht genug")) return setHint(warn);
    startRecording().then(
      (rec) => { setElapsed(0); setActive(rec); },
      (err: RecorderError) => {
        const name = err?.name ?? "Unbekannt";
        setHint(RECORDER_HINT[err?.failure ?? "other"]);
        setDetail({ name, tip: errorTip(name) });
      },
    );
  };

  const finish = async () => {
    const a = active;
    if (!a) return;
    setActive(null);
    const { blob, duration, mime } = await a.stop();
    if (!blob.size) { setDetail({ name: "LeereAufnahme", tip: "Das Mikrofon hat nichts geliefert. Beende andere Audio-Apps und versuche es noch einmal." }); return setHint("Es wurde nichts aufgenommen."); }
    await addRecording({ unitId, partId, blob, duration, mime });
    const warn = storageWarning(await clipStorage());
    toast(warn ?? "Aufnahme gespeichert – nur auf diesem Gerät.");
  };

  const removeOne = (r: Recording) => {
    if (playing === r.id) stopPlayback();
    undoable("Aufnahme gelöscht", () => removeRecording(r.id));
  };
  const removeMany = (ids: string[], text: string) => {
    stopPlayback();
    undoable(text, () => removeRecordings(ids));
  };
  const menuAll = () => {
    const here = recs ?? [];
    const whole = unitRecs ?? [];
    const choices = [
      { label: `Alle ${here.length} Aufnahmen hier löschen`, destructive: true, onSelect: () => removeMany(here.map((r) => r.id), `${here.length} Aufnahmen gelöscht`) },
    ];
    if (partId === null && whole.length > here.length) {
      choices.push({ label: `Alle ${whole.length} Aufnahmen des Stücks löschen (mit Abschnitten)`, destructive: true, onSelect: () => removeMany(whole.map((r) => r.id), `${whole.length} Aufnahmen gelöscht`) });
    }
    actionSheet({ title: "Aufnahmen", message: "Danach ist „Rückgängig“ noch kurz möglich.", choices });
  };

  const unsupported = !recorderSupported();
  const warn = storage ? storageWarning(storage) : null;

  return (
    <Fold title="Aufnahmen" icon="mic" summary={recs?.length ? String(recs.length) : ""}
      menu={(recs?.length ?? 0) > 0 ? { label: "Mehr zu den Aufnahmen", onClick: menuAll } : undefined}>
      <Group footer={warn ? <span className="clip-warn">{warn}</span> : undefined}>
        {active ? (
          <div className="row rec-live">
            <span className="rec-dot" aria-hidden="true" />
            <span className="rec-time">{fmtDur(elapsed)}</span>
            <span className="rec-label">Aufnahme läuft</span>
            <button className="rec-stop" onClick={() => void finish()}>Stopp</button>
          </div>
        ) : (
          <Row title="Aufnahme starten" tone={unsupported ? undefined : "accent"} leading={<Icon name="mic" size={18} />} onClick={unsupported ? undefined : begin}
            subtitle={unsupported ? RECORDER_HINT.unsupported : undefined} />
        )}
        {hint && (
          <div className="row rec-hint">
            <div>
              {hint}
              {detail && <small className="rec-detail"><b>Fehler: {detail.name}</b> · {detail.tip}</small>}
            </div>
          </div>
        )}
        {(recs ?? []).map((r) => (
          <SwipeRow key={r.id} actions={[{ label: "Löschen", tone: "danger", onClick: () => removeOne(r) }]}>
            <Row title={r.name} muted={missing?.has(r.id)}
              subtitle={missing?.has(r.id) ? "Aufnahme fehlt auf diesem Gerät" : `${whenLabel(r.at)} · ${fmtDur(r.duration)}${r.note ? " · Notiz" : ""}`}
              leading={
                <button className={`rec-play${playing === r.id ? " is-on" : ""}`} aria-label={playing === r.id ? "Pause" : `${r.name} abspielen`} disabled={missing?.has(r.id)}
                  onClick={(e) => { e.stopPropagation(); void play(r); }}>
                  <Icon name={playing === r.id ? "pause" : "play"} size={15} />
                </button>
              }
              trailing={<button className="rec-del" aria-label={`${r.name} löschen`} onClick={(e) => { e.stopPropagation(); removeOne(r); }}><Icon name="trash" size={17} /></button>}
              onClick={() => setEditing(r)} />
          </SwipeRow>
        ))}
        {(recs?.length ?? 0) >= 2 && <Row title="Vergleichen" tone="accent" leading={<Icon name="repeat" size={18} />} onClick={() => setCompare(true)} />}
      </Group>
      <RecordingSheet rec={editing} onClose={() => setEditing(null)} />
      <CompareSheet open={compare} onClose={() => setCompare(false)} recs={recs ?? []} />
    </Fold>
  );
}

function RecordingSheet({ rec, onClose }: { rec: Recording | null; onClose: () => void }) {
  const [shown, setShown] = useState<Recording | null>(null);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  useEffect(() => { if (rec) { setShown(rec); setName(rec.name); setNote(rec.note); } }, [rec]);
  const save = async () => { if (shown) await updateRecording(shown.id, { name, note: note.trim() }); onClose(); };
  return (
    <Sheet open={!!rec} onClose={onClose} title="Aufnahme" action={{ label: "Sichern", onClick: () => void save(), disabled: !name.trim() }}>
      <Group footer={shown ? `${dateLabel(shown.at)}, ${timeLabel(shown.at)} · ${fmtDur(shown.duration)} · ${sizeLabel(shown.size)}` : undefined}>
        <div className="row input-row labeled">
          <span className="input-label">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void save()} />
        </div>
      </Group>
      <Group header="Notiz">
        <div className="row input-row"><AutoTextarea value={note} placeholder="Was fällt dir beim Hören auf?" onChange={(e) => setNote(e.target.value)} /></div>
      </Group>
    </Sheet>
  );
}

/** Zwei Aufnahmen nacheinander hören: erst A, dann B. */
function CompareSheet({ open, onClose, recs }: { open: boolean; onClose: () => void; recs: Recording[] }) {
  const { actionSheet, toast } = useUI();
  const [a, setA] = useState<string | null>(null);
  const [b, setB] = useState<string | null>(null);
  const [now, setNow] = useState<"A" | "B" | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const url = useRef<string | null>(null);

  useEffect(() => {
    if (open) { setB(recs[0]?.id ?? null); setA(recs[1]?.id ?? null); setNow(null); }
    else stop();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = useCallback(() => {
    if (audio.current) { audio.current.onended = null; audio.current.pause(); }
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = null;
    setNow(null);
  }, []);

  const load = async (id: string | null) => {
    const blob = id ? await db.recBlobs.get(id) : undefined;
    if (!blob) { toast("Eine der Aufnahmen fehlt auf diesem Gerät."); return null; }
    if (url.current) URL.revokeObjectURL(url.current);
    url.current = URL.createObjectURL(blob.blob);
    const el = audio.current ?? (audio.current = new Audio());
    el.src = url.current;
    return el;
  };

  const playBoth = async () => {
    if (now) return stop();
    const el = await load(a);
    if (!el) return;
    setNow("A");
    el.onended = async () => {
      const el2 = await load(b);
      if (!el2) return stop();
      setNow("B");
      el2.onended = () => stop();
      void el2.play().catch(() => stop());
    };
    void el.play().catch(() => stop());
  };

  const label = (id: string | null) => {
    const r = recs.find((x) => x.id === id);
    return r ? `${r.name}` : "–";
  };
  const date = (id: string | null) => {
    const r = recs.find((x) => x.id === id);
    return r ? `${whenLabel(r.at)} · ${fmtDur(r.duration)}` : "";
  };
  const choose = (which: "A" | "B") =>
    actionSheet({
      title: `Aufnahme ${which}`,
      choices: recs.map((r) => ({ label: `${r.name} · ${whenLabel(r.at)}`, checked: r.id === (which === "A" ? a : b), onSelect: () => { stop(); (which === "A" ? setA : setB)(r.id); } })),
    });

  return (
    <Sheet open={open} onClose={onClose} title="Vergleichen" cancelLabel="Fertig">
      <Group className="is-card" footer="Zuerst läuft A, danach B. Wähle zwei Aufnahmen, zum Beispiel von verschiedenen Tagen.">
        <Row className={now === "A" ? "is-selected" : ""} title={<><b className="cmp-tag">A</b>{label(a)}</>} subtitle={date(a)} chevron onClick={() => choose("A")} />
        <Row className={now === "B" ? "is-selected" : ""} title={<><b className="cmp-tag">B</b>{label(b)}</>} subtitle={date(b)} chevron onClick={() => choose("B")} />
      </Group>
      <div className="cmp-play">
        <button className={`metro-btn${now ? " is-running" : ""}`} onClick={() => void playBoth()} aria-label={now ? "Anhalten" : "A, dann B abspielen"}>
          <Icon name={now ? "pause" : "play"} size={26} />
        </button>
        <div className="cmp-state" aria-live="polite">{now ? `Spielt ${now} · ${date(now === "A" ? a : b)}` : "A, dann B abspielen"}</div>
      </div>
    </Sheet>
  );
}
