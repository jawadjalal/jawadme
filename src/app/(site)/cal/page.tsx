import type { Metadata } from "next";
import Link from "next/link";
import { CalInline } from "@/components/ds/CalInline";
import { LondonClock } from "@/components/ds/LondonClock";
import { MailLink } from "@/components/MailLink";
import { IDENTITY } from "@/lib/profile";
import { meta } from "@/lib/seo";
import "./cal.css";

export const metadata: Metadata = meta({
  title: "book a call",
  description: "book a free 15 minute video call with jawad jalal.",
  path: "/cal",
});

type Props = { searchParams: Promise<{ src?: string }> };

/** Simplistic, Brass Hands–grade industrial dark booking page. */
export default async function Cal({ searchParams }: Props) {
  const { src: raw } = await searchParams;
  const src = raw && /^[a-z0-9-]{1,40}$/.test(raw) ? raw : "cal-page";

  return (
    <main className="cal-simple no-dock">
      <header className="cal-simple-top">
        <Link href="/" className="cal-back">
          ← JAWAD JALAL
        </Link>
        <span className="cal-simple-meta">
          LONDON, UK <span className="cal-sep">/</span> <LondonClock />
        </span>
      </header>

      <div className="cal-simple-body">
        <div className="cal-simple-head">
          <h1 className="cal-simple-h">Book a 15-min call</h1>
          <span className="cal-simple-sub">BRANDS · ADS · SITES · 3D</span>
        </div>
        <div className="cal-simple-frame">
          <CalInline email={IDENTITY.email} theme="dark" />
        </div>
        <div className="cal-simple-foot">
          <span>
            Prefer email? <MailLink src="cal" className="cal-simple-link" />
          </span>
          <a
            href={"https://cal.com/jawad-jalal-hesqbk/15min?src=" + src}
            target="_blank"
            rel="noopener"
            className="cal-simple-link"
          >
            Open on Cal.com ↗
          </a>
        </div>
      </div>
    </main>
  );
}
