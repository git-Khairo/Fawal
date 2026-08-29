import type { Projected } from "../model/project";

export type MetalPalette = {
  /** The shadow side and the contact edge. */
  core: string;
  /** The body of the material. */
  body: string;
  /** The specular return. */
  spec: string;
};

export type Light = {
  /** Unit vector in screen space. Where the key light comes from. */
  x: number;
  y: number;
};

/**
 * Draws one strand as a lit cylinder.
 *
 * Three passes, because that is what a round bar looks like: a dark spread that
 * reads as the shadow side and the contact under it, a mid body, and a thin
 * specular return offset toward the light.
 *
 * The passes are stroked in chunks rather than as one path per strand, so the
 * highlight can vary along the length. A wire catches the most light where it
 * runs across the beam and almost none where it runs along it, which is the
 * behaviour that makes it read as metal rather than as a coloured line. Chunks
 * share endpoints, so the result is continuous.
 */
export function drawStrand(
  ctx: CanvasRenderingContext2D,
  pts: Projected[],
  baseWidth: number,
  light: Light,
  palette: MetalPalette,
  chunk = 8,
) {
  const n = pts.length;
  if (n < 2) return;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Pass 1: the dark spread. One stroke, widest, sits under everything.
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < n; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.strokeStyle = palette.core;
  ctx.lineWidth = baseWidth * 2.1;
  ctx.globalAlpha = 0.55;
  ctx.stroke();

  // Passes 2 and 3, chunked so body brightness and specular can vary.
  for (let start = 0; start < n - 1; start += chunk) {
    const end = Math.min(start + chunk, n - 1);

    let kSum = 0;
    for (let i = start; i <= end; i++) kSum += pts[i].k;
    const k = kSum / (end - start + 1);

    const dx = pts[end].x - pts[start].x;
    const dy = pts[end].y - pts[start].y;
    const len = Math.hypot(dx, dy) || 1;
    const tx = dx / len;
    const ty = dy / len;

    // Perpendicular, pointing toward the light.
    let nx = -ty;
    let ny = tx;
    if (nx * light.x + ny * light.y < 0) {
      nx = -nx;
      ny = -ny;
    }

    // Across the beam catches light, along it does not.
    const along = Math.abs(tx * light.x + ty * light.y);
    const facing = 1 - along;
    const width = baseWidth * k;

    ctx.beginPath();
    ctx.moveTo(pts[start].x, pts[start].y);
    for (let i = start + 1; i <= end; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = palette.body;
    ctx.lineWidth = width;
    // Depth fades the body, so far strands sit back instead of crowding forward.
    ctx.globalAlpha = 0.35 + k * 0.5;
    ctx.stroke();

    const specStrength = Math.pow(facing, 2.2) * (0.28 + k * 0.55);
    if (specStrength > 0.02 && width > 0.9) {
      const offset = width * 0.26;
      ctx.beginPath();
      ctx.moveTo(pts[start].x + nx * offset, pts[start].y + ny * offset);
      for (let i = start + 1; i <= end; i++) {
        ctx.lineTo(pts[i].x + nx * offset, pts[i].y + ny * offset);
      }
      ctx.strokeStyle = palette.spec;
      ctx.lineWidth = Math.max(0.5, width * 0.34);
      ctx.globalAlpha = Math.min(0.9, specStrength);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
}

/** Reads the site's own tokens so the wire cannot drift from the palette. */
export function readMetalPalette(): MetalPalette {
  if (typeof window === "undefined") {
    return { core: "#0b0d10", body: "#777b7c", spec: "#d1d3d2" };
  }
  const s = getComputedStyle(document.documentElement);
  const probe = document.createElement("canvas").getContext("2d", {
    willReadFrequently: true,
  });
  const resolve = (name: string, fallback: string) => {
    const raw = s.getPropertyValue(name).trim();
    if (!raw || !probe) return fallback;
    probe.fillStyle = fallback;
    probe.fillStyle = raw;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return `rgb(${r} ${g} ${b})`;
  };
  return {
    core: resolve("--color-void", "#0b0d10"),
    body: resolve("--color-ink-3", "#777b7c"),
    spec: resolve("--color-spec-hi", "#d1d3d2"),
  };
}
