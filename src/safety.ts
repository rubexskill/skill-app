// Datensicherheit: dauerhafter Speicher, Speicherstand und dezente Backup-Erinnerung.
import { loadSetting, saveSetting } from "./logic";

export interface StorageInfo { supported: boolean; persisted: boolean | null; usage: number | null; quota: number | null }

export async function storageInfo(): Promise<StorageInfo> {
  const st = typeof navigator !== "undefined" ? navigator.storage : undefined;
  if (!st) return { supported: false, persisted: null, usage: null, quota: null };
  const persisted = await st.persisted?.().catch(() => null) ?? null;
  const est = await st.estimate?.().catch(() => undefined);
  return { supported: true, persisted, usage: est?.usage ?? null, quota: est?.quota ?? null };
}

/** Bittet den Browser, die Daten nicht automatisch zu löschen. null = nicht unterstützt. */
export async function requestPersistence(): Promise<boolean | null> {
  const st = typeof navigator !== "undefined" ? navigator.storage : undefined;
  if (!st?.persist) return null;
  try {
    if (await st.persisted?.()) return true;
    return await st.persist();
  } catch {
    return false;
  }
}

export function storageLabel(i: StorageInfo): { text: string; ok: boolean } {
  if (!i.supported) return { text: "Dieser Browser kann den Speicher nicht schützen. Sicherungen sind wichtig.", ok: false };
  if (i.persisted) return { text: "Geschützt: Der Browser löscht diese Daten nicht von selbst.", ok: true };
  return { text: "Nicht geschützt: Der Browser darf Daten bei Platzmangel oder langer Pause löschen. Backups machen.", ok: false };
}

// ---------------- Backup-Erinnerung ----------------

export const REMIND_DAYS = 14;
const K_LAST = "backup.last", K_SINCE = "backup.since", K_REMIND = "backup.remind";

export interface BackupState { last: number | null; since: number; remind: boolean }

export function loadBackupState(now = Date.now()): BackupState {
  let since = loadSetting<number>(K_SINCE, 0);
  if (!since) { since = now; saveSetting(K_SINCE, since); }
  return { last: loadSetting<number | null>(K_LAST, null), since, remind: loadSetting<boolean>(K_REMIND, true) };
}
export const markBackup = (now = Date.now()) => saveSetting(K_LAST, now);
export const setRemind = (on: boolean) => saveSetting(K_REMIND, on);

const DAY = 86400000;
/** „Seit X Tagen kein Backup“ – erst nach REMIND_DAYS Tagen, nur wenn Daten da sind und die Erinnerung an ist. */
export function reminderText(s: BackupState, now: number, hasData: boolean): string | null {
  if (!s.remind || !hasData) return null;
  const days = Math.floor((now - (s.last ?? s.since)) / DAY);
  if (days < REMIND_DAYS) return null;
  return s.last ? `Seit ${days} Tagen kein Backup.` : `Noch kein Backup, die App wird seit ${days} Tagen benutzt.`;
}
