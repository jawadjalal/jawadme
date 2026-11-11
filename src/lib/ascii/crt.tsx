import type { ComponentProps, CSSProperties } from "react";

import type { PostFx } from "@/lib/ascii/look";
import { cn } from "@/lib/utils";

/**
 * A CSS approximation of the GPU renderer's CRT finish, for Canvas2D and
 * DOM renderers: scanlines, phosphor glow, vignette, corner shading for
 * curved glass, flicker and a rolling glitch band. Lay it over the glyphs
 * (the parent must be positioned); it never takes pointer events.
 * Server-safe.
 *
 * Glow blurs whatever is behind the overlay (`backdrop-filter`) and adds
 * it back with `screen`, so every glyph glows in its own colour. It is
 * scaled by `--ascii-glow` per theme. Flicker and glitch stop under
 * reduced motion.
 */

const KEYFRAMES = `@keyframes ascii-crt-flicker{0%,100%{opacity:0}8%{opacity:.6}9%{opacity:.1}31%{opacity:.4}32%{opacity:0}63%{opacity:.8}64%{opacity:.2}}@keyframes ascii-crt-roll{0%{transform:translateY(-10%)}100%{transform:translateY(1100%)}}@media (prefers-reduced-motion:reduce){[data-ascii-crt] *{animation:none!important}}`;

const layer: CSSProperties = { inset: 0, position: "absolute" };

export interface CrtOverlayProps extends Omit<
  ComponentProps<"div">,
  "children"
> {
  /** Effect strengths, each 0 (off) to 1. Unset effects are off. */
  fx: PostFx;
}

/** CRT effects as stacked CSS layers over a renderer. Renders nothing when every effect is off. */
export const CrtOverlay = ({
  fx,
  className,
  style,
  ...props
}: CrtOverlayProps) => {
  const {
    scanlines = 0,
    bloom = 0,
    curvature = 0,
    glitch = 0,
    flicker = 0,
    vignette = 0,
  } = fx;
  if (Math.max(scanlines, bloom, curvature, glitch, flicker, vignette) <= 0) {
    return null;
  }
  return (
    <div
      aria-hidden="true"
      data-ascii-crt=""
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      style={{
        borderRadius: curvature > 0 ? `${curvature * 18}px` : undefined,
        ...style,
      }}
      {...props}
    >
      {flicker > 0 || glitch > 0 ? <style>{KEYFRAMES}</style> : null}
      {bloom > 0 ? (
        <div
          style={{
            ...layer,
            WebkitBackdropFilter: `blur(${2 + bloom * 6}px) brightness(${1 + bloom * 0.8})`,
            backdropFilter: `blur(${2 + bloom * 6}px) brightness(${1 + bloom * 0.8})`,
            mixBlendMode: "screen",
            opacity: `calc(var(--ascii-glow, var(--ascii-bloom, 1)) * ${Math.min(1, bloom * 0.9)})`,
          }}
        />
      ) : null}
      {scanlines > 0 ? (
        <div
          style={{
            ...layer,
            backgroundImage: `repeating-linear-gradient(to bottom, rgb(0 0 0 / ${scanlines * 0.45}) 0 1px, transparent 1px 3px)`,
          }}
        />
      ) : null}
      {glitch > 0 ? (
        <div
          style={{
            WebkitBackdropFilter: `saturate(${1 + glitch * 2}) brightness(${1 + glitch * 0.5}) hue-rotate(${glitch * 40}deg)`,
            animation: `ascii-crt-roll ${6 - glitch * 4}s steps(${Math.round(24 + glitch * 40)}) infinite`,
            backdropFilter: `saturate(${1 + glitch * 2}) brightness(${1 + glitch * 0.5}) hue-rotate(${glitch * 40}deg)`,
            height: "9%",
            left: 0,
            position: "absolute",
            right: 0,
            top: 0,
          }}
        />
      ) : null}
      {flicker > 0 ? (
        <div
          style={{
            ...layer,
            animation: `ascii-crt-flicker ${2.4 - flicker}s steps(1) infinite`,
            background: `rgb(0 0 0 / ${flicker * 0.18})`,
          }}
        />
      ) : null}
      {vignette > 0 ? (
        <div
          style={{
            ...layer,
            background: `radial-gradient(ellipse at center, transparent ${62 - vignette * 22}%, rgb(0 0 0 / ${vignette * 0.75}) 100%)`,
          }}
        />
      ) : null}
      {curvature > 0 ? (
        <div
          style={{
            ...layer,
            borderRadius: "inherit",
            boxShadow: `inset 0 0 ${8 + curvature * 28}px ${curvature * 6}px rgb(0 0 0 / ${0.25 + curvature * 0.45})`,
          }}
        />
      ) : null}
    </div>
  );
};
