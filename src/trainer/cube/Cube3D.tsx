import { useEffect, useRef } from "react";
import { createCubeScene, type CubeView, type SceneOptions } from "./scene";
import type { Cube } from "./engine";

export interface Cube3DProps {
  onReady(view: CubeView): void;
  onUserMove(move: string, state: Cube): void;
  onTouch?(active: boolean): void;
  /** WebGL nicht verfügbar */
  onUnavailable(): void;
}

/** Der 3D-Würfel. Beim Entfernen werden Zeichenkontext, Listener und Animationen vollständig aufgeräumt. */
export default function Cube3D(props: Cube3DProps) {
  const host = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  latest.current = props;
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const opts: SceneOptions = { onUserMove: (m, s) => latest.current.onUserMove(m, s), onTouch: (a) => latest.current.onTouch?.(a) };
    const handle = createCubeScene(el, opts);
    if (!handle) { latest.current.onUnavailable(); return; }
    latest.current.onReady(handle.view);
    return () => handle.destroy();
  }, []);
  return <div ref={host} className="cube3d" role="img" aria-label="Zauberwürfel (3D)" />;
}
