import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Navigations-Stack wie UINavigationController:
 * neue Seiten gleiten von rechts herein, die darunter weicht leicht nach links.
 * Vom linken Rand nach rechts wischen = zurück.
 */

interface StackCtx {
  pop: () => void;
  depth: number;
}
const Ctx = createContext<StackCtx>({ pop: () => {}, depth: 0 });
export const useStack = () => useContext(Ctx);

export interface StackPage {
  key: string;
  node: ReactNode;
}

const EDGE = 28;

export function Stack({ pages, onPop }: { pages: StackPage[]; onPop: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const prevLen = useRef(pages.length);
  const [entering, setEntering] = useState<string | null>(null);
  const width = useRef(0);
  const drag = useRef({ active: false, x: 0, y: 0, dx: 0, t: 0, locked: false });

  const top = pages.length - 1;
  const topKey = pages[top].key;

  useEffect(() => {
    if (top + 1 > prevLen.current) setEntering(topKey);
    prevLen.current = top + 1;
    setLeaving(false);
  }, [top, topKey]);

  const reset = (i: number) => {
    const el = refs.current[i];
    if (el) {
      el.style.transition = "";
      el.style.transform = "";
    }
  };

  const pop = () => {
    if (top === 0 || leaving) return;
    setLeaving(true);
  };

  const onAnimEnd = (i: number, e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return;
    if (i === top && leaving) onPop();
    if (i === top && !leaving) setEntering(null);
  };

  // ---- Wisch-zurück vom linken Rand ----
  const onTouchStart = (e: React.TouchEvent) => {
    if (top === 0 || leaving) return;
    const t = e.touches[0];
    const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (t.clientX - box.left > EDGE) return;
    width.current = box.width;
    drag.current = { active: true, x: t.clientX, y: t.clientY, dx: 0, t: performance.now(), locked: false };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const d = drag.current;
    if (!d.active) return;
    const t = e.touches[0];
    const dx = Math.max(0, t.clientX - d.x);
    if (!d.locked) {
      if (Math.abs(t.clientY - d.y) > 12 && Math.abs(t.clientY - d.y) > dx) {
        d.active = false;
        return;
      }
      if (dx < 6) return;
      d.locked = true;
    }
    d.dx = dx;
    const w = width.current || window.innerWidth;
    const topEl = refs.current[top];
    const under = refs.current[top - 1];
    if (topEl) {
      topEl.style.transition = "none";
      topEl.style.transform = `translateX(${dx}px)`;
    }
    if (under) {
      under.style.transition = "none";
      under.style.transform = `translateX(${-30 + (dx / w) * 30}%)`;
    }
  };
  const onTouchEnd = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    if (!d.locked) return;
    const w = width.current || window.innerWidth;
    const v = d.dx / Math.max(1, performance.now() - d.t);
    const topEl = refs.current[top];
    const under = refs.current[top - 1];
    const ease = "transform 320ms cubic-bezier(.2,.8,.2,1)";
    if (d.dx > w * 0.35 || v > 0.5) {
      if (topEl) {
        topEl.style.transition = ease;
        topEl.style.transform = "translateX(100%)";
      }
      if (under) {
        under.style.transition = ease;
        under.style.transform = "translateX(0)";
      }
      window.setTimeout(() => {
        onPop();
        reset(top - 1);
      }, 320);
    } else {
      if (topEl) {
        topEl.style.transition = ease;
        topEl.style.transform = "translateX(0)";
      }
      if (under) {
        under.style.transition = ease;
        under.style.transform = "";
      }
      window.setTimeout(() => {
        reset(top);
        reset(top - 1);
      }, 330);
    }
  };

  return (
    <Ctx.Provider value={{ pop, depth: top }}>
      <div className="stack" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}>
        {pages.map((p, i) => {
          const cls = ["page"];
          if (i < top) cls.push(i === top - 1 && leaving ? "is-uncovering" : "is-covered");
          if (i < top - 1) cls.push("is-hidden");
          if (i === top && entering === p.key && !leaving && i > 0) cls.push("is-entering");
          if (i === top && leaving) cls.push("is-leaving");
          return (
            <div key={p.key} ref={(el) => { refs.current[i] = el; }} className={cls.join(" ")} onAnimationEnd={(e) => onAnimEnd(i, e)}
              aria-hidden={i !== top}>
              {p.node}
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

/** Für Bereiche ohne eigenen Stack (z. B. iPad-Detailspalte). */
export const StackContext = Ctx;
