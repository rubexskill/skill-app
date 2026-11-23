import { db, STATUSES, type Place, type Skill, type Status, type Term, type Todo, type TodoList, type Typ, type Wish } from "./db";
import { deleteSkill, normalize, similarity } from "./logic";

/** „Mit Claude aufräumen“: Prompt bauen, Antwort lesen, Vorschau erzeugen, übernehmen. Alles lokal, ohne API. */

export type TidyKind = "skill" | "gewohnheit" | "projekt" | "todo" | "begriff" | "wunsch";
export const PACKAGE_SIZE = 30;
export const HABIT_CAT = "Gewohnheiten";
export const PROJECT_CAT = "Projekte & Besorgungen";
export const UNCLEAR_CAT = "Erst rausfinden, was das ist";

export interface TidyItem {
  kind: TidyKind;
  id: string;
  /** Kurze, eindeutige Kennung für den Prompt (z. B. „s-a1b2c3“) */
  sid: string;
  text: string;
  createdAt: number;
  skill?: Skill;
  todo?: Todo;
  term?: Term;
  wish?: Wish;
}

export interface TidyScope {
  kinds?: TidyKind[];
  /** Nur diese Einträge (Einzel-Aufräumen) */
  ids?: string[];
}

const LETTER: Record<TidyKind, string> = { skill: "s", gewohnheit: "g", projekt: "p", todo: "t", begriff: "b", wunsch: "w" };

export function skillKind(s: Pick<Skill, "typ">): TidyKind {
  return s.typ === "gewohnheit" ? "gewohnheit" : s.typ === "projekt" ? "projekt" : "skill";
}

/** Kurze Kennungen, innerhalb der Liste eindeutig. */
function assignSids(items: Omit<TidyItem, "sid">[]): TidyItem[] {
  const used = new Set<string>();
  return items.map((it) => {
    let n = 5;
    let sid = `${LETTER[it.kind]}-${it.id.slice(-n)}`;
    while (used.has(sid) && n < it.id.length) sid = `${LETTER[it.kind]}-${it.id.slice(-++n)}`;
    used.add(sid);
    return { ...it, sid };
  });
}

/** Alle Einträge (Skills, To-dos, Begriffe, Wünsche) mit kurzen Kennungen, die innerhalb der Liste eindeutig sind. */
export async function collectAll(): Promise<TidyItem[]> {
  const [skills, todos, terms, wishes] = await Promise.all([db.skills.toArray(), db.todos.toArray(), db.terms.toArray(), db.wishes.toArray()]);
  const raw: Omit<TidyItem, "sid">[] = [
    ...skills.map((s) => ({ kind: skillKind(s), id: s.id, text: s.name, createdAt: s.createdAt, skill: s })),
    ...todos.map((t) => ({ kind: "todo" as const, id: t.id, text: t.text, createdAt: t.createdAt, todo: t })),
    ...terms.map((t) => ({ kind: "begriff" as const, id: t.id, text: t.term, createdAt: t.createdAt, term: t })),
    ...wishes.map((w) => ({ kind: "wunsch" as const, id: w.id, text: w.name, createdAt: w.createdAt, wish: w })),
  ].sort((a, b) => a.createdAt - b.createdAt);
  return assignSids(raw);
}

const isUnsorted = (i: TidyItem) => !!(i.skill?.unsorted || i.todo?.unsorted || i.term?.unsorted || i.wish?.unsorted);

export async function collectUnsorted(scope: TidyScope = {}, all?: TidyItem[]): Promise<TidyItem[]> {
  const pool = all ?? (await collectAll());
  return pool.filter((i) => isUnsorted(i) && (!scope.kinds || scope.kinds.includes(i.kind)) && (!scope.ids || scope.ids.includes(i.id)));
}

/** Gleiche Tabelle (Skills/To-dos/Begriffe/Wünsche) = Duplikat und Zusammenführen sind erlaubt. */
export const tableOf = (i: TidyItem): TidyChange["table"] => (i.skill ? "skills" : i.todo ? "todos" : i.term ? "terms" : "wishes");

/** Bis zu drei ähnliche, schon vorhandene Einträge (für den Prompt, damit Claude Duplikate erkennen kann). */
export function similarOf(item: TidyItem, pool: TidyItem[], limit = 3): TidyItem[] {
  return pool
    .filter((p) => p.id !== item.id && tableOf(p) === tableOf(item))
    .map((p) => ({ p, score: Math.max(similarity(item.text, p.text), item.skill && p.skill ? similarity(item.text, p.skill.title) : 0) }))
    .filter((x) => x.score >= 60)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.p);
}

export interface TidyContext {
  categories: string[];
  lists: string[];
  today: string;
}

export async function tidyContext(): Promise<TidyContext> {
  const skills = await db.skills.toArray();
  const lists = await db.lists.orderBy("order").toArray();
  const cats = new Set<string>();
  for (const s of skills) cats.add(s.kategorie);
  return { categories: [...cats].filter((c) => c !== "Ohne Kategorie"), lists: lists.map((l) => l.name), today: new Date().toISOString().slice(0, 10) };
}

export function chunk<T>(a: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < a.length; i += n) out.push(a.slice(i, i + n));
  return out;
}

const KIND_NAME: Record<TidyKind, string> = { skill: "skill", gewohnheit: "gewohnheit", projekt: "projekt", todo: "todo", begriff: "begriff", wunsch: "wunsch" };

function promptItem(i: TidyItem, pool: TidyItem[] = []): Record<string, unknown> {
  const o: Record<string, unknown> = { id: i.sid, art: KIND_NAME[i.kind], text: i.text };
  if (i.skill) {
    if (i.skill.kategorie && i.skill.kategorie !== "Ohne Kategorie") o.aktuelle_kategorie = i.skill.kategorie;
    if (i.skill.notes.trim()) o.notizen = i.skill.notes.trim().slice(0, 400);
  }
  if (i.todo?.due) o.aktuelles_datum = i.todo.due;
  if (i.term?.explanation.trim()) o.aktuelle_erklaerung = i.term.explanation.trim().slice(0, 300);
  if (i.wish?.note.trim()) o.notiz = i.wish.note.trim().slice(0, 300);
  const sim = similarOf(i, pool);
  if (sim.length) o.aehnliche_eintraege = sim.map((p) => ({ id: p.sid, text: p.text, ...(isUnsorted(p) ? { unaufgeraeumt: true } : {}) }));
  return o;
}

export function buildPrompt(items: TidyItem[], ctx: TidyContext, part: number, parts: number, pool: TidyItem[] = []): string {
  const hasSkill = items.some((i) => i.skill);
  const hasTodo = items.some((i) => i.todo);
  const hasTerm = items.some((i) => i.term);
  const hasWish = items.some((i) => i.wish);
  const schema: string[] = [];
  if (hasSkill) schema.push(`{"id":"…","art":"skill|gewohnheit|projekt","titel":"sauberer deutscher Titel","kurztitel":"kurz, max. 4 Wörter","kategorie":"genau eine aus der Liste","status":"idee|lerne|rausfinden|kann","stunden_bis_koennen":12,"minuten_pro_einheit":15,"bewegung":0,"ort":"ueberall|zuhause|draussen|gym","material":["…"],"jahreszeit":"|sommer|winter","steckbrief":{"worum":"1–2 Sätze","warum":"1 Satz","tipps":"1–2 Sätze","sicherheit":"leer, wenn nichts nötig"},"meilensteine":["3–5 kurze Schritte"]}`);
  if (hasTodo) schema.push(`{"id":"…","art":"todo","titel":"sauberer Titel","liste":"genau eine aus der Listenliste","datum":"JJJJ-MM-TT oder null"}`);
  if (hasTerm) schema.push(`{"id":"…","art":"begriff","begriff":"sauberer Begriff","erklaerung":"1–2 Sätze, sachlich"}`);
  if (hasWish) schema.push(`{"id":"…","art":"wunsch","titel":"sauberer Name des Wunschs"}`);
  return [
    `Du hilfst mir, Einträge in meiner persönlichen Skill-App aufzuräumen.${parts > 1 ? ` Das ist Paket ${part} von ${parts}.` : ""}`,
    "",
    "Aufgabe: Bereinige jeden Eintrag unten. Antworte AUSSCHLIESSLICH mit einem JSON-Codeblock im Format unten, ohne weiteren Text davor oder danach.",
    "",
    "Regeln:",
    "- Erfinde nichts. Wenn ein Eintrag unklar ist, setze bei Skills den status \"rausfinden\" (= „Klären“) und lass Schätzwerte und Steckbrief weg.",
    "- Alle Texte auf Deutsch, ruhig und sachlich. Titel ohne Emojis, ohne Floskeln, ohne Anführungszeichen.",
    "- Kategorie und Liste nur aus den Listen unten wählen, genau so geschrieben. Gewohnheiten gehören zu „Gewohnheiten“, Projekte zu „Projekte & Besorgungen“.",
    "- status für Skills: idee = später, lerne = aktiv, rausfinden = klären (nur wenn wirklich unklar), kann = schon geschafft. Im Zweifel \"idee\".",
    "- bewegung: 0 = keine, 1 = wenig, 2 = viel. stunden_bis_koennen: realistische Stunden bis zum soliden Können für Anfänger. minuten_pro_einheit: sinnvolle Übungsdauer.",
    "- Gib bei jedem Eintrag dieselbe id zurück wie unten. Lass keinen Eintrag aus.",
    "- Aufräumen heißt auch aussortieren: Ist ein Eintrag Unsinn, ein Tippfehler-Rest, leer oder nicht sinnvoll, gib stattdessen {\"id\":\"…\",\"aktion\":\"loeschen\"} zurück. Ist er ein Duplikat eines anderen Eintrags (siehe aehnliche_eintraege oder ein anderer Eintrag in dieser Liste), gib {\"id\":\"…\",\"aktion\":\"duplikat_von\",\"duplikat_von\":\"<id des anderen Eintrags>\"} zurück. Verwende nur ids aus dieser Nachricht. Lösche und führe nur zusammen, wenn du dir sicher bist; im Zweifel behalte den Eintrag und bereinige ihn normal. Die Vorschau zeigt jede Löschung zur Bestätigung.",
    `- Heute ist ${ctx.today}. Datum bei To-dos nur setzen, wenn der Text eines nennt („morgen“, „Freitag“ …), sonst null.`,
    "",
    "Format der Antwort:",
    "```json",
    `{"eintraege":[`,
    ...schema.map((s, i) => `  ${s}${i < schema.length - 1 ? "," : ""}`),
    `]}`,
    "```",
    "",
    `Vorhandene Kategorien: ${ctx.categories.map((c) => `„${c}“`).join(", ")}`,
    `Vorhandene To-do-Listen: ${ctx.lists.map((c) => `„${c}“`).join(", ")}`,
    "",
    "Einträge:",
    "```json",
    JSON.stringify(items.map((i) => promptItem(i, pool)), null, 1),
    "```",
  ].join("\n");
}

export function buildPrompts(items: TidyItem[], ctx: TidyContext, size = PACKAGE_SIZE, pool: TidyItem[] = []): { text: string; count: number }[] {
  const parts = chunk(items, size);
  return parts.map((p, i) => ({ text: buildPrompt(p, ctx, i + 1, parts.length, pool), count: p.length }));
}

// ---------------- Antwort lesen ----------------

export interface TidyEntry {
  id: string;
  art?: string;
  titel?: string;
  kurztitel?: string;
  kategorie?: string;
  status?: string;
  stunden_bis_koennen?: number;
  minuten_pro_einheit?: number;
  bewegung?: number;
  ort?: string;
  material?: string[];
  jahreszeit?: string;
  steckbrief?: { worum?: string; warum?: string; tipps?: string; sicherheit?: string };
  meilensteine?: string[];
  liste?: string;
  datum?: string | null;
  begriff?: string;
  erklaerung?: string;
  /** "loeschen" oder "duplikat_von" (mit Feld duplikat_von); auch als Objekt {duplikat_von: id} lesbar */
  aktion?: string | { duplikat_von?: string; loeschen?: boolean };
  duplikat_von?: string;
}

/** Findet alle JSON-Blöcke (```json … ``` oder rohes JSON) und gibt die Einträge zurück. */
export function parseTidyResponse(text: string): { entries: TidyEntry[]; errors: string[] } {
  const entries: TidyEntry[] = [];
  const errors: string[] = [];
  const blocks: string[] = [];
  for (const m of text.matchAll(/```[a-zA-Z]*\s*([\s\S]*?)```/g)) blocks.push(m[1]);
  if (!blocks.length) {
    const a = text.indexOf("{"), b = text.lastIndexOf("}");
    const c = text.indexOf("["), d = text.lastIndexOf("]");
    if (a >= 0 && b > a && (c < 0 || a < c)) blocks.push(text.slice(a, b + 1));
    else if (c >= 0 && d > c) blocks.push(text.slice(c, d + 1));
  }
  if (!blocks.length) return { entries, errors: ["Kein JSON gefunden."] };
  for (const raw of blocks) {
    let data: unknown;
    try {
      // typografische Anführungszeichen und abschließende Kommas tolerieren
      data = JSON.parse(raw.replace(/,\s*([}\]])/g, "$1"));
    } catch {
      errors.push("Ein Block ist kein gültiges JSON.");
      continue;
    }
    const list = Array.isArray(data) ? data : Array.isArray((data as { eintraege?: unknown }).eintraege) ? (data as { eintraege: unknown[] }).eintraege : null;
    if (!list) { errors.push("Feld „eintraege“ fehlt."); continue; }
    for (const e of list) {
      if (!e || typeof e !== "object" || typeof (e as TidyEntry).id !== "string") continue;
      const en = e as TidyEntry;
      if (en.aktion && typeof en.aktion === "object") {
        if (en.aktion.duplikat_von) { en.duplikat_von = String(en.aktion.duplikat_von); en.aktion = "duplikat_von"; }
        else if (en.aktion.loeschen) en.aktion = "loeschen";
        else en.aktion = undefined;
      }
      if (typeof en.duplikat_von === "string" && en.duplikat_von && !en.aktion) en.aktion = "duplikat_von";
      entries.push(en);
    }
  }
  return { entries, errors };
}

// ---------------- Vorschau und Übernehmen ----------------

export interface TidyChange {
  item: TidyItem;
  entry: TidyEntry;
  table: "skills" | "todos" | "terms" | "wishes";
  patch: Record<string, unknown>;
  /** Anzeigezeilen „Feld: alt → neu“ */
  lines: string[];
  warnings: string[];
  unclear: boolean;
  /** update = bereinigen, delete = löschen, merge = als Duplikat zusammenführen */
  action: "update" | "delete" | "merge";
  target?: TidyItem;
  /** Vorauswahl in der Vorschau */
  preselect: boolean;
}

const PLACES: Record<string, Place> = { ueberall: "ueberall", überall: "ueberall", zuhause: "zuhause", "zu hause": "zuhause", draussen: "draussen", draußen: "draussen", gym: "gym" };
const num = (v: unknown, min: number, max: number) => (typeof v === "number" && isFinite(v) ? Math.min(max, Math.max(min, v)) : null);
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const validDate = (d: unknown) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(new Date(d + "T00:00:00").getTime());

function addOriginal(old: string, orig: string, changed: boolean): string {
  if (!changed || !orig.trim()) return old;
  const line = `Ursprünglich: ${orig.trim()}`;
  return old.includes(line) ? old : old.trim() ? `${old.trim()}\n\n${line}` : line;
}

export function matchEntry(items: TidyItem[], id: string): TidyItem | null {
  const k = id.trim();
  return items.find((i) => i.sid === k) ?? items.find((i) => i.sid.toLowerCase() === k.toLowerCase()) ?? items.find((i) => i.id === k) ?? null;
}

/** Skills, an denen Sessions, Häkchen, Rekorde oder Karten hängen (Löschen/Zusammenführen dann nur mit Warnung). */
export async function skillsWithHistory(): Promise<Set<string>> {
  const [a, b, c, d] = await Promise.all([db.sessions.toArray(), db.checks.toArray(), db.records.toArray(), db.cards.toArray()]);
  return new Set([...a, ...b, ...c, ...d].map((x) => x.skillId));
}

export function buildChanges(items: TidyItem[], entries: TidyEntry[], ctx: TidyContext, lists: TodoList[], pool: TidyItem[] = items, withHistory: Set<string> = new Set()): { changes: TidyChange[]; unmatched: TidyEntry[] } {
  const changes: TidyChange[] = [];
  const unmatched: TidyEntry[] = [];
  const seen = new Set<string>();
  const catSet = new Map(ctx.categories.map((c) => [normalize(c), c]));
  for (const entry of entries) {
    const item = matchEntry(items, entry.id);
    if (!item || seen.has(item.id)) { if (!item) unmatched.push(entry); continue; }
    seen.add(item.id);
    if (entry.aktion === "loeschen" || entry.aktion === "duplikat_von") {
      const table0 = tableOf(item);
      const warnings0: string[] = [];
      let action: TidyChange["action"] = entry.aktion === "loeschen" ? "delete" : "merge";
      let target: TidyItem | undefined;
      let preselect = true;
      if (action === "merge") {
        target = matchEntry(pool, String(entry.duplikat_von ?? "")) ?? undefined;
        if (!target) { warnings0.push("Das genannte Original wurde nicht gefunden – nichts zusammengeführt."); }
        else if (target.id === item.id) { warnings0.push("Ein Eintrag kann nicht Duplikat von sich selbst sein."); target = undefined; }
        else if (tableOf(target) !== table0) { warnings0.push("Das Original ist eine andere Art von Eintrag – nichts zusammengeführt."); target = undefined; }
        if (!target) { action = "update"; preselect = false; }
      }
      if (item.skill && withHistory.has(item.id) && action !== "update") { warnings0.push("Achtung: Dieser Skill hat Sessions, Häkchen, Rekorde oder Karten."); preselect = false; }
      const lines0 =
        action === "delete" ? [`Löschen (Vorschlag von Claude)`]
        : action === "merge" ? [`Duplikat von „${target!.text}“ – wird zusammengeführt, der Text bleibt dort in den Notizen`]
        : ["Keine Änderung"];
      changes.push({ item, entry, table: table0, patch: action === "update" ? {} : { unsorted: false }, lines: lines0, warnings: warnings0, unclear: false, action, target, preselect });
      continue;
    }
    const warnings: string[] = [];
    const lines: string[] = [];
    const patch: Record<string, unknown> = { unsorted: false };
    const diff = (label: string, a: string, b: string) => { if (a !== b) lines.push(`${label}: ${a || "–"} → ${b}`); };
    let table: TidyChange["table"] = "skills";
    let unclear = false;

    if (item.skill) {
      const s = item.skill;
      const art = (str(entry.art) || skillKind(s)) as string;
      const typ: Typ = art === "gewohnheit" ? "gewohnheit" : art === "projekt" ? "projekt" : "skill";
      const title = str(entry.titel) || s.name;
      const short = str(entry.kurztitel) || (str(entry.titel) ? title : s.title);
      const status: Status = (STATUSES as string[]).includes(str(entry.status)) ? (str(entry.status) as Status) : s.status;
      let kat = s.kategorie;
      const wished = str(entry.kategorie);
      if (typ === "gewohnheit") kat = HABIT_CAT;
      else if (typ === "projekt") kat = PROJECT_CAT;
      else if (catSet.has(normalize(wished))) kat = catSet.get(normalize(wished))!;
      else {
        if (wished) warnings.push(`Kategorie „${wished}“ gibt es nicht – bleibt „${s.kategorie}“.`);
        if (status === "rausfinden" && kat === "Ohne Kategorie") kat = UNCLEAR_CAT;
      }
      unclear = status === "rausfinden";
      Object.assign(patch, { name: title, title: short, typ, kategorie: kat, status, updatedAt: Date.now(), notes: addOriginal(s.notes, s.name, title !== s.name) });
      const h = num(entry.stunden_bis_koennen, 0.1, 1000);
      if (h != null && !unclear) patch.estMinutes = Math.round(h * 60);
      const m = num(entry.minuten_pro_einheit, 1, 480);
      if (m != null && !unclear) patch.sessionMinutes = Math.round(m);
      const mv = num(entry.bewegung, 0, 2);
      if (mv != null && !unclear) patch.movement = Math.round(mv);
      const place = PLACES[str(entry.ort).toLowerCase()];
      if (place && !unclear) patch.place = place;
      if (Array.isArray(entry.material) && !unclear) patch.material = entry.material.map(str).filter(Boolean).slice(0, 8);
      if (["", "sommer", "winter"].includes(str(entry.jahreszeit)) && entry.jahreszeit !== undefined && !unclear) patch.season = str(entry.jahreszeit);
      const sb = entry.steckbrief;
      if (sb && str(sb.worum) && (!s.profile || s.profile.ai)) {
        patch.profile = { about: str(sb.worum), why: str(sb.warum), tips: str(sb.tipps), safety: str(sb.sicherheit), searches: s.profile?.searches ?? [], ai: true };
      }
      if (Array.isArray(entry.meilensteine) && !s.milestones.length && !unclear) {
        patch.milestones = entry.meilensteine.map(str).filter(Boolean).slice(0, 8).map((text, i) => ({ id: `m${i}-${Math.random().toString(36).slice(2, 8)}`, text, done: false, doneAt: null }));
      }
      diff("Titel", s.name, title);
      if (short !== title) lines.push(`Kurztitel: ${short}`);
      diff("Kategorie", s.kategorie === "Ohne Kategorie" ? "" : s.kategorie, kat);
      if (typ !== s.typ) lines.push(`Typ: ${s.typ} → ${typ}`);
      if (status !== s.status) lines.push(`Status: ${s.status} → ${status}`);
      else if (unclear) lines.push("Status: Klären");
      if (patch.estMinutes) lines.push(`Zeit bis zum Können: ${Math.round((patch.estMinutes as number) / 60)} h`);
      if (patch.profile) lines.push("Steckbrief neu");
      if (patch.milestones) lines.push(`${(patch.milestones as unknown[]).length} Meilensteine`);
    } else if (item.todo) {
      table = "todos";
      const t = item.todo;
      const title = str(entry.titel) || t.text;
      patch.text = title;
      patch.note = addOriginal(t.note ?? "", t.text, title !== t.text);
      const l = lists.find((x) => normalize(x.name) === normalize(str(entry.liste)));
      if (l) patch.listId = l.id;
      else if (str(entry.liste)) warnings.push(`Liste „${str(entry.liste)}“ gibt es nicht.`);
      if (validDate(entry.datum)) patch.due = entry.datum;
      diff("Titel", t.text, title);
      if (l && l.id !== t.listId) lines.push(`Liste: ${lists.find((x) => x.id === t.listId)?.name ?? "–"} → ${l.name}`);
      if (patch.due && patch.due !== t.due) lines.push(`Fällig: ${t.due ?? "–"} → ${patch.due}`);
    } else if (item.term) {
      table = "terms";
      const t = item.term;
      const name = str(entry.begriff) || str(entry.titel) || t.term;
      patch.term = name;
      patch.note = addOriginal(t.note ?? "", t.term, name !== t.term);
      if (!t.explanation.trim() && str(entry.erklaerung)) patch.explanation = str(entry.erklaerung);
      else if (t.explanation.trim() && str(entry.erklaerung)) warnings.push("Eigene Erklärung bleibt unverändert.");
      diff("Begriff", t.term, name);
      if (patch.explanation) lines.push(`Erklärung: ${patch.explanation}`);
    } else if (item.wish) {
      table = "wishes";
      const w = item.wish;
      const name = str(entry.titel) || w.name;
      patch.name = name;
      patch.note = addOriginal(w.note, w.name, name !== w.name);
      diff("Name", w.name, name);
    }
    if (!lines.length) lines.push("Nur als aufgeräumt markieren");
    changes.push({ item, entry, table, patch, lines, warnings, unclear, action: "update", preselect: true });
  }
  // Ziele, die selbst gelöscht oder zusammengeführt werden, sind keine gültigen Originale
  const removed = new Set(changes.filter((c) => c.action === "delete" || c.action === "merge").map((c) => c.item.id));
  for (const c of changes) {
    if (c.action === "merge" && c.target && removed.has(c.target.id)) {
      c.warnings.push("Das Original wird in derselben Antwort selbst entfernt – nichts zusammengeführt.");
      c.action = "update"; c.patch = {}; c.lines = ["Keine Änderung"]; c.preselect = false; c.target = undefined;
    }
  }
  return { changes, unmatched };
}

/** Wendet die gewählten Änderungen an (bereinigen, löschen, zusammenführen); gibt eine Funktion zum Rückgängigmachen zurück. */
export async function applyChanges(changes: TidyChange[]): Promise<() => Promise<void>> {
  const rowOf = (i: TidyItem) => i.skill ?? i.todo ?? i.term ?? i.wish;
  const before = changes.map((c) => ({ table: c.table, row: rowOf(c.item) }));
  const targetsBefore = changes.filter((c) => c.action === "merge" && c.target).map((c) => ({ table: c.table, row: rowOf(c.target!) }));
  const restores: (() => Promise<void>)[] = [];
  // Erst bereinigen, dann zusammenführen/löschen: Ein Original kann in derselben Antwort selbst bereinigt werden.
  for (const c of changes) {
    if (c.action === "update" && Object.keys(c.patch).length) await db.table(c.table).update(c.item.id, c.patch);
  }
  for (const c of changes) {
    if (c.action === "merge" && c.target) {
      // Text des Duplikats bleibt beim Original in den Notizen; dann Duplikat entfernen
      const t = c.target;
      const line = `Zusammengeführt: ${c.item.text}`;
      const fresh = (await db.table(c.table).get(t.id)) as { notes?: string; note?: string } | undefined;
      const old = (t.skill ? fresh?.notes : fresh?.note) ?? "";
      const note = old.includes(line) ? old : old.trim() ? `${old.trim()}\n\n${line}` : line;
      await db.table(c.table).update(t.id, t.skill ? { notes: note } : { note });
    }
    if (c.action === "merge" || c.action === "delete") {
      if (c.action === "merge" && !c.target) continue;
      if (c.item.skill) restores.push(await deleteSkill(c.item.id));
      else await db.table(c.table).delete(c.item.id);
    }
  }
  return async () => {
    await db.transaction("rw", db.skills, db.todos, db.terms, db.wishes, async () => {
      for (const b of [...targetsBefore, ...before]) if (b.row) await db.table(b.table).put(b.row);
    });
    for (const r of restores) await r();
  };
}

export async function setSorted(kind: "skill" | "todo" | "term" | "wish", id: string) {
  const t = kind === "skill" ? db.skills : kind === "todo" ? db.todos : kind === "term" ? db.terms : db.wishes;
  await (t as unknown as { update: (id: string, p: object) => Promise<number> }).update(id, { unsorted: false });
}
