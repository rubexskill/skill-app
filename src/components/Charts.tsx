import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { addDays, dayKey, formatValue, minutesLabel, startOfDay, type Bucket } from "../logic";

/**
 * Diagramme nach den Dataviz-Regeln: ein Farbton für Mengen, dünne Marks mit
 * abgerundeten Enden, 2 px Abstand zwischen Balken, Werte per Antippen/Hover
 * statt Zahl an jedem Balken. Text bleibt in Textfarben.
 */

// ---------------- Balken (Lernzeit pro Woche/Monat) ----------------

export function BarChart({ data, caption }: { data: Bucket[]; caption: (b: Bucket) => string }) {
  const [sel, setSel] = useState<number | null>(null);
  const max = Math.max(60, ...data.map((d) => d.minutes));
  const active = sel ?? data.length - 1;
  const W = 100;
  const H = 120;
  const gap = 2;
  const bw = (W - gap * (data.length - 1)) / data.length;
  // Gitterlinie bei einer runden Stundenzahl
  const gridH = max >= 600 ? Math.ceil(max / 60 / 4) * 60 : 60;

  return (
    <div className="chart">
      <div className="chart-readout">
        <span className="chart-readout-value">{minutesLabel(data[active]?.minutes ?? 0)}</span>
        <span className="chart-readout-label">{caption(data[active])}</span>
      </div>
      <svg className="bars" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img"
        aria-label={data.map((d) => `${d.label}: ${minutesLabel(d.minutes)}`).join(", ")}
        onMouseLeave={() => setSel(null)}>
        {[1, 2, 3].map((k) => k * gridH <= max && (
          <line key={k} className="bars-grid" x1="0" x2={W} y1={H - (k * gridH / max) * H} y2={H - (k * gridH / max) * H} vectorEffect="non-scaling-stroke" />
        ))}
        {data.map((d, i) => {
          const h = d.minutes ? Math.max(2, (d.minutes / max) * H) : 0;
          const x = i * (bw + gap);
          return (
            <g key={i} onMouseEnter={() => setSel(i)} onClick={() => setSel(i)}>
              <rect className="bars-hit" x={x} y="0" width={bw + gap} height={H} />
              {h > 0 && <path className={`bars-bar${i === active ? " is-active" : ""}`} d={roundedTop(x, H - h, bw, h, Math.min(1.6, bw / 2))} />}
            </g>
          );
        })}
      </svg>
      <div className="bars-axis">
        {data.map((d, i) => (
          <span key={i} className={i === active ? "is-active" : ""}>{i % 2 === (data.length - 1) % 2 ? d.label : ""}</span>
        ))}
      </div>
    </div>
  );
}

/** Rechteck mit abgerundeten oberen Ecken, unten bündig auf der Grundlinie */
function roundedTop(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, h);
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`;
}

// ---------------- Heatmap (Kästchen pro Tag) ----------------

const WD = ["Mo", "", "Mi", "", "Fr", "", ""];
const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

export function Heatmap({ days, weeks: maxWeeks = 26, compact = false }: { days: Map<string, number>; weeks?: number; compact?: boolean }) {
  const [sel, setSel] = useState<string | null>(null);
  // So viele Wochen wie in die Breite passen – Kästchen bleiben gleich groß.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(maxWeeks);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const calc = () => {
      const w = el.clientWidth;
      if (w > 0) setFit(Math.max(8, Math.min(compact ? maxWeeks : 53, Math.floor((w - (compact ? 0 : 22) + 3) / 15))));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [compact, maxWeeks]);
  const weeks = fit;
  const cells = useMemo(() => {
    const today = startOfDay(new Date());
    const weekday = (today.getDay() + 6) % 7;
    const start = addDays(today, -weekday - 7 * (weeks - 1));
    const out: { key: string; col: number; row: number; min: number; future: boolean; date: Date }[] = [];
    for (let c = 0; c < weeks; c++) {
      for (let r = 0; r < 7; r++) {
        const d = addDays(start, c * 7 + r);
        const key = dayKey(d);
        out.push({ key, col: c, row: r, min: days.get(key) ?? 0, future: d > today, date: d });
      }
    }
    return out;
  }, [days, weeks]);

  // Stufen relativ zum eigenen Maximum – so bleibt die Karte auch bei wenig Übung lesbar
  const max = Math.max(1, ...cells.map((c) => c.min));
  const level = (m: number) => (m <= 0 ? 0 : m >= max * 0.75 ? 4 : m >= max * 0.45 ? 3 : m >= max * 0.2 ? 2 : 1);
  const size = 12;
  const gap = 3;
  const left = compact ? 0 : 22;
  const top = compact ? 0 : 15;
  const W = left + weeks * (size + gap) - gap;
  const H = top + 7 * (size + gap) - gap;
  const selCell = cells.find((c) => c.key === sel);

  return (
    <div ref={wrapRef} className={`heatmap${compact ? " is-compact" : ""}`}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Lernzeit pro Tag" onMouseLeave={() => setSel(null)}>
        {!compact && WD.map((l, r) => l && <text key={r} className="heatmap-label" x="0" y={top + r * (size + gap) + size - 2}>{l}</text>)}
        {!compact && cells.filter((c) => c.row === 0 && c.date.getDate() <= 7).map((c) => (
          <text key={`m${c.key}`} className="heatmap-label" x={left + c.col * (size + gap)} y="8">{MONTHS[c.date.getMonth()]}</text>
        ))}
        {cells.map((c) => !c.future && (
          <rect key={c.key} x={left + c.col * (size + gap)} y={top + c.row * (size + gap)} width={size} height={size} rx="3"
            className={`heatmap-cell l${level(c.min)}${sel === c.key ? " is-sel" : ""}`}
            onMouseEnter={() => setSel(c.key)} onClick={() => setSel(c.key)} />
        ))}
      </svg>
      <div className="heatmap-foot">
        <span className="heatmap-readout">
          {selCell ? `${selCell.date.getDate()}. ${MONTHS[selCell.date.getMonth()]} · ${selCell.min ? minutesLabel(selCell.min) : "nicht geübt"}` : compact ? "" : "Tippe auf einen Tag"}
        </span>
        {!compact && (
          <span className="heatmap-legend" aria-hidden="true">
            weniger
            {[0, 1, 2, 3, 4].map((l) => <i key={l} className={`heatmap-cell l${l}`} />)}
            mehr
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------- Verlauf für Rekorde ----------------

export function Sparkline({ values, higher, unit }: { values: { value: number; at: number }[]; higher: boolean; unit: string }) {
  const [sel, setSel] = useState<number | null>(null);
  if (values.length === 0) return null;
  const W = 300;
  const H = 90;
  const pad = 8;
  const vs = values.map((v) => v.value);
  const min = Math.min(...vs);
  const max = Math.max(...vs);
  const span = max - min || 1;
  const x = (i: number) => (values.length === 1 ? W / 2 : pad + (i / (values.length - 1)) * (W - pad * 2));
  const y = (v: number) => H - pad - ((v - min) / span) * (H - pad * 2);
  // Neue Bestleistung: besser als alles davor
  let best = higher ? -Infinity : Infinity;
  const isBest = values.map((v) => {
    const b = higher ? v.value > best : v.value < best;
    if (b) best = v.value;
    return b;
  });
  const points = values.map((v, i) => `${x(i)},${y(v.value)}`).join(" ");
  const active = sel ?? values.length - 1;

  return (
    <div className="spark">
      <div className="spark-readout">
        {sel === null ? "Letzter Eintrag: " : ""}
        <b>{formatValue(values[active].value)} {unit}</b>
        {" · "}
        {new Date(values[active].at).toLocaleDateString("de-DE", { day: "numeric", month: "short" })}
        {isBest[active] && active > 0 ? " · neue Bestleistung" : ""}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="spark-svg" role="img" aria-label="Verlauf der Einträge" onMouseLeave={() => setSel(null)}>
        {values.length > 1 && <polyline className="spark-line" points={points} fill="none" />}
        {values.map((v, i) => (
          <g key={i} onMouseEnter={() => setSel(i)} onClick={() => setSel(i)}>
            <circle cx={x(i)} cy={y(v.value)} r="14" className="spark-hit" />
            <circle cx={x(i)} cy={y(v.value)} r={isBest[i] ? 5 : 3.5}
              className={`spark-dot${isBest[i] && i > 0 ? " is-best" : ""}${i === active ? " is-active" : ""}`} />
          </g>
        ))}
      </svg>
    </div>
  );
}
