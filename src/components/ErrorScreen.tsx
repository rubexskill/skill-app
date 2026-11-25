// Ruhige Fehlerseiten: Datenbank lässt sich nicht öffnen, Programmfehler, Baustein konnte nicht geladen werden.
import { Component, type ReactNode } from "react";

export function ErrorScreen({ title, text, detail }: { title: string; text: string; detail?: string }) {
  return (
    <div className="errscreen" role="alert">
      <h1>{title}</h1>
      <p>{text}</p>
      <button className="btn btn-primary" onClick={() => location.reload()}>Neu laden</button>
      {detail && <small>{detail}</small>}
    </div>
  );
}

export function StartupError({ error }: { error: unknown }) {
  const name = (error as Error | undefined)?.name ?? "";
  const full = /Quota|Disk|full/i.test(name + String((error as Error | undefined)?.message));
  return (
    <ErrorScreen
      title="Die Daten lassen sich nicht öffnen"
      text={full
        ? "Auf dem Gerät ist zu wenig Speicher frei. Schaffe Platz und lade die App neu. Deine Daten wurden nicht verändert."
        : "Das passiert z. B. im privaten Modus von Safari oder wenn der Browser den Speicher sperrt. Öffne die App normal oder installiere sie auf dem Home-Bildschirm. Deine Daten wurden nicht verändert."}
      detail={name || undefined}
    />
  );
}

/** Fängt Programmfehler beim Zeichnen und fehlgeschlagenes Nachladen von Bausteinen (z. B. Würfel ohne Netz) ab. */
export class Boundary extends Component<{ children: ReactNode; title?: string; text?: string; inline?: boolean }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    const chunk = /dynamically imported|Importing a module script failed|Failed to fetch|Load failed/i.test(this.state.error.message);
    const title = this.props.title ?? (chunk ? "Konnte nicht geladen werden" : "Etwas ist schiefgelaufen");
    const text = this.props.text ?? (chunk ? "Dieser Teil der App braucht einmal eine Verbindung oder eine neue Version. Prüfe die Verbindung und lade neu." : "Deine Daten sind sicher. Lade die App neu.");
    return <ErrorScreen title={title} text={text} detail={this.props.inline ? undefined : this.state.error.name} />;
  }
}
