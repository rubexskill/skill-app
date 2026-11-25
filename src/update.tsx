// Neue App-Version: der Service Worker wartet, bis du „Neu laden“ tippst (oder die App schließt). So wird nie mitten in einer Übung neu geladen.
import { useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";

type Listener = (ready: boolean) => void;
let ready = false;
let apply: ((reload?: boolean) => Promise<void>) | null = null;
const listeners = new Set<Listener>();
const set = (v: boolean) => { ready = v; listeners.forEach((l) => l(v)); };

/** Nach der Anmeldung regelmäßig nachsehen, ob es eine neue Version gibt (beim Zurückkehren in die App und stündlich). */
export function startUpdates() {
  if (!("serviceWorker" in navigator)) return;
  apply = registerSW({
    immediate: true,
    onNeedRefresh() { set(true); },
    onRegisteredSW(_url, reg) {
      if (!reg) return;
      const check = () => { if (navigator.onLine) void reg.update().catch(() => undefined); };
      document.addEventListener("visibilitychange", () => { if (!document.hidden) check(); });
      window.setInterval(check, 60 * 60 * 1000);
    },
  });
}

export const applyUpdate = () => (apply ? apply(true) : Promise.resolve(location.reload()));

export function useUpdateReady(): boolean {
  const [v, setV] = useState(ready);
  useEffect(() => { listeners.add(setV); setV(ready); return () => void listeners.delete(setV); }, []);
  return v;
}

/** Dezenter Hinweis über der Tab-Leiste */
export function UpdateNotice() {
  const on = useUpdateReady();
  if (!on) return null;
  return (
    <div className="update-notice" role="status">
      <span>Update bereit</span>
      <button onClick={() => void applyUpdate()}>Neu laden</button>
    </div>
  );
}
