import { lazy, Suspense, useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid, type Skill } from "../db";
import { minutesLabel, saveRecord } from "../logic";
import { endOfToday } from "../srs";
import { Group, Row, Sheet, useUI } from "../components/ui";
import { Icon } from "../components/Icon";
import { allCategoryColors, categoryStyle } from "../categories";
import { BreathTrainer, CardsReview, StopwatchTrainer } from "./Body";
import { MathTrainer, MorseTrainer, WeekdayTrainer } from "./Quiz";
import { FlagsTrainer } from "./flags/FlagsTrainer";
// Der Würfel-Trainer (mit three.js) wird erst beim Öffnen geladen.
const CubeTrainer = lazy(() => import("./cube/CubeTrainer"));
import type { TrainerResult } from "./shared";

export type TrainerKind = "math" | "weekday" | "morse" | "flags" | "cube" | "breath" | "stopwatch" | "cards";

export interface TrainerOption {
  kind: TrainerKind;
  label: string;
  hint: string;
}

const MATH = ["Kopfrechnen", "Große Zahlen multiplizieren", "Trachtenberg-System"];
const BREATH = ["Box Breathing", "Physiologischer Seufzer"];

/** Eingebauter Trainer für diesen Skill (nach Kurztitel); sonst Stoppuhr, wenn der Messwert in Sekunden ist. */
export function builtInTrainer(skill: Pick<Skill, "title" | "metric">): TrainerOption | null {
  const t = skill.title;
  if (MATH.includes(t)) return { kind: "math", label: "Kopfrechnen", hint: "Zufallsaufgaben mit Zeit" };
  if (t === "Wochentag berechnen") return { kind: "weekday", label: "Wochentag-Training", hint: "Zufallsdaten, Wochentag antippen" };
  if (t === "Morsecode") return { kind: "morse", label: "Morse-Training", hint: "Zeichen und Wörter sehen oder hören" };
  if (t === "Flaggen & Geografie") return { kind: "flags", label: "Flaggen-Trainer", hint: "195 Flaggen, Hauptstädte, Lernstand" };
  if (t === "Zauberwürfel") return { kind: "cube", label: "Würfel-Trainer", hint: "3D-Würfel, Zeiten, Lernpfad" };
  if (BREATH.includes(t)) return { kind: "breath", label: "Atemübung", hint: "Ruhiger Kreis mit Phasen" };
  if (skill.metric?.unit.trim() === "s") return { kind: "stopwatch", label: "Stoppuhr", hint: "Mit Bestzeit als Rekord" };
  return null;
}

/** Karten, die heute fällig sind (inkl. später am Tag) */
export function useCardCounts(skillId: string) {
  return useLiveQuery(async () => {
    const cards = await db.cards.where("skillId").equals(skillId).toArray();
    const end = endOfToday();
    return { total: cards.length, due: cards.filter((c) => c.due <= end).length };
  }, [skillId]) ?? { total: 0, due: 0 };
}

export function TrainerSheet({ open, onClose, skill, initial }: { open: boolean; onClose: () => void; skill: Skill; initial?: TrainerKind }) {
  const { toast, celebrate } = useUI();
  const counts = useCardCounts(skill.id);
  const builtIn = builtInTrainer(skill);
  const options: TrainerOption[] = [
    ...(builtIn ? [builtIn] : []),
    ...(counts.total > 0 ? [{ kind: "cards" as const, label: "Karteikarten", hint: counts.due ? `${counts.due} fällig` : `${counts.total} Karten, nichts fällig` }] : []),
  ];
  const [kind, setKind] = useState<TrainerKind | null>(null);

  useEffect(() => {
    if (open) setKind(initial ?? (options.length === 1 ? options[0].kind : null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const finish = async (r: TrainerResult) => {
    const minutes = Math.round(r.elapsedMs / 60000);
    if (minutes >= 1) await db.sessions.add({ id: uid(), skillId: skill.id, start: Date.now() - r.elapsedMs, minutes });
    let msg = r.headline;
    if (r.record) {
      const res = await saveRecord(skill, r.record);
      if (res.isBest) {
        celebrate([categoryStyle(skill.kategorie).light, ...allCategoryColors().slice(0, 4)]);
        msg += " · neuer Rekord";
      }
    }
    toast(`${msg}${minutes >= 1 ? ` · ${minutesLabel(minutes)} gespeichert` : ""}`);
    onClose();
  };

  const props = { skill, onFinish: (r: TrainerResult) => void finish(r) };
  const title = kind ? options.find((o) => o.kind === kind)?.label ?? "Trainieren" : "Trainieren";

  return (
    <Sheet open={open} onClose={onClose} title={title} cancelLabel={kind && options.length > 1 && !initial ? "Zurück" : "Schließen"}
      onCancel={kind && options.length > 1 && !initial ? () => setKind(null) : undefined}>
      <div className="trainer">
        {!kind && (
          <Group header={skill.title}>
            {options.map((o) => (
              <Row key={o.kind} title={o.label} subtitle={o.hint} chevron onClick={() => setKind(o.kind)}
                leading={<span className="icon-tile tile-ink"><Icon name={o.kind === "cards" ? "cards" : "train"} size={17} /></span>} />
            ))}
          </Group>
        )}
        {kind === "math" && <MathTrainer {...props} />}
        {kind === "weekday" && <WeekdayTrainer {...props} />}
        {kind === "morse" && <MorseTrainer {...props} />}
        {kind === "flags" && <FlagsTrainer {...props} />}
        {kind === "cube" && <Suspense fallback={<div className="cube-loading">Würfel wird geladen …</div>}><CubeTrainer {...props} /></Suspense>}
        {kind === "breath" && <BreathTrainer {...props} />}
        {kind === "stopwatch" && <StopwatchTrainer {...props} />}
        {kind === "cards" && <CardsReview {...props} />}
      </div>
    </Sheet>
  );
}
