import { useEffect, useMemo, useRef } from "react";
import { wheelFromScroll } from "../metronome";

/** Scrollrad wie beim Apple-Wecker: Zahlen, Schnapp-Gefühl (scroll-snap), die mittlere ist gewählt. */
export function Wheel({ min, max, value, onChange, label, itemH = 40, rows = 5 }: { min: number; max: number; value: number; onChange: (v: number) => void; label: string; itemH?: number; rows?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const last = useRef(value);
  const user = useRef(false);
  const pad = (itemH * (rows - 1)) / 2;
  const values = useMemo(() => Array.from({ length: max - min + 1 }, (_, i) => min + i), [min, max]);

  // von außen geänderter Wert (Laden, anderer Abschnitt): Rad dorthin stellen
  useEffect(() => {
    const el = box.current;
    if (!el || user.current) return;
    last.current = value;
    el.scrollTop = (value - min) * itemH;
  }, [value, min, itemH]);

  const settle = useRef(0);
  const onScroll = () => {
    const el = box.current;
    if (!el) return;
    const v = wheelFromScroll(el.scrollTop, itemH, min, max);
    if (v !== last.current) {
      last.current = v;
      navigator.vibrate?.(2);
      onChange(v);
    }
    user.current = true;
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => { user.current = false; }, 160);
  };

  const step = (d: number) => {
    const v = Math.min(max, Math.max(min, last.current + d));
    if (v === last.current) return;
    last.current = v;
    if (box.current) box.current.scrollTo({ top: (v - min) * itemH, behavior: "smooth" });
    onChange(v);
  };

  return (
    <div className="wheel" style={{ height: itemH * rows }}>
      <div className="wheel-band" style={{ height: itemH }} aria-hidden="true" />
      <div ref={box} className="wheel-scroll" role="spinbutton" tabIndex={0} aria-label={label} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value}
        onScroll={onScroll} onKeyDown={(e) => { if (e.key === "ArrowUp") { e.preventDefault(); step(-1); } else if (e.key === "ArrowDown") { e.preventDefault(); step(1); } }}>
        <div style={{ height: pad }} aria-hidden="true" />
        {values.map((v) => (
          <div key={v} className={`wheel-item${v === value ? " is-on" : ""}`} style={{ height: itemH }}>{v}</div>
        ))}
        <div style={{ height: pad }} aria-hidden="true" />
      </div>
    </div>
  );
}
