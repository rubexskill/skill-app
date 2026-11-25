import type { ReactNode } from "react";

// Schlichte, an SF Symbols angelehnte Icons (selbst gezeichnet).
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const ICONS: Record<string, ReactNode> = {
  stack: (
    <g {...S}>
      <rect x="4" y="4" width="16" height="5" rx="1.6" />
      <rect x="4" y="11" width="16" height="5" rx="1.6" />
      <path d="M6 19.5h12" />
    </g>
  ),
  "stack-fill": (
    <g>
      <rect x="4" y="4" width="16" height="5.4" rx="1.6" fill="currentColor" />
      <rect x="4" y="11" width="16" height="5.4" rx="1.6" fill="currentColor" />
      <path d="M6 19.6h12" {...S} />
    </g>
  ),
  today: (
    <g {...S}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.2 12.3l2.6 2.6 5-5.4" />
    </g>
  ),
  "today-fill": (
    <g>
      <circle cx="12" cy="12" r="9.3" fill="currentColor" />
      <path d="M8.2 12.3l2.6 2.6 5-5.4" {...S} stroke="var(--tab-bg-solid)" strokeWidth={2} />
    </g>
  ),
  tray: (
    <g {...S}>
      <path d="M4 13.5l2.2-7.2A1.8 1.8 0 0 1 7.9 5h8.2a1.8 1.8 0 0 1 1.7 1.3L20 13.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18z" />
      <path d="M4 13.5h4.5l1 2h5l1-2H20" />
    </g>
  ),
  "tray-fill": (
    <g>
      <path d="M4 13.5l2.2-7.2A1.8 1.8 0 0 1 7.9 5h8.2a1.8 1.8 0 0 1 1.7 1.3L20 13.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18z" fill="currentColor" />
      <path d="M4.5 13.5h4l1 2h5l1-2h4" {...S} stroke="var(--tab-bg-solid)" />
    </g>
  ),
  more: (
    <g {...S}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="8" cy="12" r=".6" fill="currentColor" />
      <circle cx="12" cy="12" r=".6" fill="currentColor" />
      <circle cx="16" cy="12" r=".6" fill="currentColor" />
    </g>
  ),
  "more-fill": (
    <g>
      <circle cx="12" cy="12" r="9.3" fill="currentColor" />
      <g fill="var(--tab-bg-solid)">
        <circle cx="8" cy="12" r="1.2" />
        <circle cx="12" cy="12" r="1.2" />
        <circle cx="16" cy="12" r="1.2" />
      </g>
    </g>
  ),
  play: <path d="M8 5.6v12.8a.8.8 0 0 0 1.2.7l10.3-6.4a.8.8 0 0 0 0-1.4L9.2 4.9A.8.8 0 0 0 8 5.6z" fill="currentColor" />,
  pause: (
    <g fill="currentColor">
      <rect x="6.5" y="5" width="4" height="14" rx="1.1" />
      <rect x="13.5" y="5" width="4" height="14" rx="1.1" />
    </g>
  ),
  search: (
    <g {...S} strokeWidth={2}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l4.5 4.5" />
    </g>
  ),
  plus: <path d="M12 5v14M5 12h14" {...S} strokeWidth={2} />,
  "chevron-left": <path d="M15 4.5L7.5 12 15 19.5" {...S} strokeWidth={2.4} />,
  "chevron-right": <path d="M9.5 6l6 6-6 6" {...S} strokeWidth={2} />,
  "chevron-down": <path d="M6 9.5l6 6 6-6" {...S} strokeWidth={2.2} />,
  filter: (
    <g {...S}>
      <circle cx="12" cy="12" r="9" />
      <path d="M7.5 9.5h9M9.3 12.5h5.4M11 15.5h2" />
    </g>
  ),
  "filter-fill": (
    <g>
      <circle cx="12" cy="12" r="9.5" fill="currentColor" />
      <path d="M7.5 9.5h9M9.3 12.5h5.4M11 15.5h2" {...S} stroke="var(--bg-elevated)" strokeWidth={2} />
    </g>
  ),
  clear: (
    <g>
      <circle cx="12" cy="12" r="8" fill="currentColor" />
      <path d="M9.4 9.4l5.2 5.2M14.6 9.4l-5.2 5.2" {...S} stroke="var(--bg-elevated)" strokeWidth={1.8} />
    </g>
  ),
  check: <path d="M5.5 12.5l4.2 4.2L18.5 7.5" {...S} strokeWidth={2.4} />,
  link: (
    <g {...S}>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </g>
  ),
  video: (
    <g {...S}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
      <path d="M10.3 9.4v5.2l4.4-2.6z" fill="currentColor" />
    </g>
  ),
  trash: (
    <g {...S}>
      <path d="M4.5 7h15M9.5 7V5h5v2M6.5 7l.9 11.3A1.8 1.8 0 0 0 9.2 20h5.6a1.8 1.8 0 0 0 1.8-1.7L17.5 7" />
    </g>
  ),
  warning: (
    <g {...S}>
      <path d="M10.4 4.6L3.3 17.4A1.8 1.8 0 0 0 4.9 20h14.2a1.8 1.8 0 0 0 1.6-2.6L13.6 4.6a1.8 1.8 0 0 0-3.2 0z" />
      <path d="M12 9.5v4" />
      <circle cx="12" cy="16.6" r=".5" fill="currentColor" />
    </g>
  ),
  share: (
    <g {...S}>
      <path d="M12 3.5v11M8 7.5l4-4 4 4" />
      <path d="M8.5 10.5H7a1.5 1.5 0 0 0-1.5 1.5v7A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5h-1.5" />
    </g>
  ),
  download: (
    <g {...S}>
      <path d="M12 3.5v11M8 10.5l4 4 4-4" />
      <path d="M5.5 15.5v3a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3" />
    </g>
  ),
  sliders: (
    <g {...S}>
      <path d="M5 8h8M17 8h2M5 16h2M11 16h8" />
      <circle cx="15" cy="8" r="2" />
      <circle cx="9" cy="16" r="2" />
    </g>
  ),
  apps: (
    <g {...S}>
      <rect x="4" y="4" width="7" height="7" rx="2" />
      <rect x="13" y="4" width="7" height="7" rx="2" />
      <rect x="4" y="13" width="7" height="7" rx="2" />
      <rect x="13" y="13" width="7" height="7" rx="2" />
    </g>
  ),
  arrow: (
    <g {...S}>
      <path d="M5 12h13M13 7l5 5-5 5" />
    </g>
  ),
  overview: (
    <g {...S}>
      <rect x="4" y="4" width="7" height="7" rx="2" />
      <rect x="13" y="4" width="7" height="7" rx="2" />
      <rect x="4" y="13" width="7" height="7" rx="2" />
      <rect x="13" y="13" width="7" height="7" rx="2" />
    </g>
  ),
  "overview-fill": (
    <g fill="currentColor">
      <rect x="3.6" y="3.6" width="7.8" height="7.8" rx="2.2" />
      <rect x="12.6" y="3.6" width="7.8" height="7.8" rx="2.2" />
      <rect x="3.6" y="12.6" width="7.8" height="7.8" rx="2.2" />
      <rect x="12.6" y="12.6" width="7.8" height="7.8" rx="2.2" />
    </g>
  ),
  todo: (
    <g {...S}>
      <path d="M10.5 7h9.5M10.5 12h9.5M10.5 17h9.5" />
      <circle cx="5.5" cy="7" r="1.6" />
      <circle cx="5.5" cy="12" r="1.6" />
      <circle cx="5.5" cy="17" r="1.6" />
    </g>
  ),
  "todo-fill": (
    <g>
      <path d="M10.5 7h9.5M10.5 12h9.5M10.5 17h9.5" {...S} strokeWidth={2.2} />
      <g fill="currentColor">
        <circle cx="5.5" cy="7" r="2.1" />
        <circle cx="5.5" cy="12" r="2.1" />
        <circle cx="5.5" cy="17" r="2.1" />
      </g>
    </g>
  ),
  dice: (
    <g {...S}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="9" cy="9" r="1.1" fill="currentColor" />
      <circle cx="15" cy="15" r="1.1" fill="currentColor" />
      <circle cx="15" cy="9" r="1.1" fill="currentColor" />
      <circle cx="9" cy="15" r="1.1" fill="currentColor" />
    </g>
  ),
  sidebar: (
    <g {...S}>
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <path d="M9.5 5v14" />
    </g>
  ),
  calendar: (
    <g {...S}>
      <rect x="4" y="5.5" width="16" height="14" rx="2.5" />
      <path d="M4 10h16M8.5 3.5v3.5M15.5 3.5v3.5" />
    </g>
  ),
  note: (
    <g {...S}>
      <path d="M6 4.5h9l3.5 3.5v11a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 19V6A1.5 1.5 0 0 1 6 4.5z" />
      <path d="M8 11h8M8 15h5" />
    </g>
  ),
  close: <path d="M7 7l10 10M17 7L7 17" {...S} strokeWidth={2.2} />,
  "st-later": (
    <g {...S} strokeWidth={2}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.8V12l2.8 1.8" />
    </g>
  ),
  "st-active": (
    <g>
      <circle cx="12" cy="12" r="8.2" {...S} strokeWidth={2} />
      <path d="M10.2 8.6v6.8l5.4-3.4z" fill="currentColor" />
    </g>
  ),
  "st-done": (
    <g>
      <path d="M12 3.2l2.1 1.6 2.6-.2.8 2.5 2.2 1.4-.8 2.5.8 2.5-2.2 1.4-.8 2.5-2.6-.2L12 20.8l-2.1-1.6-2.6.2-.8-2.5-2.2-1.4.8-2.5-.8-2.5 2.2-1.4.8-2.5 2.6.2z" {...S} strokeWidth={1.8} />
      <path d="M8.8 12.2l2.2 2.2 4.2-4.6" {...S} strokeWidth={2} />
    </g>
  ),
  "st-clarify": (
    <g {...S} strokeWidth={2}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M9.8 9.7a2.3 2.3 0 1 1 3.1 2.1c-.5.2-.9.7-.9 1.3v.3" />
      <circle cx="12" cy="16.4" r=".5" fill="currentColor" />
    </g>
  ),
  "rate-1": (
    <g fill="currentColor">
      <rect x="5" y="14" width="3.6" height="5" rx="1.2" />
      <rect x="10.2" y="10" width="3.6" height="9" rx="1.2" opacity=".25" />
      <rect x="15.4" y="5" width="3.6" height="14" rx="1.2" opacity=".25" />
    </g>
  ),
  "rate-2": (
    <g fill="currentColor">
      <rect x="5" y="14" width="3.6" height="5" rx="1.2" />
      <rect x="10.2" y="10" width="3.6" height="9" rx="1.2" />
      <rect x="15.4" y="5" width="3.6" height="14" rx="1.2" opacity=".25" />
    </g>
  ),
  "rate-3": (
    <g fill="currentColor">
      <rect x="5" y="14" width="3.6" height="5" rx="1.2" />
      <rect x="10.2" y="10" width="3.6" height="9" rx="1.2" />
      <rect x="15.4" y="5" width="3.6" height="14" rx="1.2" />
    </g>
  ),
  minus: <path d="M5 12h14" {...S} strokeWidth={2} />,
  chart: (
    <g {...S}>
      <path d="M5 19.5V11M10 19.5V5M15 19.5v-6M20 19.5V8" strokeWidth={2.2} />
    </g>
  ),
  "chart-fill": (
    <g {...S}>
      <path d="M5 19.5V11M10 19.5V5M15 19.5v-6M20 19.5V8" strokeWidth={3.2} />
    </g>
  ),
  repeat: (
    <g {...S}>
      <path d="M16.5 3.5l3 3-3 3M4.5 11V9.5a3 3 0 0 1 3-3h12M7.5 20.5l-3-3 3-3M19.5 13v1.5a3 3 0 0 1-3 3h-12" />
    </g>
  ),
  checklist: (
    <g {...S}>
      <path d="M10 6.5h10M10 12h10M10 17.5h10M4 6.5l1.2 1.2L7.5 5.4M4 12l1.2 1.2 2.3-2.3M4 17.5l1.2 1.2 2.3-2.3" />
    </g>
  ),
  term: (
    <g {...S}>
      <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H18v14.5H7a2 2 0 0 0-2 2z" />
      <path d="M5 18.5V6M9 8.5h5.5M9 12h5.5" />
    </g>
  ),
  gift: (
    <g {...S}>
      <rect x="4" y="9" width="16" height="4" rx="1.2" />
      <path d="M5.5 13v6.5h13V13M12 9v10.5M12 9c-1-3.2-4.6-3.6-4.6-1.4C7.4 9 9.5 9 12 9zM12 9c1-3.2 4.6-3.6 4.6-1.4C16.6 9 14.5 9 12 9z" />
    </g>
  ),
  import: (
    <g {...S}>
      <path d="M12 4v10M8 10.5l4 4 4-4" />
      <path d="M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
    </g>
  ),
  sync: (
    <g {...S}>
      <path d="M4.5 9.5a7.5 7.5 0 0 1 13-2.5l1.5 1.8M19.5 14.5a7.5 7.5 0 0 1-13 2.5L5 15.2" />
      <path d="M19 4.5v4.3h-4.3M5 19.5v-4.3h4.3" />
    </g>
  ),
  bolt: <path {...S} d="M13 3.5L6 13.5h5.2L10.5 20.5l7-10h-5.2z" />,
  cards: (
    <g {...S}>
      <rect x="3.5" y="7" width="12" height="13" rx="2.2" />
      <path d="M8 4h10.3a2.2 2.2 0 0 1 2.2 2.2V16" />
      <path d="M7 12h5M7 15.5h3" />
    </g>
  ),
  exam: (
    <g {...S}>
      <path d="M9 4.5h6a1 1 0 0 1 1 1V7H8V5.5a1 1 0 0 1 1-1z" />
      <path d="M8 5.8H6.5a1.5 1.5 0 0 0-1.5 1.5v11.2a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V7.3a1.5 1.5 0 0 0-1.5-1.5H16" />
      <path d="M8.8 13.3l2.2 2.2 4.2-4.6" />
    </g>
  ),
  train: (
    <g {...S}>
      <circle cx="12" cy="12" r="8.2" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3.8V8M12 16v4.2M3.8 12H8M16 12h4.2" />
    </g>
  ),
  tidy: (
    <g {...S}>
      <circle cx="12" cy="12" r="7.5" strokeDasharray="3 3.2" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </g>
  ),
  metronome: (
    <g {...S}>
      <path d="M8.2 20.5L10.4 4.5h3.2l2.2 16z" />
      <path d="M12 16.5l3.4-8" />
      <path d="M6.5 20.5h11" />
    </g>
  ),
  mic: (
    <g {...S}>
      <rect x="9" y="3.5" width="6" height="11" rx="3" />
      <path d="M6 11.5a6 6 0 0 0 12 0M12 17.5v3M9 20.5h6" />
    </g>
  ),
  trim: (
    <g {...S}>
      <path d="M9.5 5.5H6v13h3.5M14.5 5.5H18v13h-3.5" />
      <path d="M11 12h2" />
    </g>
  ),
  undo: (
    <g {...S}>
      <path d="M9 6.5L4.5 11 9 15.5" />
      <path d="M5 11h9.5a4.5 4.5 0 0 1 0 9H11" />
    </g>
  ),
  copy: (
    <g {...S}>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
    </g>
  ),
};

export function Icon({ name, size = 22, className }: { name: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}
