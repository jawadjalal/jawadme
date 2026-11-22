import Image from "next/image";
import Link from "next/link";

const PLATES = [
  {
    code: "FIG. 01 // THE GATE",
    title: "BRAND & WEB ARCHITECTURE",
    desc: "Identity systems, high-conversion launch sites, and full-stack Next.js builds engineered from scratch.",
    href: "/work/ignaru",
    cta: "VIEW IGNARU ↗",
    src: "/world/poster/gate-d.webp",
    coords: "ISO 30° · ELEV +14.2M",
  },
  {
    code: "FIG. 02 // THE HALL",
    title: "70+ ART-DIRECTED AD CONCEPTS",
    desc: "Visual metaphors and outdoor-grade campaigns crafted for frontier AI, tech, and consumer brands.",
    href: "/work",
    cta: "OPEN AD ARCHIVE ↗",
    src: "/world/poster/hall-d.webp",
    coords: "ISO 30° · CORRIDOR 02",
  },
  {
    code: "FIG. 03 // THE SHAFT",
    title: "3D ART & ROBLOX WORLDS",
    desc: "Lead design & engineering on Fracture, plus 3D assets for Blade Ball & Fish It (11B+ combined visits).",
    href: "/work/fracture",
    cta: "EXPLORE FRACTURE ↗",
    src: "/work/fracture/mole-king.webp",
    coords: "DEPTH -420M · 68 ORES",
  },
] as const;

/** Framed Hades-style isometric architectural diagrams.
 *  Replaces the broken full-page 3D world with crisp, ember-graded technical specimen plates. */
export function HadesDiagrams() {
  return (
    <section className="iso-sec" aria-labelledby="iso-heading">
      <div className="sec-head">
        <div className="sec-head-l">
          <span className="sec-idx">[03] // SYSTEM SCHEMATICS</span>
          <h2 id="iso-heading" className="sec-title">
            CRAFT ACROSS THREE DISCIPLINES.
          </h2>
        </div>
        <div className="sec-head-r">
          <span className="sec-note">HADES II ISOMETRIC PLATES // GILDED &amp; SPECTRAL</span>
        </div>
      </div>

      <div className="iso-grid">
        {PLATES.map((p) => (
          <Link key={p.code} href={p.href} className="iso-plate">
            <div className="iso-plate-top">
              <span>{p.code}</span>
              <span>{p.coords}</span>
            </div>
            <div className="iso-art">
              <Image
                src={p.src}
                alt={p.title}
                width={1440}
                height={900}
                sizes="(min-width: 1024px) 32vw, 100vw"
              />
              <div className="iso-reticle" aria-hidden="true">
                <span className="iso-cross tl">+</span>
                <span className="iso-cross tr">+</span>
                <span className="iso-cross bl">+</span>
                <span className="iso-cross br">+</span>
              </div>
            </div>
            <div className="iso-plate-bot">
              <h3 className="iso-title">{p.title}</h3>
              <p className="iso-desc">{p.desc}</p>
              <span className="iso-cta">{p.cta}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
