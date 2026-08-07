"use client";

// The power-on. Sits fixed over the whole scene for the first ~1.4s, then
// removes itself from the paint entirely (opacity + pointer-events via the
// .jos-booted class on the parent, so nothing here re-renders).
//
// The scene underneath simultaneously runs `crtOn` — see .jos .jos-crt in
// design.css — so the display appears to strike and settle rather than fade in.

export function BootOverlay({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="jos-boot" aria-hidden="true">
      <div className="jos-boot-scan" />
      <div className="jos-boot-inner">
        <div className="jos-boot-mark">
          <span className="jos-boot-diamond" />
        </div>
        <span className="jos-boot-label">{label}</span>
        <div className="jos-boot-bar">
          <span />
        </div>
        <span className="jos-boot-hint">{hint}</span>
      </div>
      <div className="jos-boot-flash" />
    </div>
  );
}
