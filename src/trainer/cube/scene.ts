// 3D-Würfel mit three.js: 27 Teilwürfel mit abgerundeten Kanten, leicht erhabene Aufkleber, weiches Licht.
// Bedienung: Ziehen auf einer Fläche dreht die Schicht (live, rastet auf 90° ein), Ziehen daneben dreht die Ansicht (mit Trägheit),
// Zwei-Finger-Pinch zoomt, Doppeltippen auf den Hintergrund stellt die Ansicht wieder her. Der Würfelzustand liegt in der Engine, nicht in der Grafik.
import {
  CanvasTexture, CircleGeometry, DirectionalLight, ExtrudeGeometry, Group, HemisphereLight, Mesh, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial, PerspectiveCamera, PMREMGenerator,
  Euler, Quaternion, Raycaster, Scene, Shape, SRGBColorSpace, Vector2, Vector3, WebGLRenderer, type BufferGeometry, type Material,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { FACE_COLORS, STICKERS, applyMove, cloneCube, quarterTurns, solvedCube, stickerIndex, type Cube, type Vec } from "./engine";
import { DRAG_THRESHOLD, chooseLayerDrag, dragAngle, moveForDrag, snapQuarters, type LayerDrag } from "./drag";
import { IDLE, step as gestureStep, type Ev, type Fx, type GState } from "./gesture";
import { DEFAULT_PITCH, DEFAULT_YAW, blendToDefault, clampPitch, clampZoom, normalizeYaw, rotateView as turnView } from "./view";

export interface CubeView {
  getState(): Cube;
  setState(c: Cube): void;
  /** Züge nacheinander animiert ausführen (Warteschlange); `onMove` meldet den Beginn jedes Zugs. Ergibt false, wenn abgebrochen wurde. */
  applyMoves(moves: string[], opts?: { ms?: number; onMove?: (i: number) => void; highlight?: boolean }): Promise<boolean>;
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
  scene.environmentIntensity = 0.22;
  pmrem.dispose();
  envScene.dispose();
  track(envTarget);
  scene.add(new HemisphereLight(0xffffff, 0x9a9aa8, 0.85));
  const sun = new DirectionalLight(0xffffff, 1.15);
  sun.position.set(3, 6, 5);
  scene.add(sun);

  // ---------- Würfel ----------
  const cubeGroup = new Group();
  scene.add(cubeGroup);
  const body = track(new RoundedBoxGeometry(0.96, 0.96, 0.96, 3, 0.1)) as BufferGeometry;
  const bodyMat = track(new MeshStandardMaterial({ color: 0x0d0d0f, roughness: 0.5, metalness: 0.05 }));
  const hlMat = track(new MeshStandardMaterial({ color: 0x4a4a52, roughness: 0.5, metalness: 0.05 })); // Schicht, die gerade gedreht wird
  const sticker = (() => {
    const h = 0.41, r = 0.13, s = new Shape();
    s.moveTo(-h + r, -h); s.lineTo(h - r, -h); s.quadraticCurveTo(h, -h, h, -h + r); s.lineTo(h, h - r); s.quadraticCurveTo(h, h, h - r, h);
    s.lineTo(-h + r, h); s.quadraticCurveTo(-h, h, -h, h - r); s.lineTo(-h, -h + r); s.quadraticCurveTo(-h, -h, -h + r, -h);
    return track(new ExtrudeGeometry(s, { depth: 0.022, bevelEnabled: false, curveSegments: 5 }));
  })();
  const mats: Material[] = FACE_COLORS.map((c) => track(new MeshPhysicalMaterial({ color: c, roughness: 0.62, metalness: 0, specularIntensity: 0.35, clearcoat: 0.12, clearcoatRoughness: 0.6 })));

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

  // ---------- Ansicht (Drehteller: seitlich frei, nach oben/unten begrenzt, kein Verkippen) ----------
  let yaw = DEFAULT_YAW, pitch = DEFAULT_PITCH;
  const euler = new Euler(0, 0, 0, "XYZ");
  const applyView = () => { euler.set(pitch, yaw, 0, "XYZ"); cubeGroup.quaternion.setFromEuler(euler); };
  applyView();
  let zoom = 1;
  let baseDist = 12;
  let width = 1, height = 1;

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
  let viewAnim: { yaw: number; pitch: number; fromZoom: number; start: number; dur: number } | null = null;

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
      rotateViewBy(inertia.yaw * dt, inertia.pitch * dt);
      if (Math.abs(pitch) >= clampPitch(Infinity) - 1e-6) inertia.pitch = 0;
      const damp = Math.pow(0.04, dt);
      inertia.yaw *= damp; inertia.pitch *= damp;
      more = true;
    } else inertia = { yaw: 0, pitch: 0 };
    if (viewAnim) {
      const t = easeInOut(Math.min(1, (now - viewAnim.start) / viewAnim.dur));
      const v = blendToDefault({ yaw: viewAnim.yaw, pitch: viewAnim.pitch }, t);
      yaw = v.yaw; pitch = v.pitch;
      applyView();
      zoom = viewAnim.fromZoom + (1 - viewAnim.fromZoom) * t;
      applyCamera();
      if (t >= 1) viewAnim = null; else more = true;
    }
    renderer.render(scene, camera);
    if (more) { last = now; if (!raf) raf = requestAnimationFrame(frame); } else last = 0;
    if (!more && !queue.length && !anim) pump();
  }

  function rotateViewBy(dYaw: number, dPitch: number) {
    const v = turnView({ yaw, pitch }, dYaw, dPitch);
    yaw = v.yaw; pitch = v.pitch;
    applyView();
    request();
  }

  // ---------- Schichten drehen ----------
  const layerCubies = (axis: number, layer: -1 | 0 | 1 | null) => cubies.filter((c) => layer === null || (c.userData.coord as number[])[axis] === layer);
  let inPivot: Group[] = [];
  let highlighting = false;
  const grab = (axis: number, layer: -1 | 0 | 1 | null, hl = false) => {
    release();
    pivotAxis = axis;
    inPivot = layerCubies(axis, layer);
    highlighting = hl;
    if (hl) for (const c of inPivot) (c.children[0] as Mesh).material = hlMat;
    for (const c of inPivot) pivot.add(c);
    pivot.quaternion.identity();
  };
  function release() {
    if (highlighting) for (const c of inPivot) (c.children[0] as Mesh).material = bodyMat;
    highlighting = false;
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
  interface Job { moves: string[]; ms: number; onMove?: (i: number) => void; resolve: (ok: boolean) => void; canceled: boolean; preview?: boolean; highlight?: boolean }
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
      grab(spec.axis, spec.layer, job.highlight);
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

  // Bedienung über den Zustandsautomaten (gesture.ts): jedes Ende setzt alles sauber zurück
  let g: GState = IDLE;
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
  let lastUp = { x: 0, y: 0 };
  const lastSeen = new Map<number, number>(); // wann sich ein Finger zuletzt gemeldet hat
  let cancelled = false;

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

  const zoomPair = () => { const [a, b] = g.ids.slice(0, 2).map((i) => pointers.get(i)); return a && b ? Math.hypot(a.x - b.x, a.y - b.y) || 1 : 1; };

  function run(fx: Fx[]) {
    for (const f of fx) {
      if (f === "endLayerCommit") endLayerGesture(false);
      else if (f === "endLayerCancel") endLayerGesture(true);
      else if (f === "startView") { viewVel = { yaw: 0, pitch: 0 }; inertia = { yaw: 0, pitch: 0 }; viewAnim = null; }
      else if (f === "startZoom") { pinch = { dist: zoomPair(), zoom }; inertia = { yaw: 0, pitch: 0 }; viewAnim = null; }
      else if (f === "endViewInertia") {
        const now = performance.now();
        const moved = Math.hypot(lastUp.x - start.x, lastUp.y - start.y);
        if (!cancelled && moved < 8 && now - start.t < 300) {
          // Doppeltippen auf den Hintergrund: Standardansicht
          if (now - lastTap.t < 330 && Math.hypot(lastUp.x - lastTap.x, lastUp.y - lastTap.y) < 28) { lastTap = { t: 0, x: 0, y: 0 }; view.resetView(); } else lastTap = { t: now, x: lastUp.x, y: lastUp.y };
        } else if (!cancelled && now - lastMove.t < 80) {
          inertia = { yaw: Math.max(-6, Math.min(6, viewVel.yaw)), pitch: Math.max(-6, Math.min(6, viewVel.pitch)) };
          request();
        }
      }
      else if (f === "endViewStop" || f === "endZoom") inertia = { yaw: 0, pitch: 0 };
    }
  }

  function dispatch(e: Ev) {
    const r = gestureStep(g, e);
    g = r.g;
    run(r.fx);
    if (g.ids.length === 0) { pointers.clear(); lastSeen.clear(); hitInfo = null; if (g.mode === "idle") drag = null; }
  }
  /** Jedes Ende ohne eigenes pointerup (Abbruch, Verlassen, Fokusverlust, Verstecken) */
  const abort = () => { cancelled = true; dispatch({ t: "abort" }); pointers.clear(); cancelled = false; };

  function onDown(e: PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    const p = toLocal(e.clientX, e.clientY);
    const now = performance.now();
    // Ein altes Loslassen ging verloren, wenn ein neuer Hauptfinger kommt und sich der alte seit 0,4 s nicht gemeldet hat
    const silent = g.ids.length > 0 && g.ids.every((id) => now - (lastSeen.get(id) ?? 0) > 400);
    const stale = (e.isPrimary && silent) || g.ids.includes(e.pointerId);
    if (stale) pointers.clear();
    lastSeen.set(e.pointerId, now);
    pointers.set(e.pointerId, p);
    try { canvas.setPointerCapture(e.pointerId); } catch { /* nicht überall möglich */ }
    const fresh = stale || g.ids.length === 0;
    if (fresh) {
      start = { x: p.x, y: p.y, t: performance.now() };
      lastMove = { ...start };
      hitInfo = pick(p.x, p.y);
    }
    dispatch({ t: "down", id: e.pointerId, stale, onCube: fresh ? !!hitInfo : true, busy: !idle() });
    if (!stale && !fresh && g.mode === "zoom") pinch = { dist: zoomPair(), zoom };
  }

  function onMovePtr(e: PointerEvent) {
    if (!pointers.has(e.pointerId)) return;
    e.preventDefault();
    const p = toLocal(e.clientX, e.clientY);
    pointers.set(e.pointerId, p);
    lastSeen.set(e.pointerId, performance.now());
    if (g.mode === "zoom") {
      if (g.ids.length >= 2) {
        zoom = clampZoom(pinch.zoom * (zoomPair() / pinch.dist));
        applyCamera();
        request();
      }
      return;
    }
    const delta: [number, number] = [p.x - start.x, p.y - start.y];
    if (g.mode === "pending" && hitInfo) {
      if (Math.hypot(delta[0], delta[1]) < DRAG_THRESHOLD) return;
      const d = chooseLayerDrag({ normal: hitInfo.normal, point: hitInfo.point, coord: hitInfo.coord, drag: delta, project });
      if (!d) return;
      drag = d;
      dispatch({ t: "layerStart" });
      gesture = "layer";
      samples.length = 0;
      samples.push({ t: start.t, a: 0 }); // Beginn der Berührung zählt für die Geschwindigkeit
      opts.onTouch?.(true);
      grab(d.axis, d.layer);
    }
    if (g.mode === "schicht" && drag) {
      angle = dragAngle(drag, delta);
      setPivotAngle(drag.axis, angle);
      samples.push({ t: performance.now(), a: angle });
      if (samples.length > 8) samples.shift();
      request();
    } else if (g.mode === "ansicht") {
      const now = performance.now();
      const dx = p.x - lastMove.x, dy = p.y - lastMove.y;
      const k = 0.0085;
      rotateViewBy(dx * k, dy * k);
      const dtm = Math.max(0.008, (now - lastMove.t) / 1000);
      viewVel = { yaw: 0.6 * viewVel.yaw + 0.4 * ((dx * k) / dtm), pitch: 0.6 * viewVel.pitch + 0.4 * ((dy * k) / dtm) };
      lastMove = { x: p.x, y: p.y, t: now };
    }
  }

  function onUp(e: PointerEvent) {
    if (!g.ids.includes(e.pointerId)) { pointers.delete(e.pointerId); return; }
    const p = toLocal(e.clientX, e.clientY);
    lastUp = p;
    pointers.delete(e.pointerId);
    try { canvas.releasePointerCapture(e.pointerId); } catch { /* schon frei */ }
    dispatch({ t: "up", id: e.pointerId });
  }
  const onCancel = () => abort();

  on(canvas, "pointerdown", onDown, { passive: false });
  on(canvas, "pointermove", onMovePtr, { passive: false });
  on(canvas, "pointerup", onUp);
  on(canvas, "pointercancel", onCancel);
  on(canvas, "lostpointercapture", (e: PointerEvent) => { if (g.ids.includes(e.pointerId)) onUp(e); });
  on(canvas, "pointerleave", (e: PointerEvent) => { if (e.pointerType === "mouse" && !canvas.hasPointerCapture(e.pointerId) && g.ids.includes(e.pointerId)) abort(); });
  on(canvas, "contextmenu", (e: Event) => e.preventDefault());
  on(window, "blur", abort);
  on(document, "visibilitychange", () => { if (document.hidden) abort(); });
  const ro = new ResizeObserver(() => resize());
  ro.observe(host);
  on(window, "orientationchange", () => window.setTimeout(resize, 200));
  on(canvas, "webglcontextlost", (e: Event) => e.preventDefault());
  on(canvas, "webglcontextrestored", () => { recolor(); request(); });
  resize();

  const view: CubeView = {
    getState: () => cloneCube(state),
    setState(c) {
      // Springen: alles Laufende sauber abbrechen (Warteschlange, Animation, Geste), dann den Zustand setzen
      for (const j of queue.splice(0)) j.resolve(false);
      if (running) { running.canceled = true; running.resolve(false); running = null; }
      if (g.mode === "schicht") { drag = null; opts.onTouch?.(false); }
      anim = null; gesture = "none";
      release();
      state = cloneCube(c);
      recolor();
      request();
    },
    applyMoves(moves, o = {}) {
      return new Promise<boolean>((resolve) => {
        if (!moves.length) return resolve(true);
        queue.push({ moves, ms: o.ms ?? 220, onMove: o.onMove, resolve, canceled: false, highlight: o.highlight });
        pump();
      });
    },
    preview(move) {
      return new Promise<void>((resolve) => { queue.push({ moves: [move], ms: 320, resolve: () => resolve(), canceled: false, preview: true }); pump(); });
    },
    cancelQueue() { for (const j of queue.splice(0)) j.resolve(false); if (running) running.canceled = true; },
    resetView() {
      inertia = { yaw: 0, pitch: 0 };
      viewAnim = { yaw, pitch, fromZoom: zoom, start: performance.now(), dur: 380 };
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
        return n.dot(new Vector3(0, 0, 1)) > 0.3;
      },
      /** beliebiger Punkt im Würfelraum in Seitenkoordinaten */
      project(p: Vec): [number, number] {
        cubeGroup.updateMatrixWorld(true);
        const q = project(p);
        const r = canvas.getBoundingClientRect();
        return [r.left + q[0], r.top + q[1]];
      },
      zoom: () => zoom,
      /** Kamerazustand: Drehung seitlich/oben in Grad, Verkippung (muss 0 sein), Zoom */
      camera() {
        // Verkippung: Winkel der Würfel-Oberseite zur senkrechten Bildachse (bei einem Drehteller immer 0)
        const up = new Vector3(0, 1, 0).applyQuaternion(cubeGroup.quaternion);
        return { yaw: (yaw * 180) / Math.PI, pitch: (pitch * 180) / Math.PI, roll: (Math.atan2(up.x, up.y) * 180) / Math.PI, zoom, fov: camera.fov, dist: camera.position.z };
      },
      setView(yawDeg: number, pitchDeg: number) { yaw = normalizeYaw((yawDeg * Math.PI) / 180); pitch = clampPitch((pitchDeg * Math.PI) / 180); applyView(); request(); },
      /** Bildpunkt (Seitenkoordinaten) → gezeichnete Farbe, direkt nach einem Zeichnen gelesen (für den Farbtest) */
      sample(x: number, y: number): [number, number, number] {
        renderer.render(scene, camera);
        const gl = renderer.getContext();
        const r = canvas.getBoundingClientRect();
        const pr = renderer.getPixelRatio();
        const buf = new Uint8Array(4);
        gl.readPixels(Math.round((x - r.left) * pr), Math.round((r.height - (y - r.top)) * pr), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
        return [buf[0], buf[1], buf[2]];
      },
      resetViewNow() { yaw = DEFAULT_YAW; pitch = DEFAULT_PITCH; zoom = 1; applyView(); applyCamera(); request(); },
      /** Zustand des Gestenautomaten (für Tests) */
      gesture: () => ({ mode: g.mode, ids: [...g.ids] }),
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
    anim = null; viewAnim = null; g = IDLE;
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

