/** Selbstaufnahme mit dem Mikrofon (MediaRecorder). Alles lokal, kein Upload. */

export const RECORDER_TYPES = ["audio/mp4", "audio/webm;codecs=opus", "audio/aac", "audio/webm"];

/** Erstes Format, das der Browser aufnehmen kann (iPhone: mp4/AAC, Chrome: webm/Opus). Sonst undefined = Standard des Browsers. */
export function pickRecorderMime(isSupported: (type: string) => boolean): string | undefined {
  return RECORDER_TYPES.find((t) => {
    try { return isSupported(t); } catch { return false; }
  });
}

export const recorderSupported = (): boolean => typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

export type RecorderFailure = "denied" | "none" | "busy" | "security" | "unsupported" | "other";

/** Ruhige Hinweise statt Fehlermeldungen. */
export const RECORDER_HINT: Record<RecorderFailure, string> = {
  denied: "Der Zugriff auf das Mikrofon ist ausgeschaltet.",
  none: "Auf diesem Gerät wurde kein Mikrofon gefunden.",
  busy: "Das Mikrofon ist gerade nicht frei.",
  security: "Das Mikrofon ist auf dieser Seite nicht erlaubt.",
  unsupported: "Aufnehmen geht in diesem Browser oder in diesem Format nicht.",
  other: "Die Aufnahme konnte nicht gestartet werden.",
};

export function failureOf(err: unknown): RecorderFailure {
  const name = errorName(err);
  if (name === "NotAllowedError" || name === "PermissionDeniedError") return "denied";
  if (name === "SecurityError") return "security";
  if (name === "NotFoundError" || name === "OverconstrainedError" || name === "DevicesNotFoundError") return "none";
  if (name === "NotReadableError" || name === "TrackStartError" || name === "AbortError") return "busy";
  if (name === "NotSupportedError") return "unsupported";
  return "other";
}

export const errorName = (err: unknown): string => {
  const e = err as { name?: string; failureName?: string } | null;
  return (e?.failureName || e?.name || (err instanceof Error ? err.constructor.name : "")) || "Unbekannt";
};

/** Ein Satz Hilfe zum echten Fehlernamen. */
export function errorTip(name: string): string {
  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Mikrofon in den iOS-Einstellungen unter Apps → Safari erlauben. Bei der Home-Bildschirm-App die Seite einmal in Safari öffnen und dort „Erlauben“ wählen.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "Prüfe, ob ein Mikrofon vorhanden ist, etwa am Kopfhörer, und versuche es noch einmal.";
    case "NotReadableError":
    case "TrackStartError":
      return "Eine andere App nutzt das Mikrofon. Schließe sie kurz (Anruf, Sprachmemo, Video) und tippe noch einmal.";
    case "SecurityError":
      return "Das Mikrofon geht nur auf einer sicheren Seite (https). Öffne die App über ihre gewohnte Adresse.";
    case "NotSupportedError":
      return "Dieses Format wird nicht unterstützt. Aktualisiere iOS oder nimm in Safari auf.";
    case "OverconstrainedError":
      return "Das Mikrofon unterstützt die Einstellung nicht. Versuche es mit einem anderen Mikrofon.";
    case "AbortError":
      return "Der Zugriff wurde unterbrochen. Beende andere Audio-Apps und tippe noch einmal.";
    default:
      return "Beende Metronom und andere Audio-Apps und versuche es noch einmal. Bleibt es dabei, hilft ein Neustart der App.";
  }
}

export interface RecorderError {
  failure: RecorderFailure;
  /** Echter Fehlername, z. B. NotAllowedError */
  name: string;
}

export interface ActiveRecording {
  stop: () => Promise<{ blob: Blob; duration: number; mime: string }>;
  cancel: () => void;
}

type AudioSessionNav = { audioSession?: { type: string } };
let previousSession: string | null = null;

/** iOS: Für das Aufnehmen muss die Audio-Sitzung „play-and-record“ sein, danach wieder wie vorher. */
export function enterRecordSession(): void {
  try {
    const s = (navigator as unknown as AudioSessionNav).audioSession;
    if (!s) return;
    if (previousSession === null) previousSession = s.type;
    s.type = "play-and-record";
  } catch { /* nicht unterstützt */ }
}

export function leaveRecordSession(): void {
  try {
    const s = (navigator as unknown as AudioSessionNav).audioSession;
    if (s && previousSession !== null) s.type = previousSession === "auto" ? "playback" : previousSession;
  } catch { /* nicht unterstützt */ }
  previousSession = null;
}

/** Legt einen MediaRecorder an und startet ihn. Schlägt es fehl, folgen einfachere Versuche (ohne Format, ohne Zeitscheiben). */
function createRecorder(stream: MediaStream, mime: string | undefined, chunks: Blob[]): MediaRecorder {
  const attempts: { mime?: string; slice: boolean }[] = [
    ...(mime ? [{ mime, slice: true }] : []),
    { mime: undefined, slice: true },
    { mime: undefined, slice: false },
  ];
  let last: unknown;
  for (const a of attempts) {
    try {
      const rec = a.mime ? new MediaRecorder(stream, { mimeType: a.mime }) : new MediaRecorder(stream);
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      if (a.slice) rec.start(1000);
      else rec.start();
      return rec;
    } catch (err) {
      last = err;
    }
  }
  throw last ?? new Error("MediaRecorder");
}

/**
 * Fragt (beim ersten Mal) das Mikrofon ab und beginnt.
 * Muss direkt im Tipp-Handler aufgerufen werden: vor getUserMedia darf nichts Asynchrones passieren.
 * Wirft { failure, name } statt roher Fehler.
 */
export function startRecording(): Promise<ActiveRecording> {
  if (!recorderSupported()) return Promise.reject<ActiveRecording>({ failure: "unsupported", name: "NotSupportedError" } satisfies RecorderError);
  enterRecordSession();
  // getUserMedia sofort, einfache Einstellung { audio: true }
  const gum = navigator.mediaDevices.getUserMedia({ audio: true });
  return gum.then(
    (stream) => {
      const mime = pickRecorderMime((t) => MediaRecorder.isTypeSupported?.(t) ?? false);
      const chunks: Blob[] = [];
      let rec: MediaRecorder;
      try {
        rec = createRecorder(stream, mime, chunks);
      } catch (err) {
        stream.getTracks().forEach((t) => t.stop());
        leaveRecordSession();
        throw { failure: failureOf(err), name: errorName(err) } satisfies RecorderError;
      }
      const t0 = performance.now();
      const release = () => { stream.getTracks().forEach((t) => t.stop()); leaveRecordSession(); };
      return {
        stop: () =>
          new Promise((resolve) => {
            rec.onstop = () => {
              release();
              const type = rec.mimeType || mime || "audio/mp4";
              resolve({ blob: new Blob(chunks, { type }), duration: (performance.now() - t0) / 1000, mime: type });
            };
            if (rec.state !== "inactive") rec.stop();
            else rec.onstop?.(new Event("stop"));
          }),
        cancel: () => {
          rec.onstop = null;
          try { if (rec.state !== "inactive") rec.stop(); } catch { /* egal */ }
          release();
        },
      };
    },
    (err) => {
      leaveRecordSession();
      throw { failure: failureOf(err), name: errorName(err) } satisfies RecorderError;
    },
  );
}
