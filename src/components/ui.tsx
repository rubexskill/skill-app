import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Icon } from "./Icon";

// ---------------- Hooks ----------------

/** Liefert jede Sekunde die aktuelle Zeit – nur solange `active` true ist. */
export function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    const onVis = () => setNow(Date.now());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(t);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [active]);
  return now;
}

/** Hält ein Element nach dem Schließen noch so lange im DOM, bis die Animation fertig ist. */
function usePresence(open: boolean, ms = 450) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      let r2 = 0;
      const r1 = requestAnimationFrame(() => {
        r2 = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(r1);
        cancelAnimationFrame(r2);
      };
    }
    setShown(false);
    const t = window.setTimeout(() => setMounted(false), ms);
    return () => window.clearTimeout(t);
  }, [open, ms]);
  return { mounted, shown };
}

// Zählt offene Sheets, damit die App dahinter „zurücktritt“ (wie in iOS).
let openSheets = 0;
function useSheetBackdrop(active: boolean) {
  useEffect(() => {
    if (!active) return;
    openSheets++;
    document.documentElement.classList.add("has-sheet");
    return () => {
      openSheets--;
      if (openSheets <= 0) document.documentElement.classList.remove("has-sheet");
    };
  }, [active]);
}

// ---------------- Navigationsseite mit großem Titel ----------------

interface NavPageProps {
  title: string;
  eyebrow?: ReactNode;
  sub?: ReactNode;
  back?: { label: string; onClick: () => void };
  leading?: ReactNode;
  trailing?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
}

export function NavPage({ title, eyebrow, sub, back, leading, trailing, header, children }: NavPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const scrolledRef = useRef(false);
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const s = e.currentTarget.scrollTop > (eyebrow ? 52 : 34);
    if (s !== scrolledRef.current) {
      scrolledRef.current = s;
      setScrolled(s);
    }
  };

  return (
    <div className="navpage">
      <header className={`navbar${scrolled ? " is-scrolled" : ""}`}>
        <div className="navbar-inner">
          <div className="navbar-side">
            {back ? (
              <button className="nav-back" onClick={back.onClick}>
                <Icon name="chevron-left" size={22} />
                <span>{back.label}</span>
              </button>
            ) : (
              leading
            )}
          </div>
          <div className="navbar-title">{title}</div>
          <div className="navbar-side navbar-trailing">{trailing}</div>
        </div>
      </header>
      <div className="scroller" onScroll={onScroll}>
        <div className="navbar-spacer" />
        <div className="large-title-wrap">
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1 className="large-title">{title}</h1>
          {sub && <div className="large-sub">{sub}</div>}
        </div>
        {header}
        <div className="page-content">{children}</div>
        <div className="bottom-spacer" />
      </div>
    </div>
  );
}

export function NavButton({ icon, label, onClick, bold }: { icon?: string; label?: string; onClick: () => void; bold?: boolean }) {
  return (
    <button className={`nav-btn${bold ? " is-bold" : ""}`} onClick={onClick} aria-label={label}>
      {icon ? <Icon name={icon} size={24} /> : label}
    </button>
  );
}

// ---------------- Gruppierte Listen ----------------

export function Group({ header, footer, children, className }: { header?: ReactNode; footer?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`group ${className ?? ""}`}>
      {header && <div className="group-header">{header}</div>}
      <div className="group-body">{children}</div>
      {footer && <div className="group-footer">{footer}</div>}
    </section>
  );
}

interface RowProps {
  title: ReactNode;
  subtitle?: ReactNode;
  detail?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  onClick?: () => void;
  tone?: "accent" | "danger";
  center?: boolean;
  muted?: boolean;
  selected?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Row({ title, subtitle, detail, leading, trailing, chevron, onClick, tone, center, muted, selected, className, style }: RowProps) {
  const cls = ["row", onClick ? "is-tappable" : "", tone ? `tone-${tone}` : "", center ? "is-center" : "", leading ? "has-leading" : "", selected ? "is-selected" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} style={style} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => { if (onClick && (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) { e.preventDefault(); onClick(); } }}>
      {leading && <div className="row-leading">{leading}</div>}
      <div className="row-main">
        <div className={`row-title${muted ? " is-muted" : ""}`}>{title}</div>
        {subtitle && <div className="row-subtitle">{subtitle}</div>}
      </div>
      {detail != null && <div className="row-detail">{detail}</div>}
      {trailing}
      {chevron && <Icon name="chevron-right" size={15} className="row-chevron" />}
    </div>
  );
}

// ---------------- Wisch-Aktionen ----------------

export interface SwipeAction {
  label: string;
  tone: "danger" | "accent" | "gray" | "ok";
  onClick: () => void;
}

const ACTION_W = 82;

/** `leading`: Aktion beim Wischen nach rechts (z. B. „Erledigt“); weit durchwischen löst sie aus. */
export function SwipeRow({ actions, leading, children }: { actions: SwipeAction[]; leading?: SwipeAction; children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef(0);
  const [offset, setOffset] = useState(0);
  const st = useRef({ x: 0, y: 0, base: 0, lock: "" as "" | "x" | "y", id: -1, moved: false });
  const max = actions.length * ACTION_W;
  const lead = leading ? ACTION_W + 14 : 0;
  const leadingRef = useRef(leading);
  leadingRef.current = leading;
  const myId = useRef(Math.random());

  useEffect(() => {
    const close = (e: Event) => {
      if ((e as CustomEvent).detail !== myId.current) setOffset(0);
    };
    window.addEventListener("swiperow-open", close);
    return () => window.removeEventListener("swiperow-open", close);
  }, []);

  const apply = (x: number, animate: boolean) => {
    const el = contentRef.current;
    if (!el) return;
    el.style.transition = animate ? "" : "none";
    el.style.transform = `translateX(${x}px)`;
    // Aktionen nur zeigen, solange die Zeile verschoben ist (sonst scheint der Rand durch).
    window.clearTimeout(hideTimer.current);
    if (x !== 0 && wrapRef.current) wrapRef.current.dataset.side = x > 0 ? "lead" : "trail";
    if (x !== 0) wrapRef.current?.classList.add("is-active");
    else hideTimer.current = window.setTimeout(() => wrapRef.current?.classList.remove("is-active"), 420);
  };

  // Gemeinsame Gestenlogik für Touch (iOS) und Maus.
  const offsetRef = useRef(0);
  offsetRef.current = offset;
  const actionsRef = useRef(actions);
  actionsRef.current = actions;
  const lastX = useRef(0);

  const begin = (x: number, y: number) => {
    st.current = { x, y, base: offsetRef.current, lock: "", id: 1, moved: false };
    lastX.current = x;
  };
  /** true = horizontale Geste, Scrollen soll unterdrückt werden */
  const move = (x: number, y: number): boolean => {
    const s = st.current;
    if (s.id < 0) return false;
    const dx = x - s.x;
    const dy = y - s.y;
    if (!s.lock) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return false;
      s.lock = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (s.lock === "x") window.dispatchEvent(new CustomEvent("swiperow-open", { detail: myId.current }));
    }
    if (s.lock !== "x") return false;
    s.moved = true;
    lastX.current = x;
    let pos = s.base + dx;
    if (pos > 0) pos = leadingRef.current ? pos : pos / 4;
    if (pos < -max) pos = -max + (pos + max) / 3;
    apply(pos, false);
    return true;
  };
  const end = () => {
    const s = st.current;
    if (s.id < 0) return;
    st.current.id = -1;
    if (s.lock !== "x") return;
    const pos = s.base + (lastX.current - s.x);
    const width = contentRef.current?.offsetWidth ?? 320;
    const el = contentRef.current;
    if (el) el.style.transition = "";
    if (leadingRef.current && pos > width * 0.42) {
      apply(width, true);
      window.setTimeout(() => { leadingRef.current?.onClick(); apply(0, false); setOffset(0); }, 220);
      return;
    }
    if (pos < -width * 0.55) {
      // Durchwischen = erste Aktion (wie in iOS)
      apply(-width, true);
      window.setTimeout(() => { actionsRef.current[0].onClick(); apply(0, false); setOffset(0); }, 220);
      return;
    }
    const next = pos < -max / 2 ? -max : leadingRef.current && pos > lead / 2 ? lead : 0;
    apply(next, true);
    setOffset(next);
  };

  // Touch: eigene Listener, damit horizontales Wischen das Scrollen blockieren darf (passive: false).
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const ts = (e: TouchEvent) => { if (e.touches.length === 1) begin(e.touches[0].clientX, e.touches[0].clientY); };
    const tm = (e: TouchEvent) => { if (e.touches.length === 1 && move(e.touches[0].clientX, e.touches[0].clientY) && e.cancelable) e.preventDefault(); };
    const te = () => end();
    el.addEventListener("touchstart", ts, { passive: true });
    el.addEventListener("touchmove", tm, { passive: false });
    el.addEventListener("touchend", te);
    el.addEventListener("touchcancel", te);
    return () => {
      el.removeEventListener("touchstart", ts);
      el.removeEventListener("touchmove", tm);
      el.removeEventListener("touchend", te);
      el.removeEventListener("touchcancel", te);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [max]);

  // Maus (Mac, Tests): Pointer-Events nur für die Maus
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    begin(e.clientX, e.clientY);
  };
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (move(e.clientX, e.clientY) && !(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
  };
  const onUp = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    end();
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (st.current.moved || offset !== 0) {
      e.stopPropagation();
      e.preventDefault();
      st.current.moved = false;
      if (offset !== 0) { apply(0, true); setOffset(0); }
    }
  };

  return (
    <div ref={wrapRef} className="swipe">
      {leading && (
        <div className={`swipe-lead tone-${leading.tone}`}>
          <button className={`swipe-action tone-${leading.tone}`} style={{ width: lead }} onClick={() => { apply(0, true); setOffset(0); leading.onClick(); }}>{leading.label}</button>
        </div>
      )}
      <div className="swipe-actions" style={{ width: max }}>
        {actions.map((a) => (
          <button key={a.label} className={`swipe-action tone-${a.tone}`} onClick={() => { apply(0, true); setOffset(0); a.onClick(); }}>
            {a.label}
          </button>
        ))}
      </div>
      <div ref={contentRef} className="swipe-content" style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onClickCapture={onClickCapture}>
        {children}
      </div>
    </div>
  );
}

// ---------------- Eingaben ----------------

export function SearchField({ value, onChange, placeholder = "Suchen" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className={`search${focused ? " is-focused" : ""}`}>
      <label className="search-field">
        <Icon name="search" size={16} className="search-icon" />
        <input ref={ref} type="search" enterKeyHint="search" value={value} placeholder={placeholder} autoCorrect="off"
          onChange={(e) => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        {value && (
          <button className="search-clear" aria-label="Löschen" onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange(""); ref.current?.focus(); }}>
            <Icon name="clear" size={18} />
          </button>
        )}
      </label>
      <button className="search-cancel" tabIndex={focused ? 0 : -1} onMouseDown={(e) => e.preventDefault()}
        onClick={() => { onChange(""); ref.current?.blur(); }}>
        Abbrechen
      </button>
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div className="segmented" style={{ ["--n" as string]: options.length, ["--i" as string]: idx }}>
      <div className="segmented-thumb" />
      {options.map((o) => (
        <button key={o.value} className={o.value === value ? "is-active" : ""} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function AutoTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    // In einem verborgenen Tab ist scrollHeight 0 – dann die CSS-Mindesthöhe lassen.
    if (el.scrollHeight > 0) el.style.height = `${el.scrollHeight}px`;
    else el.style.height = "";
  }, [props.value]);
  return <textarea ref={ref} rows={1} {...props} />;
}

export function CheckCircle({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <button className={`check${checked ? " is-checked" : ""}`} role="checkbox" aria-checked={checked} aria-label={label}
      onClick={(e) => { e.stopPropagation(); navigator.vibrate?.(8); onToggle(); }}>
      <Icon name="check" size={14} />
    </button>
  );
}

export function ProgressRing({ value, size = 56, stroke = 7 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <svg className="ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} className="ring-value" strokeWidth={stroke} strokeOpacity={v === 0 ? 0 : 1}
        strokeDasharray={`${c} ${c}`} strokeDashoffset={c * (1 - v)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>
  );
}

export function EmptyState({ icon, title, text }: { icon: string; title: string; text?: string }) {
  return (
    <div className="empty">
      <Icon name={icon} size={44} />
      <div className="empty-title">{title}</div>
      {text && <div className="empty-text">{text}</div>}
    </div>
  );
}

// ---------------- Sheet (von unten) ----------------

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  cancelLabel?: string;
  /** Linker Button macht etwas anderes als Schließen (z. B. Zurücksetzen). */
  onCancel?: () => void;
  action?: { label: string; onClick: () => void; disabled?: boolean };
  children: ReactNode;
}

export function Sheet({ open, onClose, title, cancelLabel = "Abbrechen", onCancel, action, children }: SheetProps) {
  const { mounted, shown } = usePresence(open);
  useSheetBackdrop(mounted && open);
  const panelRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ y: 0, id: -1, t: 0, dy: 0 });

  const setDrag = (dy: number, dragging: boolean) => {
    const el = panelRef.current;
    if (!el) return;
    el.classList.toggle("is-dragging", dragging);
    el.style.setProperty("--drag", `${dy}px`);
  };

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    drag.current = { y: e.clientY, id: e.pointerId, t: performance.now(), dy: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (drag.current.id !== e.pointerId) return;
    const raw = e.clientY - drag.current.y;
    const dy = raw > 0 ? raw : raw / 6;
    drag.current.dy = dy;
    setDrag(dy, true);
  };
  const onUp = (e: React.PointerEvent) => {
    if (drag.current.id !== e.pointerId) return;
    const { dy, t } = drag.current;
    drag.current.id = -1;
    const v = dy / Math.max(1, performance.now() - t);
    if (dy > 140 || (dy > 30 && v > 0.6)) {
      // Vom aktuellen Punkt aus nach unten weggleiten lassen.
      panelRef.current?.classList.remove("is-dragging");
      onClose();
    } else {
      setDrag(0, false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;
  return createPortal(
    <div className={`sheet-layer${shown && open ? " is-shown" : ""}`}>
      <div className="sheet-backdrop" onClick={onClose} />
      <div ref={panelRef} className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-head" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <div className="sheet-grabber" />
          <div className="sheet-bar">
            <button className="nav-btn" onClick={onCancel ?? onClose}>{cancelLabel}</button>
            <div className="sheet-title">{title}</div>
            {action ? (
              <button className="nav-btn is-bold" disabled={action.disabled} onClick={action.onClick}>{action.label}</button>
            ) : (
              <span className="nav-btn-placeholder" />
            )}
          </div>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

// ---------------- Aktionsblatt, Toast ----------------

export interface SheetChoice {
  label: string;
  destructive?: boolean;
  checked?: boolean;
  onSelect: () => void;
}

interface ActionSheetState {
  title?: string;
  message?: string;
  choices: SheetChoice[];
}

export interface ToastAction {
  label: string;
  run: () => void;
}

interface UIContextValue {
  toast: (text: string, action?: ToastAction) => void;
  actionSheet: (s: ActionSheetState) => void;
  /** Kleine Feier, z. B. bei „Geschafft“. Farben als CSS-Werte. */
  celebrate: (colors: string[]) => void;
  /** Löscht etwas und bietet danach „Rückgängig“ an. `run` gibt die Wiederherstellung zurück. */
  undoable: (text: string, run: () => Promise<() => Promise<void>>) => void;
}

const UIContext = createContext<UIContextValue>({ toast: () => {}, actionSheet: () => {}, celebrate: () => {}, undoable: () => {} });

/** iOS-Schalter */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={checked} aria-label={label} className={`switch${checked ? " is-on" : ""}`}
      onClick={(e) => { e.stopPropagation(); navigator.vibrate?.(6); onChange(!checked); }}>
      <span className="switch-knob" />
    </button>
  );
}

/** Ausklappbarer Bereich */
export function Disclosure({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={`disclosure${open ? " is-open" : ""}`}>
      <button className="disclosure-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>{title}</span>
        <Icon name="chevron-down" size={15} className="disclosure-chevron" />
      </button>
      {open && <div className="disclosure-body">{children}</div>}
    </section>
  );
}
export const useUI = () => useContext(UIContext);

function Celebration({ colors, onDone }: { colors: string[]; onDone: () => void }) {
  const parts = useRef(
    Array.from({ length: 26 }, (_, i) => {
      const a = (i / 26) * Math.PI * 2 + Math.random() * 0.4;
      const d = 90 + Math.random() * 120;
      return {
        x: Math.cos(a) * d,
        y: Math.sin(a) * d - 40,
        r: Math.random() * 360,
        c: colors[i % colors.length],
        w: 6 + Math.random() * 6,
        delay: Math.random() * 80,
      };
    }),
  ).current;
  useEffect(() => {
    navigator.vibrate?.([12, 40, 18]);
    const t = window.setTimeout(onDone, 1400);
    return () => window.clearTimeout(t);
  }, [onDone]);
  return createPortal(
    <div className="celebrate" aria-hidden="true">
      <div className="celebrate-ring" style={{ borderColor: colors[0] }} />
      {parts.map((p, i) => (
        <span key={i} className="celebrate-bit"
          style={{ background: p.c, width: p.w, height: p.w * 0.45, animationDelay: `${p.delay}ms`, ["--x" as string]: `${p.x}px`, ["--y" as string]: `${p.y}px`, ["--r" as string]: `${p.r}deg` }} />
      ))}
    </div>,
    document.body,
  );
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [party, setParty] = useState<{ key: number; colors: string[] } | null>(null);
  const celebrate = useCallback((colors: string[]) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setParty({ key: Date.now(), colors: colors.length ? colors : ["currentColor"] });
  }, []);
  const endParty = useCallback(() => setParty(null), []);
  const [toastText, setToastText] = useState<string | null>(null);
  const [toastAction, setToastAction] = useState<ToastAction | null>(null);
  const [toastKey, setToastKey] = useState(0);
  const [sheet, setSheet] = useState<ActionSheetState | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const toastTimer = useRef(0);

  const toast = useCallback((text: string, action?: ToastAction) => {
    setToastText(text);
    setToastAction(action ?? null);
    setToastKey((k) => k + 1);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => { setToastText(null); setToastAction(null); }, action ? 5000 : Math.max(2600, Math.min(7500, text.length * 60)));
  }, []);

  const undoable = useCallback(
    (text: string, run: () => Promise<() => Promise<void>>) => {
      void run().then((restore) => toast(text, { label: "Rückgängig", run: () => void restore() }));
    },
    [toast],
  );

  const actionSheet = useCallback((s: ActionSheetState) => {
    setSheet(s);
    setSheetOpen(true);
  }, []);

  const { mounted, shown } = usePresence(sheetOpen, 350);
  const close = () => setSheetOpen(false);

  // Mit Tastatur (iPad) lässt sich das Auswahlblatt auch mit Esc schließen
  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      setSheetOpen(false);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [sheetOpen]);

  return (
    <UIContext.Provider value={{ toast, actionSheet, celebrate, undoable }}>
      {children}
      {party && <Celebration key={party.key} colors={party.colors} onDone={endParty} />}
      {mounted && sheet &&
        createPortal(
          <div className={`as-layer${shown && sheetOpen ? " is-shown" : ""}`}>
            <div className="as-backdrop" onClick={close} />
            <div className="as-panel" role="dialog" aria-modal="true">
              <div className="as-group">
                {(sheet.title || sheet.message) && (
                  <div className="as-header">
                    {sheet.title && <div className="as-title">{sheet.title}</div>}
                    {sheet.message && <div className="as-message">{sheet.message}</div>}
                  </div>
                )}
                {sheet.choices.map((c) => (
                  <button key={c.label} className={`as-btn${c.destructive ? " is-destructive" : ""}`}
                    onClick={() => { close(); c.onSelect(); }}>
                    {c.label}
                    {c.checked && <Icon name="check" size={18} className="as-check" />}
                  </button>
                ))}
              </div>
              <button className="as-btn as-cancel" onClick={close}>Abbrechen</button>
            </div>
          </div>,
          document.body,
        )}
      {createPortal(
        <div className={`toast${toastText ? " is-shown" : ""}${toastAction ? " has-action" : ""}`} key={toastKey} role="status" aria-live="polite">
          <span>{toastText}</span>
          {toastAction && (
            <button className="toast-action" onClick={() => {
              toastAction.run();
              window.clearTimeout(toastTimer.current);
              setToastText(null);
              setToastAction(null);
            }}>
              {toastAction.label}
            </button>
          )}
        </div>,
        document.body,
      )}
    </UIContext.Provider>
  );
}
