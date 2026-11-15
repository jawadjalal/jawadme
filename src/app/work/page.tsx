import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SquircleButton } from "@/components/portfolio/SquircleButton";
import { sans } from "@/components/portfolio/fonts";
import { PRICES, SECTIONS, SIZES, WORK, type Shot, type Work } from "@/content/hire";
import { HIRE, SECOND } from "@/content/story";
import "@/components/portfolio/portfolio.css";
import "@/components/portfolio/work.css";

// jawadjalal.com/work: the pitch. The best logos, brand boards and ads shown large, one plain line on each idea, and
// the prices and the call button in the column beside them. The pieces and prices are in content/hire.ts.

const TITLE = "Work and prices";
const DESCRIPTION = "Ads, logos and brands by Jawad Jalal, shown large, with what it costs to have him make yours.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/work" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/work", siteName: "Jawad Jalal", type: "website", images: [{ url: "/og/call.png", width: 1200, height: 630, alt: "Let's make yours. Book a call with Jawad Jalal." }] },
  twitter: { card: "summary_large_image", creator: "@jawadmakes", title: TITLE, description: DESCRIPTION, images: [{ url: "/og/call.png", width: 1200, height: 630, alt: "Let's make yours. Book a call with Jawad Jalal." }] },
};

const srcSet = (s: Shot, widths: readonly number[]) => {
  const [sm, md, full] = widths;
  return `/hire/${s.file}-sm.webp ${sm}w, /hire/${s.file}-md.webp ${md}w, /hire/${s.file}.webp ${full}w`;
};

function Piece({ p, first }: { p: Work; first: boolean }) {
  return (
    <figure className="wk-piece" id={p.id}>
      <picture>
        {p.tall && (
          <source media="(max-width: 820px)" srcSet={srcSet(p.tall, SIZES.tall)} sizes="calc(100vw - 32px)" width={p.tall.w} height={p.tall.h} />
        )}
        <img
          src={`/hire/${p.wide.file}-md.webp`}
          srcSet={srcSet(p.wide, SIZES.wide)}
          sizes="(min-width: 821px) min(1280px, calc(70vw - 48px)), calc(100vw - 32px)"
          width={p.wide.w}
          height={p.wide.h}
          alt={p.alt}
          loading={first ? "eager" : "lazy"}
          fetchPriority={first ? "high" : "auto"}
          decoding="async"
        />
      </picture>
      <figcaption>
        <p className="wk-idea">
          <b>{p.brand}</b> {p.idea}
        </p>
        <p className="wk-fine">
          {p.spec && <>Unofficial spec work, not commissioned by {p.brand}. </>}
          {p.credit}
        </p>
      </figcaption>
    </figure>
  );
}

export default function WorkPage() {
  if (!WORK.length) notFound();
  const sections = SECTIONS.map((s) => ({ ...s, items: WORK.filter((w) => w.kind === s.kind) })).filter((s) => s.items.length);
  const firstId = sections[0]?.items[0]?.id;
  return (
    <div className={`pf pf-work ${sans.variable}`}>
      <aside className="col wk-col">
        <div className="col-top wk-head">
          <h1 className="col-h1">
            <span className="col-lead">
              <span className="col-line">Ads and brands</span>
            </span>
            <span className="col-main">
              <span className="col-line">for startups.</span>
            </span>
          </h1>
          <p className="wk-sub">
            <b>Jawad Jalal</b> Each piece here was made unasked, for a real company or an invented one. Yours starts the same way.
          </p>
          <div className="wk-head-act">
            <SquircleButton href={HIRE} icon="phone" label="Call me: book a call">
              call me
            </SquircleButton>
            <a className="wk-mail" href="#wk-prices">
              see prices
            </a>
          </div>
        </div>

        <section className="wk-offer" aria-labelledby="wk-prices">
          <h2 id="wk-prices" className="wk-h">
            Prices
          </h2>
          <dl className="wk-prices">
            {PRICES.map((p) => (
              <div key={p.name} className="wk-rung">
                <dt>{p.name}</dt>
                <dd className="wk-price">{p.price}</dd>
                <dd className="wk-what">{p.what}</dd>
              </div>
            ))}
          </dl>
          <p className="wk-what wk-brand">Logos and brand identities: tell me what you need on a call and I&apos;ll price it there.</p>
          <div className="wk-act">
            <SquircleButton href={HIRE} icon="phone" label="Call me: book a call">
              call me
            </SquircleButton>
            <a className="wk-mail" href={SECOND.href}>
              or email me
            </a>
          </div>
        </section>
      </aside>

      <main className="pf-main wk-main" id="work">
        {sections.map((s) => (
          <section key={s.kind} className="wk-sec" aria-labelledby={`wk-${s.kind}`}>
            <h2 id={`wk-${s.kind}`} className="wk-h">
              {s.title}
            </h2>
            {s.items.map((p) => (
              <Piece key={p.id} p={p} first={p.id === firstId} />
            ))}
          </section>
        ))}
        <p className="wk-more">
          <a href="/">More of my work, on the home page</a>
        </p>
      </main>
    </div>
  );
}
