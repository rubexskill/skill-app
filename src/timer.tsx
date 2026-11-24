import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Skill } from "./db";
import { bigTime, saveSessionNote, startTimer, stopMessage, stopTimer, type StopResult } from "./logic";
import { AutoTextarea, Group, Sheet, useUI } from "./components/ui";
import { Icon } from "./components/Icon";
import { catVars } from "./categories";

interface TimerCtx {
  toggle: (skill: Skill, unitId?: string) => Promise<void>;
  start: (skill: Skill, unitId?: string) => Promise<void>;
}

const Ctx = createContext<TimerCtx>({ toggle: async () => {}, start: async () => {} });
export const useTimer = () => useContext(Ctx);

export { stopMessage };

const RATINGS: { value: 1 | 2 | 3; label: string }[] = [
  { value: 1, label: "Zäh" },
  { value: 2, label: "Okay" },
  { value: 3, label: "Gut" },
];

/** Kurzes Sheet nach dem Stoppen: Bewertung + „Woran arbeite ich nächstes Mal?“ */
function StopSheet({ result, onClose }: { result: StopResult | null; onClose: () => void }) {
  const [rating, setRating] = useState<1 | 2 | 3 | null>(null);
  const [text, setText] = useState("");
  const [shown, setShown] = useState<StopResult | null>(null);

  useEffect(() => {
    if (result) {
      setShown(result);
      setRating(null);
      setText("");
    }
  }, [result]);

  const save = async () => {
    if (shown) await saveSessionNote(shown, rating, text);
    onClose();
  };

  const t = bigTime(shown?.minutes ?? 0);
  return (
    <Sheet open={!!result} onClose={onClose} title="Session gespeichert" cancelLabel="Überspringen"
      action={{ label: "Sichern", onClick: () => void save() }}>
      {shown && (
        <div className="stop cv" style={catVars(shown.skill.kategorie)}>
          <div className="stop-time"><span className="num">{t.big}</span><span className="unit">{t.unit}</span></div>
          <div className="stop-name">{shown.unit ? `${shown.unit.title} · ${shown.skill.title}` : shown.skill.title}</div>

          <div className="stop-label">Wie lief es?</div>
          <div className="rating">
            {RATINGS.map((r) => (
              <button key={r.value} className={`rating-btn${rating === r.value ? " is-on" : ""}`} onClick={() => setRating(rating === r.value ? null : r.value)}
                aria-pressed={rating === r.value}>
                <Icon name={`rate-${r.value}`} size={26} />
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <Group header="Nächstes Mal" footer="Steht beim nächsten Mal oben auf der Skill-Seite. Diktieren geht über das Mikrofon der Tastatur.">
        <div className="row input-row">
          <AutoTextarea value={text} placeholder="Woran arbeite ich nächstes Mal?" onChange={(e) => setText(e.target.value)} />
        </div>
      </Group>
    </Sheet>
  );
}

export function TimerProvider({ children }: { children: ReactNode }) {
  const { toast } = useUI();
  const [stopped, setStopped] = useState<StopResult | null>(null);

  const afterStop = useCallback(
    (r: StopResult | null) => {
      if (!r) return;
      if (r.saved) setStopped(r);
      else toast(stopMessage(r));
    },
    [toast],
  );

  const start = useCallback(
    async (skill: Skill, unitId?: string) => {
      navigator.vibrate?.(10);
      afterStop(await startTimer(skill.id, unitId));
    },
    [afterStop],
  );

  const toggle = useCallback(
    async (skill: Skill, unitId?: string) => {
      navigator.vibrate?.(10);
      if (skill.timerStart) afterStop(await stopTimer(skill.id));
      else afterStop(await startTimer(skill.id, unitId));
    },
    [afterStop],
  );

  return (
    <Ctx.Provider value={{ toggle, start }}>
      {children}
      <StopSheet result={stopped} onClose={() => setStopped(null)} />
    </Ctx.Provider>
  );
}
