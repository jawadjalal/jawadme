import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalInline } from "@/components/ds/CalInline";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Book a call",
  description: "Book a 15 minute video call with Jawad Jalal about brands, ads, 3D and Roblox games.",
  alternates: { canonical: "/cal" },
};

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
        Rather write? <a href={"mailto:" + SITE.email + "?subject=Project"}>{SITE.email}</a>
        <span aria-hidden="true"> · </span>
        <a href={"https://cal.com/jawad-jalal-hesqbk/15min?src=" + src} target="_blank" rel="noopener">
          Open on Cal.com ↗
        </a>
      </p>
      <div className="cal-embed">
        <CalInline email={SITE.email} theme="light" />
      </div>
    </main>
  );
}
