import type { Camera, Vec3 } from "./types";

export type Projected = {
  x: number;
  y: number;
  /** Perspective scale at this depth. Drives stroke weight and brightness. */
  k: number;
  /** View-space depth, for painter ordering. */
  depth: number;
};

/**
 * Yaw, then pitch, then a perspective divide.
 *
 * This is the whole reason Three.js is not here. Wire is a one-dimensional
 * object: there are no surfaces to shade and no meshes to light, so carrying a z
 * through a rotation and dividing by depth produces the same spatial reading for
 * a fraction of the cost.
 */
export function project(
  p: Vec3,
  cam: Camera,
  width: number,
  height: number,
  out: Projected,
): Projected {
  const cy = Math.cos(cam.rotY);
  const sy = Math.sin(cam.rotY);
  const x1 = p.x * cy + p.z * sy;
  const z1 = p.z * cy - p.x * sy;

  const cx = Math.cos(cam.rotX);
  const sx = Math.sin(cam.rotX);
  const y1 = p.y * cx - z1 * sx;
  const z2 = z1 * cx + p.y * sx;

  const k = cam.dist / (cam.dist + z2);
  const half = Math.min(width, height) * 0.5 * cam.zoom;

  out.x = width * 0.5 + x1 * k * half;
  out.y = height * 0.5 + y1 * k * half;
  out.k = k;
  out.depth = z2;
  return out;
}

export function makeProjected(): Projected {
  return { x: 0, y: 0, k: 1, depth: 0 };
}
