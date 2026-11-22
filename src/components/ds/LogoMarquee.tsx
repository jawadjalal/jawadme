import Image from "next/image";

const LOGOS = [
  { name: "IGNARU", src: "/logos/clean/ignaru.png" },
  { name: "MENUFIT", src: "/logos/clean/menufit.png" },
  { name: "OKARA", src: "/logos/clean/okara.png" },
  { name: "IGNURA", src: "/logos/clean/ignura.png" },
  { name: "BEVEL", src: "/logos/clean/bevel.png" },
  { name: "KLEOKLAW", src: "/logos/clean/kleoklaw.png" },
  { name: "SPLITTING POINT", src: "/logos/clean/splittingpoint.png" },
  { name: "VIZZBEES", src: "/logos/clean/vizzbees.png" },
  { name: "ACQUIBLOX", src: "/logos/clean/acquiblox.png" },
  { name: "BASKETENT", src: "/logos/clean/basketent.png" },
] as const;

/** Extracted, borderless transparent logo marks floating in a refined edge-faded marquee. */
export function LogoMarquee() {
  return (
    <div className="logo-bar" aria-label="Companies and projects">
      <div className="logo-track">
        {[...LOGOS, ...LOGOS].map((logo, i) => (
          <div key={i} className="logo-item">
            <Image
              src={logo.src}
              alt={logo.name}
              width={24}
              height={24}
              className="logo-mark-clean"
              unoptimized
            />
            <span>{logo.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
