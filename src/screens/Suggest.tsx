import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, PLACE_LABEL, STATUS_LABEL, type Skill } from "../db";
import { loadSetting, pickWeighted, saveSetting, seasonHint, suggestCandidates, updateSkill, type MoveWish, type SuggestFilter, type Where } from "../logic";
import { Group, Row, Segmented, Sheet, useUI } from "../components/ui";
import { CategoryIcon, catVars, shortCategory } from "../categories";
import { useTimer } from "../timer";
import { MaterialSheet, useAllMaterials } from "./SkillSheets";

const KEY = "suggest.filter";
const DEFAULT: SuggestFilter = { time: 15, move: "egal", where: "zuhause", material: ["Papier", "Stift", "Wand", "Bücher", "Küche", "Laptop"] };

const TIME_OPTS = [5, 15, 30, 60].map((t) => ({ value: String(t), label: `${t} min` }));
const MOVE_OPTS: { value: string; label: string }[] = [
  { value: "egal", label: "Egal" },
  { value: "0", label: "Keine" },
  { value: "1", label: "Wenig" },
  { value: "2", label: "Viel" },
];
const WHERE_OPTS: { value: Where; label: string }[] = [
  { value: "zuhause", label: "Zu Hause" },
  { value: "draussen", label: "Draußen" },
  { value: "gym", label: "Gym" },
  { value: "unterwegs", label: "Unterwegs" },
];

export function SuggestSheet({ open, onClose, onStarted }: { open: boolean; onClose: () => void; onStarted: (s: Skill) => void }) {
  const { toast } = useUI();
  const { start } = useTimer();
  const skills = useLiveQuery(() => db.skills.toArray(), []);
  const allMaterials = useAllMaterials();
  const [f, setF] = useState<SuggestFilter>(() => ({ ...DEFAULT, ...loadSetting<Partial<SuggestFilter>>(KEY, {}) }));
  const [current, setCurrent] = useState<Skill | null>(null);
  const [round, setRound] = useState(0);
  const [matOpen, setMatOpen] = useState(false);

  const candidates = useMemo(() => suggestCandidates(skills ?? [], f), [skills, f]);

  const next = (avoidId?: string) => {
    const pick = pickWeighted(candidates, (c) => c.skill.id === avoidId);
    setCurrent(pick?.skill ?? null);
    setRound((r) => r + 1);
  };

  // Neu würfeln, wenn sich Filter ändern oder das Sheet aufgeht.
  useEffect(() => {
    if (open && skills) next(current?.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, f, skills === undefined]);

  const update = (patch: Partial<SuggestFilter>) => {
    const nf = { ...f, ...patch };
    setF(nf);
    saveSetting(KEY, nf);
  };

  const go = async () => {
    if (!current) return;
    if (current.status !== "lerne") {
      await updateSkill(current.id, { status: "lerne" });
      toast(`„${current.title}“ ist jetzt aktiv`);
    }
    await start(current);
    onClose();
    onStarted(current);
  };

  const hint = current ? seasonHint(current) : null;

  return (
    <>
      <Sheet open={open} onClose={onClose} title="Vorschlag" cancelLabel="Schließen">
        <div className="suggest">
          {current ? (
            <div key={round} className="suggest-card cv" style={catVars(current.kategorie)}>
              <div className="suggest-cat"><CategoryIcon name={current.kategorie} size={18} />{shortCategory(current.kategorie)}</div>
              <div className="suggest-title">{current.title}</div>
              {current.title !== current.name && <div className="suggest-orig">{current.name}</div>}
              <div className="suggest-facts">
                <span>{current.sessionMinutes} min</span>
                <span>{PLACE_LABEL[current.place]}</span>
                {current.material.length > 0 && <span>{current.material.join(", ")}</span>}
                <span>{STATUS_LABEL[current.status]}</span>
              </div>
              {hint && <div className="suggest-hint">{hint}</div>}
            </div>
          ) : (
            <div className="suggest-card suggest-none">
              <div className="suggest-title">Nichts passt</div>
              <div className="suggest-orig">Mehr Zeit wählen, einen anderen Ort oder weiteres Material freigeben.</div>
            </div>
          )}
          <div className="suggest-actions">
            <button className="btn btn-secondary" disabled={candidates.length < 2} onClick={() => next(current?.id)}>Anderer Vorschlag</button>
            <button className="btn btn-primary" disabled={!current} onClick={() => void go()}>Starten</button>
          </div>
          <div className="suggest-count">{candidates.length === 1 ? "1 Skill passt" : `${candidates.length} Skills passen`}</div>
        </div>

        <Group header="Zeit">
          <div className="row segmented-row">
            <Segmented options={TIME_OPTS} value={String(f.time)} onChange={(v) => update({ time: Number(v) as SuggestFilter["time"] })} />
          </div>
        </Group>
        <Group header="Bewegung">
          <div className="row segmented-row">
            <Segmented options={MOVE_OPTS} value={String(f.move)} onChange={(v) => update({ move: (v === "egal" ? "egal" : Number(v)) as MoveWish })} />
          </div>
        </Group>
        <Group header="Wo bist du?">
          <div className="row segmented-row">
            <Segmented options={WHERE_OPTS} value={f.where === "egal" ? "zuhause" : f.where} onChange={(v) => update({ where: v })} />
          </div>
        </Group>
        <Group footer="Die Jahreszeit fließt automatisch ein. Aktive Skills werden öfter vorgeschlagen.">
          <Row title="Material vorhanden" detail={f.material.length ? `${f.material.length} ausgewählt` : "Keins"} chevron onClick={() => setMatOpen(true)} />
        </Group>
      </Sheet>
      <MaterialSheet open={matOpen} onClose={() => setMatOpen(false)} title="Material vorhanden" options={allMaterials}
        value={f.material} onChange={(material) => update({ material })} />
    </>
  );
}
