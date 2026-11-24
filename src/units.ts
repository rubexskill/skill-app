import { db, uid, type ClipMeta, type Part, type PartNote, type Recording, type Unit, type UnitStatus } from "./db";

/** Unterpunkte („Stücke“), Abschnitte und Clips. Videos liegen nur lokal in IndexedDB (clipBlobs). */

export const CLIP_WARN_BYTES = 100 * 1024 * 1024;
export const LOOP_SPEEDS = [0.25, 0.5, 0.75, 1] as const;

// ---------------- Unterpunkte ----------------

export async function createUnit(skillId: string, title: string): Promise<Unit> {
  const count = await db.units.where("skillId").equals(skillId).count();
  const unit: Unit = { id: uid(), skillId, title: title.trim() || "Neues Stück", status: "lerne", note: "", nextNote: null, order: count, createdAt: Date.now() };
  await db.units.add(unit);
  return unit;
}

export async function updateUnit(id: string, patch: Partial<Unit>) {
  await db.units.update(id, patch);
}

export const setUnitStatus = (id: string, status: UnitStatus) => updateUnit(id, { status });

/** Löscht den Unterpunkt samt Abschnitten und Clips. Sessions bleiben beim Skill (Zeit geht nicht verloren). Gibt „Rückgängig“ zurück. */
export async function deleteUnit(id: string): Promise<() => Promise<void>> {
  const unit = await db.units.get(id);
  const parts = await db.parts.where("unitId").equals(id).toArray();
  const sessions = await db.sessions.where("unitId").equals(id).toArray();
  const records = await db.records.filter((r) => r.unitId === id).toArray();
  const blobs = (await db.clipBlobs.bulkGet(parts.flatMap((p) => p.clips.map((c) => c.id)))).filter((b): b is NonNullable<typeof b> => !!b);
  const recs = await db.recordings.where("unitId").equals(id).toArray();
  const recBlobs = (await db.recBlobs.bulkGet(recs.map((r) => r.id))).filter((b): b is NonNullable<typeof b> => !!b);
  await db.transaction("rw", [db.units, db.parts, db.clipBlobs, db.sessions, db.records, db.recordings, db.recBlobs], async () => {
    await db.recBlobs.bulkDelete(recBlobs.map((b) => b.id));
    await db.recordings.bulkDelete(recs.map((r) => r.id));
    await db.parts.bulkDelete(parts.map((p) => p.id));
    await db.clipBlobs.bulkDelete(blobs.map((b) => b.id));
    await db.sessions.where("unitId").equals(id).modify((s) => { delete s.unitId; });
    await db.records.filter((r) => r.unitId === id).modify((r) => { delete r.unitId; });
    await db.units.delete(id);
  });
  return async () => {
    await db.transaction("rw", [db.units, db.parts, db.clipBlobs, db.sessions, db.records, db.recordings, db.recBlobs], async () => {
      if (unit) await db.units.put(unit);
      await db.recordings.bulkPut(recs);
      await db.recBlobs.bulkPut(recBlobs);
      await db.parts.bulkPut(parts);
      await db.clipBlobs.bulkPut(blobs);
      await db.sessions.bulkPut(sessions);
      await db.records.bulkPut(records);
    });
  };
}

export function unitProgress(parts: Pick<Part, "solid">[]): { solid: number; total: number } {
  return { solid: parts.filter((p) => p.solid).length, total: parts.length };
}

// ---------------- Abschnitte ----------------

export async function createPart(unitId: string, name: string): Promise<Part> {
  const count = await db.parts.where("unitId").equals(unitId).count();
  const part: Part = { id: uid(), unitId, name: name.trim() || `Abschnitt ${count + 1}`, order: count, solid: false, notes: [], links: [], clips: [], loops: 0, createdAt: Date.now() };
  await db.parts.add(part);
  return part;
}

export async function updatePart(id: string, patch: Partial<Part>) {
  await db.parts.update(id, patch);
}

export async function deletePart(id: string): Promise<() => Promise<void>> {
  const part = await db.parts.get(id);
  const blobs = part ? (await db.clipBlobs.bulkGet(part.clips.map((c) => c.id))).filter((b): b is NonNullable<typeof b> => !!b) : [];
  const recs = await db.recordings.where("partId").equals(id).toArray();
  const recBlobs = (await db.recBlobs.bulkGet(recs.map((r) => r.id))).filter((b): b is NonNullable<typeof b> => !!b);
  await db.transaction("rw", [db.parts, db.clipBlobs, db.recordings, db.recBlobs], async () => {
    await db.clipBlobs.bulkDelete(blobs.map((b) => b.id));
    await db.recBlobs.bulkDelete(recBlobs.map((b) => b.id));
    await db.recordings.bulkDelete(recs.map((r) => r.id));
    await db.parts.delete(id);
  });
  return async () => {
    await db.transaction("rw", [db.parts, db.clipBlobs, db.recordings, db.recBlobs], async () => {
      if (part) await db.parts.put(part);
      await db.clipBlobs.bulkPut(blobs);
      await db.recordings.bulkPut(recs);
      await db.recBlobs.bulkPut(recBlobs);
    });
  };
}

/** Abschnitt eine Stelle nach oben (-1) oder unten (+1) schieben. */
export async function movePart(id: string, dir: -1 | 1) {
  const part = await db.parts.get(id);
  if (!part) return;
  const siblings = (await db.parts.where("unitId").equals(part.unitId).toArray()).sort((a, b) => a.order - b.order);
  const i = siblings.findIndex((p) => p.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= siblings.length) return;
  [siblings[i], siblings[j]] = [siblings[j], siblings[i]];
  await db.transaction("rw", db.parts, async () => {
    for (const [k, p] of siblings.entries()) if (p.order !== k) await db.parts.update(p.id, { order: k });
  });
}

export async function addUnitNote(unitId: string, text: string) {
  const t = text.trim();
  if (!t) return;
  const unit = await db.units.get(unitId);
  if (!unit) return;
  await db.units.update(unitId, { notes: [{ id: uid(), text: t, at: Date.now() }, ...(unit.notes ?? [])] });
}

export async function removeUnitNote(unitId: string, noteId: string): Promise<() => Promise<void>> {
  const unit = await db.units.get(unitId);
  const before = unit?.notes ?? [];
  await db.units.update(unitId, { notes: before.filter((n) => n.id !== noteId) });
  return async () => void (await db.units.update(unitId, { notes: before }));
}

/** Das frühere Einzelfeld `note` wird zur ersten Notiz der Liste. */
export async function migrateUnitNote(unit: Unit) {
  if (unit.note.trim() && !(unit.notes?.length)) await db.units.update(unit.id, { notes: [{ id: uid(), text: unit.note.trim(), at: unit.createdAt }], note: "" });
}

export async function addPartNote(partId: string, text: string) {
  const t = text.trim();
  if (!t) return;
  const part = await db.parts.get(partId);
  if (!part) return;
  const note: PartNote = { id: uid(), text: t, at: Date.now() };
  await db.parts.update(partId, { notes: [note, ...part.notes] });
}

export async function removePartNote(partId: string, noteId: string): Promise<() => Promise<void>> {
  const part = await db.parts.get(partId);
  const before = part?.notes ?? [];
  await db.parts.update(partId, { notes: before.filter((n) => n.id !== noteId) });
  return async () => void (await db.parts.update(partId, { notes: before }));
}

/** Die Schleife ist einmal durchgelaufen: Übungszähler +1. */
export async function addLoop(partId: string) {
  await db.transaction("rw", db.parts, async () => {
    const part = await db.parts.get(partId);
    if (part) await db.parts.update(partId, { loops: (part.loops ?? 0) + 1 });
  });
}

// ---------------- Clips ----------------

export interface ClipStorage {
  /** Videos */
  clipBytes: number;
  /** Aufnahmen */
  recBytes?: number;
  /** Anzahl der Aufnahmen (alle Stücke) */
  recCount?: number;
  count: number;
  usage?: number;
  quota?: number;
}

export async function clipStorage(): Promise<ClipStorage> {
  const parts = await db.parts.toArray();
  const metas = parts.flatMap((p) => p.clips);
  const recs = await db.recordings.toArray();
  const est = await navigator.storage?.estimate?.().catch(() => undefined);
  return { clipBytes: metas.reduce((n, c) => n + c.size, 0), recBytes: recs.reduce((n, r) => n + r.size, 0), recCount: recs.length, count: metas.length + recs.length, usage: est?.usage, quota: est?.quota };
}

export const sizeLabel = (bytes: number) => (bytes <= 0 ? "0 KB" : bytes >= 1024 * 1024 * 1024 ? `${(bytes / 1024 ** 3).toFixed(1)} GB` : bytes >= 1024 * 1024 ? `${Math.round(bytes / 1024 / 1024)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`).replace(".", ",");

/** Hinweis zum Speicher oder null, wenn alles in Ordnung ist. */
export function storageWarning(s: ClipStorage, extra = 0): string | null {
  const free = s.quota != null && s.usage != null ? s.quota - s.usage : undefined;
  if (free != null && extra > free) return `Dafür ist nicht genug Speicher frei (frei: ${sizeLabel(Math.max(0, free))}).`;
  if (free != null && s.quota && (s.usage! + extra) / s.quota > 0.8) return `Der Speicher dieser App ist fast voll (frei: ${sizeLabel(Math.max(0, free))}). Lösche alte Clips oder nimm kürzere auf.`;
  const media = s.clipBytes + (s.recBytes ?? 0);
  if (media + extra > CLIP_WARN_BYTES) return `Clips und Aufnahmen belegen ${sizeLabel(media + extra)}. Kurze Clips (wenige Sekunden pro Abschnitt) und kurze Aufnahmen halten die App schnell.`;
  return null;
}

export async function addClip(partId: string, file: File): Promise<ClipMeta> {
  const part = await db.parts.get(partId);
  if (!part) throw new Error("Abschnitt nicht gefunden");
  const duration = await videoDuration(file);
  const meta: ClipMeta = { id: uid(), name: file.name || "Clip", size: file.size, addedAt: Date.now(), ...(duration ? { duration } : {}) };
  await db.transaction("rw", [db.parts, db.clipBlobs], async () => {
    await db.clipBlobs.put({ id: meta.id, blob: file });
    await db.parts.update(partId, { clips: [...part.clips, meta] });
  });
  return meta;
}

export async function removeClip(partId: string, clipId: string): Promise<() => Promise<void>> {
  const part = await db.parts.get(partId);
  const blob = await db.clipBlobs.get(clipId);
  const before = part?.clips ?? [];
  await db.transaction("rw", [db.parts, db.clipBlobs], async () => {
    await db.clipBlobs.delete(clipId);
    await db.parts.update(partId, { clips: before.filter((c) => c.id !== clipId) });
  });
  return async () => {
    await db.transaction("rw", [db.parts, db.clipBlobs], async () => {
      if (blob) await db.clipBlobs.put(blob);
      await db.parts.update(partId, { clips: before });
    });
  };
}

export async function setClipRange(partId: string, clipId: string, start: number | undefined, end: number | undefined) {
  const part = await db.parts.get(partId);
  if (!part) return;
  await db.parts.update(partId, { clips: part.clips.map((c) => (c.id === clipId ? { ...c, start, end } : c)) });
}

export async function renameClip(partId: string, clipId: string, name: string) {
  const part = await db.parts.get(partId);
  if (!part || !name.trim()) return;
  await db.parts.update(partId, { clips: part.clips.map((c) => (c.id === clipId ? { ...c, name: name.trim() } : c)) });
}

function videoDuration(file: Blob): Promise<number | undefined> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") return resolve(undefined);
    const v = document.createElement("video");
    const url = URL.createObjectURL(file);
    const done = (d?: number) => { URL.revokeObjectURL(url); resolve(d && isFinite(d) ? d : undefined); };
    v.preload = "metadata";
    v.onloadedmetadata = () => done(v.duration);
    v.onerror = () => done();
    window.setTimeout(() => done(), 4000);
    v.src = url;
  });
}

// ---------------- Clips sichern und wiederherstellen ----------------
// Clips sind nicht Teil des normalen Backups. Der Export legt die Videos als einzelne Dateien ab (Teilen-Menü bzw. Download),
// der Dateiname enthält die Clip-ID. Beim Import werden Dateien über diese ID wieder den Clips zugeordnet.

const EXT_BY_TYPE: Record<string, string> = { "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm", "video/x-m4v": "m4v" };

export function clipFileName(meta: ClipMeta, type: string): string {
  const base = meta.name.replace(/\.[^.]+$/, "").replace(/[^\p{L}\p{N}_-]+/gu, "-").slice(0, 40) || "clip";
  const ext = EXT_BY_TYPE[type] ?? (/\.([a-z0-9]{2,4})$/i.exec(meta.name)?.[1].toLowerCase() ?? "mp4");
  return `skills-clip_${meta.id}_${base}.${ext}`;
}

const AUDIO_EXT: Record<string, string> = { "audio/mp4": "m4a", "audio/aac": "aac", "audio/webm": "webm", "audio/ogg": "ogg", "audio/mpeg": "mp3", "audio/wav": "wav" };

export function recordingFileName(r: Pick<Recording, "id" | "name" | "mime">): string {
  const base = r.name.replace(/[^\p{L}\p{N}_-]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "aufnahme";
  const ext = AUDIO_EXT[r.mime.split(";")[0]] ?? "m4a";
  return `skills-aufnahme_${r.id}_${base}.${ext}`;
}

export async function exportClipFiles(): Promise<File[]> {
  const parts = await db.parts.toArray();
  const files: File[] = [];
  for (const p of parts) for (const c of p.clips) {
    const b = await db.clipBlobs.get(c.id);
    if (b) files.push(new File([b.blob], clipFileName(c, b.blob.type), { type: b.blob.type || "video/mp4" }));
  }
  for (const r of await db.recordings.toArray()) {
    const b = await db.recBlobs.get(r.id);
    if (b) files.push(new File([b.blob], recordingFileName(r), { type: b.blob.type || r.mime || "audio/mp4" }));
  }
  return files;
}

/** Ordnet Dateien über die Clip-ID im Namen zu. Gibt (zugeordnet, nicht zuordenbar) zurück. */
export async function importClipFiles(files: File[]): Promise<{ matched: number; unmatched: number }> {
  const parts = await db.parts.toArray();
  const known = new Set(parts.flatMap((p) => p.clips.map((c) => c.id)));
  const knownRec = new Set((await db.recordings.toCollection().primaryKeys()) as string[]);
  let matched = 0, unmatched = 0;
  for (const f of files) {
    const m = /skills-(clip|aufnahme)_([a-z0-9]+)_/i.exec(f.name);
    const id = m?.[2];
    if (id && m?.[1].toLowerCase() === "clip" && known.has(id)) {
      await db.clipBlobs.put({ id, blob: f });
      matched++;
    } else if (id && m?.[1].toLowerCase() === "aufnahme" && knownRec.has(id)) {
      await db.recBlobs.put({ id, blob: f });
      matched++;
    } else unmatched++;
  }
  return { matched, unmatched };
}

/** Clips ohne Video (z. B. nach Backup-Import auf einem neuen Gerät). */
export async function missingClipIds(): Promise<Set<string>> {
  const parts = await db.parts.toArray();
  const ids = parts.flatMap((p) => p.clips.map((c) => c.id));
  const have = new Set((await db.clipBlobs.toCollection().primaryKeys()) as string[]);
  return new Set(ids.filter((id) => !have.has(id)));
}

/** Aufnahmen ohne Audiodatei (z. B. nach Backup-Import auf einem neuen Gerät). */
export async function missingRecordingIds(): Promise<Set<string>> {
  const ids = (await db.recordings.toCollection().primaryKeys()) as string[];
  const have = new Set((await db.recBlobs.toCollection().primaryKeys()) as string[]);
  return new Set(ids.filter((id) => !have.has(id)));
}

// ---------------- Selbstaufnahmen ----------------

export async function recordingsOf(unitId: string, partId: string | null): Promise<Recording[]> {
  const all = await db.recordings.where("unitId").equals(unitId).toArray();
  return all.filter((r) => (r.partId ?? null) === partId).sort((a, b) => b.at - a.at);
}

/** Alle Aufnahmen eines Stücks (mit allen Abschnitten) oder einer Auswahl. */
export async function recordingsOfUnit(unitId: string): Promise<Recording[]> {
  return db.recordings.where("unitId").equals(unitId).toArray();
}

/** Mehrere Aufnahmen auf einmal löschen. Gibt „Rückgängig“ zurück. */
export async function removeRecordings(ids: string[]): Promise<() => Promise<void>> {
  const recs = (await db.recordings.bulkGet(ids)).filter((r): r is Recording => !!r);
  const blobs = (await db.recBlobs.bulkGet(ids)).filter((b): b is NonNullable<typeof b> => !!b);
  await db.transaction("rw", [db.recordings, db.recBlobs], async () => {
    await db.recBlobs.bulkDelete(blobs.map((b) => b.id));
    await db.recordings.bulkDelete(recs.map((r) => r.id));
  });
  return async () => {
    await db.transaction("rw", [db.recordings, db.recBlobs], async () => {
      await db.recordings.bulkPut(recs);
      await db.recBlobs.bulkPut(blobs);
    });
  };
}

export function defaultRecordingName(at: number): string {
  const d = new Date(at);
  const p = (n: number) => String(n).padStart(2, "0");
  return `Aufnahme ${p(d.getDate())}.${p(d.getMonth() + 1)}. ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export async function addRecording(input: { unitId: string; partId?: string | null; blob: Blob; duration: number; mime?: string }): Promise<Recording> {
  const at = Date.now();
  const rec: Recording = {
    id: uid(), unitId: input.unitId, ...(input.partId ? { partId: input.partId } : {}), name: defaultRecordingName(at), note: "", at,
    duration: Math.max(0, Math.round(input.duration * 10) / 10), size: input.blob.size, mime: input.mime || input.blob.type || "audio/mp4",
  };
  await db.transaction("rw", [db.recordings, db.recBlobs], async () => {
    await db.recBlobs.put({ id: rec.id, blob: input.blob });
    await db.recordings.add(rec);
  });
  return rec;
}

export async function updateRecording(id: string, patch: Partial<Pick<Recording, "name" | "note">>) {
  const clean = { ...patch };
  if (clean.name !== undefined && !clean.name.trim()) delete clean.name;
  if (clean.name !== undefined) clean.name = clean.name.trim();
  await db.recordings.update(id, clean);
}

export async function removeRecording(id: string): Promise<() => Promise<void>> {
  const rec = await db.recordings.get(id);
  const blob = await db.recBlobs.get(id);
  await db.transaction("rw", [db.recordings, db.recBlobs], async () => {
    await db.recBlobs.delete(id);
    await db.recordings.delete(id);
  });
  return async () => {
    await db.transaction("rw", [db.recordings, db.recBlobs], async () => {
      if (rec) await db.recordings.put(rec);
      if (blob) await db.recBlobs.put(blob);
    });
  };
}

// ---------------- Metronom pro Stück/Abschnitt ----------------

export async function setPartMetronome(id: string, patch: { bpm?: number; meter?: string }) {
  await db.parts.update(id, patch);
}
export async function setUnitMetronome(id: string, patch: { bpm?: number; meter?: string }) {
  await db.units.update(id, patch);
}
