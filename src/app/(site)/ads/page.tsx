import type { Metadata } from "next";
import Link from "next/link";
import { BookLink } from "@/components/BookLink";
import { Footer } from "@/components/ds/Footer";
import { Media } from "@/components/ds/Media";
import { TitleTab } from "@/components/ds/TitleTab";
import { ADS, CAMPAIGNS, campaignOf } from "@/content/ads";

export const metadata: Metadata = {
  title: "Ads",
  description: "Ads by Jawad Jalal for Shown Media, Palantir, Whop, Outpace and more. Spec work.",
  alternates: { canonical: "/ads" },
};

type Props = { searchParams: Promise<{ c?: string }> };
const slug = (c: string) => c.toLowerCase().replace(/\s+/g, "-");

export default async function Ads({ searchParams }: Props) {
  const { c } = await searchParams;
  const tabs = [...CAMPAIGNS, "Other"];
  const pick = tabs.find((t) => slug(t) === c);
  const list = pick ? ADS.filter((a) => campaignOf(a) === pick) : ADS;
  const chunks = Array.from({ length: Math.ceil(list.length / 8) }, (_, i) => list.slice(i * 8, i * 8 + 8));
  return (
    <main className="ads">
      <TitleTab as="h1" tag={String(ADS.length)} side={<span className="tab-say">Spec ads, made unasked</span>}>
        Ads
      </TitleTab>
      <nav className="filters wrap" aria-label="Filter by campaign">
        <Link href="/ads" aria-current={!pick ? "page" : undefined} scroll={false}>
          <span className="n">[{ADS.length}]</span> All
        </Link>
        <span className="filters-r">
          {tabs.map((t) => (
            <Link key={t} href={`/ads?c=${slug(t)}`} aria-current={pick === t ? "page" : undefined} scroll={false}>
              <span className="n">[{ADS.filter((a) => campaignOf(a) === t).length}]</span> {t}
            </Link>
          ))}
        </span>
      </nav>
      {chunks.map((chunk, n) => (
        <div key={n}>
          <div className="wrap masonry">
            {chunk.map((a, i) => (
              <Link key={a.id} href={`/w/${a.id}`} className="m-item" data-cursor="view">
                <Media m={{ src: a.src, w: a.w, h: a.h, alt: a.alt }} sizes="(min-width: 768px) 33vw, 50vw" delay={(i % 3) * 60} />
              </Link>
            ))}
          </div>
          {n < chunks.length - 1 || chunks.length === 1 ? (
            <BookLink src="ads-inline" className="strip" cursor>
              <span className="d-name">Want ads like these?</span>
              <span className="strip-cta">Book a call ↗</span>
            </BookLink>
          ) : null}
        </div>
      ))}
      <Footer src="ads" sheet="S-04" />
    </main>
  );
}
