// Farbe und Symbol pro Kategorie – zieht sich durch die ganze App.

export interface CategoryStyle {
  icon: string;
  light: string;
  dark: string;
}

const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const CAT_ICONS: Record<string, React.ReactNode> = {
  dumbbell: <path {...S} d="M6.5 7.5v9M17.5 7.5v9M4 10v4M20 10v4M6.5 12h11" />,
  cards: (
    <g {...S}>
      <rect x="4" y="5.5" width="9.5" height="13.5" rx="2" transform="rotate(-9 8.75 12.25)" />
      <rect x="10.5" y="4.5" width="9.5" height="13.5" rx="2" transform="rotate(9 15.25 11.25)" />
    </g>
  ),
  bulb: <path {...S} d="M9.5 18h5M10.5 21h3M12 3.5a5.8 5.8 0 0 0-3.4 10.5c.6.5.9 1.1.9 1.9v.1h5v-.1c0-.8.3-1.4.9-1.9A5.8 5.8 0 0 0 12 3.5z" />,
  leaf: <path {...S} d="M5 19.5c0-8.5 5.5-14 14.5-14.5 0 9.5-5.5 14.5-14.5 14.5zM5 19.5l7.5-7.5" />,
  book: <path {...S} d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" />,
  bubbles: <path {...S} d="M4 6.5A2.5 2.5 0 0 1 6.5 4h7A2.5 2.5 0 0 1 16 6.5v4a2.5 2.5 0 0 1-2.5 2.5H9.5L6 16v-3.1A2.5 2.5 0 0 1 4 10.5zM18.5 8.5A1.5 1.5 0 0 1 20 10v4.5a1.5 1.5 0 0 1-1.5 1.5H18v3l-3.5-3H12" />,
  wind: <path {...S} d="M3.5 9H14a2.8 2.8 0 1 0-2.8-2.8M3.5 13h14.5a2.8 2.8 0 1 1-2.8 2.8M3.5 17h6" />,
  target: (
    <g {...S}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r=".8" fill="currentColor" />
    </g>
  ),
  pencil: <path {...S} d="M15 4.5l4.5 4.5L9 19.5H4.5V15zM13 6.5l4.5 4.5" />,
  repeat: <path {...S} d="M16.5 3.5l3 3-3 3M4.5 11V9.5a3 3 0 0 1 3-3h12M7.5 20.5l-3-3 3-3M19.5 13v1.5a3 3 0 0 1-3 3h-12" />,
  checklist: <path {...S} d="M10 6.5h10M10 12h10M10 17.5h10M4 6.5l1.2 1.2L7.5 5.4M4 12l1.2 1.2 2.3-2.3M4 17.5l1.2 1.2 2.3-2.3" />,
  question: (
    <g {...S}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.3" />
      <circle cx="12" cy="16.8" r=".6" fill="currentColor" />
    </g>
  ),
  folder: <path {...S} d="M3.5 7A1.5 1.5 0 0 1 5 5.5h4l2 2h8A1.5 1.5 0 0 1 20.5 9v8.5A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z" />,
};

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  "Körper & Sport": { icon: "dumbbell", light: "#CF5F3E", dark: "#EE8463" },
  "Tricks, Geschick & Mentalismus": { icon: "cards", light: "#A8871C", dark: "#D9B648" },
  "Kopf: Rechnen, Gedächtnis & Denken": { icon: "bulb", light: "#3B6FB0", dark: "#73A2E2" },
  "Natur, Erde & Himmel": { icon: "leaf", light: "#3E8B53", dark: "#6CC084" },
  "Wissen & Verstehen": { icon: "book", light: "#25837F", dark: "#5DC1BA" },
  "Menschen, Sprache & Kommunikation": { icon: "bubbles", light: "#BE5177", dark: "#E67FA1" },
  "Atmung, Sinne & Körperkontrolle": { icon: "wind", light: "#2F8DB0", dark: "#66BEDF" },
  "Mindset & Fokus": { icon: "target", light: "#5C6977", dark: "#9DA9B6" },
  "Kreativ & Alltag": { icon: "pencil", light: "#D27A22", dark: "#F0A257" },
  Gewohnheiten: { icon: "repeat", light: "#788B2E", dark: "#AFC35D" },
  "Projekte & Besorgungen": { icon: "checklist", light: "#946D49", dark: "#C9A27D" },
  "Erst rausfinden, was das ist": { icon: "question", light: "#86868B", dark: "#A1A1A6" },
};

const FALLBACK: CategoryStyle = { icon: "folder", light: "#6E7781", dark: "#A3ABB4" };

export function categoryStyle(name: string): CategoryStyle {
  return CATEGORY_STYLES[name] ?? FALLBACK;
}

/** Kurzer Anzeigename, z. B. „Kopf“ statt „Kopf: Rechnen, Gedächtnis & Denken“. */
export function shortCategory(name: string): string {
  if (name.startsWith("Erst rausfinden")) return "Klären";
  return name.split(/[:,]/)[0].replace(/\s*&.*$/, "").trim() || name;
}

export function CategoryIcon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {CAT_ICONS[categoryStyle(name).icon]}
    </svg>
  );
}

/** Inline-Variablen für Kategoriefarbe; CSS wählt hell/dunkel über die Klasse „cv“. */
export function catVars(name: string): React.CSSProperties {
  const s = categoryStyle(name);
  return { ["--cl" as string]: s.light, ["--cd" as string]: s.dark };
}

export function allCategoryColors(): string[] {
  return Object.values(CATEGORY_STYLES).map((s) => s.light);
}
