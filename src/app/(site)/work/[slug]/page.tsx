import type { Metadata } from "next";
import { Fragment, type CSSProperties } from "react";
import { notFound } from "next/navigation";
import { Gilded } from "@/components/gilded/Gilded";
import { Footer } from "@/components/ds/Footer";
import { Media } from "@/components/ds/Media";
import { TLink } from "@/components/ds/TLink";
import { TitleTab } from "@/components/ds/TitleTab";
import { CaseMoment } from "@/components/moments/case";
import { JsonLd, abs, caseWork, meta } from "@/lib/seo";
import "./case.css";
import { REAL, laneLabel, nextOf, projectBySlug, type Block, type Media as M } from "@/content/work";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => REAL.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = projectBySlug((await params).slug);
  if (!p) return {};
  return meta({ title: p.name, description: `${p.lines.join(" ")} ${p.disciplines.join(", ")} by jawad jalal, ${p.year}.`, path: "/work/" + p.slug, type: "article" });
}

const portrait = (m: M) => m.h > m.w;
/** never wider than the file's own pixels */
const native = (m: M) => ({ "--nw": m.w + "px" }) as CSSProperties;
/** a side-by-side pair at one height, together no wider than the shorter file's pixels */
const level = ([a, b]: [M, M]) =>
  ({ "--cols": `${a.w / a.h}fr ${b.w / b.h}fr`, "--nw": Math.min(a.h, b.h) * (a.w / a.h + b.w / b.h) + 12 + "px" }) as CSSProperties;

function BlockView({ b }: { b: Block }) {
  switch (b.kind) {
    case "full":
      return (
        <div className="b-full" style={native(b.media)}>
          <Media m={b.media} sizes="100vw" />
        </div>
      );
    case "inset":
      return (
        <div className={"b-inset hatch " + (portrait(b.media) ? "tall" : "")} style={native(b.media)}>
          <Media m={b.media} sizes="(min-width: 768px) 62vw, 88vw" />
        </div>
      );
    case "pair":
      return (
        <div className={"b-pair " + (b.media.every(portrait) ? "" : "b-level")} style={b.media.every(portrait) ? undefined : level(b.media)}>
          {b.media.map((m) => (
            <Media key={m.src} m={m} ratio={b.media.every(portrait) ? "4 / 5" : undefined} fit={portrait(m) && m.h / m.w > 1.6 ? "contain" : "cover"} sizes="(min-width: 768px) 50vw, 100vw" />
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
      <JsonLd
        data={[
          caseWork(p),
          { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "work", item: abs("/work") }, { "@type": "ListItem", position: 2, name: p.name, item: abs("/work/" + p.slug) }] },
        ]}
      />
      <TitleTab
        as="h1"
        tag={[laneLabel(p.lane), p.year].join(", ")}
        side={
          p.link ? (
            <Gilded variant="pill" href={p.link.href} prefetch={false}>
              {p.link.label} ↗
            </Gilded>
          ) : (
            <Gilded variant="pill" href="/work" prefetch={false}>
              work
            </Gilded>
          )
        }
      >
        {p.name}
      </TitleTab>
      {p.lead ? (
        <div className={"wrap case-lead" + (p.lead.tone === "ink" ? " case-lead-ink" : "")} style={native(p.lead)}>
          <Media m={p.lead} vt={"cover-" + p.slug} priority sizes="(min-width: 1440px) 1346px, 100vw" />
        </div>
      ) : (
        <CaseMoment lane={p.lane} tall={tall}>
          <div className="case-cover-in">
            <Media m={p.cover} vt={"cover-" + p.slug} priority="low" sizes={tall ? "(min-width: 768px) 30vw, 72vw" : "(min-width: 768px) 58vw, 72vw"} />
          </div>
        </CaseMoment>
      )}
      <div className="g16 case-lines">
        {p.lines.map((l, i) => (
          <Fragment key={l}>
            {p.beats?.[i] ? <p className="lbl dim case-beat">{p.beats[i]}</p> : null}
            <p className="t-line" data-lines="">
              {l}
            </p>
          </Fragment>
        ))}
      </div>
      <dl className="g16 spec case-facts">
        <div>
          <dt className="lbl dim">role</dt>
          <dd>{p.disciplines.join(", ")}</dd>
        </div>
        {p.client ? (
          <div>
            <dt className="lbl dim">client</dt>
            <dd>{p.client}</dd>
          </div>
        ) : null}
        {p.spec ? (
          <div className="wide">
            <dt className="lbl dim">client</dt>
            <dd>independent work. not commissioned by or affiliated with the brands shown.</dd>
          </div>
        ) : null}
        <div>
          <dt className="lbl dim">year</dt>
          <dd>{p.year}</dd>
        </div>
        {p.link ? (
          <div>
            <dt className="lbl dim">live</dt>
            <dd>
              <a href={p.link.href} target={p.link.href.startsWith("/") ? undefined : "_blank"} rel="noopener">
                {p.link.label} ↗
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
      <div className="wrap case-blocks">
        {p.blocks.map((b, i) => (
          <BlockView key={i} b={b} />
        ))}
      </div>
      <TLink href={"/work/" + next.slug} vt={"cover-" + next.slug} className="next wrap" data-cursor="view">
        <span className="next-head">
          <span className="d-tab">next: {next.name} ↗</span>
        </span>
        <Media m={{ ...next.cover, loop: undefined }} ratio="21 / 9" sizes="100vw" fit={portrait(next.cover) ? "contain" : "cover"} />
      </TLink>
      <Footer src={"case-" + p.slug} />
    </main>
  );
}
