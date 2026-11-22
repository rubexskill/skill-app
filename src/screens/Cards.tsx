import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid, type Card, type Skill } from "../db";
import { newCardState } from "../srs";
import { AutoTextarea, Group, Row, Sheet, SwipeRow, useUI } from "../components/ui";
import { Icon } from "../components/Icon";

const dueLabel = (c: Card) => {
  const days = Math.ceil((c.due - Date.now()) / 86400000);
  if (c.due <= Date.now()) return "fällig";
  return days <= 1 ? "morgen" : `in ${days} T`;
};

const makeCard = (skillId: string, front: string, back: string, i = 0): Card => ({
  id: uid(), skillId, front, back, createdAt: Date.now() + i, ...newCardState(),
});

export function CardsSheet({ open, onClose, skill }: { open: boolean; onClose: () => void; skill: Skill }) {
  const { undoable, toast } = useUI();
  const cards = useLiveQuery(() => db.cards.where("skillId").equals(skill.id).sortBy("createdAt"), [skill.id]) ?? [];
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [edit, setEdit] = useState<Card | null>(null);
  const [bulk, setBulk] = useState(false);

  useEffect(() => {
    if (open) {
      setFront("");
      setBack("");
    }
  }, [open]);

  const add = async () => {
    if (!front.trim() || !back.trim()) return;
    await db.cards.add(makeCard(skill.id, front.trim(), back.trim()));
    setFront("");
    setBack("");
  };

  const remove = (c: Card) =>
    undoable("Karte gelöscht", async () => {
      await db.cards.delete(c.id);
      return async () => void (await db.cards.put(c));
    });

  const due = cards.filter((c) => c.due <= Date.now()).length;

  return (
    <>
      <Sheet open={open} onClose={onClose} title="Karteikarten" cancelLabel="Fertig">
        <Group header="Neue Karte" footer="Wiederholt wird nach Plan: Was du gut kannst, kommt seltener, was schwerfällt, öfter.">
          <div className="row input-row"><AutoTextarea value={front} placeholder="Vorderseite (Frage)" onChange={(e) => setFront(e.target.value)} /></div>
          <div className="row input-row"><AutoTextarea value={back} placeholder="Rückseite (Antwort)" onChange={(e) => setBack(e.target.value)} /></div>
          <Row title="Karte hinzufügen" tone="accent" leading={<Icon name="plus" size={18} />} onClick={front.trim() && back.trim() ? () => void add() : undefined} />
          <Row title="Mehrere auf einmal" subtitle="Eine Karte pro Zeile" tone="accent" leading={<Icon name="cards" size={18} />} onClick={() => setBulk(true)} />
        </Group>

        {cards.length > 0 && (
          <Group header={`Karten · ${cards.length}${due ? ` · ${due} fällig` : ""}`} footer="Antippen zum Bearbeiten, nach links wischen zum Löschen.">
            {cards.map((c) => (
              <SwipeRow key={c.id} actions={[{ label: "Löschen", tone: "danger", onClick: () => remove(c) }]}>
                <Row title={<span className="clamp-1">{c.front}</span>} subtitle={<span className="clamp-1">{c.back}</span>} detail={dueLabel(c)} onClick={() => setEdit(c)} />
              </SwipeRow>
            ))}
          </Group>
        )}
      </Sheet>
      <CardEditSheet card={edit} onClose={() => setEdit(null)} />
      <BulkSheet open={bulk} onClose={() => setBulk(false)} skillId={skill.id} onDone={(n) => toast(`${n} ${n === 1 ? "Karte" : "Karten"} hinzugefügt`)} />
    </>
  );
}

function CardEditSheet({ card, onClose }: { card: Card | null; onClose: () => void }) {
  const [shown, setShown] = useState<Card | null>(null);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  useEffect(() => {
    if (card) {
      setShown(card);
      setFront(card.front);
      setBack(card.back);
    }
  }, [card]);
  const save = async () => {
    if (shown && front.trim() && back.trim()) await db.cards.update(shown.id, { front: front.trim(), back: back.trim() });
    onClose();
  };
  return (
    <Sheet open={!!card} onClose={onClose} title="Karte" action={{ label: "Sichern", onClick: () => void save(), disabled: !front.trim() || !back.trim() }}>
      <Group header="Vorderseite"><div className="row input-row"><AutoTextarea value={front} onChange={(e) => setFront(e.target.value)} /></div></Group>
      <Group header="Rückseite"><div className="row input-row"><AutoTextarea value={back} onChange={(e) => setBack(e.target.value)} /></div></Group>
      {shown && shown.reps > 0 && <Group footer="Fortschritt zurücksetzen, wenn du die Karte neu lernen willst.">
        <Row title="Wiederholungen zurücksetzen" tone="accent" onClick={() => { void db.cards.update(shown.id, { ...newCardState() }); onClose(); }} />
      </Group>}
    </Sheet>
  );
}

function BulkSheet({ open, onClose, skillId, onDone }: { open: boolean; onClose: () => void; skillId: string; onDone: (n: number) => void }) {
  const [text, setText] = useState("");
  useEffect(() => { if (open) setText(""); }, [open]);
  const pairs = text.split("\n").map((l) => l.split(/\s*(?:::|\t|;)\s*/)).filter((p) => p.length >= 2 && p[0].trim() && p[1].trim());
  const save = async () => {
    await db.cards.bulkAdd(pairs.map((p, i) => makeCard(skillId, p[0].trim(), p.slice(1).join(" ").trim(), i)));
    onDone(pairs.length);
    onClose();
  };
  return (
    <Sheet open={open} onClose={onClose} title="Mehrere Karten" action={{ label: pairs.length ? `${pairs.length} hinzufügen` : "Hinzufügen", onClick: () => void save(), disabled: !pairs.length }}>
      <Group header="Eine Karte pro Zeile" footer="Vorder- und Rückseite trennst du mit „::“ oder „;“. Beispiel: Was ist E im Morsecode? :: ein Punkt">
        <div className="row input-row"><AutoTextarea value={text} placeholder={"Frage :: Antwort\nFrage :: Antwort"} onChange={(e) => setText(e.target.value)} /></div>
      </Group>
    </Sheet>
  );
}
