import Image from "next/image";

const LOGOS = [
  { name: "Ignaru", src: "/logos/ignaru.svg" },
  { name: "MenuFit", src: "/logos/menufit.png" },
  { name: "Okara", src: "/logos/okara.png" },
  { name: "Ignura", src: "/logos/ignura.png" },
  { name: "Bevel", src: "/logos/bevel.png" },
  { name: "Kleoklaw", src: "/logos/kleoklaw.png" },
  { name: "Splitting Point", src: "/logos/splittingpoint.png" },
  { name: "Vizzbees", src: "/logos/vizzbees.png" },
  { name: "Acquiblox", src: "/logos/acquiblox.png" },
  { name: "BasketEnt", src: "/logos/basketent.png" },
] as const;

/** Refined, edge-faded real logo marquee positioned cleanly under the hero carousel. */
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
              className="logo-mark"
              unoptimized
            />
            <span>{logo.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
