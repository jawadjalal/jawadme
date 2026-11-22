import Image from "next/image";

const LOGOS = [
  { name: "IGNARU", src: "/logos/ignaru-mark.png" },
  { name: "MENUFIT", src: "/logos/menufit-bag-128.webp" },
  { name: "OKARA", src: "/logos/okara.png" },
  { name: "IGNURA", src: "/logos/ignura.png" },
  { name: "BEVEL", src: "/logos/bevel.png" },
  { name: "KLEOKLAW", src: "/logos/kleoklaw.png" },
  { name: "SPLITTING POINT", src: "/logos/splittingpoint.png" },
  { name: "VIZZBEES", src: "/logos/vizzbees.png" },
  { name: "ACQUIBLOX", src: "/logos/acquiblox.png" },
  { name: "BASKETENT", src: "/logos/basketent.png" },
] as const;

/** Cleanly cropped, edge-faded industrial logo marquee below the hero work carousel. */
export function LogoMarquee() {
  return (
    <div className="logo-bar" aria-label="Companies and projects">
      <div className="logo-track">
        {[...LOGOS, ...LOGOS].map((logo, i) => (
          <div key={i} className="logo-item">
            <span className="logo-frame">
              <Image
                src={logo.src}
                alt={logo.name}
                width={28}
                height={28}
                className="logo-mark"
                unoptimized
              />
            </span>
            <span>{logo.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
