/** Selbstaufnahme mit dem Mikrofon (MediaRecorder). Alles lokal, kein Upload. */

export const RECORDER_TYPES = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];

/** Erstes Format, das der Browser aufnehmen kann (iPhone: mp4/AAC, Chrome: webm/Opus). */
export function pickRecorderMime(isSupported: (type: string) => boolean): string | undefined {
  return RECORDER_TYPES.find((t) => isSupported(t));
}

export const recorderSupported = (): boolean => typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

export type RecorderFailure = "denied" | "none" | "unsupported" | "other";

/** Ruhige Hinweise statt Fehlermeldungen. */
export const RECORDER_HINT: Record<RecorderFailure, string> = {
  denied: "Der Zugriff auf das Mikrofon ist ausgeschaltet. Erlaube ihn in den Einstellungen von Safari bzw. der App und versuche es noch einmal.",
  none: "Auf diesem Gerät wurde kein Mikrofon gefunden.",
  unsupported: "Aufnehmen geht in diesem Browser nicht. Auf iPhone und iPad funktioniert es in Safari und in der installierten App.",
  other: "Die Aufnahme konnte nicht gestartet werden. Versuche es gleich noch einmal.",
};

export function failureOf(err: unknown): RecorderFailure {
  const name = (err as { name?: string })?.name;
  if (name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError") return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError" || name === "DevicesNotFoundError") return "none";
  return "other";
}

export interface ActiveRecording {
  stop: () => Promise<{ blob: Blob; duration: number; mime: string }>;
  cancel: () => void;
}

/** Fragt (beim ersten Mal) das Mikrofon ab und beginnt. Wirft ein Objekt { failure } statt roher Fehler. */
export async function startRecording(): Promise<ActiveRecording> {
  if (!recorderSupported()) throw { failure: "unsupported" as RecorderFailure };
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
  } catch (err) {
    throw { failure: failureOf(err) };
  }
  const mime = pickRecorderMime((t) => MediaRecorder.isTypeSupported?.(t) ?? false);
  let rec: MediaRecorder;
  try {
    rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
  } catch {
    stream.getTracks().forEach((t) => t.stop());
    throw { failure: "other" as RecorderFailure };
  }
  const chunks: Blob[] = [];
  const t0 = performance.now();
  rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
  rec.start(1000);
  const release = () => stream.getTracks().forEach((t) => t.stop());
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
}
