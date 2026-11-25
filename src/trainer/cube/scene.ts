// 3D-Würfel mit three.js: 27 Teilwürfel mit abgerundeten Kanten, leicht erhabene Aufkleber, weiches Licht.
// Bedienung: Ziehen auf einer Fläche dreht die Schicht (live, rastet auf 90° ein), Ziehen daneben dreht die Ansicht (mit Trägheit),
// Zwei-Finger-Pinch zoomt, Doppeltippen auf den Hintergrund stellt die Ansicht wieder her. Der Würfelzustand liegt in der Engine, nicht in der Grafik.
import {
  CanvasTexture, CircleGeometry, DirectionalLight, ExtrudeGeometry, Group, HemisphereLight, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, PerspectiveCamera, PMREMGenerator,
  Quaternion, Raycaster, Scene, Shape, SRGBColorSpace, Vector2, Vector3, WebGLRenderer, type BufferGeometry, type Material,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { FACE_COLORS, STICKERS, applyMove, cloneCube, quarterTurns, solvedCube, stickerIndex, type Cube, type Vec } from "./engine";
import { DRAG_THRESHOLD, chooseLayerDrag, dragAngle, moveForDrag, snapQuarters, type LayerDrag } from "./drag";

export interface CubeView {
  getState(): Cube;
  setState(c: Cube): void;
  /** Züge nacheinander animiert ausführen (Warteschlange); `onMove` meldet den Beginn jedes Zugs. Ergibt false, wenn abgebrochen wurde. */
  applyMoves(moves: string[], opts?: { ms?: number; onMove?: (i: number) => void }): Promise<boolean>;
  /** Eine Schicht einmal vordrehen und zurück – der Zustand bleibt unverändert */
  preview(move: string): Promise<void>;
  /** Wartende Züge verwerfen (der laufende Zug wird noch fertig) */
  cancelQueue(): void;
  resetView(): void;
  /** kleiner Schubs: der Würfel dreht sich kurz von selbst (für „gelöst“) */
  spin(): void;
  busy(): boolean;
}

export interface SceneOptions {
  onUserMove(move: string, state: Cube): void;
  /** Schicht wird gerade mit dem Finger gedreht (true) bzw. losgelassen (false) */
  onTouch?(active: boolean): void;
}

export interface SceneHandle { view: CubeView; destroy(): void }

const TAU4 = Math.PI / 2;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const AXES = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)];

/** Zähler für Tests (nur in Test-Builds sichtbar): angelegte/aufgeräumte Szenen und offene Listener */
export const sceneCounters = { created: 0, destroyed: 0, listeners: 0, frames: 0 };

export function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function createCubeScene(host: HTMLElement, opts: SceneOptions): SceneHandle | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  sceneCounters.created++;
  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(o: T): T => { disposables.push(o); return o; };

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = "cube3d-canvas";
  canvas.style.touchAction = "none";
  host.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  const pmrem = new PMREMGenerator(renderer);
  const envScene = new RoomEnvironment();
  const envTarget = pmrem.fromScene(envScene, 0.04);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.5;
  pmrem.dispose();
  envScene.dispose();
  track(envTarget);
  scene.add(new HemisphereLight(0xffffff, 0x8a8a99, 0.55));
  const sun = new DirectionalLight(0xffffff, 1.5);
  sun.position.set(3, 6, 5);
  scene.add(sun);

  // ---------- Würfel ----------
  const cubeGroup = new Group();
  scene.add(cubeGroup);
  const body = track(new RoundedBoxGeometry(0.96, 0.96, 0.96, 3, 0.1)) as BufferGeometry;
  const bodyMat = track(new MeshStandardMaterial({ color: 0x0d0d0f, roughness: 0.5, metalness: 0.05 }));
  const sticker = (() => {
    const h = 0.41, r = 0.13, s = new Shape();
    s.moveTo(-h + r, -h); s.lineTo(h - r, -h); s.quadraticCurveTo(h, -h, h, -h + r); s.lineTo(h, h - r); s.quadraticCurveTo(h, h, h - r, h);
    s.lineTo(-h + r, h); s.quadraticCurveTo(-h, h, -h, h - r); s.lineTo(-h, -h + r); s.quadraticCurveTo(-h, -h, -h + r, -h);
    return track(new ExtrudeGeometry(s, { depth: 0.022, bevelEnabled: false, curveSegments: 5 }));
  })();
  const mats: Material[] = FACE_COLORS.map((c) => track(new MeshPhysicalMaterial({ color: c, roughness: 0.42, metalness: 0, clearcoat: 0.45, clearcoatRoughness: 0.35 })));

  const cubies: Group[] = [];
  const stickerMeshes: Mesh[] = new Array(54);
  const zAxis = new Vector3(0, 0, 1);
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
    const cubie = new Group();
    cubie.position.set(x, y, z);
    cubie.userData.coord = [x, y, z];
    cubie.add(new Mesh(body, bodyMat));
    cubies.push(cubie);
    cubeGroup.add(cubie);
  }
  STICKERS.forEach((st, i) => {
    const cubie = cubies.find((c) => (c.userData.coord as number[]).every((v, k) => v === st.pos[k]))!;
    const m = new Mesh(sticker, mats[0]);
    const n = new Vector3(...st.normal);
    m.quaternion.setFromUnitVectors(zAxis, n);
    m.position.copy(n.multiplyScalar(0.479));
    m.raycast = () => undefined; // getroffen wird immer der Körper darunter
    stickerMeshes[i] = m;
    cubie.add(m);
  });
  const bodies = cubies.map((c) => c.children[0]);

  // weicher Schatten unter dem Würfel (nur ein Bild, kein Echtzeit-Schatten)
  const shadowTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    grad.addColorStop(0, "rgba(0,0,0,0.38)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return track(new CanvasTexture(c));
  })();
  const shadowGeo = track(new CircleGeometry(2.6, 32));
  const shadowMat = track(new MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  const shadow = new Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -2.55;
  shadow.scale.set(1, 0.75, 1);
  scene.add(shadow);

  const pivot = new Group();
  cubeGroup.add(pivot);

  let state: Cube = solvedCube();
  const recolor = () => { for (let i = 0; i < 54; i++) stickerMeshes[i].material = mats[state[i]]; };
  recolor();

  // ---------- Ansicht ----------
  const defaultQ = new Quaternion().setFromAxisAngle(AXES[0], (30 * Math.PI) / 180).multiply(new Quaternion().setFromAxisAngle(AXES[1], (-35 * Math.PI) / 180));
  cubeGroup.quaternion.copy(defaultQ);
  let zoom = 1;
  let baseDist = 12;
  let width = 1, height = 1;
  const ZOOM_MIN = 0.65, ZOOM_MAX = 1.7;

  const applyCamera = () => {
    const rad = (camera.fov * Math.PI) / 180;
    const vFit = 2.85 / Math.sin(rad / 2);
    const hFit = 2.85 / Math.sin(Math.atan(Math.tan(rad / 2) * camera.aspect));
    baseDist = Math.max(vFit, hFit);
    camera.position.set(0, 0, baseDist / zoom);
    camera.lookAt(0, 0, 0);
  };
  const resize = () => {
    const r = host.getBoundingClientRect();
    width = Math.max(1, Math.round(r.width));
    height = Math.max(1, Math.round(r.height));
    renderer.setSize(width, height, false);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    applyCamera();
    request();
  };

  // ---------- Zeichenschleife nur bei Bedarf ----------
  let raf = 0;
  let destroyed = false;
  let last = 0;
  const request = () => { if (!raf && !destroyed) raf = requestAnimationFrame(frame); };

  interface Anim { from: number; to: number; start: number; dur: number; ease: (t: number) => number; onDone: () => void }
  let anim: Anim | null = null;
  const setPivotAngle = (axis: number, a: number) => pivot.quaternion.setFromAxisAngle(AXES[axis], a);
  let pivotAxis = 0;

  let inertia = { yaw: 0, pitch: 0 };
  let viewAnim: { from: Quaternion; fromZoom: number; start: number; dur: number } | null = null;

  function frame(now: number) {
    raf = 0;
    if (destroyed) return;
    sceneCounters.frames++;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;
    let more = false;
    if (anim) {
      const t = Math.min(1, (now - anim.start) / anim.dur);
      setPivotAngle(pivotAxis, anim.from + (anim.to - anim.from) * anim.ease(t));
      if (t >= 1) { const done = anim.onDone; anim = null; done(); } else more = true;
    }
    if (Math.abs(inertia.yaw) > 0.01 || Math.abs(inertia.pitch) > 0.01) {
      rotateView(inertia.yaw * dt, inertia.pitch * dt);
      const damp = Math.pow(0.04, dt);
      inertia.yaw *= damp; inertia.pitch *= damp;
      more = true;
    } else inertia = { yaw: 0, pitch: 0 };
    if (viewAnim) {
      const t = easeInOut(Math.min(1, (now - viewAnim.start) / viewAnim.dur));
      cubeGroup.quaternion.copy(viewAnim.from).slerp(defaultQ, t);
      zoom = viewAnim.fromZoom + (1 - viewAnim.fromZoom) * t;
      applyCamera();
      if (t >= 1) viewAnim = null; else more = true;
    }
    renderer.render(scene, camera);
    if (more) { last = now; if (!raf) raf = requestAnimationFrame(frame); } else last = 0;
    if (!more && !queue.length && !anim) pump();
  }

  const yawQ = new Quaternion(), pitchQ = new Quaternion();
  function rotateView(yaw: number, pitch: number) {
    yawQ.setFromAxisAngle(AXES[1], yaw);
    pitchQ.setFromAxisAngle(AXES[0], pitch);
    cubeGroup.quaternion.premultiply(yawQ).premultiply(pitchQ).normalize();
    request();
  }

  // ---------- Schichten drehen ----------
  const layerCubies = (axis: number, layer: -1 | 0 | 1 | null) => cubies.filter((c) => layer === null || (c.userData.coord as number[])[axis] === layer);
  let inPivot: Group[] = [];
  const grab = (axis: number, layer: -1 | 0 | 1 | null) => {
    release();
    pivotAxis = axis;
    inPivot = layerCubies(axis, layer);
    for (const c of inPivot) pivot.add(c);
    pivot.quaternion.identity();
  };
  function release() {
    for (const c of inPivot) cubeGroup.add(c);
    inPivot = [];
    pivot.quaternion.identity();
  }
  const commit = (move: string) => {
    release();
    state = applyMove(state, move);
    recolor();
    request();
  };

  // ---------- Warteschlange für Züge aus dem Programm ----------
  interface Job { moves: string[]; ms: number; onMove?: (i: number) => void; resolve: (ok: boolean) => void; canceled: boolean; preview?: boolean }
  const queue: Job[] = [];
  let running: Job | null = null;
  let gesture: "none" | "layer" | "snap" = "none";

  const idle = () => !anim && !running && gesture === "none";
  function pump() {
    if (running || anim || gesture !== "none" || destroyed) return;
    const job = queue.shift();
    if (!job) return;
    running = job;
    let i = 0;
    const next = () => {
      if (destroyed) { job.resolve(false); return; }
      if (job.canceled || i >= job.moves.length) { running = null; job.resolve(!job.canceled); request(); pump(); return; }
      const move = job.moves[i];
      job.onMove?.(i);
      const { spec, q } = quarterTurns(move);
      grab(spec.axis, spec.layer);
      const target = q * TAU4;
      anim = {
        from: 0, to: target, start: performance.now(), dur: job.ms * (Math.abs(q) === 2 ? 1.5 : 1), ease: job.ms < 120 ? easeOut : easeInOut,
        onDone: () => {
          if (job.preview) {
            // zurückdrehen, ohne den Zustand zu ändern
            anim = { from: target, to: 0, start: performance.now(), dur: job.ms, ease: easeInOut, onDone: () => { release(); i++; next(); } };
            request();
          } else { commit(move); i++; next(); }
        },
      };
      request();
    };
    next();
  }

  // ---------- Eingabe ----------
  const raycaster = new Raycaster();
  const ndc = new Vector2();
  const tmp = new Vector3();
  const project = (p: Vec): [number, number] => {
    tmp.set(p[0], p[1], p[2]);
    cubeGroup.localToWorld(tmp);
    tmp.project(camera);
    return [((tmp.x + 1) / 2) * width, ((1 - tmp.y) / 2) * height];
  };
  const toLocal = (clientX: number, clientY: number) => {
    const r = canvas.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };
  const invQ = new Quaternion();
  function pick(px: number, py: number) {
    ndc.set((px / width) * 2 - 1, -(py / height) * 2 + 1);
    cubeGroup.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(bodies, false)[0];
    if (!hit || !hit.face) return null;
    const cubie = hit.object.parent as Group;
    const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
    invQ.copy(cubeGroup.quaternion).invert();
    n.applyQuaternion(invQ);
    const na = [0, 1, 2].reduce((b, a) => (Math.abs([n.x, n.y, n.z][a]) > Math.abs([n.x, n.y, n.z][b]) ? a : b), 0);
    const normal: Vec = [0, 0, 0];
    normal[na] = [n.x, n.y, n.z][na] > 0 ? 1 : -1;
    const point = cubeGroup.worldToLocal(hit.point.clone());
    return { normal, point: [point.x, point.y, point.z] as Vec, coord: cubie.userData.coord as Vec };
  }

  type Mode = "none" | "pending" | "layer" | "view" | "pinch" | "ignored";
  let mode: Mode = "none";
  const pointers = new Map<number, { x: number; y: number }>();
  let start = { x: 0, y: 0, t: 0 };
  let hitInfo: ReturnType<typeof pick> = null;
  let drag: LayerDrag | null = null;
  let angle = 0;
  const samples: { t: number; a: number }[] = [];
  let lastMove = { x: 0, y: 0, t: 0 };
  let viewVel = { yaw: 0, pitch: 0 };
  let pinch = { dist: 0, zoom: 1 };
  let lastTap = { t: 0, x: 0, y: 0 };

  const listeners: [EventTarget, string, EventListener, AddEventListenerOptions | undefined][] = [];
  const on = (el: EventTarget, type: string, fn: (e: never) => void, o?: AddEventListenerOptions) => {
    el.addEventListener(type, fn as EventListener, o);
    listeners.push([el, type, fn as EventListener, o]);
    sceneCounters.listeners++;
  };

  function endLayerGesture(cancel: boolean) {
    const d = drag;
    drag = null;
    const s = samples.filter((x) => performance.now() - x.t < 140);
    const v = s.length >= 2 ? (s[s.length - 1].a - s[0].a) / Math.max(0.016, (s[s.length - 1].t - s[0].t) / 1000) : 0;
    const q = cancel || !d ? 0 : snapQuarters(angle, v);
    if (import.meta.env.DEV || import.meta.env.VITE_EXPOSE === "1") (window as unknown as Record<string, unknown>).__cubeLast = { angle, v, q, n: s.length };
    gesture = "snap";
    opts.onTouch?.(false);
    const target = q * TAU4;
    const dist = Math.abs(target - angle);
    anim = {
      from: angle, to: target, start: performance.now(), dur: 110 + Math.min(1, dist / TAU4) * 120, ease: easeOut,
      onDone: () => {
        gesture = "none";
        if (q !== 0 && d) {
          const move = moveForDrag(d, q);
          if (move) { commit(move); opts.onUserMove(move, cloneCube(state)); } else release();
        } else release();
        pump();
        request();
      },
    };
    request();
  }

  function onDown(e: PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    const p = toLocal(e.clientX, e.clientY);
    pointers.set(e.pointerId, p);
    try { canvas.setPointerCapture(e.pointerId); } catch { /* nicht überall möglich */ }
    if (pointers.size >= 2) {
      // zweiter Finger: Schicht verwerfen, Ansicht zoomen
      if (mode === "layer") endLayerGesture(true);
      mode = "pinch";
      const [a, b] = [...pointers.values()];
      pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom };
      inertia = { yaw: 0, pitch: 0 };
      return;
    }
    start = { x: p.x, y: p.y, t: performance.now() };
    lastMove = { ...start };
    viewVel = { yaw: 0, pitch: 0 };
    inertia = { yaw: 0, pitch: 0 };
    viewAnim = null;
    hitInfo = pick(p.x, p.y);
    if (hitInfo) mode = idle() ? "pending" : "ignored";
    else mode = "view";
  }

  function onMovePtr(e: PointerEvent) {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    e.preventDefault();
    const p = toLocal(e.clientX, e.clientY);
    pointers.set(e.pointerId, p);
    if (mode === "pinch" && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pinch.zoom * (d / pinch.dist)));
      applyCamera();
      request();
      return;
    }
    const delta: [number, number] = [p.x - start.x, p.y - start.y];
    if (mode === "pending" && hitInfo) {
      if (Math.hypot(delta[0], delta[1]) < DRAG_THRESHOLD) return;
      const d = chooseLayerDrag({ normal: hitInfo.normal, point: hitInfo.point, coord: hitInfo.coord, drag: delta, project });
      if (!d) return;
      drag = d;
      mode = "layer";
      gesture = "layer";
      samples.length = 0;
      samples.push({ t: start.t, a: 0 }); // Beginn der Berührung zählt für die Geschwindigkeit
      opts.onTouch?.(true);
      grab(d.axis, d.layer);
    }
    if (mode === "layer" && drag) {
      angle = dragAngle(drag, delta);
      setPivotAngle(drag.axis, angle);
      samples.push({ t: performance.now(), a: angle });
      if (samples.length > 8) samples.shift();
      request();
    } else if (mode === "view") {
      const now = performance.now();
      const dx = p.x - lastMove.x, dy = p.y - lastMove.y;
      const k = 0.0085;
      rotateView(dx * k, dy * k);
      const dtm = Math.max(0.008, (now - lastMove.t) / 1000);
      viewVel = { yaw: 0.6 * viewVel.yaw + 0.4 * ((dx * k) / dtm), pitch: 0.6 * viewVel.pitch + 0.4 * ((dy * k) / dtm) };
      lastMove = { x: p.x, y: p.y, t: now };
    }
  }

  function onUp(e: PointerEvent) {
    if (!pointers.has(e.pointerId)) return;
    const p = toLocal(e.clientX, e.clientY);
    pointers.delete(e.pointerId);
    try { canvas.releasePointerCapture(e.pointerId); } catch { /* schon frei */ }
    if (mode === "pinch") { if (pointers.size === 0) mode = "none"; else if (pointers.size === 1) mode = "ignored"; return; }
    if (pointers.size > 0) return;
    const m = mode;
    mode = "none";
    if (m === "layer") endLayerGesture(e.type === "pointercancel");
    else if (m === "view") {
      const moved = Math.hypot(p.x - start.x, p.y - start.y);
      const now = performance.now();
      if (moved < 8 && now - start.t < 300 && e.type !== "pointercancel") {
        // Doppeltippen auf den Hintergrund: Standardansicht
        if (now - lastTap.t < 330 && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 28) { lastTap = { t: 0, x: 0, y: 0 }; view.resetView(); } else lastTap = { t: now, x: p.x, y: p.y };
      } else if (now - lastMove.t < 80 && e.type !== "pointercancel") {
        inertia = { yaw: Math.max(-6, Math.min(6, viewVel.yaw)), pitch: Math.max(-6, Math.min(6, viewVel.pitch)) };
        request();
      }
    }
    hitInfo = null;
  }

  on(canvas, "pointerdown", onDown, { passive: false });
  on(canvas, "pointermove", onMovePtr, { passive: false });
  on(canvas, "pointerup", onUp);
  on(canvas, "pointercancel", onUp);
  on(canvas, "contextmenu", (e: Event) => e.preventDefault());
  const ro = new ResizeObserver(() => resize());
  ro.observe(host);
  on(window, "orientationchange", () => window.setTimeout(resize, 200));
  on(canvas, "webglcontextlost", (e: Event) => e.preventDefault());
  on(canvas, "webglcontextrestored", () => { recolor(); request(); });
  resize();

  const view: CubeView = {
    getState: () => cloneCube(state),
    setState(c) { if (running || anim) return; state = cloneCube(c); recolor(); request(); },
    applyMoves(moves, o = {}) {
      return new Promise<boolean>((resolve) => {
        if (!moves.length) return resolve(true);
        queue.push({ moves, ms: o.ms ?? 220, onMove: o.onMove, resolve, canceled: false });
        pump();
      });
    },
    preview(move) {
      return new Promise<void>((resolve) => { queue.push({ moves: [move], ms: 320, resolve: () => resolve(), canceled: false, preview: true }); pump(); });
    },
    cancelQueue() { for (const j of queue.splice(0)) j.resolve(false); if (running) running.canceled = true; },
    resetView() {
      inertia = { yaw: 0, pitch: 0 };
      viewAnim = { from: cubeGroup.quaternion.clone(), fromZoom: zoom, start: performance.now(), dur: 380 };
      request();
    },
    spin() { inertia = { yaw: 3.4, pitch: 0 }; request(); },
    busy: () => !idle() || queue.length > 0,
  };

  // Testzugang: Pixelposition eines Aufklebers, Zustand (nur in Test-Builds)
  const expose = import.meta.env.DEV || import.meta.env.VITE_EXPOSE === "1";
  if (expose) {
    (window as unknown as Record<string, unknown>).__cubeCounters = sceneCounters;
    (window as unknown as Record<string, unknown>).__cube3d = {
      /** Mittelpunkt eines Aufklebers in Seitenkoordinaten */
      stickerXY(pos: Vec, normal: Vec): [number, number] {
        cubeGroup.updateMatrixWorld(true);
        const p = project([pos[0] + normal[0] * 0.5, pos[1] + normal[1] * 0.5, pos[2] + normal[2] * 0.5]);
        const r = canvas.getBoundingClientRect();
        return [r.left + p[0], r.top + p[1]];
      },
      /** Ist der Aufkleber von vorn zu sehen? */
      visible(normal: Vec): boolean {
        const n = new Vector3(...normal).applyQuaternion(cubeGroup.quaternion);
        return n.dot(new Vector3(0, 0, 1)) > 0.15;
      },
      /** beliebiger Punkt im Würfelraum in Seitenkoordinaten */
      project(p: Vec): [number, number] {
        cubeGroup.updateMatrixWorld(true);
        const q = project(p);
        const r = canvas.getBoundingClientRect();
        return [r.left + q[0], r.top + q[1]];
      },
      zoom: () => zoom,
      index: (pos: Vec, normal: Vec) => stickerIndex(pos, normal),
      state: () => Array.from(state).join(""),
      busy: () => view.busy(),
      canvasRect: () => canvas.getBoundingClientRect().toJSON(),
      pixelRatio: () => renderer.getPixelRatio(),
      counters: sceneCounters,
    };
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    anim = null; viewAnim = null;
    for (const j of queue.splice(0)) j.resolve(false);
    if (running) running.resolve(false);
    running = null;
    ro.disconnect();
    for (const [el, type, fn, o] of listeners) { el.removeEventListener(type, fn, o); sceneCounters.listeners--; }
    listeners.length = 0;
    pointers.clear();
    for (const d of disposables) d.dispose();
    scene.environment = null;
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
    sceneCounters.destroyed++;
    if (expose) delete (window as unknown as Record<string, unknown>).__cube3d;
  }

  // Dateien sind geladen, erstes Bild
  request();
  return { view, destroy };
}

