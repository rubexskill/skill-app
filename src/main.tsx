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

// Nur im Entwicklungsmodus: Datenbank für automatisierte Tests erreichbar machen.
if (import.meta.env.DEV) void import("./db").then(({ db }) => ((window as unknown as { db: unknown }).db = db));
