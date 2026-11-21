import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/ds/Footer";
import { Media } from "@/components/ds/Media";
import { TLink } from "@/components/ds/TLink";
import { TitleTab } from "@/components/ds/TitleTab";
import { REAL, laneLabel, nextOf, projectBySlug, type Block, type Media as M } from "@/content/work";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => REAL.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = projectBySlug((await params).slug);
  if (!p) return {};
  const description = p.lines.join(" ");
  return {
    title: p.name,
    description,
    alternates: { canonical: "/work/" + p.slug },
    openGraph: { title: p.name + ", by Jawad Jalal", description },
  };
}

const portrait = (m: M) => m.h > m.w;

function BlockView({ b }: { b: Block }) {
  switch (b.kind) {
    case "full":
      return <Media m={b.media} sizes="100vw" className="b-full" />;
    case "inset":
      return (
        <div className={"b-inset hatch " + (portrait(b.media) ? "tall" : "")}>
          <Media m={b.media} sizes="62vw" />
        </div>
      );
    case "pair":
      return (
        <div className="b-pair">
          {b.media.map((m) => (
            <Media key={m.src} m={m} ratio={b.media.some(portrait) ? "4 / 5" : undefined} fit={portrait(m) && m.h / m.w > 1.6 ? "contain" : "cover"} sizes="50vw" />
          ))}
        </div>
      );
    case "grid":
      return (
        <div className={"b-grid " + (b.media.length % 3 === 0 ? "" : "b-grid-4")}>
          {b.media.map((m, i) => (
            <Media key={m.src} m={m} ratio={portrait(m) ? (m.h / m.w > 1.6 ? "9 / 16" : "4 / 5") : "1 / 1"} fit={portrait(m) && m.h / m.w <= 1.6 ? "cover" : "contain"} sizes="33vw" delay={(i % 3) * 60} />
          ))}
        </div>
      );
    case "sequence":
      return <Media m={b.media} sizes="100vw" />;
  }
}

export default async function Case({ params }: Props) {
  const p = projectBySlug((await params).slug);
  if (!p) notFound();
  const next = nextOf(p);
  const tall = portrait(p.cover);
  return (
    <main className={"case " + (p.cover.tone === "ink" ? "case-ink" : "")}>
      <TitleTab
        as="h1"
        tag={[laneLabel(p.lane), p.year].join(", ")}
        side={p.link ? <a href={p.link.href} target={p.link.href.startsWith("/") ? undefined : "_blank"} rel="noopener">{p.link.label} ↗</a> : undefined}
      >
        {p.name}
      </TitleTab>
      <div className={"wrap case-cover " + (tall ? "tall hatch" : "")}>
        <div className="case-cover-in" style={tall ? undefined : { maxWidth: p.cover.w }}>
          <Media m={p.cover} vt={"cover-" + p.slug} priority sizes={tall ? "40vw" : "(min-width: " + p.cover.w + "px) " + p.cover.w + "px, 100vw"} />
        </div>
      </div>
      <div className="g16 case-lines">
        {p.lines.map((l) => (
          <p key={l} className="t-line" data-lines="">
            {l}
          </p>
        ))}
      </div>
      <div className="wrap case-blocks">
        {p.blocks.map((b, i) => (
          <BlockView key={i} b={b} />
        ))}
      </div>
      <TLink href={"/work/" + next.slug} vt={"cover-" + next.slug} className="next wrap" data-cursor="view">
        <span className="next-head">
          <span className="d-tab">Next: {next.name} ↗</span>
        </span>
        <Media m={next.cover} ratio="21 / 9" sizes="100vw" fit={portrait(next.cover) ? "contain" : "cover"} />
      </TLink>
      <Footer src={"case-" + p.slug} />
    </main>
  );
}
