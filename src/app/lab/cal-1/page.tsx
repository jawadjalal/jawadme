import Image from "next/image";
import Link from "next/link";
import { CalInline } from "@/components/ds/CalInline";
import { SITE } from "@/content/site";
import { NAV } from "../copy";

// /cal direction 1. Daylight and plain: the calendar is the page. A short left column says what the call is in the
// site's own type; the calendar sits on white with nothing drawn round it.

export default function Cal1() {
  return (
    <main className="c1x">
      <nav className="c1x-nav" aria-label="Site">
        <Link href="/" className="c1x-mark">
          <Image src="/design/jawad-die.webp" alt="" width={697} height={781} priority />
          Jawad Jalal
        </Link>
        <span className="c1x-links">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href}>
              {n.label}
            </Link>
          ))}
        </span>
      </nav>
      <section className="c1x-grid">
        <header className="c1x-copy">
          <h1 className="c1x-h">Book a call</h1>
          <p className="c1x-sub">Fifteen minutes on video with me. Bring the launch, the brand or the game, and leave with a plan.</p>
          <dl className="c1x-facts">
            <div>
              <dt>Length</dt>
              <dd>15 min</dd>
            </div>
            <div>
              <dt>Where</dt>
              <dd>Video</dd>
            </div>
            <div>
              <dt>Cost</dt>
              <dd>Free</dd>
            </div>
          </dl>
          <p className="c1x-mail">
            Rather write? <a href={"mailto:" + SITE.email}>{SITE.email}</a>
          </p>
        </header>
        <div className="c1x-cal">
          <CalInline email={SITE.email} theme="light" />
        </div>
      </section>
    </main>
  );
}
