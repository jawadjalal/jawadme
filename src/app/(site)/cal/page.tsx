import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalInline } from "@/components/ds/CalInline";
import { NAV, SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Book a call",
  description: "Book a 15 minute video call with Jawad Jalal about brands, ads, 3D and Roblox games.",
  alternates: { canonical: "/cal" },
};

// Daylight and plain: the calendar is the page. The name of the page set as a mark, the ember bar of facts, a short
// column on what the call is, and Cal's own calendar on white.

const HEAD = "Book a call";

type Props = { searchParams: Promise<{ src?: string }> };

export default async function Cal({ searchParams }: Props) {
  const { src: raw } = await searchParams;
  const src = raw && /^[a-z0-9-]{1,40}$/.test(raw) ? raw : "cal-page";
  return (
    <main className="cal no-dock">
      <nav className="cal-nav" aria-label="Site">
        <Link href="/" className="cal-home">
          <Image src="/design/jawad-die.webp" alt="" width={697} height={781} sizes="28px" priority />
          Jawad Jalal
        </Link>
        <span className="cal-links">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </span>
      </nav>
      <h1 className="cal-mark" aria-label={HEAD}>
        {HEAD.split(" ").map((w, i, all) => (
          <span key={w} className="cal-w" aria-hidden="true">
            {[...w].map((ch, j) => (
              <span key={j} style={{ animationDelay: 40 + (all.slice(0, i).join("").length + j) * 22 + "ms" }}>
                {ch}
              </span>
            ))}
          </span>
        ))}
      </h1>
      <div className="bar cal-bar">
        <span>Jawad Jalal</span>
        <span className="hide-s">[ {SITE.detail} ]</span>
        <span className="hide-s">London</span>
        <span>{SITE.available}</span>
      </div>
      <section className="cal-grid">
        <header className="cal-copy">
          <div className="cal-who">
            <Image src="/design/jawad-die.webp" alt="Jawad's memoji" width={697} height={781} sizes="84px" priority />
            <p className="cal-sub">Fifteen minutes on video with me. Bring the launch, the brand or the game, and leave with a plan.</p>
          </div>
          <dl className="cal-facts">
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
          <p className="cal-mail">
            Rather write? <a href={"mailto:" + SITE.email + "?subject=Project"}>{SITE.email}</a>
            <br />
            Or <a href={"https://cal.com/jawad-jalal-hesqbk/15min?src=" + src} target="_blank" rel="noopener">open the calendar on Cal.com ↗</a>
          </p>
        </header>
        <div className="cal-frame">
          <CalInline email={SITE.email} theme="light" />
        </div>
      </section>
    </main>
  );
}
