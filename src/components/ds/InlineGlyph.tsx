import Image from "next/image";

export type GlyphKind =
  | "head"
  | "ads"
  | "brands"
  | "sites"
  | "cube"
  | "london"
  | "studio"
  | "bolt"
  | "reach";

/** Tactile Cal.com-style inline micro-graphics crafted for headlines and editorial breaks. */
export function InlineGlyph({
  kind,
  tilt = 0,
  size = "md",
}: {
  kind: GlyphKind;
  tilt?: number;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={`ig-tile ig-${kind} ig-${size}`}
      style={{ "--ig-tilt": `${tilt}deg` } as React.CSSProperties}
      aria-hidden="true"
    >
      {kind === "head" && (
        <Image
          src="/design/jawad-die.webp"
          alt=""
          width={36}
          height={40}
          sizes="36px"
          className="ig-head-img"
        />
      )}

      {kind === "ads" && (
        <svg viewBox="0 0 28 28" fill="none" className="ig-svg">
          {/* Mini campaign poster card with viewfinder corners */}
          <rect x="4" y="3" width="20" height="22" rx="3.5" fill="url(#igAdsBg)" stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" />
          <path d="M8 8.5h12M8 12h7" stroke="#181818" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
          <circle cx="17.5" cy="18" r="3.4" fill="#181818" opacity="0.82" />
          <circle cx="17.5" cy="18" r="1.4" fill="#ff9f5a" />
          <defs>
            <linearGradient id="igAdsBg" x1="4" y1="3" x2="24" y2="25" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ff8833" />
              <stop offset="1" stopColor="#ff5500" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {kind === "brands" && (
        <svg viewBox="0 0 28 28" fill="none" className="ig-svg">
          {/* Precision 4-point brand spark with registration reticle */}
          <circle cx="14" cy="14" r="9.5" stroke="rgba(255,255,255,0.16)" strokeWidth="1.2" strokeDasharray="2 2.5" />
          <path
            d="M14 4.8L16.35 11.65L23.2 14L16.35 16.35L14 23.2L11.65 16.35L4.8 14L11.65 11.65L14 4.8Z"
            fill="url(#igBrandGrad)"
          />
          <circle cx="14" cy="14" r="1.9" fill="#1e1e1e" />
          <defs>
            <linearGradient id="igBrandGrad" x1="5" y1="5" x2="23" y2="23" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fff4eb" />
              <stop offset="0.55" stopColor="#ff7b29" />
              <stop offset="1" stopColor="#ff5500" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {kind === "sites" && (
        <svg viewBox="0 0 28 28" fill="none" className="ig-svg">
          {/* Tactile mini browser window */}
          <rect x="3" y="5" width="22" height="18" rx="3.5" fill="#2c2c2c" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
          <path d="M3 10.2h22" stroke="rgba(255,255,255,0.14)" strokeWidth="1.1" />
          <circle cx="6.8" cy="7.6" r="1.15" fill="#ff6200" />
          <circle cx="10.2" cy="7.6" r="1.15" fill="#adb3b7" opacity="0.65" />
          <circle cx="13.6" cy="7.6" r="1.15" fill="#adb3b7" opacity="0.35" />
          <rect x="6" y="13" width="8" height="7" rx="1.5" fill="#ff6200" opacity="0.88" />
          <rect x="16" y="13" width="6" height="2.8" rx="1" fill="rgba(255,255,255,0.34)" />
          <rect x="16" y="17.2" width="6" height="2.8" rx="1" fill="rgba(255,255,255,0.18)" />
        </svg>
      )}

      {kind === "cube" && (
        <svg viewBox="0 0 28 28" fill="none" className="ig-svg">
          {/* Faceted isometric 3D cube */}
          <path d="M14 4L23 9.2L14 14.4L5 9.2L14 4Z" fill="#ff8438" />
          <path d="M5 9.2L14 14.4V24L5 18.8V9.2Z" fill="#d94e00" />
          <path d="M23 9.2L14 14.4V24L23 18.8V9.2Z" fill="#2d2d2d" />
          <path
            d="M14 4L23 9.2V18.8L14 24L5 18.8V9.2L14 4ZM14 14.4V24M14 14.4L5 9.2M14 14.4L23 9.2"
            stroke="rgba(255,255,255,0.38)"
            strokeWidth="1.05"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {kind === "london" && (
        <svg viewBox="0 0 28 28" fill="none" className="ig-svg">
          {/* Precision radar / meridian target */}
          <circle cx="14" cy="14" r="9" stroke="rgba(255,255,255,0.22)" strokeWidth="1.3" />
          <circle cx="14" cy="14" r="4.8" stroke="#ff6200" strokeWidth="1.4" />
          <circle cx="14" cy="14" r="2" fill="#f2f2f0" />
          <path d="M14 3v3.2M14 21.8V25M3 14h3.2M21.8 14H25" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )}

      {kind === "studio" && (
        <svg viewBox="0 0 28 28" fill="none" className="ig-svg">
          {/* Stacked layered architecture planes */}
          <path d="M14 5L23 9.8L14 14.6L5 9.8L14 5Z" fill="#ff7224" />
          <path d="M5 14.4L14 19.2L23 14.4" stroke="#f2f2f0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
          <path d="M5 18.8L14 23.6L23 18.8" stroke="#ff6200" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        </svg>
      )}

      {kind === "bolt" && (
        <svg viewBox="0 0 28 28" fill="none" className="ig-svg">
          <path
            d="M15.8 4L6.8 15.2H13.4L12.2 24L21.2 12.8H14.6L15.8 4Z"
            fill="url(#igBoltGrad)"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="igBoltGrad" x1="7" y1="4" x2="21" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fff2e6" />
              <stop offset="0.45" stopColor="#ff7a26" />
              <stop offset="1" stopColor="#e54d00" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {kind === "reach" && (
        <svg viewBox="0 0 28 28" fill="none" className="ig-svg">
          {/* Signal arcs / scale */}
          <circle cx="9.5" cy="18.5" r="3.2" fill="#ff6200" />
          <path d="M9.5 11.2A7.3 7.3 0 0 1 16.8 18.5" stroke="#f2f2f0" strokeWidth="2" strokeLinecap="round" />
          <path d="M9.5 6.4A12.1 12.1 0 0 1 21.6 18.5" stroke="#ff6200" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        </svg>
      )}
    </span>
  );
}
