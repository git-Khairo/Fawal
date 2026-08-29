"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

export type SceneFrame = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  /** Seconds since the scene started. */
  time: number;
  /** Smoothed pointer, -1..1 relative to the canvas centre. Zero when absent. */
  px: number;
  py: number;
  /** True when the browser asked for reduced motion. Scenes render a still. */
  still: boolean;
};

/**
 * Hosts a canvas scene: sizing, device pixel ratio, pointer smoothing, the
 * animation loop, visibility pausing and teardown.
 *
 * The visibility rule is deliberate. An IntersectionObserver's first callback
 * can arrive before layout has settled and report that a plainly visible
 * element is not intersecting; if that is allowed to cancel the loop, nothing
 * ever restarts it, because intersection never subsequently "changes". So the
 * loop starts unconditionally and the observer is only permitted to pause it
 * once it has confirmed at least one genuinely visible frame.
 */
export function WireCanvas({
  draw,
  className,
  maxDpr = 2,
  ariaLabel,
}: {
  draw: (frame: SceneFrame) => void;
  className?: string;
  maxDpr?: number;
  ariaLabel?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Held in a ref so a changing draw function never restarts the loop. Updated
  // in an effect rather than during render, which React forbids.
  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let confirmedVisible = false;
    let paused = false;
    const startedAt = performance.now();

    let targetPx = 0;
    let targetPy = 0;
    let px = 0;
    let py = 0;

    let width = 0;
    let height = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const w = Math.max(1, Math.round(canvas!.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas!.clientHeight * dpr));
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
      }
      width = w;
      height = h;
    }

    function render(now: number) {
      const time = (now - startedAt) / 1000;
      // Ease the pointer rather than tracking it. The object should not chase.
      px += (targetPx - px) * 0.07;
      py += (targetPy - py) * 0.07;
      ctx!.clearRect(0, 0, width, height);
      drawRef.current({
        ctx: ctx!,
        width,
        height,
        time,
        px,
        py,
        still: reduced.matches,
      });
      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { __wireFrames?: number }).__wireFrames =
          ((window as unknown as { __wireFrames?: number }).__wireFrames ?? 0) + 1;
      }
    }

    function loop(now: number) {
      resize();
      render(now);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      // Guarding on `raf` rather than a separate flag: it is the only thing that
      // tells the truth about whether a frame is genuinely pending.
      if (raf || reduced.matches || paused || document.hidden) return;
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    function renderOnce() {
      resize();
      render(performance.now());
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          confirmedVisible = true;
          paused = false;
          start();
          return;
        }
        // Only trusted once the observer has proved it works for this element.
        if (confirmedVisible) {
          paused = true;
          stop();
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      if (!raf) renderOnce();
    });
    ro.observe(canvas);

    function onPointer(event: PointerEvent) {
      const r = canvas!.getBoundingClientRect();
      if (!r.width || !r.height) return;
      targetPx = ((event.clientX - r.left) / r.width) * 2 - 1;
      targetPy = ((event.clientY - r.top) / r.height) * 2 - 1;
    }

    function onMotionChange() {
      if (reduced.matches) {
        stop();
        renderOnce();
      } else if (!paused) {
        start();
      }
    }

    function onVisibility() {
      if (document.hidden) stop();
      else if (!paused && !reduced.matches) start();
    }

    window.addEventListener("pointermove", onPointer, { passive: true });
    reduced.addEventListener("change", onMotionChange);
    document.addEventListener("visibilitychange", onVisibility);

    if (process.env.NODE_ENV !== "production") {
      (canvas as HTMLCanvasElement & { __wireStep?: (seconds: number) => void }).__wireStep = (
        seconds: number,
      ) => {
        resize();
        render(startedAt + seconds * 1000);
      };
    }

    resize();
    if (reduced.matches) renderOnce();
    else start();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      reduced.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [maxDpr]);

  return (
    <canvas
      ref={canvasRef}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={cn("block h-full w-full", className)}
    />
  );
}
