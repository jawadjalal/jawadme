import Image from "next/image";
import Link from "next/link";

const PLATES = [
  { title: "Brand & Web", href: "/work/ignaru", src: "/world/poster/gate-d.webp" },
  { title: "Ads", href: "/work", src: "/world/poster/hall-d.webp" },
  { title: "3D & Roblox", href: "/work/fracture", src: "/work/fracture/mole-king.webp" },
] as const;

/** Three clean Hades II isometric plates — zero eyebrows or clutter. */
export function HadesDiagrams() {
  return (
    <section className="iso-sec" aria-label="Isometric plates">
      <div className="iso-grid">
        {PLATES.map((p) => (
          <Link key={p.title} href={p.href} className="iso-plate">
            <div className="iso-art">
              <Image
                src={p.src}
                alt={p.title}
                width={1440}
                height={900}
                sizes="(min-width: 1024px) 32vw, 100vw"
              />
            </div>
            <div className="iso-plate-min">
              <span className="iso-title-min">{p.title}</span>
              <span className="iso-code" aria-hidden="true">↗</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
