import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid, type LinkItem, type Term } from "../db";
import { AutoTextarea, CheckCircle, EmptyState, Group, NavPage, Row, Sheet, Switch, SwipeRow, useUI } from "../components/ui";
import { Icon } from "../components/Icon";
import { useStack } from "../components/Stack";
import { useNav } from "../nav";
import { LinkSheet } from "./SkillSheets";

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export function Terms() {
  const nav = useNav();
  const { pop, depth } = useStack();
  const { undoable, toast } = useUI();
  const terms = useLiveQuery(() => db.terms.orderBy("createdAt").reverse().toArray(), []);
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState<Term | null>(null);

  const add = async () => {
    const t = draft.trim();
    if (!t) return;
    await db.terms.add({ id: uid(), term: t, explanation: "", understood: false, understoodAt: null, links: [], createdAt: Date.now() });
    setDraft("");
  };

  const toggle = (t: Term) => {
    const now = !t.understood;
    void db.terms.update(t.id, { understood: now, understoodAt: now ? Date.now() : null });
    if (now && !t.explanation.trim()) toast("Tipp: Erkläre den Begriff noch in eigenen Worten.");
  };

  const remove = (t: Term) =>
    undoable(`„${t.term}“ gelöscht`, async () => {
      await db.terms.delete(t.id);
      return async () => void (await db.terms.put(t));
    });

  const row = (t: Term) => (
    <SwipeRow key={t.id} actions={[{ label: "Löschen", tone: "danger", onClick: () => remove(t) }]}>
      <Row title={t.term} muted={t.understood}
        subtitle={t.explanation.trim() ? <span className="clamp-1">{t.explanation}</span> : "Noch keine Erklärung"}
        leading={<CheckCircle checked={t.understood} label={`${t.term} verstanden`} onToggle={() => toggle(t)} />}
        chevron onClick={() => setOpen(t)} />
    </SwipeRow>
  );

  const openTerms = (terms ?? []).filter((t) => !t.understood);
  const done = (terms ?? []).filter((t) => t.understood);

  return (
    <NavPage title="Begriffe" back={depth > 0 ? { label: nav.backLabel, onClick: pop } : undefined}
      sub={terms && terms.length ? `${done.length} von ${terms.length} verstanden` : "Dinge, die du verstehen willst"}>
      <Group footer="Erkläre jeden Begriff in eigenen Worten und hake ihn ab, wenn du ihn verstanden hast.">
        <div className="row input-row compose">
          <input value={draft} placeholder="Neuer Begriff" enterKeyHint="done" onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void add()} />
          {draft.trim() && <button className="inline-btn" onClick={() => void add()}>Hinzufügen</button>}
        </div>
      </Group>
      {terms && terms.length === 0 && <EmptyState icon="term" title="Keine Begriffe" text="Sammle hier Wörter und Konzepte, die du richtig verstehen willst – zum Beispiel aus Videos oder Gesprächen." />}
      {openTerms.length > 0 && <Group header={`Offen · ${openTerms.length}`}>{openTerms.map(row)}</Group>}
      {done.length > 0 && <Group header={`Verstanden · ${done.length}`}>{done.map(row)}</Group>}
      <TermSheet term={open} onClose={() => setOpen(null)} />
    </NavPage>
  );
}

function TermSheet({ term, onClose }: { term: Term | null; onClose: () => void }) {
  const { undoable } = useUI();
  const [shown, setShown] = useState<Term | null>(null);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [linkOpen, setLinkOpen] = useState(false);

  useEffect(() => {
    if (term) {
      setShown(term);
      setName(term.term);
      setText(term.explanation);
      setUnderstood(term.understood);
      setLinks(term.links);
    }
  }, [term]);

  const save = async () => {
    if (shown && name.trim()) {
      await db.terms.update(shown.id, {
        term: name.trim(),
        explanation: text.trim(),
        understood,
        understoodAt: understood ? (shown.understoodAt ?? Date.now()) : null,
        links,
      });
    }
    onClose();
  };

  const remove = () => {
    const copy = shown;
    onClose();
    if (copy) undoable(`„${copy.term}“ gelöscht`, async () => {
      await db.terms.delete(copy.id);
      return async () => void (await db.terms.put(copy));
    });
  };

  return (
    <>
      <Sheet open={!!term} onClose={onClose} title="Begriff" action={{ label: "Sichern", onClick: () => void save(), disabled: !name.trim() }}>
        <Group>
          <div className="row input-row"><input value={name} onChange={(e) => setName(e.target.value)} /></div>
        </Group>
        <Group header="In eigenen Worten" footer="Schreib es so, als würdest du es einem Freund erklären.">
          <div className="row input-row"><AutoTextarea value={text} placeholder="Was bedeutet das?" onChange={(e) => setText(e.target.value)} /></div>
        </Group>
        <Group>
          <Row title="Verstanden" trailing={<Switch checked={understood} onChange={setUnderstood} label="Verstanden" />} />
        </Group>
        <Group header="Links">
          {links.map((l) => (
            <SwipeRow key={l.id} actions={[{ label: "Löschen", tone: "danger", onClick: () => setLinks((x) => x.filter((y) => y.id !== l.id)) }]}>
              <Row title={l.title || host(l.url)} subtitle={l.title ? host(l.url) : undefined}
                leading={<span className="icon-tile tile-soft"><Icon name="link" size={17} /></span>} onClick={() => window.open(l.url, "_blank", "noopener")} />
            </SwipeRow>
          ))}
          <Row title="Link hinzufügen" tone="accent" leading={<Icon name="plus" size={18} />} onClick={() => setLinkOpen(true)} />
        </Group>
        <Group><Row title="Begriff löschen" tone="danger" center onClick={remove} /></Group>
      </Sheet>
      <LinkSheet open={linkOpen} onClose={() => setLinkOpen(false)} onSave={(url, title) => setLinks((x) => [...x, { id: uid(), url, title, addedAt: Date.now() }])} />
    </>
  );
}
