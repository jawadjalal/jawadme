import Image from "next/image";
import Link from "next/link";
import { Embers } from "../Embers";
import { Lean } from "../Lean";
import { CAL, HEAD, NAV, SUB } from "../copy";

// Direction 3. Fracture, with a studio's restraint: one object in the dark. The cracked pillar stands in the brazier's
// light, leans toward the pointer, sparks rise past it. The type is plain Inter Display in bone; the game is in the
// light and the object, not in the letters.

export default function Hero3() {
  return (
    <Lean className="h3x">
      <div className="h3x-glow" aria-hidden="true" />
      <div className="h3x-obj" aria-hidden="true">
        <Image src="/three/pillar-illustration.webp" alt="" width={768} height={1152} priority fetchPriority="high" sizes="(min-width: 768px) 40vw, 70vw" />
      </div>
      <Embers />
      <nav className="h3x-nav" aria-label="Site">
        <Link href="/" className="h3x-name">
          Jawad Jalal
        </Link>
        <span className="h3x-links">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href}>
              {n.label}
            </Link>
          ))}
        </span>
      </nav>
      <main className="h3x-copy">
        <h1 className="h3x-h">{HEAD}</h1>
        <p className="h3x-sub">{SUB}</p>
      </main>
      <div className="h3x-foot">
        <Link href="/derelictdepths">Lit like Fracture, my Roblox game ↗</Link>
        <Link href={CAL} className="h3x-cta">
          Book a call ↗
        </Link>
      </div>
    </Lean>
  );
}
