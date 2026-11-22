import { useEffect, useMemo, useRef, useState } from "react";
import type { Skill } from "../db";
import { copyText, parseProfile, profilePrompt, toMilestones, toProfile, updateSkill, youtubeUrl } from "../logic";
import { AutoTextarea, Group, Row, Sheet, useUI } from "../components/ui";
import { Icon } from "../components/Icon";
import { dossierFor, DossierView } from "./Dossier";

export function ProfileCard({ skill }: { skill: Skill }) {
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const own = skill.profile;
  const dossier = dossierFor(skill.title);
  // Unbearbeiteter KI-Steckbrief wird durch die recherchierte Fassung ersetzt; eigene Texte bleiben.
  const researched = !!dossier && (!own || own.ai);
  const p = researched && dossier ? { ...(own ?? { searches: [], ai: false }), about: dossier.steckbrief.about, why: dossier.steckbrief.why, tips: dossier.steckbrief.tips, safety: dossier.steckbrief.safety, searches: own?.searches ?? [], ai: false } : own;

  return (
    <>
      {p ? (
        <section className="profile">
          <div className="section-head-row">
            <h2 className="block-title">Steckbrief</h2>
            {p.ai && <span className="ai-tag">KI-erstellt · ungeprüft</span>}
            {researched && <span className="ai-tag is-researched">Recherchiert · mit Quellen</span>}
            <button className="text-btn" onClick={() => setEditOpen(true)}>Bearbeiten</button>
          </div>
          <p className="profile-about">{p.about}</p>
          {p.why && (
            <div className="profile-block">
              <div className="profile-label">Warum</div>
              <p>{p.why}</p>
            </div>
          )}
          {p.tips && (
            <div className="profile-block">
              <div className="profile-label">Tipps</div>
              <p>{p.tips}</p>
            </div>
          )}
          {p.safety && (
            <div className="safety">
              <Icon name="warning" size={18} />
              <p>{p.safety}</p>
            </div>
          )}
          {p.searches.length > 0 && (
            <div className="search-chips">
              {p.searches.map((q) => (
                <a key={q} className="search-chip" href={youtubeUrl(q)} target="_blank" rel="noopener noreferrer">
                  <Icon name="video" size={16} />
                  {q}
                </a>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="profile profile-empty">
          <h2 className="block-title">Steckbrief</h2>
          <p>Worum es geht, Lernschritte, Tipps und Videos – erstellt mit Claude, ohne API-Schlüssel.</p>
          <button className="btn btn-secondary btn-small" onClick={() => setCreateOpen(true)}>Steckbrief erstellen</button>
        </section>
      )}
      {dossier && <DossierView d={dossier} id={`dos-${skill.id}`} />}
      <ProfileEditSheet open={editOpen} onClose={() => setEditOpen(false)} skill={skill} onRegenerate={() => { setEditOpen(false); setCreateOpen(true); }} />
      <ProfileCreateSheet open={createOpen} onClose={() => setCreateOpen(false)} skill={skill} />
    </>
  );
}

function ProfileEditSheet({ open, onClose, skill, onRegenerate }: { open: boolean; onClose: () => void; skill: Skill; onRegenerate: () => void }) {
  const { actionSheet } = useUI();
  const [about, setAbout] = useState("");
  const [why, setWhy] = useState("");
  const [tips, setTips] = useState("");
  const [safety, setSafety] = useState("");
  const [searches, setSearches] = useState("");

  useEffect(() => {
    if (!open) return;
    const p = skill.profile;
    setAbout(p?.about ?? "");
    setWhy(p?.why ?? "");
    setTips(p?.tips ?? "");
    setSafety(p?.safety ?? "");
    setSearches((p?.searches ?? []).join("\n"));
  }, [open, skill.profile]);

  const save = () => {
    const list = searches.split("\n").map((s) => s.trim()).filter(Boolean);
    const p = skill.profile;
    const changed = !p || p.about !== about.trim() || p.why !== why.trim() || p.tips !== tips.trim() || p.safety !== safety.trim() || p.searches.join("\n") !== list.join("\n");
    void updateSkill(skill.id, {
      profile: { about: about.trim(), why: why.trim(), tips: tips.trim(), safety: safety.trim(), searches: list, ai: changed ? false : (p?.ai ?? false) },
    });
    onClose();
  };

  const field = (label: string, value: string, set: (v: string) => void, placeholder: string) => (
    <Group header={label}>
      <div className="row input-row"><AutoTextarea value={value} placeholder={placeholder} onChange={(e) => set(e.target.value)} /></div>
    </Group>
  );

  return (
    <Sheet open={open} onClose={onClose} title="Steckbrief" action={{ label: "Sichern", onClick: save, disabled: !about.trim() }}>
      {field("Worum geht's", about, setAbout, "2–3 Sätze")}
      {field("Warum nützlich", why, setWhy, "Ein Satz")}
      {field("Tipps", tips, setTips, "Typische Fehler und Tipps")}
      {field("Sicherheit", safety, setSafety, "Nur bei riskanten Skills")}
      <Group header="YouTube-Suchbegriffe" footer="Ein Begriff pro Zeile.">
        <div className="row input-row"><AutoTextarea value={searches} placeholder="z. B. handstand tutorial" onChange={(e) => setSearches(e.target.value)} /></div>
      </Group>
      <Group footer="Sobald du etwas änderst, verschwindet der Hinweis „KI-erstellt“.">
        <Row title="Mit Claude neu erstellen" tone="accent" onClick={onRegenerate} />
        <Row title="Steckbrief entfernen" tone="danger" onClick={() => actionSheet({
          title: "Steckbrief entfernen?",
          message: "Meilensteine bleiben erhalten.",
          choices: [{ label: "Entfernen", destructive: true, onSelect: () => { void updateSkill(skill.id, { profile: null }); onClose(); } }],
        })} />
      </Group>
    </Sheet>
  );
}

export function ProfileCreateSheet({ open, onClose, skill }: { open: boolean; onClose: () => void; skill: Skill }) {
  const { toast } = useUI();
  const [answer, setAnswer] = useState("");
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const prompt = useMemo(() => profilePrompt(skill), [skill]);
  const parsed = useMemo(() => (answer.trim() ? parseProfile(answer) : null), [answer]);

  useEffect(() => { if (open) setAnswer(""); }, [open]);

  const copy = async () => {
    const ok = await copyText(prompt);
    if (ok) toast("Prompt kopiert – jetzt in Claude einfügen");
    else {
      promptRef.current?.focus();
      promptRef.current?.select();
      toast("Bitte den markierten Text kopieren");
    }
  };

  const apply = () => {
    if (!parsed) return;
    const anyDone = skill.milestones.some((m) => m.done);
    const fresh = toMilestones(parsed.milestones);
    const milestones = anyDone
      ? [...skill.milestones, ...fresh.filter((m) => !skill.milestones.some((o) => o.text.toLowerCase() === m.text.toLowerCase()))]
      : fresh.length ? fresh : skill.milestones;
    void updateSkill(skill.id, { profile: toProfile(parsed), milestones });
    toast("Steckbrief übernommen");
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Steckbrief erstellen" action={{ label: "Übernehmen", onClick: apply, disabled: !parsed }}>
      <div className="steps">
        <div className="step">
          <span className="step-num">1</span>
          <div className="step-body">
            <div className="step-title">Prompt kopieren</div>
            <div className="step-text">Füge ihn in der Claude-App oder auf claude.ai ein.</div>
            <textarea ref={promptRef} className="prompt-box" readOnly value={prompt} rows={5} />
            <button className="btn btn-primary btn-small" onClick={() => void copy()}><Icon name="copy" size={17} /> Prompt kopieren</button>
          </div>
        </div>
        <div className="step">
          <span className="step-num">2</span>
          <div className="step-body">
            <div className="step-title">Antwort einfügen</div>
            <div className="step-text">Kopiere die ganze Antwort von Claude hier hinein.</div>
            <AutoTextarea className="answer-box" value={answer} placeholder="WORUM: …" onChange={(e) => setAnswer(e.target.value)} />
            {answer.trim() && (
              <div className={`parse-state${parsed ? " is-ok" : ""}`}>
                {parsed
                  ? `Erkannt: Text${parsed.milestones.length ? `, ${parsed.milestones.length} Meilensteine` : ""}${parsed.searches.length ? `, ${parsed.searches.length} Suchbegriffe` : ""}`
                  : "Noch nicht erkannt – die Antwort sollte mit „WORUM:“ beginnen."}
              </div>
            )}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
