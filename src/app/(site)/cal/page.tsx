import type { Metadata } from "next";
import Image from "next/image";
import { CalInline } from "@/components/ds/CalInline";
import { RAIL } from "@/content/ads";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Book a call",
  description: "Book a 15 minute video call with Jawad Jalal about brands, ads, 3D and Roblox games.",
  alternates: { canonical: "/cal" },
};

const EMBERS = Array.from({ length: 14 }, (_, i) => i);

type Props = { searchParams: Promise<{ src?: string }> };

export default async function Cal({ searchParams }: Props) {
  const { src: raw } = await searchParams;
  const src = raw && /^[a-z0-9-]{1,40}$/.test(raw) ? raw : "cal-page";
  const best = RAIL.slice(0, 8);
  return (
    <main className="cal no-dock">
      <div className="cal-fire" aria-hidden="true">
        {EMBERS.map((i) => (
          <i key={i} style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>
      <header className="cal-top wrap">
        <a href="/" className="cal-home lbl">
          ← Jawad Jalal
        </a>
        <span className="lbl dim">15 min · video · free</span>
      </header>
      <div className="g16 cal-grid">
        <section className="cal-side" aria-labelledby="cal-h">
          <h1 id="cal-h" className="d-hero cal-h">
            Book a call
          </h1>
          <div className="rule-key" aria-hidden="true" />
          <div className="cal-who">
            <span className="cal-face">
              <Image src="/design/jawad-die.webp" alt="Jawad's memoji" width={697} height={781} sizes="96px" priority />
            </span>
            <p className="cal-lead">
              Fifteen minutes with me, Jawad. Bring the launch, the brand or the game. You leave with a plan, not a pitch.
            </p>
          </div>
          <a href={`https://cal.com/jawad-jalal-hesqbk/15min?src=${src}`} className="cal-book" target="_blank" rel="noopener">
            Open the calendar ↗
          </a>
          <p className="cal-alt">
            <span className="dim">Prefer email? </span>
            <a href={`mailto:${SITE.email}?subject=Project`}>{SITE.email}</a>
          </p>
        </section>
        <div className="cal-frame">
          <span className="marks" aria-hidden="true">
            <i />
          </span>
          <CalInline email={SITE.email} />
        </div>
      </div>
      <div className="call-rail" aria-hidden="true">
        <div className="call-rail-track">
          {[...best, ...best].map((a, i) => (
            <Image key={i} src={a.sm} width={a.w} height={a.h} alt="" sizes="160px" />
          ))}
        </div>
      </div>
    </main>
  );
}
