import type { HeroParams } from "./hero-timeline";
import { drawStrand, type Light, type MetalPalette } from "../render/metal-material";
import { makeProjected, project, type Projected } from "../model/project";
import type { Camera, Vec3 } from "../model/types";
import { clamp01, easeOutPower3 } from "../model/easing";

const SAMPLES = 60;
/** Lighting segments per strand. Coarser than the product stage on purpose:
 *  the hero draws roughly seventy strands at once and the budget is 60fps. */
const CHUNK = 12;
const SPAN = 1.35;

type Buffers = {
  pts: Vec3[];
  proj: Projected[];
};

function makeBuffers(): Buffers {
  const pts: Vec3[] = [];
  const proj: Projected[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    pts.push({ x: 0, y: 0, z: 0 });
    proj.push(makeProjected());
  }
  return { pts, proj };
}

/**
 * Three spatial layers, drawn back to front.
 *
 * Background is atmosphere only. Midground carries the wire becoming mesh.
 * Foreground holds a couple of strands that pass close to the camera and are
 * deliberately softened, which is what gives the frame depth without any
 * post-processing pass.
 */
export class HeroScene {
  private pool: Buffers[] = [];
  private cam: Camera = { rotY: 0, rotX: 0, dist: 3, zoom: 1 };

  private take(index: number): Buffers {
    let b = this.pool[index];
    if (!b) {
      b = makeBuffers();
      this.pool[index] = b;
    }
    return b;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    p: HeroParams,
    time: number,
    px: number,
    py: number,
    palette: MetalPalette,
  ) {
    this.drawAtmosphere(ctx, width, height, p.haze);

    // Roughly two degrees of pointer influence. Felt, not noticed.
    this.cam.rotY = p.camRotY + px * 0.035;
    this.cam.rotX = p.camRotX + py * 0.022;
    this.cam.dist = p.camDist;
    this.cam.zoom = p.camZoom;

    const lightAngle = -2.15 + Math.sin(time * 0.16) * 0.22 + px * 0.1;
    const light: Light = { x: Math.cos(lightAngle), y: Math.sin(lightAngle) };

    const unit = Math.min(width, height);
    const baseWidth = unit * 0.0075;

    type Item = { b: Buffers; depth: number; width: number; alpha: number; blur: number };
    const items: Item[] = [];
    let slot = 0;

    const panelCount = 1 + Math.floor(p.panels);
    for (let panel = 0; panel < panelCount; panel++) {
      // Panels alternate outward from the centre so the structure grows
      // symmetrically rather than trailing off to one side.
      const dir = panel === 0 ? 0 : panel % 2 === 1 ? 1 : -1;
      const step = Math.ceil(panel / 2);
      const panelAlpha = clamp01(p.panels - (panel - 1));
      if (panel > 0 && panelAlpha <= 0.01) continue;

      const offsetX = dir * step * SPAN * 2;

      // Horizontal strands.
      const wholeWires = Math.ceil(p.wires);
      for (let i = 0; i < wholeWires; i++) {
        const alpha = clamp01(p.wires - i) * (panel === 0 ? 1 : panelAlpha);
        if (alpha <= 0.01) continue;
        const row = wholeWires === 1 ? 0 : i / (wholeWires - 1) - 0.5;
        const b = this.take(slot++);
        let depth = 0;
        for (let k = 0; k < SAMPLES; k++) {
          const s = k / (SAMPLES - 1);
          const pt = b.pts[k];
          pt.x = offsetX + (s - 0.5) * 2 * SPAN;
          pt.y = row * 1.15 + Math.sin(s * Math.PI) * p.bend * 0.14;
          pt.z = Math.sin(s * Math.PI * 11) * 0.05 * p.verticals * 0.09;
          project(pt, this.cam, width, height, b.proj[k]);
          depth += b.proj[k].depth;
        }
        items.push({
          b,
          depth: depth / SAMPLES,
          width: baseWidth,
          alpha,
          blur: 0,
        });
      }

      // Perpendicular strands.
      const wholeVerts = Math.ceil(p.verticals);
      for (let i = 0; i < wholeVerts; i++) {
        const alpha = clamp01(p.verticals - i) * (panel === 0 ? 1 : panelAlpha);
        if (alpha <= 0.01) continue;
        const col = wholeVerts === 1 ? 0 : i / (wholeVerts - 1) - 0.5;
        const b = this.take(slot++);
        let depth = 0;
        for (let k = 0; k < SAMPLES; k++) {
          const s = k / (SAMPLES - 1);
          const pt = b.pts[k];
          pt.x = offsetX + col * 2 * SPAN;
          pt.y = (s - 0.5) * 1.15;
          pt.z = -Math.sin(s * Math.PI * 9) * 0.03;
          project(pt, this.cam, width, height, b.proj[k]);
          depth += b.proj[k].depth;
        }
        items.push({ b, depth: depth / SAMPLES, width: baseWidth * 0.92, alpha, blur: 0 });
      }

      // Posts. They arrive with the structure and read as steel rod, which is
      // another thing the company actually makes.
      if (p.posts > 0.01 && panel > 0) {
        const b = this.take(slot++);
        let depth = 0;
        for (let k = 0; k < SAMPLES; k++) {
          const s = k / (SAMPLES - 1);
          const pt = b.pts[k];
          pt.x = offsetX - dir * SPAN;
          pt.y = (s - 0.5) * 1.7;
          pt.z = 0.12;
          project(pt, this.cam, width, height, b.proj[k]);
          depth += b.proj[k].depth;
        }
        items.push({
          b,
          depth: depth / SAMPLES,
          width: baseWidth * 3.1,
          alpha: p.posts * panelAlpha,
          blur: 0,
        });
      }
    }

    // Foreground: two strands close to the camera, softened. They exist to put
    // something out of focus in front of the subject, the way a long lens does.
    const near = easeOutPower3(clamp01((p.panels - 0.2) / 1.6));
    if (near > 0.01) {
      for (let i = 0; i < 2; i++) {
        const b = this.take(slot++);
        for (let k = 0; k < SAMPLES; k++) {
          const s = k / (SAMPLES - 1);
          const pt = b.pts[k];
          pt.x = (s - 0.5) * 4;
          pt.y = (i === 0 ? -0.62 : 0.74) + Math.sin(s * Math.PI * 0.7 + time * 0.1) * 0.06;
          pt.z = -1.35;
          project(pt, this.cam, width, height, b.proj[k]);
        }
        items.push({
          b,
          depth: -1.35,
          width: baseWidth * 2.2,
          alpha: near * 0.26,
          blur: unit * 0.008,
        });
      }
    }

    items.sort((l, r) => r.depth - l.depth);

    for (const item of items) {
      // Reveal draws each strand out of the dark along its length rather than
      // fading it in as a whole, so it reads as material being fed through.
      const shown = Math.max(2, Math.round(SAMPLES * clamp01(p.reveal)));
      const pts = item.b.proj.slice(0, shown);
      ctx.save();
      ctx.globalAlpha = item.alpha;
      if (item.blur > 0) ctx.filter = `blur(${item.blur.toFixed(1)}px)`;
      drawStrand(ctx, pts, item.width, light, palette, CHUNK);
      ctx.restore();
    }
  }

  private drawAtmosphere(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    haze: number,
  ) {
    // Never a flat black field. A dark room still has a gradient in it.
    const g = ctx.createRadialGradient(
      width * 0.62,
      height * 0.3,
      0,
      width * 0.62,
      height * 0.3,
      Math.max(width, height) * 0.9,
    );
    g.addColorStop(0, `rgb(33 35 35 / ${(0.55 * haze).toFixed(3)})`);
    g.addColorStop(0.55, `rgb(23 25 25 / ${(0.3 * haze).toFixed(3)})`);
    g.addColorStop(1, "rgb(13 14 14 / 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }
}
