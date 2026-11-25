import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { db, type ClipMeta, type Part } from "../db";
import { addLoops, clipTitle, LOOP_SPEEDS, setClipRange } from "../units";
import { clampRange, fmtTime, loopAction, loopEnd, wrapped } from "../clipLoop";
import { Icon } from "../components/Icon";

const HIDE_MS = 2000;
const GHOST_MS = 350;
const SAVE_MS = 5000;

/**
 * Kurze Eingabesperre nach dem Schließen (Geister-Klick): nur die Seite dahinter bekommt `pointer-events: none`
 * (CSS `html[data-input-lock] #root`). Die Sperre hebt sich per Timer auf – und sofort bei Drehen, Größenänderung,
 * Seitenwechsel oder Ausblenden, damit sie nie hängen bleiben kann.
 */
let lockTimer = 0;
function releaseLock() {
  window.clearTimeout(lockTimer);
  delete document.documentElement.dataset.inputLock;
}
function lockInput() {
  releaseLock();
  document.documentElement.dataset.inputLock = "1";
  lockTimer = window.setTimeout(releaseLock, GHOST_MS);
}
if (typeof window !== "undefined") {
  for (const ev of ["resize", "orientationchange", "pagehide", "visibilitychange"]) window.addEventListener(ev, releaseLock);
}

/** Vollbild-Player: Erstes Tippen blendet nur die Steuerung ein, pausiert wird über den Mittelknopf. Zeit und Zähler laufen ohne React-Updates. */
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
  const [range, setRange] = useState<[number, number]>([0, 0]);
  const [vis, setVis] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const timeEl = useRef<HTMLSpanElement>(null);
  const seekEl = useRef<HTMLInputElement>(null);
  const countEl = useRef<HTMLDivElement>(null);
  const loopRef = useRef(loop); loopRef.current = loop;
  const rangeRef = useRef(range); rangeRef.current = range;
  const durRef = useRef(duration); durRef.current = duration;
  const trimRef = useRef(trim); trimRef.current = trim;
  const scrub = useRef(false);
  const userSeek = useRef(0);
  const hide = useRef(0);
  const base = useRef(0);
  const pending = useRef(0);
  const total = useRef(0);

  const showCount = useCallback(() => {
    if (countEl.current) countEl.current.textContent = total.current > 0 ? `${total.current}× in der Schleife` : "";
  }, []);
  const flush = useCallback(() => {
    const n = pending.current;
    if (n > 0) { pending.current = 0; void addLoops(part.id, n); }
  }, [part.id]);
  const flushRef = useRef(flush); flushRef.current = flush;

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
    setDuration(clip.duration ?? 0);
    base.current = part.loops ?? 0; pending.current = 0; total.current = 0;
    requestAnimationFrame(() => requestAnimationFrame(() => setVis(true)));
    void db.clipBlobs.get(clip.id).then((b) => {
      if (cancelled) return;
      if (!b) return setAbsent(true);
      obj = URL.createObjectURL(b.blob);
      setUrl(obj);
    });
    return () => { cancelled = true; window.clearTimeout(hide.current); flushRef.current(); if (obj) URL.revokeObjectURL(obj); };
  }, [open, clip?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Seite dahinter sperren; Scroll-Sperre und Listener werden in jedem Fall wieder entfernt
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    html.classList.add("has-player");
    // Drehen/Größenänderung: Vollbild neu berechnen (iOS meldet die Maße oft erst verzögert), Steuerung wieder zeigen
    const timers: number[] = [];
    const relayout = () => {
      const el = root.current;
      if (!el) return;
      const vv = window.visualViewport;
      el.style.width = `${Math.round(vv?.width ?? window.innerWidth)}px`;
      el.style.height = `${Math.round(vv?.height ?? window.innerHeight)}px`;
      setUi(true);
      poke();
    };
    const onTurn = () => {
      relayout();
      timers.push(window.setTimeout(relayout, 150), window.setTimeout(relayout, 450));
    };
    const onHide = () => { html.classList.remove("has-player"); };
    const onShow = () => { if (document.visibilityState === "visible") { html.classList.add("has-player"); onTurn(); } };
    window.addEventListener("resize", onTurn);
    window.addEventListener("orientationchange", onTurn);
    window.visualViewport?.addEventListener("resize", onTurn);
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onShow);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("resize", onTurn);
      window.removeEventListener("orientationchange", onTurn);
      window.visualViewport?.removeEventListener("resize", onTurn);
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onShow);
      html.classList.remove("has-player");
    };
  }, [open, poke]);

  // Zähler gesammelt speichern
  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => flushRef.current(), SAVE_MS);
    return () => window.clearInterval(id);
  }, [open]);

  const apply = useCallback(() => {
    const v = video.current;
    if (!v) return;
    v.playbackRate = speed;
    v.preservesPitch = true;
    (v as HTMLVideoElement & { webkitPreservesPitch?: boolean }).webkitPreservesPitch = true;
  }, [speed]);
  useEffect(apply, [apply, url]);

  // Ganzer Clip: natives Loop (nahtlos). Mit Ausschnitt übernimmt die Bildschirmschleife unten.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const [a, b] = range;
    const partial = a > 0.05 || (duration > 0 && b > 0 && b < duration - 0.05);
    v.loop = loop && !partial;
  }, [loop, range, duration, url]);

  const close = useCallback(() => {
    video.current?.pause();
    flushRef.current();
    lockInput();
    onClose();
  }, [onClose]);

  const toggle = useCallback(() => {
    const v = video.current;
    if (!v || absent) return;
    if (v.paused) {
      const [a, b] = rangeRef.current;
      if (v.currentTime < a || v.currentTime >= (b || v.duration)) v.currentTime = a;
      void v.play();
    } else v.pause();
    poke();
  }, [absent, poke]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === " " && (e.target as HTMLElement)?.tagName !== "INPUT") { e.preventDefault(); toggle(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, toggle]);

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

  // Eine Schleife pro Bild: Ausschnitt-Ende prüfen und direkt zurückspringen (ohne pause/play); Zeit und Leiste höchstens 4× pro Sekunde
  useEffect(() => {
    if (!open || !url) return;
    let raf = 0;
    let lastPaint = 0;
    let lastT = 0;
    const tick = (now: number) => {
      const v = video.current;
      if (v) {
        const t = v.currentTime;
        const [a, b] = rangeRef.current;
        const dur = v.duration || durRef.current;
        const act = loopAction(t, loopEnd(a, b, dur), dur, loopRef.current);
        let lapped = false;
        if (act === "lap") { v.currentTime = a; lapped = true; }
        else if (act === "stop") { v.pause(); v.currentTime = a; }
        else if (v.loop && !v.paused && !scrub.current && now - userSeek.current > 600 && wrapped(lastT, t)) lapped = true;
        if (lapped) { pending.current++; total.current++; showCount(); }
        lastT = lapped ? a : t;
        if (now - lastPaint > 250) {
          lastPaint = now;
          if (timeEl.current) timeEl.current.textContent = fmtTime(t);
          if (seekEl.current && !scrub.current) seekEl.current.value = String(t);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, url, showCount]);

  // Zähler beim Öffnen anzeigen
  useEffect(() => { if (open) { total.current = base.current; showCount(); } }, [open, clip?.id, showCount, url]);

  const saveRange = (r: [number, number]) => {
    if (!shown) return;
    const whole = r[0] <= 0.05 && Math.abs(r[1] - duration) < 0.05;
    void setClipRange(part.id, shown.id, whole ? undefined : r[0], whole ? undefined : r[1]);
  };

  if (!open || !clip) return null;
  const title = clipTitle(shown ?? clip, index);
  const showUi = ui || !playing || trim || absent;
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return createPortal(
    <div ref={root} className={`fsp${vis ? " is-shown" : ""}`} role="dialog" aria-modal="true" aria-label={title}
      onPointerDown={stop} onPointerUp={stop} onClick={stop} onTouchStart={stop} onTouchEnd={stop} onMouseDown={stop} onContextMenu={(e) => e.preventDefault()}>
      {absent ? (
        <p className="fsp-missing">Dieses Video liegt nicht auf diesem Gerät. Über Mehr → „Clips importieren“ lässt es sich wieder einspielen.</p>
      ) : (
        <video ref={video} className="fsp-video" src={url ?? undefined} playsInline preload="auto" disablePictureInPicture onLoadedMetadata={onMeta}
          onEnded={() => setPlaying(false)}
          onPlay={() => { setPlaying(true); poke(); }} onPause={() => { setPlaying(false); setUi(true); window.clearTimeout(hide.current); }} />
      )}
      <div className="fsp-hit" onClick={() => { if (showUi && playing && !trim) { window.clearTimeout(hide.current); setUi(false); } else poke(); }} />
      <div className={`fsp-ui${showUi ? " is-on" : ""}`}>
        <div className="fsp-top">
          <button className="fsp-btn fsp-x" aria-label="Schließen"
            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onPointerUp={(e) => { e.preventDefault(); e.stopPropagation(); close(); }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); close(); } }}><Icon name="close" size={22} /></button>
          <div className="fsp-title">{title}</div>
          <div className="fsp-count" ref={countEl} aria-live="off" />
        </div>
        {!absent && (
          <button className="fsp-center" onClick={toggle} aria-label={playing ? "Pause" : "Abspielen"}><Icon name={playing ? "pause" : "play"} size={34} /></button>
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
            <span ref={timeEl}>0:00</span>
            <input ref={seekEl} type="range" min={0} max={duration || 1} step={0.01} defaultValue={0} aria-label="Zeitleiste"
              onPointerDown={() => { scrub.current = true; userSeek.current = performance.now(); }}
              onInput={(e) => { const t = Number((e.target as HTMLInputElement).value); userSeek.current = performance.now(); if (timeEl.current) timeEl.current.textContent = fmtTime(t); if (video.current) video.current.currentTime = t; }}
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
