import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalInline } from "@/components/ds/CalInline";
import { MailLink } from "@/components/MailLink";
import { CalMoment } from "@/components/moments/cal";
import { SITE } from "@/content/site";
import { meta } from "@/lib/seo";

export const metadata: Metadata = meta({ title: "book a call", description: "book a free 15 minute video call with jawad jalal about brands, ads, sites, 3d and roblox games.", path: "/cal" });

// The calendar is the page: one ink bar with the facts on one line, then Cal.com's own month view across the grid, themed to the site.

type Props = { searchParams: Promise<{ src?: string }> };

export default async function Cal({ searchParams }: Props) {
  const { src: raw } = await searchParams;
  const src = raw && /^[a-z0-9-]{1,40}$/.test(raw) ? raw : "cal-page";
  return (
    <main className="cal no-dock">
      <header className="bar ink cal-bar">
        <Link href="/" className="cal-home" data-m="press">
          <Image src="/design/jawad-die.webp" alt="" width={697} height={781} sizes="22px" priority />
          jawad jalal
        </Link>
        <h1 className="cal-h">book a call</h1>
        <p className="cal-meta">15 min · video · free · europe/london</p>
      </header>
      <div className="cal-row">
        <div>
          <div className="cal-embed">
            <CalInline email={SITE.email} theme="light" />
          </div>
          <p className="cal-mail">
            calendar not loading?{" "}
            <a href={"https://cal.com/jawad-jalal-hesqbk/15min?src=" + src} target="_blank" rel="noopener">
              open on cal.com ↗
            </a>
          </p>
          <p className="cal-mail cal-alt">
            rather write? <MailLink src="cal" />
          </p>
        </div>
        <CalMoment />
      </div>
    </main>
  );
}
