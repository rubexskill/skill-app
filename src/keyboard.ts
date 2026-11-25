// Bildschirmtastatur (iOS): Eingabefelder bleiben sichtbar. Die Höhe der Tastatur steht in --kb; beim Fokus wird das Feld ins Bild gescrollt.
export const kbHeight = (innerH: number, vv: { height: number; offsetTop: number } | null | undefined): number =>
  vv ? Math.max(0, Math.round(innerH - vv.height - vv.offsetTop)) : 0;

/** Wie weit (in px) muss nach unten gescrollt werden, damit ein Feld über der Tastatur und unter der Kopfzeile liegt? Negativ = nach oben. */
export function scrollDelta(rect: { top: number; bottom: number }, innerH: number, kb: number, margin = 16, topInset = 64): number {
  const bottomLimit = innerH - kb - margin;
  if (rect.bottom > bottomLimit) return Math.round(rect.bottom - bottomLimit);
  if (rect.top < topInset) return Math.round(rect.top - topInset);
  return 0;
}

const scrollParent = (el: HTMLElement): HTMLElement | null => {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const o = getComputedStyle(p).overflowY;
    if ((o === "auto" || o === "scroll") && p.scrollHeight > p.clientHeight) return p;
  }
  return null;
};

const EDITABLE = "input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]):not([type=date]), textarea";

export function initKeyboard() {
  const root = document.documentElement;
  const vv = window.visualViewport;
  const update = () => root.style.setProperty("--kb", `${kbHeight(window.innerHeight, vv)}px`);
  update();
  vv?.addEventListener("resize", update);
  vv?.addEventListener("scroll", update);
  const reveal = (el: HTMLElement) => {
    const kb = parseFloat(getComputedStyle(root).getPropertyValue("--kb")) || 0;
    const d = scrollDelta(el.getBoundingClientRect(), window.innerHeight, kb);
    if (!d) return;
    const sp = scrollParent(el);
    if (sp) sp.scrollBy({ top: d, behavior: "auto" });
  };
  document.addEventListener("focusin", (e) => {
    const t = e.target as HTMLElement | null;
    if (!t?.matches?.(EDITABLE)) return;
    // die Tastatur fährt erst nach dem Fokus ein
    for (const ms of [60, 350, 700]) window.setTimeout(() => { if (document.activeElement === t) reveal(t); }, ms);
  });
  vv?.addEventListener("resize", () => { const a = document.activeElement as HTMLElement | null; if (a?.matches?.(EDITABLE)) reveal(a); });
}
