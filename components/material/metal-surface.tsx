"use client";

import { useEffect, useRef, useState } from "react";
import { MaterialFill } from "./material-fill";
import { cn } from "@/lib/cn";

/**
 * A live brushed steel surface with the company's own diamond lattice sitting
 * on it, lit by a light that follows the pointer.
 *
 * The reason this exists rather than a static image: steel is defined by what
 * it does to light, and no flat panel can show that. The highlight is
 * anisotropic, meaning it smears along the brush grain instead of forming a
 * round blob, which is the actual behaviour of a brushed surface and the thing
 * that makes it read as metal rather than as grey paint.
 *
 * Raw WebGL2, no library, so it costs a few kilobytes rather than the hundreds
 * a 3D engine would. It pauses when scrolled out of view, renders a single
 * static frame under reduced motion, and falls back to the plain material plate
 * if a context cannot be created.
 */

const VERT = `#version 300 es
void main() {
  // Fullscreen triangle. No buffers, no attributes.
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;

uniform vec2  uResolution;
uniform vec2  uLight;
uniform vec3  uBase;
uniform vec3  uWire;
uniform vec3  uSpec;
uniform float uScale;

out vec4 fragColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
             mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  // Brush grain, on the same fixed 100 degree axis the CSS plates use, so the
  // whole site reads as one piece of stock.
  float a = radians(100.0);
  vec2 axis = vec2(cos(a), sin(a));
  vec2 perp = vec2(-axis.y, axis.x);
  float along = dot(p, axis);
  float across = dot(p, perp);
  float streak = noise(vec2(across * 430.0, along * 3.0)) * 0.5
               + noise(vec2(across * 150.0, along * 1.4)) * 0.5;

  // The expanded metal diamond, as a distance field so the strands can be lit
  // as round wire rather than drawn as flat lines.
  vec2 cell = fract(p * uScale) - 0.5;
  float diamond = abs(cell.x) + abs(cell.y) - 0.42;
  float t = clamp(diamond / 0.032, -1.0, 1.0);
  float wireMask = 1.0 - smoothstep(0.82, 1.0, abs(t));
  float bulge = sqrt(max(0.0, 1.0 - t * t));

  vec2 lp = vec2(uLight.x * aspect, uLight.y);
  vec2 d = lp - p;
  float dAlong = dot(d, axis);
  float dAcross = dot(d, perp);

  // Anisotropic highlight: tight across the grain, long along it.
  float aniso = exp(-(dAlong * dAlong) / 0.85 - (dAcross * dAcross) / 0.045);
  float wash = exp(-dot(d, d) / 1.1);

  float plateLight = (aniso * 0.55 + wash * 0.16) * (0.75 + streak * 0.5);
  float wireLight = (aniso * 0.85 + wash * 0.24) * bulge;

  vec3 col = uBase * (0.82 + streak * 0.36);
  col += uSpec * plateLight * 0.32;
  col *= 1.0 - wireMask * 0.22;                      // contact shadow under the strand
  col = mix(col, uWire * (0.55 + bulge * 0.45), wireMask * 0.6);
  col += uSpec * wireLight * wireMask * 0.4;

  vec2 c = uv - 0.5;
  col *= 1.0 - dot(c, c) * 0.72;                      // sit in the page, do not glow at the edges

  fragColor = vec4(col, 1.0);
}`;

/** Resolves a CSS custom property to linear 0..1 RGB via a 1px canvas. */
function readColor(styles: CSSStyleDeclaration, name: string, probe: CanvasRenderingContext2D) {
  probe.fillStyle = "#000";
  probe.fillStyle = styles.getPropertyValue(name).trim();
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255] as const;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("[metal-surface]", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function MetalSurface({
  className,
  scale = 9,
  fallbackScale = 92,
}: {
  className?: string;
  /** Lattice repetitions across the surface. Lower reads as heavier gauge. */
  scale?: number;
  fallbackScale?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    if (!gl) {
      setFailed(true);
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      setFailed(true);
      return;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("[metal-surface]", gl.getProgramInfoLog(program));
      setFailed(true);
      return;
    }
    gl.useProgram(program);

    const u = {
      resolution: gl.getUniformLocation(program, "uResolution"),
      light: gl.getUniformLocation(program, "uLight"),
      base: gl.getUniformLocation(program, "uBase"),
      wire: gl.getUniformLocation(program, "uWire"),
      spec: gl.getUniformLocation(program, "uSpec"),
      scale: gl.getUniformLocation(program, "uScale"),
    };

    const probe = document.createElement("canvas").getContext("2d", {
      willReadFrequently: true,
    })!;
    const styles = getComputedStyle(document.documentElement);
    gl.uniform3fv(u.base, readColor(styles, "--color-raised", probe));
    gl.uniform3fv(u.wire, readColor(styles, "--color-edge", probe));
    gl.uniform3fv(u.spec, readColor(styles, "--color-spec-hi", probe));
    gl.uniform1f(u.scale, scale);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Target and current are kept apart so the light eases toward the pointer
    // instead of snapping to it. Both live outside React state: this updates
    // every frame, and a re-render per frame would be absurd.
    let targetX = 0.72;
    let targetY = 0.2;
    let lightX = targetX;
    let lightY = targetY;
    let raf = 0;
    let visible = true;
    let start = performance.now();

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas!.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas!.clientHeight * dpr));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
        gl!.viewport(0, 0, w, h);
      }
      gl!.uniform2f(u.resolution, canvas!.width, canvas!.height);
    }

    function draw() {
      gl!.uniform2f(u.light, lightX, lightY);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    function frame(now: number) {
      const t = (now - start) / 1000;
      // Autonomous drift keeps the surface alive without a pointer, which is
      // every touch device.
      const driftX = 0.5 + Math.cos(t * 0.21) * 0.3;
      const driftY = 0.42 + Math.sin(t * 0.27) * 0.28;
      const wx = pointerSeen ? 0.78 : 0;
      lightX += (targetX * wx + driftX * (1 - wx) - lightX) * 0.045;
      lightY += (targetY * wx + driftY * (1 - wx) - lightY) * 0.045;
      resize();
      draw();
      raf = requestAnimationFrame(frame);
    }

    let pointerSeen = false;
    function onPointer(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointerSeen = true;
      targetX = (event.clientX - rect.left) / rect.width;
      // WebGL's origin is bottom left, the DOM's is top left.
      targetY = 1 - (event.clientY - rect.top) / rect.height;
    }

    function onLeave() {
      pointerSeen = false;
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    function play() {
      if (raf || reduced.matches) return;
      start = performance.now() - 1000;
      raf = requestAnimationFrame(frame);
    }

    // A shader running behind content the reader has scrolled past is wasted
    // battery, so the loop only runs while the surface is on screen.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) play();
        else stop();
      },
      { threshold: 0.01 },
    );
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      resize();
      if (!raf) draw();
    });
    ro.observe(canvas);

    function onMotionChange() {
      if (reduced.matches) {
        stop();
        resize();
        draw();
      } else if (visible) {
        play();
      }
    }
    reduced.addEventListener("change", onMotionChange);

    canvas.addEventListener("pointermove", onPointer);
    canvas.addEventListener("pointerleave", onLeave);

    resize();
    if (reduced.matches) draw();
    else play();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      reduced.removeEventListener("change", onMotionChange);
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerleave", onLeave);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      // Deliberately no loseContext() here. getContext returns the same object
      // for the life of the canvas, so forcing a loss on cleanup hands the next
      // mount a dead context. Strict Mode remounts every effect in development,
      // which made this fail immediately and silently. The context is released
      // with the canvas element.
    };
  }, [scale]);

  if (failed) {
    return <MaterialFill scale={fallbackScale} meshOpacity={0.2} className={className} />;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("block h-full w-full", className)}
    />
  );
}
