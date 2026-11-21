import Image from "next/image";
import Link from "next/link";
import { CalInline } from "@/components/ds/CalInline";
import { SITE } from "@/content/site";
import { Embers } from "../Embers";

// /cal direction 2. Night: the call as a lit doorway. Jawad's memoji in the brazier's light, one line, and the
// calendar open beneath it on the same dark, with no card round it.

export default function Cal2() {
  return (
    <main className="c2x">
      <div className="c2x-glow" aria-hidden="true" />
      <Embers count={36} />
      <nav className="c2x-nav" aria-label="Site">
        <Link href="/">← Jawad Jalal</Link>
        <span>15 min · Video · Free</span>
      </nav>
      <header className="c2x-head">
        <Image className="c2x-me" src="/design/jawad-die.webp" alt="Jawad's memoji" width={697} height={781} priority />
        <h1 className="c2x-h">Book a call</h1>
        <p className="c2x-sub">Fifteen minutes with me. Bring the launch, the brand or the game.</p>
      </header>
      <div className="c2x-cal">
        <CalInline email={SITE.email} theme="dark" />
      </div>
      <p className="c2x-mail">
        Rather write? <a href={"mailto:" + SITE.email}>{SITE.email}</a>
      </p>
    </main>
  );
}
