import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import { applyTheme } from "./theme";
import { ensureFlagSkill } from "./trainer/flags/store";
import { requestPersistence } from "./safety";
import { ensureCubeSkill } from "./trainer/cube/store";
import { db } from "./db";
import { Boundary, StartupError } from "./components/ErrorScreen";
import { startUpdates } from "./update";
import { initKeyboard } from "./keyboard";
import { ensureDemo } from "./demo/control";
import { applyRecordClass } from "./demo/mode";

applyTheme();
initKeyboard();

// /design-vorschau ohne Schrägstrich → zur Vorschau-Seite
if (location.pathname.endsWith("/design-vorschau")) location.replace(`${location.pathname}/${location.search}`);

// Damit :active auf iOS sofort beim Antippen greift.
document.addEventListener("touchstart", () => {}, { passive: true });

// Bittet den Browser, die Daten nicht automatisch zu löschen.
void requestPersistence();

const root = createRoot(document.getElementById("root")!);
// Erst die Datenbank öffnen: scheitert das (privater Modus, Speicher gesperrt), gibt es eine ruhige Fehlerseite statt einer leeren.
db.open().then(
  async () => {
    await ensureDemo().catch(() => undefined); // nur im Demo-Modus
    applyRecordClass();
    void ensureFlagSkill().then(() => ensureCubeSkill()).catch(() => undefined);
    root.render(<StrictMode><Boundary><App /></Boundary></StrictMode>);
    startUpdates();
  },
  (error) => root.render(<StartupError error={error} />),
);

// Nur im Entwicklungsmodus oder in Test-Builds (VITE_EXPOSE=1): Datenbank und Logik für automatisierte Tests erreichbar machen.
if (import.meta.env.DEV || import.meta.env.VITE_EXPOSE === "1") {
  void Promise.all([import("./db"), import("./logic"), import("./sync"), import("./units"), import("./tidy"), import("./trainer/flags/data"), import("./trainer/flags/logic"), import("./trainer/flags/store"), import("./trainer/cube/engine"), import("./trainer/cube/store"), import("./trainer/cube/path")]).then(([{ db }, logic, sync, units, tidy, flagsData, flagsLogic, flagsStore, cubeEngine, cubeStore, cubePath]) => {
    const w = window as unknown as Record<string, unknown>;
    w.db = db;
    w.app = { logic, sync, units, tidy, flags: { data: flagsData, logic: flagsLogic, store: flagsStore }, cube: { engine: cubeEngine, store: cubeStore, path: cubePath } };
  });
}
