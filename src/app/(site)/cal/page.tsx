import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalInline } from "@/components/ds/CalInline";
import { MailLink } from "@/components/MailLink";
import { CalMoment } from "@/components/moments/cal";
import { SITE } from "@/content/site";
import { meta } from "@/lib/seo";

export const metadata: Metadata = meta({ title: "Book a call", description: "Book a free 15 minute video call with Jawad Jalal about brands, ads, sites, 3D and Roblox games.", path: "/cal" });

// The calendar is the page: one ink bar of facts, then Cal.com's own month view across the grid, themed to the site.

type Props = { searchParams: Promise<{ src?: string }> };

export default async function Cal({ searchParams }: Props) {
  const { src: raw } = await searchParams;
  const src = raw && /^[a-z0-9-]{1,40}$/.test(raw) ? raw : "cal-page";
  return (
    <main className="cal no-dock">
      <header className="bar ink cal-bar">
        <Link href="/" className="cal-home">
          <Image src="/design/jawad-die.webp" alt="" width={697} height={781} sizes="22px" priority />
          Jawad Jalal
        </Link>
        <h1 className="cal-h">Book a call</h1>
        <span>15 min</span>
        <span className="hide-s">Video</span>
        <span>Free</span>
      </header>
      <p className="cal-mail">
        Calendar not loading?{" "}
        <a href={"https://cal.com/jawad-jalal-hesqbk/15min?src=" + src} target="_blank" rel="noopener">
          Open on Cal.com ↗
        </a>
      </p>
      <div className="cal-row">
        <div>
          <div className="cal-embed">
            <CalInline email={SITE.email} theme="light" />
          </div>
          <p className="cal-mail cal-alt">
            Rather write? <MailLink src="cal" />
          </p>
        </div>
        <CalMoment />
      </div>
    </main>
  );
}
