import Image from "next/image";

const ROW_TOP = [
  { name: "IGNARU", src: "/logos/clean/ignaru.png" },
  { name: "MENUFIT", src: "/logos/clean/menufit.png" },
  { name: "OKARA", src: "/logos/clean/okara.png" },
  { name: "IGNURA", src: "/logos/clean/ignura.png" },
  { name: "BEVEL", src: "/logos/clean/bevel.png" },
] as const;

const ROW_BOTTOM = [
  { name: "KLEOKLAW", src: "/logos/clean/kleoklaw.png" },
  { name: "SPLITTING POINT", src: "/logos/clean/splittingpoint.png" },
  { name: "VIZZBEES", src: "/logos/clean/vizzbees.png" },
  { name: "ACQUIBLOX", src: "/logos/clean/acquiblox.png" },
  { name: "BASKETENT", src: "/logos/clean/basketent.png" },
] as const;

/** Two-layer counter-scrolling borderless logo marquee. */
export function LogoMarquee() {
  return (
    <div className="logo-bar logo-bar-2" aria-label="Companies and projects">
      <div className="logo-row">
        <div className="logo-track">
          {[...ROW_TOP, ...ROW_TOP, ...ROW_TOP, ...ROW_TOP].map((logo, i) => (
            <div key={`t-${i}`} className="logo-item">
              <Image
                src={logo.src}
                alt={logo.name}
                width={22}
                height={22}
                className="logo-mark-clean"
                unoptimized
              />
              <span>{logo.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="logo-row logo-row-b">
        <div className="logo-track logo-track-rev">
          {[...ROW_BOTTOM, ...ROW_BOTTOM, ...ROW_BOTTOM, ...ROW_BOTTOM].map((logo, i) => (
            <div key={`b-${i}`} className="logo-item">
              <Image
                src={logo.src}
                alt={logo.name}
                width={22}
                height={22}
                className="logo-mark-clean"
                unoptimized
              />
              <span>{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
