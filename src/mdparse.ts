/** Liest Markdown-Listen (Punkte, Nummerierungen, Checkboxen, Überschriften, Links). Keine Datenbank-Abhängigkeit. */

export interface MdLink {
  title: string;
  url: string;
}

export interface MdItem {
  /** Laufende Nummer in der Datei */
  n: number;
  /** Text ohne Markdown-Zeichen; Links sind auf ihren Titel reduziert */
  title: string;
  /** Text wie in der Datei, Links als „Titel (URL)“ */
  raw: string;
  links: MdLink[];
  /** 0 = oberste Ebene, 1 = eingerückt … */
  depth: number;
  checkbox: boolean;
  done: boolean;
  /** Zugehörige Überschrift (## …) */
  group: string;
}

const URL_RE = /https?:\/\/[^\s)<>\]]+/g;
const MD_LINK_RE = /\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;

function stripEmphasis(s: string): string {
  return s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/__(.+?)__/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/(^|\s)\*([^*\s][^*]*)\*(?=\s|$)/g, "$1$2");
}

export function splitLinks(text: string): { title: string; raw: string; links: MdLink[] } {
  const links: MdLink[] = [];
  // 1. [Titel](URL)
  let rest = text.replace(MD_LINK_RE, (_m, t: string, u: string) => {
    links.push({ title: t.trim(), url: u });
    return `\u0000${links.length - 1}\u0000`;
  });
  // 2. lose URLs
  rest = rest.replace(URL_RE, (u) => {
    const clean = u.replace(/[.,;:!?]+$/, "");
    const tail = u.slice(clean.length);
    links.push({ title: "", url: clean });
    return `\u0000${links.length - 1}\u0000${tail}`;
  });
  const title = stripEmphasis(
    rest
      .replace(/\u0000(\d+)\u0000/g, (_m, i: string) => links[Number(i)].title)
      .replace(/\s+([.,;:!?])/g, "$1")
      .replace(/\s*[-–—:]\s*$/, "")
      .replace(/\s{2,}/g, " "),
  ).trim();
  const raw = stripEmphasis(
    rest.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => {
      const l = links[Number(i)];
      return l.title ? `${l.title} (${l.url})` : l.url;
    }),
  ).trim();
  return { title, raw, links };
}

export function parseMarkdown(md: string): MdItem[] {
  let text = md.replace(/\r/g, "");
  // YAML-Kopf entfernen
  text = text.replace(/^---\n[\s\S]*?\n---\n?/, "");
  const lines = text.split("\n");
  const hasSub = lines.some((l) => /^#{2,6}\s+\S/.test(l));
  const hasBullets = lines.some((l) => /^\s*([-*+]|\d+[.)])\s+\S/.test(l));

  const items: MdItem[] = [];
  let group = "";
  let fence = false;
  for (const raw of lines) {
    if (/^\s*(```|~~~)/.test(raw)) {
      fence = !fence;
      continue;
    }
    if (fence || !raw.trim()) continue;

    const h = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(raw);
    if (h) {
      if (h[1].length >= 2 || !hasSub) group = stripEmphasis(h[2]).trim();
      continue;
    }
    let depth = 0;
    let body: string | null = null;
    let checkbox = false;
    let done = false;
    const b = /^(\s*)([-*+]|\d+[.)])\s+(?:\[( |x|X)\]\s+)?(.*)$/.exec(raw);
    if (b) {
      depth = Math.floor(b[1].replace(/\t/g, "  ").length / 2);
      checkbox = b[3] !== undefined;
      done = b[3] === "x" || b[3] === "X";
      body = b[4];
    } else if (!hasBullets && !/^\s*[>|]/.test(raw)) {
      body = raw.trim(); // Datei ohne Listenzeichen: jede Zeile ist ein Punkt
    }
    if (body === null || !body.trim()) continue;
    const { title, raw: shown, links } = splitLinks(body.trim());
    if (!title && !links.length) continue;
    items.push({ n: items.length, title: title || links[0].url, raw: shown, links, depth: Math.min(depth, 4), checkbox, done, group });
  }
  return items;
}
