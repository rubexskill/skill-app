import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid, type RecordEntry, type Skill } from "../db";
import { bestOf, dayLabel, formatValue } from "../logic";
import { Group, Row, SwipeRow, useUI } from "../components/ui";
import { Sparkline } from "../components/Charts";
import { allCategoryColors, categoryStyle } from "../categories";
import { RecordSheet } from "./EditSheets";

export function Records({ skill }: { skill: Skill }) {
  const { undoable, celebrate, toast } = useUI();
  const records = useLiveQuery(() => db.records.where("skillId").equals(skill.id).sortBy("at"), [skill.id]) ?? [];
  const [open, setOpen] = useState(false);
  const metric = skill.metric;
  if (!metric) return null;
  const best = bestOf(records, metric.higher);

  const add = async (value: number, at: number) => {
    const prev = bestOf(records, metric.higher);
    await db.records.add({ id: uid(), skillId: skill.id, value, at });
    const isBest = prev !== null && (metric.higher ? value > prev : value < prev);
    if (isBest) {
      celebrate([categoryStyle(skill.kategorie).light, ...allCategoryColors().slice(0, 4)]);
      toast(`Neue Bestleistung: ${formatValue(value)} ${metric.unit}`);
    }
  };

  const remove = (r: RecordEntry) =>
    undoable("Eintrag gelöscht", async () => {
      await db.records.delete(r.id);
      return async () => void (await db.records.put(r));
    });

  return (
    <>
      <section className="record">
        <div className="section-head-row">
          <h2 className="block-title">{metric.label}</h2>
          <button className="text-btn" onClick={() => setOpen(true)}>Eintragen</button>
        </div>
        {records.length === 0 ? (
          <p className="record-empty">Trag deinen ersten Wert ein – danach siehst du hier deinen Verlauf und jede neue Bestleistung.</p>
        ) : (
          <>
            <div className="record-best">
              <span className="record-best-num">{formatValue(best!)}</span>
              <span className="record-best-unit">{metric.unit}</span>
              <span className="record-best-label">Bestleistung</span>
            </div>
            <Sparkline values={records} higher={metric.higher} unit={metric.unit} />
          </>
        )}
      </section>
      {records.length > 0 && (
        <Group>
          {[...records].reverse().slice(0, 5).map((r) => (
            <SwipeRow key={r.id} actions={[{ label: "Löschen", tone: "danger", onClick: () => remove(r) }]}>
              <Row title={`${formatValue(r.value)} ${metric.unit}`} detail={dayLabel(r.at)} />
            </SwipeRow>
          ))}
        </Group>
      )}
      <RecordSheet open={open} onClose={() => setOpen(false)} metric={metric} onSave={(v, at) => void add(v, at)} />
    </>
  );
}
