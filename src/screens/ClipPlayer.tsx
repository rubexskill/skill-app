import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { db, type ClipMeta, type Part } from "../db";
import { addLoop, clipTitle, LOOP_SPEEDS, setClipRange } from "../units";
import { clampRange, fmtTime, loopAction, onEnded } from "../clipLoop";
import { Icon } from "../components/Icon";

const HIDE_MS = 2000;

/** Vollbild-Player wie bei YouTube: schwarz, Video groß, Tippen = Pause/Play, Steuerung blendet sich nach 2 s aus. */
export function ClipPlayer({ open, onClose, part, clip, index, autoplay }: { open: boolean; onClose: () => void; part: Part; clip: ClipMeta | null; index: number; autoplay?: boolean }) {
  const [shown, setShown] = useState<ClipMeta | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [absent, setAbsent] = useState(false);
  const [loop, setLoop] = useState(true);
  const [speed, setSpeed] = useState<number>(1);
  const [playing, setPlaying] = useState(false);
  const [ui, setUi] = useState(true);
  const [trim, setTrim] = useState(false);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const [vis, setVis] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const loopRef = useRef(loop); loopRef.current = loop;
  const rangeRef = useRef(range); rangeRef.current = range;
  const durRef = useRef(duration); durRef.current = duration;
  const scrub = useRef(false);
  const hide = useRef(0);
  const trimRef = useRef(trim); trimRef.current = trim;

  const poke = useCallback((keep = false) => {
    setUi(true);
    window.clearTimeout(hide.current);
    if (keep || trimRef.current || video.current?.paused) return;
    hide.current = window.setTimeout(() => { if (!scrub.current && !trimRef.current) setUi(false); }, HIDE_MS);
  }, []);

  // Video laden
  useEffect(() => {
    if (!open || !clip) { setVis(false); return; }
    let obj: string | null = null;
    let cancelled = false;
    setShown(clip); setAbsent(false); setPlaying(false); setUrl(null); setTrim(false); setUi(true);
    setRange([clip.start ?? 0, clip.end ?? clip.duration ?? 0]);
    setDuration(clip.duration ?? 0); setTime(0);
    requestAnimationFrame(() => requestAnimationFrame(() => setVis(true)));
    void db.clipBlobs.get(clip.id).then((b) => {
      if (cancelled) return;
      if (!b) return setAbsent(true);
      obj = URL.createObjectURL(b.blob);
      setUrl(obj);
    });
    return () => { cancelled = true; window.clearTimeout(hide.current); if (obj) URL.revokeObjectURL(obj); };
  }, [open, clip?.id]);

  // Seite dahinter bleibt stehen
  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("has-player");
    return () => document.documentElement.classList.remove("has-player");
  }, [open]);

  const apply = useCallback(() => {
    const v = video.current;
    if (!v) return;
    v.playbackRate = speed;
    v.preservesPitch = true;
    (v as HTMLVideoElement & { webkitPreservesPitch?: boolean }).webkitPreservesPitch = true;
  }, [speed]);
  useEffect(apply, [apply, url]);

  const close = useCallback(() => { video.current?.pause(); onClose(); }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === " " && (e.target as HTMLElement)?.tagName !== "INPUT") { e.preventDefault(); toggle(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onMeta = () => {
    const v = video.current;
    if (!v) return;
    apply();
    const d = v.duration;
    if (isFinite(d)) {
      setDuration(d);
      setRange(([a, b]) => [a, b > 0 && b <= d ? b : d]);
    }
    if (autoplay) void v.play().catch(() => undefined);
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
    if (!scrub.current) setTime(v.currentTime);
    const act = loopAction(v.currentTime, rangeRef.current[1], v.duration || durRef.current, loopRef.current);
    if (act === "lap") lap();
    else if (act === "stop") { v.pause(); v.currentTime = rangeRef.current[0]; }
  };

  const toggle = () => {
    const v = video.current;
    if (!v || absent) return;
    if (v.paused) {
      const [a, b] = rangeRef.current;
      if (v.currentTime < a || v.currentTime >= (b || v.duration)) v.currentTime = a;
      void v.play();
    } else v.pause();
    poke();
  };

  const saveRange = (r: [number, number]) => {
    if (!shown) return;
    const whole = r[0] <= 0.05 && Math.abs(r[1] - duration) < 0.05;
    void setClipRange(part.id, shown.id, whole ? undefined : r[0], whole ? undefined : r[1]);
  };

  if (!open || !clip) return null;
  const title = clipTitle(shown ?? clip, index);
  const showUi = ui || !playing || trim || absent;

  return createPortal(
    <div className={`fsp${vis ? " is-shown" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
      {absent ? (
        <p className="fsp-missing">Dieses Video liegt nicht auf diesem Gerät. Über Mehr → „Clips importieren“ lässt es sich wieder einspielen.</p>
      ) : (
        <video ref={video} className="fsp-video" src={url ?? undefined} playsInline preload="auto" onLoadedMetadata={onMeta} onTimeUpdate={onTime}
          onEnded={() => { if (onEnded(loopRef.current) === "lap") lap(); else setPlaying(false); }}
          onPlay={() => { setPlaying(true); poke(); }} onPause={() => { setPlaying(false); setUi(true); window.clearTimeout(hide.current); }}
          onClick={toggle} />
      )}
      <div className={`fsp-ui${showUi ? " is-on" : ""}`}>
        <div className="fsp-top">
          <button className="fsp-btn fsp-x" onClick={close} aria-label="Schließen"><Icon name="close" size={22} /></button>
          <div className="fsp-title">{title}</div>
          {part.loops > 0 && <div className="fsp-count" aria-live="polite">{part.loops}× in der Schleife</div>}
        </div>
        {!playing && !absent && (
          <button className="fsp-center" onClick={toggle} aria-label="Abspielen"><Icon name="play" size={34} /></button>
        )}
        <div className="fsp-bottom" onPointerDown={() => poke(true)} onPointerUp={() => poke()}>
          {trim && duration > 0 && (
            <div className="fsp-trim">
              {(["start", "end"] as const).map((k) => (
                <label key={k} className="fsp-trim-row">
                  <span>{k === "start" ? "Start" : "Ende"}</span>
                  <input type="range" min={0} max={duration} step={0.1} value={range[k === "start" ? 0 : 1]} aria-label={k === "start" ? "Start" : "Ende"}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const next = clampRange(k === "start" ? val : range[0], k === "end" ? val : range[1], duration, k);
                      setRange(next);
                      if (k === "start" && video.current && !playing) video.current.currentTime = next[0];
                    }}
                    onPointerUp={() => saveRange(rangeRef.current)} onKeyUp={() => saveRange(rangeRef.current)} />
                  <em>{fmtTime(range[k === "start" ? 0 : 1])}</em>
                </label>
              ))}
            </div>
          )}
          <div className="fsp-seek">
            <span>{fmtTime(time)}</span>
            <input type="range" min={0} max={duration || 1} step={0.01} value={Math.min(time, duration || 1)} aria-label="Zeitleiste"
              onPointerDown={() => { scrub.current = true; }}
              onChange={(e) => { const t = Number(e.target.value); setTime(t); if (video.current) video.current.currentTime = t; }}
              onPointerUp={() => { scrub.current = false; poke(); }} onKeyUp={() => { scrub.current = false; }} />
            <span>{fmtTime(duration)}</span>
          </div>
          <div className="fsp-row">
            <div className="fsp-speeds" role="group" aria-label="Tempo">
              {LOOP_SPEEDS.map((v) => (
                <button key={v} className={`fsp-cap${speed === v ? " is-on" : ""}`} aria-pressed={speed === v} onClick={() => setSpeed(v)}>
                  {String(v).replace(".", ",")}×
                </button>
              ))}
            </div>
            <button className={`fsp-btn${loop ? " is-on" : ""}`} onClick={() => setLoop((l) => !l)} aria-pressed={loop} aria-label="Dauerschleife"><Icon name="repeat" size={20} /></button>
            <button className={`fsp-btn${trim ? " is-on" : ""}`} onClick={() => setTrim((t) => !t)} aria-pressed={trim} aria-label="Ausschnitt"><Icon name="trim" size={20} /></button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
