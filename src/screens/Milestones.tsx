import { useState } from "react";
import { uid, type Milestone, type Skill } from "../db";
import { updateSkill } from "../logic";
import { CheckCircle, Group, Row, SwipeRow, useUI } from "../components/ui";

/** Meilensteine (bei Skills) bzw. Unterpunkte (bei Projekten) zum Abhaken */
export function MilestoneList({ skill, title = "Meilensteine", addLabel = "Meilenstein hinzufügen", onAllDone }: {
  skill: Skill;
  title?: string;
  addLabel?: string;
  onAllDone?: () => void;
}) {
  const { undoable } = useUI();
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const list = skill.milestones;
  const done = list.filter((m) => m.done).length;

  const save = (milestones: Milestone[]) => void updateSkill(skill.id, { milestones });

  const toggle = (m: Milestone) => {
    const next = list.map((x) => (x.id === m.id ? { ...x, done: !x.done, doneAt: x.done ? null : Date.now() } : x));
    save(next);
    if (!m.done && next.every((x) => x.done) && next.length > 1) onAllDone?.();
  };

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    save([...list, { id: uid(), text: t, done: false, doneAt: null }]);
    setDraft("");
  };

  const remove = (m: Milestone) => {
    const before = list;
    undoable(`„${m.text}“ gelöscht`, async () => {
      await updateSkill(skill.id, { milestones: before.filter((x) => x.id !== m.id) });
      return async () => void (await updateSkill(skill.id, { milestones: before }));
    });
  };

  const commitEdit = (m: Milestone) => {
    const t = editText.trim();
    setEditing(null);
    if (t && t !== m.text) save(list.map((x) => (x.id === m.id ? { ...x, text: t } : x)));
  };

  return (
    <Group header={<span className="head-with-count">{title}{list.length > 0 && <span className="section-count">{done} von {list.length}</span>}</span>}>
      {list.length > 0 && (
        <div className="progress-line" aria-hidden="true"><span style={{ width: `${(done / list.length) * 100}%` }} /></div>
      )}
      {list.map((m) => (
        <SwipeRow key={m.id} actions={[{ label: "Löschen", tone: "danger", onClick: () => remove(m) }]}>
          {editing === m.id ? (
            <div className="row input-row has-leading">
              <CheckCircle checked={m.done} label={m.text} onToggle={() => toggle(m)} />
              <input autoFocus value={editText} onChange={(e) => setEditText(e.target.value)} onBlur={() => commitEdit(m)}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
            </div>
          ) : (
            <Row title={m.text} muted={m.done}
              leading={<CheckCircle checked={m.done} label={m.text} onToggle={() => toggle(m)} />}
              onClick={() => { setEditing(m.id); setEditText(m.text); }} />
          )}
        </SwipeRow>
      ))}
      <div className="row input-row compose">
        <input value={draft} placeholder={addLabel} enterKeyHint="done" onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        {draft.trim() && <button className="inline-btn" onClick={add}>Hinzufügen</button>}
      </div>
    </Group>
  );
}
