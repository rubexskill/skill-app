import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import { applyTheme } from "./theme";

applyTheme();

// /design-vorschau ohne Schrägstrich → zur Vorschau-Seite
if (location.pathname.endsWith("/design-vorschau")) location.replace(`${location.pathname}/${location.search}`);

// Damit :active auf iOS sofort beim Antippen greift.
document.addEventListener("touchstart", () => {}, { passive: true });

// Bittet den Browser, die Daten nicht automatisch zu löschen.
void navigator.storage?.persist?.();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Nur im Entwicklungsmodus oder in Test-Builds (VITE_EXPOSE=1): Datenbank und Logik für automatisierte Tests erreichbar machen.
if (import.meta.env.DEV || import.meta.env.VITE_EXPOSE === "1") {
  void Promise.all([import("./db"), import("./logic"), import("./sync"), import("./units"), import("./tidy")]).then(([{ db }, logic, sync, units, tidy]) => {
    const w = window as unknown as Record<string, unknown>;
    w.db = db;
    w.app = { logic, sync, units, tidy };
  });
}
