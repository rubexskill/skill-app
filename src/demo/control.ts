// Demo starten, zurücksetzen, beenden. Die Demo läuft in einer eigenen Datenbank; beim Beenden wird sie gelöscht, die echten Daten bleiben unberührt.
import Dexie from "dexie";
import { db } from "../db";
import { dayKey } from "../logic";
import { DEMO_DB, demoSeededOn, isDemo, leaveDemoFlags } from "./mode";
import { fetchDemoMedia, seedDemo } from "./seed";

/** Beim Start im Demo-Modus: Daten anlegen, wenn die Demo-Datenbank neu ist oder von einem anderen Tag stammt (dann stimmen die relativen Daten wieder). */
export async function ensureDemo(): Promise<void> {
  if (!isDemo() || db.name !== DEMO_DB) return;
  const empty = (await db.skills.count()) === 0;
  if (empty || demoSeededOn() !== dayKey(new Date())) await seedDemo(Date.now(), await fetchDemoMedia());
}

export async function resetDemo(): Promise<void> {
  if (!isDemo()) return;
  await seedDemo(Date.now(), await fetchDemoMedia());
  location.reload();
}

/** Demo beenden: Demo-Datenbank löschen, Demo-Einstellungen entfernen, mit der normalen Datenbank neu starten */
export async function endDemo(): Promise<void> {
  db.close();
  await Dexie.delete(DEMO_DB);
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k?.startsWith("demo.")) keys.push(k); }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch { /* egal */ }
  leaveDemoFlags();
  location.reload();
}
