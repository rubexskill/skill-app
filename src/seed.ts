// Lokal: persönliche Startdaten aus src/seed/private. Online-Build: keine Startdaten. Bibliothek (Schätzwerte, Steckbriefe): src/library.
import { APPS_MD as appsMd, SKILLS_MD as skillsMd } from "@seed-data";
import { META_ROWS, PROFILES } from "./library";
import { UNITS_DEFAULT_TITLE } from "./unitsMigrate";
import type { AppIdea, Metric, Milestone, Movement, Place, Profile, Season, Session, Skill, Status, TodoList, Typ } from "./db";


function id(prefix: string, n: number): string {
  return `${prefix}-${n.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const PLACE_MAP = { u: "ueberall", h: "zuhause", d: "draussen", g: "gym" } as const;

interface Meta {
  title: string;
  estMinutes: number;
  sessionMinutes: number;
  movement: Movement;
  place: Place;
  material: string[];
  season: Season;
}

const norm = (s: string) => s.normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim();

export const META = new Map<string, Meta>(
  META_ROWS.map(([name, title, h, sess, move, place, mat, season]) => [
    norm(name),
    {
      title,
      estMinutes: Math.round(h * 60),
      sessionMinutes: sess,
      movement: move,
      place: PLACE_MAP[place],
      material: (mat ?? "").split(",").map((m) => m.trim()).filter(Boolean),
      season: season === "s" ? "sommer" : season === "w" ? "winter" : "",
    },
  ]),
);

function profileFor(title: string): { profile: Profile; milestones: Milestone[]; metric: Metric | null } | null {
  const p = PROFILES[title];
  if (!p) return null;
  return {
    profile: { about: p.a, why: p.w ?? "", tips: p.t ?? "", safety: p.x ?? "", searches: p.s ?? [], ai: true },
    milestones: (p.m ?? []).map((text, i) => ({ id: `m${i}-${Math.random().toString(36).slice(2, 8)}`, text, done: false, doneAt: null })),
    metric: p.r ? { label: p.r[0], unit: p.r[1], higher: p.r[2] === 1 } : null,
  };
}

/** Ergänzt fehlende Felder (Migration, Backup-Import, neue Einträge). Vorhandene Werte bleiben. */
export function withDefaults(s: Partial<Skill>): Skill {
  const m = META.get(norm(s.name ?? ""));
  const pf = s.profile === undefined ? profileFor(m?.title ?? s.title ?? "") : null;
  return {
    id: s.id!,
    name: s.name ?? "",
    title: s.title ?? m?.title ?? s.name ?? "",
    kategorie: s.kategorie ?? "Ohne Kategorie",
    typ: s.typ ?? "skill",
    status: s.status ?? "idee",
    notes: s.notes ?? "",
    links: s.links ?? [],
    createdAt: s.createdAt ?? Date.now(),
    updatedAt: s.updatedAt ?? Date.now(),
    timerStart: s.timerStart ?? null,
    estMinutes: s.estMinutes ?? m?.estMinutes ?? 600,
    sessionMinutes: s.sessionMinutes ?? m?.sessionMinutes ?? 15,
    movement: s.movement ?? m?.movement ?? 0,
    place: s.place ?? m?.place ?? "ueberall",
    material: s.material ?? m?.material ?? [],
    season: s.season ?? m?.season ?? "",
    nextNote: s.nextNote ?? null,
    milestones: s.milestones ?? pf?.milestones ?? [],
    profile: s.profile !== undefined ? s.profile : pf?.profile ?? null,
    metric: s.metric !== undefined ? s.metric : pf?.metric ?? null,
    test: s.test ?? null,
    useUnits: s.useUnits ?? (s.title ?? m?.title ?? s.name) === UNITS_DEFAULT_TITLE ? true : s.useUnits,
    ...(s.unsorted ? { unsorted: true } : {}),
    upd: s.upd,
  };
}

export function defaultLists(): TodoList[] {
  return [
    { id: "list-allgemein", name: "Allgemein", order: 0 },
    { id: "list-schule", name: "Schule", order: 1 },
  ];
}

/** Nur „(auch …)“ und „(Info …)“ wandern in die Notizen, andere Klammern bleiben im Namen. */
const NOTE_RE = /\s*\(((?:auch|info)\b[^()]*)\)/gi;

export function parseSkills(md: string, now = Date.now()) {
  const skills: Skill[] = [];
  const sessions: Session[] = [];
  let kategorie = "";
  let n = 0;

  for (const raw of md.replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    const h = /^##\s+(.+)$/.exec(line);
    if (h) {
      kategorie = h[1].trim();
      continue;
    }
    const li = /^[-*]\s+(.+)$/.exec(line);
    if (!li || !kategorie) continue;

    const notes: string[] = [];
    let mergeJonglieren = false;
    const name = li[1]
      .replace(NOTE_RE, (_, inner: string) => {
        if (/jonglieren/i.test(inner)) mergeJonglieren = true;
        else notes.push(inner.charAt(0).toUpperCase() + inner.slice(1));
        return "";
      })
      .replace(/\s+/g, " ")
      .trim();

    const typ: Typ = kategorie === "Gewohnheiten" ? "gewohnheit" : kategorie === "Projekte & Besorgungen" ? "projekt" : "skill";
    const status: Status = kategorie.startsWith("Erst rausfinden") ? "rausfinden" : "idee";

    const skill = withDefaults({
      id: id("s", n++),
      name,
      kategorie,
      typ,
      status,
      notes: notes.join("\n"),
      createdAt: now + n,
      updatedAt: now + n,
    });
    skills.push(skill);

    if (mergeJonglieren || /^juggle 3/i.test(name)) {
      sessions.push({ id: id("x", n), skillId: skill.id, start: new Date(2026, 10, 21, 17, 1).getTime(), minutes: 2 });
    }
  }
  return { skills, sessions };
}

export function parseApps(md: string): AppIdea[] {
  return md
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => /^[-*]\s+(.+)$/.exec(l.trim())?.[1])
    .filter((x): x is string => !!x)
    .map((text, i) => {
      const [name, ...rest] = text.split(/\s+[–-]\s+/);
      return { id: id("a", i), name: name.trim(), note: rest.join(" – ").trim(), done: false, order: i };
    });
}

export function buildSeed() {
  return { ...parseSkills(skillsMd), apps: parseApps(appsMd) };
}
