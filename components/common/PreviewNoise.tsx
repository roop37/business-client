"use client";

import { useEffect, useRef } from "react";

/**
 * Animated grain canvas, scoped to a containing element via
 * `position: absolute` (vs the customer-app's `position: fixed`
 * full-viewport overlay). Drop inside any positioned parent — the
 * preview aside in EventJourney, for example — to give it the same
 * "wet glass with film grain" feel as hoizr.com without bleeding
 * across the entire business dashboard.
 */
type Props = {
  /** Square dimension of the source pattern, in px. */
  patternSize?: number;
  /** Redraw every Nth frame. Higher = cheaper, slower shimmer. */
  patternRefreshInterval?: number;
  /** Alpha 0–255. Mix-blend overlay makes effective opacity lower. */
  patternAlpha?: number;
  /** mix-blend-mode applied to the canvas. */
  blendMode?: React.CSSProperties["mixBlendMode"];
  /** Optional inline opacity multiplier 0–1. */
  opacity?: number;
};

export const PreviewNoise = ({
  patternSize = 220,
  patternRefreshInterval = 2,
  patternAlpha = 18,
  blendMode = "overlay",
  opacity = 0.55,
}: Props) => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Honor `prefers-reduced-motion` — paint one static grain frame and
    // skip the animation loop entirely. Saves battery for anyone who's
    // opted out, and avoids motion sickness for people sensitive to
    // shimmering textures.
    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const size = Math.max(256, Math.round(patternSize * 4));
    canvas.width = size;
    canvas.height = size;

    let frame = 0;
    let raf = 0;

    const draw = () => {
      const img = ctx.createImageData(size, size);
      const data = img.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = patternAlpha;
      }
      ctx.putImageData(img, 0, 0);
    };

    if (reduceMotion) {
      draw();
      return;
    }

    const loop = () => {
      if (document.visibilityState !== "visible") {
        // Pause the loop while the tab is hidden so we're not allocating
        // a 256-pixel ImageData buffer every other frame in the
        // background. The visibilitychange listener below resumes it.
        return;
      }
      if (frame % Math.max(1, patternRefreshInterval) === 0) draw();
      frame++;
      raf = window.requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") loop();
    };

    document.addEventListener("visibilitychange", onVisibility);
    loop();
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.cancelAnimationFrame(raf);
    };
  }, [patternSize, patternRefreshInterval, patternAlpha]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        mixBlendMode: blendMode,
        opacity,
        imageRendering: "pixelated",
        zIndex: 0,
      }}
    />
  );
};

export default PreviewNoise;
