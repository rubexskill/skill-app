import { useEffect, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Skill } from "../db";
import { createSkill, deleteSkill, updateSkill } from "../logic";
import { AutoTextarea, CheckCircle, EmptyState, Group, NavButton, NavPage, Row, SwipeRow, useUI } from "../components/ui";
import { useStack } from "../components/Stack";
import { useNav } from "../nav";
import { MilestoneList } from "./Milestones";
import { TidyStrip, UnsortedMark } from "./Tidy";

const PROJECT_CATEGORY = "Projekte & Besorgungen";

function progress(p: Skill) {
  const n = p.milestones.length;
  const d = p.milestones.filter((m) => m.done).length;
  return { n, d };
}

export function Projects() {
  const nav = useNav();
  const { pop, depth } = useStack();
  const { undoable, toast } = useUI();
  const projects = useLiveQuery(() => db.skills.where("typ").equals("projekt").sortBy("createdAt"), []);
  const [draft, setDraft] = useState("");
  const [only, setOnly] = useState(false);

  const shown = (projects ?? []).filter((p) => !only || p.unsorted);
  const open = shown.filter((p) => p.status !== "kann");
  const done = shown.filter((p) => p.status === "kann");

  const add = async () => {
    const t = draft.trim();
    if (!t) return;
    await createSkill({ name: t, kategorie: PROJECT_CATEGORY, typ: "projekt", status: "idee" });
    setDraft("");
  };

  const toggleDone = (p: Skill) => {
    const next = p.status === "kann" ? "idee" : "kann";
    void updateSkill(p.id, { status: next });
    if (next === "kann") toast(`„${p.title}“ erledigt`);
  };

  const row = (p: Skill) => {
    const { n, d } = progress(p);
    return (
      <SwipeRow key={p.id} actions={[{ label: "Löschen", tone: "danger", onClick: () => undoable(`„${p.title}“ gelöscht`, () => deleteSkill(p.id)) }]}>
        <Row title={<>{p.title}<UnsortedMark on={p.unsorted} /></>} muted={p.status === "kann"}
          subtitle={n ? <span className="mini-progress"><span className="mini-progress-bar"><i style={{ width: `${(d / n) * 100}%` }} /></span>{d} von {n}</span> : p.profile?.about}
          leading={<CheckCircle checked={p.status === "kann"} label={p.title} onToggle={() => toggleDone(p)} />}
          chevron onClick={() => nav.push({ type: "project", id: p.id })} />
      </SwipeRow>
    );
  };

  return (
    <NavPage title="Projekte" back={depth > 0 ? { label: nav.backLabel, onClick: pop } : undefined}
      trailing={<NavButton icon="plus" label="Neues Projekt" onClick={() => document.getElementById("new-project")?.focus()} />}>
      <TidyStrip kinds={["projekt"]} only={only} onToggle={setOnly} />
      <Group>
        <div className="row input-row compose">
          <input id="new-project" value={draft} placeholder="Neues Projekt" enterKeyHint="done" onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && void add()} />
          {draft.trim() && <button className="inline-btn" onClick={() => void add()}>Hinzufügen</button>}
        </div>
      </Group>
      {projects && projects.length === 0 && <EmptyState icon="checklist" title="Keine Projekte" text="Projekte sind Vorhaben mit Unterpunkten zum Abhaken." />}
      {open.length > 0 && <Group header="Offen">{open.map(row)}</Group>}
      {done.length > 0 && <Group header="Erledigt">{done.map(row)}</Group>}
    </NavPage>
  );
}

export function ProjectDetail({ id }: { id: string }) {
  const { pop, depth } = useStack();
  const nav = useNav();
  const { undoable, actionSheet, toast } = useUI();
  const p = useLiveQuery(() => db.skills.get(id), [id]);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const loaded = useRef<string | null>(null);

  useEffect(() => {
    if (p && loaded.current !== p.id) {
      loaded.current = p.id;
      setTitle(p.title);
      setNotes(p.notes);
    }
  }, [p]);

  const back = depth > 0 ? { label: nav.backLabel, onClick: pop } : undefined;
  if (!p) return <NavPage title="" back={back}><div /></NavPage>;
  const { n, d } = progress(p);

  return (
    <NavPage title={p.title} back={back} eyebrow={<span className="eyebrow-area">Projekt</span>}
      sub={n ? `${d} von ${n} erledigt` : undefined}>
      <div className="detail">
        {p.profile?.about && <p className="one-liner">{p.profile.about}</p>}
        <MilestoneList skill={p} title="Unterpunkte" addLabel="Unterpunkt hinzufügen"
          onAllDone={() => p.status !== "kann" && actionSheet({
            title: "Alles abgehakt",
            message: `Projekt „${p.title}“ als erledigt markieren?`,
            choices: [{ label: "Erledigt", onSelect: () => { void updateSkill(id, { status: "kann" }); toast("Projekt erledigt"); } }],
          })} />
        <Group header="Notizen">
          <div className="row input-row">
            <AutoTextarea value={notes} placeholder="Ideen, Links, Preise …" onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== p.notes && void updateSkill(id, { notes })} />
          </div>
        </Group>
        <Group header="Name">
          <div className="row input-row">
            <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => title.trim() && title.trim() !== p.title && void updateSkill(id, { title: title.trim() })}
              onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} />
          </div>
        </Group>
        <Group>
          <Row title={p.status === "kann" ? "Wieder öffnen" : "Als erledigt markieren"} tone="accent" center
            onClick={() => void updateSkill(id, { status: p.status === "kann" ? "idee" : "kann" })} />
          <Row title="Projekt löschen" tone="danger" center onClick={() => { pop(); undoable(`„${p.title}“ gelöscht`, () => deleteSkill(id)); }} />
        </Group>
      </div>
    </NavPage>
  );
}
