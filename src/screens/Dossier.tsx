import type { ReactNode } from "react";
import { DOSSIERS, EVIDENCE_LABEL, type Dossier } from "../library/dossiers";
import { Disclosure } from "../components/ui";
import { Icon } from "../components/Icon";

export const dossierFor = (title: string): Dossier | null => DOSSIERS[title] ?? null;

/** Text mit Quellenhinweisen „[1]“ → kleine Hochzahlen, die zur Quellenliste springen. */
function Cited({ text, id }: { text: string; id: string }) {
  const parts = text.split(/(\[\d+\])/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = /^\[(\d+)\]$/.exec(p);
        return m ? <sup key={i} className="dos-cite"><a href={`#${id}-src-${m[1]}`} onClick={(e) => { e.preventDefault(); document.getElementById(`${id}-src-${m[1]}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>{m[1]}</a></sup> : <span key={i}>{p}</span>;
      })}
    </>
  );
}

function Sec({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return (
    <details className="dos-sec">
      <summary><span>{title}</span>{count != null && <span className="dos-count">{count}</span>}<Icon name="chevron-down" size={13} className="dos-chev" /></summary>
      <div className="dos-body">{children}</div>
    </details>
  );
}

export function DossierView({ d, id }: { d: Dossier; id: string }) {
  return (
    <Disclosure title="Mehr erfahren">
      <div className="dossier">
        <div className={`dos-ampel is-${d.evidence.level}`}>
          <span className="dos-light" aria-hidden="true" />
          <div>
            <div className="dos-ampel-title">{EVIDENCE_LABEL[d.evidence.level]}</div>
            <p><Cited text={d.evidence.why} id={id} /></p>
          </div>
        </div>

        <Sec title="Wie es funktioniert">
          {d.learn.map((t, i) => <p key={i}><Cited text={t} id={id} /></p>)}
        </Sec>
        <Sec title="Anleitung" count={d.steps.length}>
          <ol className="dos-steps">{d.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </Sec>
        <Sec title="Übungsplan für Anfänger">
          <div className="dos-plan">{d.plan.map((p) => <div key={p.title}><b>{p.title}</b><span><Cited text={p.text} id={id} /></span></div>)}</div>
        </Sec>
        <Sec title="Mythen und Fakten" count={d.myths.length}>
          {d.myths.map((m, i) => (
            <div key={i} className="dos-myth"><div className="dos-myth-q">{m.myth}</div><div><Cited text={m.fact} id={id} /></div></div>
          ))}
        </Sec>
        <Sec title="Typische Fehler" count={d.mistakes.length}>
          <ul>{d.mistakes.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </Sec>
        {d.safety.length > 0 && (
          <Sec title="Sicherheit">
            <div className="safety"><Icon name="warning" size={18} /><div>{d.safety.map((s, i) => <p key={i}><Cited text={s} id={id} /></p>)}</div></div>
          </Sec>
        )}
        {d.conflicts.length > 0 && (
          <Sec title="Widersprüche in der Literatur" count={d.conflicts.length}>
            <ul>{d.conflicts.map((s, i) => <li key={i}><Cited text={s} id={id} /></li>)}</ul>
          </Sec>
        )}
        {d.trainer && (
          <Sec title="Trainer-Standardwerte">
            <p><Cited text={d.trainer} id={id} /></p>
          </Sec>
        )}
        <Sec title="Videos" count={d.videos.length}>
          {d.videos.map((v) => (
            <a key={v.id} className="dos-video" href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer">
              <Icon name="video" size={20} />
              <span>
                <b>{v.title}</b>
                <small>{v.channel} · {v.why}</small>
                {!v.checked && <small className="dos-unchecked">Link aus Suchergebnis, Inhalt noch nicht geprüft</small>}
              </span>
            </a>
          ))}
        </Sec>
        <Sec title="Quellen" count={d.sources.length}>
          <ol className="dos-sources">
            {d.sources.map((s, i) => (
              <li key={s.url} id={`${id}-src-${i + 1}`}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>
                <small>{s.kind}</small>
              </li>
            ))}
          </ol>
          <div className="dos-date">Recherchiert am {d.date}</div>
        </Sec>
      </div>
    </Disclosure>
  );
}
