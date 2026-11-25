// Ansicht des Würfels wie ein Drehteller: Drehung seitlich (yaw) und nach oben/unten (pitch, begrenzt), nie seitlich verkippt (kein Roll).
export const DEG = Math.PI / 180;
/** Standardansicht: Vorderseite fast frontal, leicht von oben und von der Seite, damit der Würfel noch räumlich wirkt */
export const DEFAULT_YAW = -10 * DEG;
export const DEFAULT_PITCH = 10 * DEG;
export const PITCH_LIMIT = 80 * DEG;
export const ZOOM_MIN = 0.65, ZOOM_MAX = 1.7;

export interface ViewAngles { yaw: number; pitch: number }

export const clampPitch = (p: number): number => Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, p));
/** Winkel in (−π, π] */
export function normalizeYaw(y: number): number {
  let a = ((y + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
  if (a === -Math.PI) a = Math.PI;
  return a;
}
export const clampZoom = (z: number): number => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));

export function rotateView(v: ViewAngles, dYaw: number, dPitch: number): ViewAngles {
  return { yaw: normalizeYaw(v.yaw + dYaw), pitch: clampPitch(v.pitch + dPitch) };
}

/** Zwischenstand auf dem kürzesten Weg zur Standardansicht (t von 0 bis 1) */
export function blendToDefault(v: ViewAngles, t: number): ViewAngles {
  const dy = normalizeYaw(DEFAULT_YAW - v.yaw);
  return { yaw: normalizeYaw(v.yaw + dy * t), pitch: v.pitch + (DEFAULT_PITCH - v.pitch) * t };
}
