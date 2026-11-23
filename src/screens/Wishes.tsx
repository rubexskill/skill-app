import { TidyItemRows, TidyStrip, UnsortedMark } from "./Tidy";
import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid, type Wish } from "../db";
import { AutoTextarea, CheckCircle, EmptyState, Group, NavPage, Row, Sheet, Switch, SwipeRow, useUI } from "../components/ui";
import { Icon } from "../components/Icon";
import { useStack } from "../components/Stack";
import { useNav } from "../nav";

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const fixUrl = (u: string) => {
  const t = u.trim();
  if (!t) return "";
  return /^[a-z]+:\/\//i.test(t) ? t : `https://${t}`;
};

export function Wishes() {
  const nav = useNav();
  const { pop, depth } = useStack();
  const { undoable } = useUI();
  const wishes = useLiveQuery(() => db.wishes.orderBy("createdAt").reverse().toArray(), []);
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState<Wish | null>(null);
  const [only, setOnly] = useState(false);

  const add = async () => {
    const t = draft.trim();
    if (!t) return;
    await db.wishes.add({ id: uid(), name: t, url: "", note: "", bought: false, boughtAt: null, createdAt: Date.now() });
    setDraft("");
  };

  const toggle = (w: Wish) => void db.wishes.update(w.id, { bought: !w.bought, boughtAt: w.bought ? null : Date.now() });

  const remove = (w: Wish) =>
    undoable(`„${w.name}“ gelöscht`, async () => {
      await db.wishes.delete(w.id);
      return async () => void (await db.wishes.put(w));
    });

  const row = (w: Wish) => (
    <SwipeRow key={w.id} actions={[{ label: "Löschen", tone: "danger", onClick: () => remove(w) }]}>
      <Row title={<>{w.name}<UnsortedMark on={w.unsorted} /></>} muted={w.bought}
        subtitle={w.note.trim() ? <span className="clamp-1">{w.note}</span> : w.url ? host(w.url) : undefined}
        leading={<CheckCircle checked={w.bought} label={`${w.name} gekauft`} onToggle={() => toggle(w)} />}
        trailing={w.url ? <Icon name="link" size={16} className="row-link-hint" /> : undefined}
        chevron onClick={() => setOpen(w)} />
    </SwipeRow>
  );

  const shownW = (wishes ?? []).filter((w) => !only || w.unsorted);
  const openWishes = shownW.filter((w) => !w.bought);
  const bought = shownW.filter((w) => w.bought);

  return (
    <NavPage title="Wunschliste" back={depth > 0 ? { label: nav.backLabel, onClick: pop } : undefined}
      sub={wishes && wishes.length ? `${bought.length} von ${wishes.length} gekauft` : undefined}>
      <TidyStrip kinds={["wunsch"]} only={only} onToggle={setOnly} />
      <Group>
        <div className="row input-row compose">
          <input value={draft} placeholder="Neuer Wunsch" enterKeyHint="done" onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void add()} />
          {draft.trim() && <button className="inline-btn" onClick={() => void add()}>Hinzufügen</button>}
        </div>
      </Group>
      {wishes && wishes.length === 0 && <EmptyState icon="gift" title="Keine Wünsche" text="Alles, was du dir kaufen oder schenken lassen willst – mit Link und Notiz." />}
      {openWishes.length > 0 && <Group header={`Offen · ${openWishes.length}`}>{openWishes.map(row)}</Group>}
      {bought.length > 0 && <Group header={`Gekauft · ${bought.length}`}>{bought.map(row)}</Group>}
      <WishSheet wish={open} onClose={() => setOpen(null)} />
    </NavPage>
  );
}

function WishSheet({ wish, onClose }: { wish: Wish | null; onClose: () => void }) {
  const { undoable } = useUI();
  const [shown, setShown] = useState<Wish | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [bought, setBought] = useState(false);

  useEffect(() => {
    if (wish) {
      setShown(wish);
      setName(wish.name);
      setUrl(wish.url);
      setNote(wish.note);
      setBought(wish.bought);
    }
  }, [wish]);

  const save = async () => {
    if (shown && name.trim()) {
      await db.wishes.update(shown.id, { name: name.trim(), url: fixUrl(url), note: note.trim(), bought, boughtAt: bought ? (shown.boughtAt ?? Date.now()) : null });
    }
    onClose();
  };

  const remove = () => {
    const copy = shown;
    onClose();
    if (copy) undoable(`„${copy.name}“ gelöscht`, async () => {
      await db.wishes.delete(copy.id);
      return async () => void (await db.wishes.put(copy));
    });
  };

  const link = fixUrl(url);

  return (
    <Sheet open={!!wish} onClose={onClose} title="Wunsch" action={{ label: "Sichern", onClick: () => void save(), disabled: !name.trim() }}>
      <Group>
        <div className="row input-row"><input value={name} onChange={(e) => setName(e.target.value)} /></div>
      </Group>
      <Group header="Link">
        <div className="row input-row">
          <input value={url} placeholder="https://" type="url" inputMode="url" autoCapitalize="off" autoCorrect="off" onChange={(e) => setUrl(e.target.value)} />
        </div>
        {link && <Row title="Link öffnen" tone="accent" leading={<Icon name="link" size={18} />} onClick={() => window.open(link, "_blank", "noopener")} />}
      </Group>
      <Group header="Notiz">
        <div className="row input-row"><AutoTextarea value={note} placeholder="Größe, Farbe, Preis …" onChange={(e) => setNote(e.target.value)} /></div>
      </Group>
      <Group>
        <Row title="Gekauft" trailing={<Switch checked={bought} onChange={setBought} label="Gekauft" />} />
      </Group>
      {shown && <Group><TidyItemRows kind="wish" id={shown.id} unsorted={shown.unsorted} /></Group>}
      <Group><Row title="Wunsch löschen" tone="danger" center onClick={remove} /></Group>
    </Sheet>
  );
}
