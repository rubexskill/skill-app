import { useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid, type Typ } from "../db";
import { createSkill, normalize, similarity } from "../logic";
import { parseMarkdown, type MdItem, type MdLink } from "../mdparse";
import { CheckCircle, Group, Row, Sheet, useUI } from "../components/ui";
import { Icon } from "../components/Icon";
import { CategorySheet } from "./SkillSheets";

type Target = "inbox" | "todos" | "skills" | "terms" | "wishes";

const TARGETS: { id: Target; label: string; hint: string; unit: [string, string] }[] = [
  { id: "inbox", label: "Inbox", hint: "Ideen zum späteren Einsortieren", unit: ["Idee", "Ideen"] },
  { id: "todos", label: "To-dos", hint: "Checkboxen werden zu To-dos", unit: ["To-do", "To-dos"] },
  { id: "skills", label: "Skills", hint: "Überschriften werden Kategorien", unit: ["Skill", "Skills"] },
  { id: "terms", label: "Begriffe", hint: "Dinge, die du verstehen willst", unit: ["Begriff", "Begriffe"] },
  { id: "wishes", label: "Wunschliste", hint: "Mit Link und Notiz", unit: ["Wunsch", "Wünsche"] },
];

interface Entry {
  key: number;
  title: string;
  /** Text für Inbox/To-do (Links als „Titel (URL)“) */
  text: string;
  note: string;
  links: MdLink[];
  group: string;
  done: boolean;
  dup: string | null;
}

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** „Begriff – Erklärung“ oder „Begriff: Erklärung“ */
function splitTerm(title: string): { term: string; explanation: string } {
  const m = /^(.{1,60}?)\s+[–—-]\s+(.+)$/.exec(title) ?? /^(.{1,60}?):\s+(.+)$/.exec(title);
  return m ? { term: m[1].trim(), explanation: m[2].trim() } : { term: title, explanation: "" };
}

function typFor(group: string): Typ {
  if (group === "Gewohnheiten") return "gewohnheit";
  if (group === "Projekte" || group === "Projekte & Besorgungen") return "projekt";
  return "skill";
}

function buildEntries(items: MdItem[], target: Target): Omit<Entry, "dup">[] {
  const flat = target === "inbox" || target === "todos";
  const out: Omit<Entry, "dup">[] = [];
  for (const it of items) {
    const parent = out[out.length - 1];
    if (!flat && it.depth > 0 && parent) {
      parent.note = parent.note ? `${parent.note}\n${it.raw}` : it.raw;
      continue;
    }
    out.push({ key: out.length, title: it.title, text: it.raw, note: "", links: it.links, group: it.group, done: it.done });
  }
  return out;
}

export function MarkdownImportSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast, actionSheet } = useUI();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<{ name: string; items: MdItem[]; id: number } | null>(null);
  const [target, setTarget] = useState<Target>("inbox");
  const [listId, setListId] = useState("");
  const [category, setCategory] = useState("Importiert");
  const [catOpen, setCatOpen] = useState(false);
  const [sel, setSel] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);

  const lists = useLiveQuery(() => db.lists.orderBy("order").toArray(), []);
  const existing = useLiveQuery(
    async () => ({
      inbox: await db.inbox.toArray(),
      todos: await db.todos.toArray(),
      skills: await db.skills.toArray(),
      terms: await db.terms.toArray(),
      wishes: await db.wishes.toArray(),
    }),
    [open],
  );

  useEffect(() => {
    if (open) {
      setFile(null);
      setSel(new Set());
      setBusy(false);
    }
  }, [open]);

  useEffect(() => {
    if (lists?.length && !lists.some((l) => l.id === listId)) setListId((lists.find((l) => l.name === "Schule") ?? lists[0]).id);
  }, [lists, listId]);

  const entries: Entry[] = useMemo(() => {
    if (!file || !existing) return [];
    const base = buildEntries(file.items, target);
    const seen = new Set<string>();
    return base.map((e) => {
      const nameKey = normalize(target === "terms" ? splitTerm(e.title).term : e.title);
      let dup: string | null = null;
      if (seen.has(nameKey)) dup = "Doppelt in der Datei";
      else if (target === "inbox" && existing.inbox.some((x) => normalize(x.text) === normalize(e.text))) dup = "Gibt es schon";
      else if (target === "todos" && existing.todos.some((x) => x.listId === listId && normalize(x.text) === normalize(e.text))) dup = "Gibt es schon";
      else if (target === "skills" && existing.skills.some((s) => similarity(e.title, s.name) >= 80 || similarity(e.title, s.title) >= 80)) dup = "Ähnlicher Skill vorhanden";
      else if (target === "terms" && existing.terms.some((t) => normalize(t.term) === nameKey)) dup = "Gibt es schon";
      else if (target === "wishes" && existing.wishes.some((w) => normalize(w.name) === nameKey || (!!e.links[0] && w.url === e.links[0].url))) dup = "Gibt es schon";
      seen.add(nameKey);
      return { ...e, dup };
    });
  }, [file, existing, target, listId]);

  // Auswahl neu setzen, wenn sich Datei, Ziel oder Liste ändern (Duplikate sind zunächst abgewählt)
  const ready = !!existing;
  useEffect(() => {
    if (file && ready) setSel(new Set(entries.filter((e) => !e.dup).map((e) => e.key)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file?.id, target, listId, ready]);

  const pick = async (f: File | undefined) => {
    if (!f) return;
    try {
      const items = parseMarkdown(await f.text());
      if (!items.length) {
        toast("In der Datei wurden keine Punkte gefunden.");
        return;
      }
      setFile({ name: f.name, items, id: Date.now() });
      setTarget(items.some((i) => i.checkbox) ? "todos" : "inbox");
    } catch {
      toast("Die Datei konnte nicht gelesen werden.");
    }
  };

  const chosen = entries.filter((e) => sel.has(e.key));
  const toggle = (k: number) => setSel((s) => {
    const n = new Set(s);
    if (n.has(k)) n.delete(k);
    else n.add(k);
    return n;
  });
  const meta = TARGETS.find((t) => t.id === target)!;

  const commit = async () => {
    if (!chosen.length || busy) return;
    setBusy(true);
    const now = Date.now();
    try {
      if (target === "inbox") {
        await db.inbox.bulkAdd(chosen.map((e, i) => ({ id: uid(), text: e.text, createdAt: now - i })));
      } else if (target === "todos") {
        const lid = listId || "list-allgemein";
        await db.todos.bulkAdd(chosen.map((e, i) => ({ id: uid(), listId: lid, text: e.text, due: null, done: e.done, doneAt: e.done ? now : null, createdAt: now + i })));
      } else if (target === "skills") {
        for (const e of chosen) {
          const kat = e.group || category;
          await createSkill({
            name: e.title,
            kategorie: kat,
            typ: typFor(kat),
            status: "idee",
            notes: e.note,
            links: e.links.map((l) => ({ id: uid(), url: l.url, title: l.title, addedAt: now })),
          });
        }
      } else if (target === "terms") {
        await db.terms.bulkAdd(chosen.map((e, i) => {
          const { term, explanation } = splitTerm(e.title);
          return {
            id: uid(), term, explanation, understood: e.done, understoodAt: e.done ? now : null,
            links: e.links.map((l) => ({ id: uid(), url: l.url, title: l.title, addedAt: now })), createdAt: now + i,
          };
        }));
      } else {
        await db.wishes.bulkAdd(chosen.map((e, i) => ({
          id: uid(), name: e.title, url: e.links[0]?.url ?? "",
          note: [e.note, ...e.links.slice(1).map((l) => (l.title ? `${l.title} (${l.url})` : l.url))].filter(Boolean).join("\n"),
          bought: e.done, boughtAt: e.done ? now : null, createdAt: now + i,
        })));
      }
      const n = chosen.length;
      toast(`${n} ${meta.unit[n === 1 ? 0 : 1]} übernommen`);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const listName = lists?.find((l) => l.id === listId)?.name ?? "";

  return (
    <>
      <Sheet open={open} onClose={onClose} title="Importieren"
        action={file ? { label: chosen.length ? `${chosen.length} übernehmen` : "Übernehmen", onClick: () => void commit(), disabled: !chosen.length || busy } : undefined}>
        <input ref={fileRef} type="file" hidden accept=".md,.markdown,.txt,text/markdown,text/plain"
          onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; void pick(f); }} />

        {!file ? (
          <div className="md-empty">
            <Icon name="import" size={44} />
            <div className="empty-title">Datei wählen</div>
            <p className="empty-text">Wähle eine Markdown-Datei (.md) aus der Dateien-App. Danach legst du fest, wohin die Punkte kommen, und siehst vorher eine Vorschau.</p>
            <button className="btn btn-primary btn-small" onClick={() => fileRef.current?.click()}>Datei wählen</button>
          </div>
        ) : (
          <>
            <Group>
              <Row title={file.name} detail={`${file.items.length} Punkte`}
                leading={<span className="icon-tile tile-ink"><Icon name="note" size={17} /></span>} />
              <Row title="Andere Datei wählen" tone="accent" onClick={() => fileRef.current?.click()} />
            </Group>

            <Group header="Importieren als">
              {TARGETS.map((t) => (
                <Row key={t.id} title={t.label} subtitle={t.hint} onClick={() => setTarget(t.id)}
                  trailing={target === t.id ? <Icon name="check" size={18} className="row-check" /> : undefined} />
              ))}
            </Group>

            {(target === "todos" || target === "skills") && (
              <Group>
                {target === "todos" && (
                  <Row title="Liste" detail={listName} chevron onClick={() => actionSheet({
                    title: "To-do-Liste",
                    choices: (lists ?? []).map((l) => ({ label: l.name, checked: l.id === listId, onSelect: () => setListId(l.id) })),
                  })} />
                )}
                {target === "skills" && <Row title="Kategorie ohne Überschrift" detail={category} chevron onClick={() => setCatOpen(true)} />}
              </Group>
            )}

            <Group header={
              <span className="head-with-link">Vorschau · {chosen.length} von {entries.length}
                <button className="text-btn" onClick={() => setSel(chosen.length === entries.length ? new Set() : new Set(entries.map((e) => e.key)))}>
                  {chosen.length === entries.length ? "Keine" : "Alle"}
                </button>
              </span>
            } footer={entries.some((e) => e.dup) ? "Bereits vorhandene Einträge sind abgewählt." : undefined}>
              {entries.map((e) => {
                const shown = target === "terms" ? splitTerm(e.title) : null;
                const sub = [e.dup, shown?.explanation, target === "skills" && e.group ? e.group : null, target !== "inbox" && target !== "todos" && e.links[0] ? host(e.links[0].url) : null, e.note ? e.note.split("\n")[0] : null].filter(Boolean).join(" · ");
                return (
                  <Row key={e.key} title={shown ? shown.term : target === "inbox" || target === "todos" ? e.text : e.title} muted={!sel.has(e.key)}
                    subtitle={sub ? <span className={e.dup ? "dup-note" : "clamp-1"}>{sub}</span> : undefined}
                    leading={<CheckCircle checked={sel.has(e.key)} label={e.title} onToggle={() => toggle(e.key)} />}
                    onClick={() => toggle(e.key)} />
                );
              })}
            </Group>
          </>
        )}
      </Sheet>
      <CategorySheet open={catOpen} onClose={() => setCatOpen(false)} value={category} onSelect={setCategory} />
    </>
  );
}
