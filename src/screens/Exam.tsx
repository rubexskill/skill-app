import { useEffect, useMemo, useRef, useState } from "react";
import { uid, type ExamQuestion, type ExamTask, type ExamTest, type Skill } from "../db";
import { copyText, updateSkill } from "../logic";
import { examPrompt, parseExam } from "../exam";
import { AutoTextarea, CheckCircle, Group, Row, Sheet, useUI } from "../components/ui";
import { Icon } from "../components/Icon";
import { shuffle } from "../trainer/shared";

const pct = (n: number) => `${n} %`;
const LETTERS = ["A", "B", "C", "D"];

// ---------------- Block auf der Skill-Seite ----------------

export function ExamGroup({ skill, onPass }: { skill: Skill; onPass: () => void }) {
  const { actionSheet, undoable } = useUI();
  const [createOpen, setCreateOpen] = useState(false);
  const [runOpen, setRunOpen] = useState(false);
  const test = skill.test;
  const last = test?.attempts[test.attempts.length - 1];
  const best = test?.attempts.reduce((b, a) => Math.max(b, a.percent), 0) ?? 0;
  const offer = !!last?.passed && skill.status !== "kann";

  const remove = () => {
    const before = skill.test;
    actionSheet({
      title: "Abschlusstest löschen?",
      choices: [{
        label: "Test löschen", destructive: true,
        onSelect: () => undoable("Abschlusstest gelöscht", async () => {
          await updateSkill(skill.id, { test: null });
          return async () => void (await updateSkill(skill.id, { test: before }));
        }),
      }],
    });
  };

  return (
    <>
      <Group header="Abschlusstest">
        {!test ? (
          <Row title="Abschlusstest erstellen" subtitle="Prompt für Claude – ein wirklich schwerer Test" chevron onClick={() => setCreateOpen(true)}
            leading={<span className="icon-tile tile-ink"><Icon name="exam" size={17} /></span>} />
        ) : (
          <>
            <Row title={last ? (last.passed ? "Bestanden" : "Nicht bestanden") : "Bereit"} className={last ? (last.passed ? "exam-pass" : "exam-fail") : ""}
              subtitle={`${test.questions.length} Fragen · ${test.tasks.length} ${test.tasks.length === 1 ? "Aufgabe" : "Aufgaben"} · ab ${pct(test.passPercent)}`}
              detail={last ? `${pct(last.percent)}${test.attempts.length > 1 ? ` · Best ${pct(best)}` : ""}` : undefined}
              leading={<span className="icon-tile tile-ink"><Icon name="exam" size={17} /></span>} />
            <Row title={last ? "Test wiederholen" : "Test machen"} tone="accent" chevron onClick={() => setRunOpen(true)} />
            {offer && <Row title="Auf „Geschafft“ setzen" subtitle="Du hast den Test bestanden." tone="accent" chevron onClick={onPass} />}
            <Row title="Neuen Test erstellen" tone="accent" onClick={() => setCreateOpen(true)} />
            <Row title="Test löschen" tone="danger" onClick={remove} />
          </>
        )}
      </Group>
      <ExamCreateSheet open={createOpen} onClose={() => setCreateOpen(false)} skill={skill} />
      {test && <ExamRunSheet open={runOpen} onClose={() => setRunOpen(false)} skill={skill} test={test} onPass={() => { setRunOpen(false); onPass(); }} />}
    </>
  );
}

// ---------------- Erstellen: Prompt kopieren, Antwort einfügen ----------------

function ExamCreateSheet({ open, onClose, skill }: { open: boolean; onClose: () => void; skill: Skill }) {
  const { toast } = useUI();
  const [answer, setAnswer] = useState("");
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const prompt = useMemo(() => examPrompt(skill), [skill]);
  const parsed = useMemo(() => (answer.trim() ? parseExam(answer) : null), [answer]);

  useEffect(() => { if (open) setAnswer(""); }, [open]);

  const copy = async () => {
    if (await copyText(prompt)) toast("Prompt kopiert – jetzt in Claude einfügen");
    else {
      promptRef.current?.focus();
      promptRef.current?.select();
      toast("Bitte den markierten Text kopieren");
    }
  };

  const apply = () => {
    if (!parsed) return;
    const test: ExamTest = {
      title: parsed.title || `Abschlusstest ${skill.title}`,
      passPercent: parsed.passPercent,
      questions: parsed.questions.map((q) => ({ ...q, id: uid() })),
      tasks: parsed.tasks.map((t) => ({ ...t, id: uid() })),
      attempts: [],
      createdAt: Date.now(),
    };
    void updateSkill(skill.id, { test });
    toast("Abschlusstest übernommen");
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Abschlusstest erstellen" action={{ label: "Übernehmen", onClick: apply, disabled: !parsed }}>
      <div className="steps">
        <div className="step">
          <span className="step-num">1</span>
          <div className="step-body">
            <div className="step-title">Prompt kopieren</div>
            <div className="step-text">Füge ihn in der Claude-App oder auf claude.ai ein. Er verlangt einen wirklich schweren Test.</div>
            <textarea ref={promptRef} className="prompt-box" readOnly value={prompt} rows={5} />
            <button className="btn btn-primary btn-small" onClick={() => void copy()}><Icon name="copy" size={17} /> Prompt kopieren</button>
          </div>
        </div>
        <div className="step">
          <span className="step-num">2</span>
          <div className="step-body">
            <div className="step-title">Antwort einfügen</div>
            <div className="step-text">Kopiere die ganze Antwort von Claude hier hinein.</div>
            <AutoTextarea className="answer-box" value={answer} placeholder="TEST: …" onChange={(e) => setAnswer(e.target.value)} />
            {answer.trim() && (
              <div className={`parse-state${parsed ? " is-ok" : ""}`}>
                {parsed
                  ? `Erkannt: ${parsed.questions.length} Fragen, ${parsed.tasks.length} ${parsed.tasks.length === 1 ? "Aufgabe" : "Aufgaben"}, bestanden ab ${pct(parsed.passPercent)}`
                  : "Noch nicht erkannt – die Antwort sollte mit „TEST:“ oder „FRAGE:“ beginnen."}
              </div>
            )}
          </div>
        </div>
      </div>
    </Sheet>
  );
}

// ---------------- Test durchführen ----------------

type Step = { kind: "q"; q: ExamQuestion; order: number[] } | { kind: "t"; t: ExamTask };

function ExamRunSheet({ open, onClose, skill, test, onPass }: { open: boolean; onClose: () => void; skill: Skill; test: ExamTest; onPass: () => void }) {
  const [phase, setPhase] = useState<"intro" | "run" | "result">("intro");
  const [steps, setSteps] = useState<Step[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [ticks, setTicks] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<ExamQuestion[]>([]);
  const [result, setResult] = useState<{ percent: number; passed: boolean; rq: number; rt: number } | null>(null);
  const score = useRef({ q: 0, t: 0 });

  useEffect(() => {
    if (open) {
      setPhase("intro");
      setResult(null);
    }
  }, [open]);

  const start = () => {
    const qs: Step[] = shuffle(test.questions).map((q) => ({ kind: "q", q, order: shuffle(q.options.map((_, k) => k)) }));
    setSteps([...qs, ...test.tasks.map((t): Step => ({ kind: "t", t }))]);
    score.current = { q: 0, t: 0 };
    setWrong([]);
    setI(0);
    setPicked(null);
    setTicks(new Set());
    setPhase("run");
  };

  const finish = () => {
    const total = test.questions.length + test.tasks.length;
    const percent = total ? Math.round((100 * (score.current.q + score.current.t)) / total) : 0;
    const passed = percent >= test.passPercent;
    setResult({ percent, passed, rq: score.current.q, rt: score.current.t });
    setPhase("result");
    void updateSkill(skill.id, { test: { ...test, attempts: [...test.attempts, { at: Date.now(), percent, passed }] } });
  };

  const next = () => {
    if (i + 1 >= steps.length) return finish();
    setI(i + 1);
    setPicked(null);
    setTicks(new Set());
  };

  const step = steps[i];
  const pick = (display: number) => {
    if (picked !== null || step?.kind !== "q") return;
    setPicked(display);
    if (step.order[display] === step.q.answer) score.current.q++;
    else setWrong((w) => [...w, step.q]);
    navigator.vibrate?.(8);
  };
  const doneTask = () => {
    if (step?.kind === "t" && step.t.criteria.every((_, k) => ticks.has(k))) score.current.t++;
    next();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Abschlusstest" cancelLabel={phase === "run" ? "Abbrechen" : "Schließen"}>
      <div className="exam">
        {phase === "intro" && (
          <div className="tr-setup">
            <h2 className="tr-title">{test.title}</h2>
            <p className="tr-lead">{test.questions.length} Fragen{test.tasks.length ? ` und ${test.tasks.length} ${test.tasks.length === 1 ? "praktische Aufgabe" : "praktische Aufgaben"}` : ""}. Bestanden ab {pct(test.passPercent)}. Ehrlich bleiben – der Test ist nur für dich.</p>
            {test.attempts.length > 0 && <p className="tr-note">Bisher {test.attempts.length} {test.attempts.length === 1 ? "Versuch" : "Versuche"}, bestes Ergebnis {pct(Math.max(...test.attempts.map((a) => a.percent)))}.</p>}
            <button className="btn btn-primary tr-start" onClick={start}>Test starten</button>
          </div>
        )}

        {phase === "run" && step && (
          <div className="tr-run">
            <div className="tr-top"><span>{step.kind === "q" ? "Frage" : "Aufgabe"} {i + 1} von {steps.length}</span></div>
            <div className="tr-progress"><i style={{ width: `${(i / steps.length) * 100}%` }} /></div>
            {step.kind === "q" ? (
              <>
                <div className="exam-q">{step.q.text}</div>
                <div className="tr-choices" style={{ ["--cols" as string]: 1 }}>
                  {step.order.map((orig, d) => {
                    const state = picked === null ? "" : orig === step.q.answer ? " is-right" : picked === d ? " is-wrong" : " is-dim";
                    return (
                      <button key={d} className={`tr-choice exam-opt${state}`} onClick={() => pick(d)} disabled={picked !== null}>
                        <b>{LETTERS[d]}</b><span>{step.q.options[orig]}</span>
                      </button>
                    );
                  })}
                </div>
                {picked !== null && (
                  <div className={`tr-fb${step.order[picked] === step.q.answer ? " is-ok" : " is-bad"}`}>
                    <div>{step.order[picked] === step.q.answer ? "Richtig" : <>Richtig wäre: <b>{step.q.options[step.q.answer]}</b></>}{step.q.explanation && <p className="exam-expl">{step.q.explanation}</p>}</div>
                    <button className="btn btn-secondary btn-small" onClick={next}>{i + 1 >= steps.length ? "Auswerten" : "Weiter"}</button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="exam-q">{step.t.text}</div>
                <Group header="Hast du das geschafft?" footer="Hake nur ab, was wirklich geklappt hat.">
                  {step.t.criteria.map((c, k) => (
                    <Row key={k} title={c} leading={<CheckCircle checked={ticks.has(k)} label={c} onToggle={() => setTicks((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; })} />}
                      onClick={() => setTicks((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; })} />
                  ))}
                </Group>
                <button className="btn btn-primary tr-start" onClick={doneTask}>{i + 1 >= steps.length ? "Auswerten" : "Weiter"}</button>
              </>
            )}
          </div>
        )}

        {phase === "result" && result && (
          <div className="exam-result">
            <div className={`exam-badge${result.passed ? " is-pass" : ""}`}><Icon name={result.passed ? "check" : "close"} size={30} /></div>
            <div className="tr-big"><span className="num">{result.percent}</span><span className="unit"> %</span></div>
            <div className="tr-sub">{result.passed ? "Bestanden" : `Nicht bestanden – nötig sind ${pct(test.passPercent)}`}</div>
            <Group>
              <Row title="Fragen" detail={`${result.rq} von ${test.questions.length}`} />
              {test.tasks.length > 0 && <Row title="Aufgaben" detail={`${result.rt} von ${test.tasks.length}`} />}
            </Group>
            {result.passed && skill.status !== "kann" && (
              <button className="btn btn-primary tr-start" onClick={onPass}>Auf „Geschafft“ setzen</button>
            )}
            <div className="tr-result-actions">
              <button className="btn btn-secondary" onClick={start}>Nochmal</button>
              <button className="btn btn-secondary" onClick={onClose}>Schließen</button>
            </div>
            {wrong.length > 0 && (
              <Group header="Falsch beantwortet">
                {wrong.map((q) => (
                  <Row key={q.id} title={<span className="exam-wrong-q">{q.text}</span>} subtitle={<>Richtig: <b>{q.options[q.answer]}</b>{q.explanation ? ` – ${q.explanation}` : ""}</>} />
                ))}
              </Group>
            )}
          </div>
        )}
      </div>
    </Sheet>
  );
}
