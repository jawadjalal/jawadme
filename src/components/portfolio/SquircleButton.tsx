// A squircle: a superellipse corner, so the curve eases out of the straight edge instead of meeting it at a joint, as
// an iOS app icon does. Not a pill, not a rounded rectangle. The outline is computed for the button's exact size and
// applied as a clip-path, so it stays crisp at any zoom and needs no image.

type Size = "md" | "sm";

const SIZES: Record<Size, { w: number; h: number }> = {
  md: { w: 116, h: 46 },
  sm: { w: 104, h: 42 },
};

/** The outline of a w by h box with superellipse corners of radius r and exponent n (4 to 5 reads as a squircle). */
export function squirclePath(w: number, h: number, r: number, n = 4.2, steps = 14) {
  const e = 2 / n;
  const pts: string[] = [];
  const corner = (cx: number, cy: number, sx: number, sy: number, from: number) => {
    for (let i = 0; i <= steps; i++) {
      const t = ((from + (i / steps)) * Math.PI) / 2;
      const c = Math.cos(t), s = Math.sin(t);
      const x = cx + sx * r * Math.sign(c) * Math.abs(c) ** e;
      const y = cy + sy * r * Math.sign(s) * Math.abs(s) ** e;
      pts.push(`${x.toFixed(2)} ${y.toFixed(2)}`);
    }
  };
  // clockwise from the top right corner; each corner sweeps a quarter turn
  corner(w - r, r, 1, -1, 0); // top right: angle 0 to 90, y up
  corner(r, r, 1, -1, 1); // top left: 90 to 180
  corner(r, h - r, 1, -1, 2); // bottom left: 180 to 270
  corner(w - r, h - r, 1, -1, 3); // bottom right: 270 to 360
  return `M ${pts.join(" L ")} Z`;
}

export function SquircleButton({
  href,
  children = "hire me",
  size = "md",
  className = "",
  label,
}: {
  href: string;
  children?: React.ReactNode;
  size?: Size;
  className?: string;
  /** an accessible name when the visible label needs more context */
  label?: string;
}) {
  const { w, h } = SIZES[size];
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      className={`sq ${className}`}
      data-size={size}
      aria-label={label}
      style={{ width: w, height: h, clipPath: `path("${squirclePath(w, h, h * 0.46)}")` }}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
    >
      <span>{children}</span>
    </a>
  );
}
