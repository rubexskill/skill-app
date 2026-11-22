import { useEffect, useState } from "react";
import { db, uid, type Metric, type Session } from "../db";
import { dayKey, timeLabel } from "../logic";
import { Group, Row, Sheet, Switch, useUI } from "../components/ui";
import { Icon } from "../components/Icon";

const pad = (n: number) => String(n).padStart(2, "0");
const timeKey = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function Stepper({ value, onChange, step = 5, min = 1, unit }: { value: number; onChange: (v: number) => void; step?: number; min?: number; unit: string }) {
  return (
    <div className="stepper">
      <button aria-label="Weniger" onClick={() => onChange(Math.max(min, value - step))}><Icon name="minus" size={18} /></button>
      <label className="stepper-value">
        <input inputMode="numeric" value={value} onChange={(e) => onChange(Math.max(0, Number(e.target.value.replace(/\D/g, "")) || 0))} />
        <span>{unit}</span>
      </label>
      <button aria-label="Mehr" onClick={() => onChange(value + step)}><Icon name="plus" size={18} /></button>
    </div>
  );
}

// ---------------- Session bearbeiten / hinzufügen ----------------

export function SessionSheet({ open, onClose, skillId, session, defaultMinutes }: {
  open: boolean;
  onClose: () => void;
  skillId: string;
  session: Session | null;
  defaultMinutes: number;
}) {
  const { undoable } = useUI();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [minutes, setMinutes] = useState(15);

  useEffect(() => {
    if (!open) return;
    const d = session ? new Date(session.start) : new Date(Date.now() - defaultMinutes * 60000);
    setDate(dayKey(d));
    setTime(timeKey(d));
    setMinutes(session?.minutes ?? defaultMinutes);
  }, [open, session, defaultMinutes]);

  const save = async () => {
    const [y, m, d] = date.split("-").map(Number);
    const [hh, mm] = (time || "12:00").split(":").map(Number);
    const start = new Date(y, m - 1, d, hh, mm).getTime();
    if (!minutes || Number.isNaN(start)) return;
    if (session) await db.sessions.update(session.id, { start, minutes });
    else await db.sessions.add({ id: uid(), skillId, start, minutes });
    onClose();
  };

  const remove = () => {
    if (!session) return;
    const copy = session;
    onClose();
    undoable("Session gelöscht", async () => {
      await db.sessions.delete(copy.id);
      return async () => void (await db.sessions.put(copy));
    });
  };

  return (
    <Sheet open={open} onClose={onClose} title={session ? "Session" : "Session hinzufügen"}
      action={{ label: "Sichern", onClick: () => void save(), disabled: !date || !minutes }}>
      <Group header="Dauer">
        <div className="row stepper-row"><Stepper value={minutes} onChange={setMinutes} unit="min" /></div>
      </Group>
      <Group header="Wann">
        <div className="row input-row labeled">
          <span className="input-label">Datum</span>
          <input type="date" value={date} max={dayKey(new Date())} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="row input-row labeled">
          <span className="input-label">Beginn</span>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </Group>
      {session?.note && (
        <Group header="Notiz">
          <Row title={session.note} />
        </Group>
      )}
      {session && (
        <Group footer={`Erfasst am ${new Date(session.start).toLocaleDateString("de-DE")} um ${timeLabel(session.start)}.`}>
          <Row title="Session löschen" tone="danger" center onClick={remove} />
        </Group>
      )}
    </Sheet>
  );
}

// ---------------- Rekord-Eintrag ----------------

export function RecordSheet({ open, onClose, metric, onSave }: { open: boolean; onClose: () => void; metric: Metric; onSave: (value: number, at: number) => void }) {
  const [value, setValue] = useState("");
  const [date, setDate] = useState("");
  useEffect(() => {
    if (open) {
      setValue("");
      setDate(dayKey(new Date()));
    }
  }, [open]);
  const num = Number(value.replace(",", "."));
  const valid = value.trim() !== "" && Number.isFinite(num);
  const save = () => {
    if (!valid) return;
    const [y, m, d] = date.split("-").map(Number);
    const isToday = date === dayKey(new Date());
    onSave(num, isToday ? Date.now() : new Date(y, m - 1, d, 12).getTime());
    onClose();
  };
  return (
    <Sheet open={open} onClose={onClose} title={metric.label} action={{ label: "Sichern", onClick: save, disabled: !valid }}>
      <div className="big-input">
        <input inputMode="decimal" placeholder="0" value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} />
        <span>{metric.unit}</span>
      </div>
      <Group>
        <div className="row input-row labeled">
          <span className="input-label">Datum</span>
          <input type="date" value={date} max={dayKey(new Date())} onChange={(e) => setDate(e.target.value)} />
        </div>
      </Group>
    </Sheet>
  );
}

// ---------------- Messwert festlegen ----------------

export function MetricSheet({ open, onClose, metric, onSave }: { open: boolean; onClose: () => void; metric: Metric | null; onSave: (m: Metric | null) => void }) {
  const [label, setLabel] = useState("");
  const [unit, setUnit] = useState("");
  const [higher, setHigher] = useState(true);
  useEffect(() => {
    if (open) {
      setLabel(metric?.label ?? "");
      setUnit(metric?.unit ?? "");
      setHigher(metric?.higher ?? true);
    }
  }, [open, metric]);
  const save = () => {
    if (!label.trim()) return;
    onSave({ label: label.trim(), unit: unit.trim(), higher });
    onClose();
  };
  return (
    <Sheet open={open} onClose={onClose} title="Messwert" action={{ label: "Sichern", onClick: save, disabled: !label.trim() }}>
      <Group footer="Zum Beispiel „Haltezeit“ in „s“ beim Handstand oder „Sprunghöhe“ in „cm“.">
        <div className="row input-row labeled">
          <span className="input-label">Name</span>
          <input value={label} placeholder="Haltezeit" onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div className="row input-row labeled">
          <span className="input-label">Einheit</span>
          <input value={unit} placeholder="s" onChange={(e) => setUnit(e.target.value)} />
        </div>
        <Row title="Höher ist besser" trailing={<Switch checked={higher} onChange={setHigher} label="Höher ist besser" />} />
      </Group>
      {metric && (
        <Group footer="Bisherige Einträge bleiben gespeichert.">
          <Row title="Messwert entfernen" tone="danger" center onClick={() => { onSave(null); onClose(); }} />
        </Group>
      )}
    </Sheet>
  );
}
