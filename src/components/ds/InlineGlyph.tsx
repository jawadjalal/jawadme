import Image from "next/image";

export type PillKind = "head" | "ads" | "brands" | "sites" | "3d" | "campaign";

/** Straight, varied-width editorial visual pills embedded inline in display headlines
 *  using real previews of Jawad's own work (zero tilt, zero generic icon boxes). */
export function InlinePill({ kind }: { kind: PillKind }) {
  if (kind === "head") {
    return (
      <span className="ip-pill ip-head" aria-hidden="true">
        <Image
          src="/design/jawad-die.webp"
          alt=""
          width={44}
          height={48}
          sizes="44px"
          className="ip-head-img"
        />
      </span>
    );
  }

  if (kind === "ads") {
    return (
      <span className="ip-pill ip-ads" aria-hidden="true">
        <Image
          src="/ads/new/on-480.webp"
          alt=""
          width={96}
          height={120}
          sizes="80px"
          className="ip-cover"
        />
      </span>
    );
  }

  if (kind === "brands") {
    return (
      <span className="ip-pill ip-brands" aria-hidden="true">
        <Image
          src="/logos/clean/ignaru.png"
          alt=""
          width={32}
          height={32}
          unoptimized
          className="ip-mark"
        />
      </span>
    );
  }

  if (kind === "sites") {
    return (
      <span className="ip-pill ip-sites" aria-hidden="true">
        <Image
          src="/work/ignaru.webp"
          alt=""
          width={140}
          height={88}
          sizes="100px"
          className="ip-cover"
        />
      </span>
    );
  }

  if (kind === "campaign") {
    return (
      <span className="ip-pill ip-campaign" aria-hidden="true">
        <Image
          src="/ads/new/cisco-480.webp"
          alt=""
          width={96}
          height={120}
          sizes="80px"
          className="ip-cover"
        />
      </span>
    );
  }

  // "3d"
  return (
    <span className="ip-pill ip-3d" aria-hidden="true">
      <Image
        src="/work/fracture/mole-king.webp"
        alt=""
        width={120}
        height={80}
        sizes="90px"
        className="ip-cover"
      />
    </span>
  );
}

/** Ultra-clean, straight 1.5px hairline monochrome icons for editorial line breaks. */
export function BeatIcon({ kind }: { kind: "frame" | "layers" | "cube" }) {
  if (kind === "frame") {
    return (
      <svg className="ed-ico" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="2.25" y="2.25" width="11.5" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5 6h6M5 9.5h3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "layers") {
    return (
      <svg className="ed-ico" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 2.2L14 5.5L8 8.8L2 5.5L8 2.2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M2 8.4L8 11.7L14 8.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 11.1L8 14.4L14 11.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className="ed-ico" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2L13.5 5.1V11.3L8 14.4L2.5 11.3V5.1L8 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 8.2V14.4M8 8.2L2.5 5.1M8 8.2L13.5 5.1" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
