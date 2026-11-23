import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import { copyText } from "../logic";
import { applyChanges, buildChanges, buildPrompts, collectAll, collectUnsorted, parseTidyResponse, setSorted, skillsWithHistory, tidyContext, type TidyChange, type TidyContext, type TidyItem, type TidyKind, type TidyScope } from "../tidy";
import { AutoTextarea, CheckCircle, Group, Row, Sheet, useUI } from "../components/ui";
import { Icon } from "../components/Icon";

/** Anzahl unaufgeräumter Einträge (optional nur bestimmte Arten). */
export function useUnsortedCount(kinds?: TidyKind[]): number {
  return (
    useLiveQuery(async () => {
      const k = (x: TidyKind) => !kinds || kinds.includes(x);
      let n = 0;
      if (k("skill") || k("gewohnheit") || k("projekt")) {
        n += await db.skills.filter((s) => !!s.unsorted && k(s.typ === "gewohnheit" ? "gewohnheit" : s.typ === "projekt" ? "projekt" : "skill")).count();
      }
      if (k("todo")) n += await db.todos.filter((t) => !!t.unsorted).count();
      if (k("begriff")) n += await db.terms.filter((t) => !!t.unsorted).count();
      if (k("wunsch")) n += await db.wishes.filter((t) => !!t.unsorted).count();
      return n;
    }, [kinds?.join(",")]) ?? 0
  );
}

/** Kleines Symbol hinter dem Titel */
export function UnsortedMark({ on }: { on?: boolean }) {
  if (!on) return null;
  return <span className="unsorted-mark" title="Unaufgeräumt" role="img" aria-label="Unaufgeräumt"><Icon name="tidy" size={14} /></span>;
}

/** Zeile über Listen: Filter „Unaufgeräumt“ und Knopf „Mit Claude aufräumen“. Erscheint nur, wenn es etwas aufzuräumen gibt. */
export function TidyStrip({ kinds, ids, only, onToggle }: { kinds: TidyKind[]; ids?: string[]; only: boolean; onToggle: (v: boolean) => void }) {
  const all = useUnsortedCount(kinds);
  const n = ids ? ids.length : all;
  const [open, setOpen] = useState(false);
  if (n === 0 && !only) return null;
  return (
    <div className="tidy-strip">
      <button className={`mini-pill${only ? " is-on" : ""}`} onClick={() => onToggle(!only)} aria-pressed={only}><Icon name="tidy" size={14} />Unaufgeräumt · {n}</button>
      {n > 0 && <button className="mini-pill tidy-go" onClick={() => setOpen(true)}>Mit Claude aufräumen ({n})</button>}
      <TidySheet open={open} onClose={() => setOpen(false)} scope={ids ? { ids } : { kinds }} />
    </div>
  );
}

/** Großer Knopf (Übersicht, Mehr) */
export function TidyButton({ kinds, label = "Mit Claude aufräumen", inGroup }: { kinds?: TidyKind[]; label?: string; inGroup?: boolean }) {
  const n = useUnsortedCount(kinds);
  const [open, setOpen] = useState(false);
  if (n === 0) return null;
  const sheet = <TidySheet open={open} onClose={() => setOpen(false)} scope={{ kinds }} />;
  if (inGroup) {
    return (
      <>
        <Row title={`${label} (${n})`} leading={<span className="icon-tile tile-soft"><Icon name="tidy" size={18} /></span>} chevron onClick={() => setOpen(true)} />
        {sheet}
      </>
    );
  }
  return (
    <>
      <button className="sort-cta tidy-cta" onClick={() => setOpen(true)}>
        <Icon name="tidy" size={20} /><span>{label} ({n})</span><Icon name="chevron-right" size={15} className="sort-cta-chev" />
      </button>
      {sheet}
    </>
  );
}

/** Zeilen für Einzelseiten: einzeln aufräumen oder als aufgeräumt markieren. */
export function TidyItemRows({ kind, id, unsorted }: { kind: "skill" | "todo" | "term" | "wish"; id: string; unsorted?: boolean }) {
  const [open, setOpen] = useState(false);
  const { toast } = useUI();
  return (
    <>
      <Row title={unsorted ? "Mit Claude aufräumen" : "Mit Claude neu aufräumen"} tone="accent" leading={<Icon name="tidy" size={18} />} onClick={() => setOpen(true)} />
      {unsorted && <Row title="Als aufgeräumt markieren" leading={<Icon name="check" size={18} />} onClick={() => { void setSorted(kind, id); toast("Als aufgeräumt markiert"); }} />}
      <TidySheet open={open} onClose={() => setOpen(false)} scope={{ ids: [id] }} forceItems />
    </>
  );
}

export function TidySheet({ open, onClose, scope, forceItems }: { open: boolean; onClose: () => void; scope: TidyScope; forceItems?: boolean }) {
  const { toast, actionSheet } = useUI();
  const [items, setItems] = useState<TidyItem[]>([]);
  const [pool, setPool] = useState<TidyItem[]>([]);
  const [ctx, setCtx] = useState<TidyContext | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [changes, setChanges] = useState<TidyChange[] | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const scopeKey = JSON.stringify(scope);

  const reload = async () => {
    const all = await collectAll();
    let list = await collectUnsorted(scope, all);
    // Einzel-Aufräumen auch für bereits aufgeräumte Einträge: temporär mitnehmen
    if (forceItems && scope.ids && list.length === 0) list = all.filter((i) => scope.ids!.includes(i.id));
    setPool(all);
    setItems(list);
    setCtx(await tidyContext());
  };
  useEffect(() => {
    if (!open) return;
    setText(""); setChanges(null); setNotes([]); setCopied(null);
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, scopeKey]);

  const prompts = useMemo(() => (ctx ? buildPrompts(items, ctx, undefined, pool) : []), [items, ctx, pool]);

  const copy = async (i: number) => {
    const ok = await copyText(prompts[i].text);
    setCopied(ok ? i : null);
    toast(ok ? `Prompt ${prompts.length > 1 ? `${i + 1} von ${prompts.length} ` : ""}kopiert – jetzt in Claude einfügen.` : "Kopieren nicht möglich. Bitte erneut versuchen.");
  };

  const paste = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) { setText(t); preview(t); }
    } catch {
      toast("Zwischenablage nicht lesbar. Bitte ins Feld einfügen.");
    }
  };

  const preview = async (src = text) => {
    if (!ctx) return;
    const { entries, errors } = parseTidyResponse(src);
    const lists = await db.lists.toArray();
    const { changes: ch, unmatched } = buildChanges(items, entries, ctx, lists, pool, await skillsWithHistory());
    const n: string[] = [...errors];
    if (unmatched.length) n.push(`${unmatched.length} Antwort${unmatched.length === 1 ? "" : "en"} ließ${unmatched.length === 1 ? "" : "en"} sich keinem Eintrag zuordnen (andere Paket-Antwort?).`);
    const missing = items.length - ch.length;
    if (ch.length && missing > 0) n.push(`${missing} Eintrag${missing === 1 ? "" : "e"} ohne Antwort – bleiben unaufgeräumt.`);
    setNotes(n);
    setChanges(ch);
    setPicked(new Set(ch.filter((c) => c.preselect).map((c) => c.item.id)));
  };

  const doApply = async (chosen: TidyChange[]) => {
    const undo = await applyChanges(chosen);
    const n = (k: TidyChange["action"]) => chosen.filter((c) => c.action === k).length;
    const parts = [n("update") ? `${n("update")} aufgeräumt` : "", n("delete") ? `${n("delete")} gelöscht` : "", n("merge") ? `${n("merge")} zusammengeführt` : ""].filter(Boolean);
    toast(parts.join(", "), { label: "Rückgängig", run: () => void undo() });
    setText(""); setChanges(null); setNotes([]);
    await reload();
    if (!(await collectUnsorted(scope)).length) onClose();
  };

  const apply = async () => {
    const chosen = (changes ?? []).filter((c) => picked.has(c.item.id));
    if (!chosen.length) return;
    const del = chosen.filter((c) => c.action === "delete").length;
    const mer = chosen.filter((c) => c.action === "merge").length;
    if (del || mer) {
      actionSheet({
        title: "Bestätigen",
        message: [del ? `${del} Eintrag${del === 1 ? "" : "e"} wird gelöscht` : "", mer ? `${mer} Eintrag${mer === 1 ? "" : "e"} wird mit dem Original zusammengeführt` : ""].filter(Boolean).join(", ") + ". Danach ist „Rückgängig“ noch kurz möglich.",
        choices: [{ label: "Jetzt übernehmen", destructive: true, onSelect: () => void doApply(chosen) }],
      });
      return;
    }
    await doApply(chosen);
  };

  const toggle = (id: string) => setPicked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <Sheet open={open} onClose={onClose} title="Aufräumen" cancelLabel="Schließen"
      action={changes && changes.length ? { label: `Übernehmen (${picked.size})`, onClick: () => void apply(), disabled: picked.size === 0 } : undefined}>
      {items.length === 0 ? (
        <p className="sheet-lead">Nichts aufzuräumen.</p>
      ) : (
        <>
          <p className="sheet-lead">
            {items.length} Eintrag{items.length === 1 ? "" : "e"}: Prompt kopieren, in Claude einfügen, die Antwort hier einfügen. Der ursprüngliche Text bleibt in den Notizen.
          </p>
          <Group header={prompts.length > 1 ? `1 · Prompt kopieren (${prompts.length} Pakete)` : "1 · Prompt kopieren"}
            footer={prompts.length > 1 ? "Pakete nacheinander in Claude einfügen und jede Antwort einzeln übernehmen." : undefined}>
            {prompts.map((p, i) => (
              <Row key={i} title={prompts.length > 1 ? `Paket ${i + 1}` : "Prompt für Claude"} subtitle={`${p.count} ${p.count === 1 ? "Eintrag" : "Einträge"}`}
                leading={<span className="icon-tile tile-soft"><Icon name="copy" size={18} /></span>}
                trailing={<span className="tidy-copy">{copied === i ? "Kopiert" : "Kopieren"}</span>} onClick={() => void copy(i)} />
            ))}
          </Group>
          <Group header="2 · Antwort einfügen">
            <div className="row input-row">
              <AutoTextarea value={text} placeholder="Antwort von Claude (JSON-Codeblock) hier einfügen" onChange={(e) => setText(e.target.value)} />
            </div>
            <Row title="Aus Zwischenablage einfügen" tone="accent" leading={<Icon name="import" size={18} />} onClick={() => void paste()} />
            {text.trim() && <Row title="Vorschau zeigen" tone="accent" center onClick={() => void preview()} />}
          </Group>
        </>
      )}
      {notes.length > 0 && <div className="tidy-notes">{notes.map((n, i) => <p key={i}>{n}</p>)}</div>}
      {changes && changes.length > 0 && (
        <Group header={`3 · Vorschau · ${changes.length}`} footer="Abgewählte Einträge bleiben unaufgeräumt.">
          {changes.map((c) => (
            <Row key={c.item.id} className={`tidy-row${c.action !== "update" ? " is-destructive" : ""}`} title={<span className="tidy-title"><s>{c.item.text}</s><Icon name="arrow" size={13} />{c.action === "delete" ? <b className="tidy-del">Löschen</b> : c.action === "merge" ? <b className="tidy-del">Duplikat von „{c.target?.text}“</b> : <b>{String(c.patch.name ?? c.patch.text ?? c.patch.term ?? c.item.text)}</b>}</span>}
              subtitle={<span className="tidy-lines">{c.lines.map((l, i) => <span key={i}>{l}</span>)}{c.warnings.map((w, i) => <span key={`w${i}`} className="tidy-warn">{w}</span>)}{c.unclear && <span className="tidy-warn">Unklar – bleibt unter „Klären“</span>}</span>}
              leading={<CheckCircle checked={picked.has(c.item.id)} label="Übernehmen" onToggle={() => toggle(c.item.id)} />}
              onClick={() => toggle(c.item.id)} />
          ))}
        </Group>
      )}
      {changes && changes.length === 0 && <p className="sheet-lead">Keine passenden Einträge in der Antwort gefunden.</p>}
    </Sheet>
  );
}
