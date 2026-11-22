import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, STATUSES, STATUS_LABEL, TYPES, TYP_LABEL, type Skill, type Status, type Typ } from "../db";
import { createSkill, findSimilar } from "../logic";
import { AutoTextarea, Group, Row, Segmented, Sheet, useUI } from "../components/ui";
import { Icon } from "../components/Icon";
import { CategoryIcon, catVars } from "../categories";

export function useCategories(): string[] {
  const skills = useLiveQuery(() => db.skills.toArray(), []);
  return useMemo(() => {
    if (!skills) return [];
    const first = new Map<string, number>();
    for (const s of skills) if (!first.has(s.kategorie) || first.get(s.kategorie)! > s.createdAt) first.set(s.kategorie, s.createdAt);
    return [...first.entries()].sort((a, b) => a[1] - b[1]).map(([k]) => k);
  }, [skills]);
}

export function useAllMaterials(): string[] {
  const skills = useLiveQuery(() => db.skills.toArray(), []);
  return useMemo(() => [...new Set((skills ?? []).flatMap((s) => s.material))].sort((a, b) => a.localeCompare(b, "de")), [skills]);
}

export const statusOptions = STATUSES.map((s) => ({ value: s, label: STATUS_LABEL[s] }));
export const typOptions = TYPES.map((t) => ({ value: t, label: TYP_LABEL[t] }));

// ---------------- Kategorie wählen ----------------

export function CategorySheet({ open, onClose, value, onSelect }: { open: boolean; onClose: () => void; value: string; onSelect: (k: string) => void }) {
  const categories = useCategories();
  const [draft, setDraft] = useState("");
  useEffect(() => { if (open) setDraft(""); }, [open]);
  const choose = (k: string) => { onSelect(k); onClose(); };

  return (
    <Sheet open={open} onClose={onClose} title="Kategorie">
      <Group footer="Neue Kategorie anlegen oder eine vorhandene wählen.">
        <div className="row input-row">
          <input value={draft} placeholder="Neue Kategorie" enterKeyHint="done" onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) choose(draft.trim()); }} />
          {draft.trim() && <button className="inline-btn" onClick={() => choose(draft.trim())}>Hinzufügen</button>}
        </div>
      </Group>
      <Group>
        {categories.map((k) => (
          <Row key={k} title={k} className="cv" style={catVars(k)} onClick={() => choose(k)}
            leading={<span className="icon-tile tile-cat"><CategoryIcon name={k} size={17} /></span>}
            trailing={k === value ? <Icon name="check" size={18} className="row-check" /> : undefined} />
        ))}
      </Group>
    </Sheet>
  );
}

// ---------------- Material (Mehrfachauswahl) ----------------

export function MaterialSheet({ open, onClose, title, options, value, onChange }: {
  open: boolean; onClose: () => void; title: string; options: string[]; value: string[]; onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const all = useMemo(() => [...new Set([...options, ...value])].sort((a, b) => a.localeCompare(b, "de")), [options, value]);
  const toggle = (m: string) => onChange(value.includes(m) ? value.filter((x) => x !== m) : [...value, m]);
  const add = () => {
    const m = draft.trim();
    if (m && !value.includes(m)) onChange([...value, m]);
    setDraft("");
  };
  return (
    <Sheet open={open} onClose={onClose} title={title} cancelLabel="Fertig">
      <div className="chips">
        {all.map((m) => (
          <button key={m} className={`chip${value.includes(m) ? " is-on" : ""}`} onClick={() => toggle(m)} aria-pressed={value.includes(m)}>
            {value.includes(m) && <Icon name="check" size={14} />}
            {m}
          </button>
        ))}
      </div>
      <Group>
        <div className="row input-row">
          <input value={draft} placeholder="Anderes Material" enterKeyHint="done" onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
          {draft.trim() && <button className="inline-btn" onClick={add}>Hinzufügen</button>}
        </div>
      </Group>
    </Sheet>
  );
}

// ---------------- Neuer Eintrag ----------------

interface NewSkillProps {
  open: boolean;
  onClose: () => void;
  initialName?: string;
  initialCategory?: string;
  onCreated?: (s: Skill) => void;
  onOpenExisting?: (s: Skill) => void;
}

export function NewSkillSheet({ open, onClose, initialName = "", initialCategory = "", onCreated, onOpenExisting }: NewSkillProps) {
  const { actionSheet, toast } = useUI();
  const skills = useLiveQuery(() => db.skills.toArray(), []) ?? [];
  const [name, setName] = useState("");
  const [kategorie, setKategorie] = useState("");
  const [typ, setTyp] = useState<Typ>("skill");
  const [status, setStatus] = useState<Status>("idee");
  const [notes, setNotes] = useState("");
  const [catOpen, setCatOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initialName);
    setKategorie(initialCategory);
    setTyp(initialCategory === "Gewohnheiten" ? "gewohnheit" : initialCategory === "Projekte & Besorgungen" ? "projekt" : "skill");
    setStatus("idee");
    setNotes("");
  }, [open, initialName, initialCategory]);

  const similar = useMemo(() => findSimilar(name, skills), [name, skills]);

  const create = async () => {
    const s = await createSkill({ name, kategorie, typ, status, notes });
    toast(`„${s.title}“ hinzugefügt`);
    onCreated?.(s);
    onClose();
  };

  const submit = () => {
    if (!name.trim()) return;
    if (similar.length) {
      actionSheet({
        title: "Ähnlicher Eintrag vorhanden",
        message: `„${name.trim()}“ ähnelt ${similar.slice(0, 2).map((s) => `„${s.title}“`).join(" und ")}.`,
        choices: [{ label: "Trotzdem hinzufügen", onSelect: () => void create() }],
      });
    } else void create();
  };

  return (
    <>
      <Sheet open={open} onClose={onClose} title="Neuer Eintrag" action={{ label: "Hinzufügen", onClick: submit, disabled: !name.trim() }}>
        <Group>
          <div className="row input-row">
            <input value={name} placeholder="Name, z. B. Spanisch" enterKeyHint="done" autoCapitalize="sentences"
              onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>
        </Group>

        {similar.length > 0 && (
          <Group className="group-warning" header={<span className="warning-head"><Icon name="warning" size={15} /> Gibt es vielleicht schon</span>}
            footer="Tippe auf einen Eintrag, um ihn zu öffnen.">
            {similar.map((s) => (
              <Row key={s.id} title={s.title} subtitle={s.title !== s.name ? s.name : s.kategorie} chevron
                onClick={onOpenExisting ? () => { onClose(); onOpenExisting(s); } : undefined} />
            ))}
          </Group>
        )}

        <Group>
          <Row title="Kategorie" detail={kategorie || "Keine"} chevron onClick={() => setCatOpen(true)} />
        </Group>
        <Group header="Typ">
          <div className="row segmented-row"><Segmented options={typOptions} value={typ} onChange={setTyp} /></div>
        </Group>
        <Group header="Status">
          <div className="row segmented-row"><Segmented options={statusOptions} value={status} onChange={setStatus} /></div>
        </Group>
        <Group header="Notizen">
          <div className="row input-row"><AutoTextarea value={notes} placeholder="Optional" onChange={(e) => setNotes(e.target.value)} /></div>
        </Group>
      </Sheet>
      <CategorySheet open={catOpen} onClose={() => setCatOpen(false)} value={kategorie} onSelect={setKategorie} />
    </>
  );
}

// ---------------- Link hinzufügen ----------------

export function LinkSheet({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (url: string, title: string) => void }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  useEffect(() => { if (open) { setUrl(""); setTitle(""); } }, [open]);

  const normalized = url.trim() && !/^[a-z]+:\/\//i.test(url.trim()) ? `https://${url.trim()}` : url.trim();
  const valid = (() => { try { return !!normalized && new URL(normalized).hostname.includes("."); } catch { return false; } })();
  const save = () => { if (valid) { onSave(normalized, title.trim()); onClose(); } };

  return (
    <Sheet open={open} onClose={onClose} title="Link oder Video" action={{ label: "Sichern", onClick: save, disabled: !valid }}>
      <Group footer="Zum Beispiel ein YouTube-Video, ein Artikel oder ein Kurs.">
        <div className="row input-row">
          <input value={url} placeholder="https://" type="url" inputMode="url" autoCapitalize="off" autoCorrect="off"
            onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} />
        </div>
        <div className="row input-row">
          <input value={title} placeholder="Titel (optional)" onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} />
        </div>
      </Group>
    </Sheet>
  );
}
