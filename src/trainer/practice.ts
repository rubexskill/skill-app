// Übungszeit der Trainer: volle Minuten werden Sessions des Skills, der Rest wird für später gesammelt.
import { db, uid } from "../db";
import { loadSetting, saveSetting } from "../logic";

/** Sammelt Übungszeit: volle Minuten werden Sessions, der Rest bleibt für später. */
export function splitMinutes(pendingMs: number, addMs: number): { minutes: number; pending: number } {
  const total = Math.max(0, pendingMs) + Math.max(0, addMs);
  const minutes = Math.floor(total / 60000);
  return { minutes, pending: total - minutes * 60000 };
}

/** Übungszeit zählt als normale Lernzeit des Skills. `key` trennt die Restzeit je Trainer. Gibt die neu gespeicherten Minuten zurück. */
export async function addPracticeTimeFor(key: string, skillId: string, addMs: number, now = Date.now()): Promise<number> {
  const { minutes, pending } = splitMinutes(loadSetting<number>(key, 0), addMs);
  saveSetting(key, pending);
  if (minutes >= 1) await db.sessions.add({ id: uid(), skillId, start: now - minutes * 60000, minutes });
  return minutes;
}
