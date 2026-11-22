import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Contact } from "@/components/ds/Contact";
import { Footer } from "@/components/ds/Footer";
import { ADS, adsOf } from "@/content/ads";
import { REAL, projectBySlug } from "@/content/work";
import { FAQ } from "@/lib/facts";
import { GITHUB, getContributions } from "@/lib/github";
import { JsonLd, PERSON_ID, abs, meta } from "@/lib/seo";
import "./about.css";

export const metadata: Metadata = meta({
  title: "about",
  description: "jawad jalal is a 15-year-old designer and founder in london. his journey from 3d at 13 to ignura studio, menufit and okara, his projects and the short answers.",
  path: "/about",
  type: "profile",
});

const LD = [
  { "@type": "ProfilePage", "@id": abs("/about"), url: abs("/about"), name: "about jawad jalal", mainEntity: { "@id": PERSON_ID } },
  { "@type": "FAQPage", "@id": abs("/about") + "#faq", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
];

type Row = { name: string; href: string; stat?: string; line?: string; mark?: string };
type Org = { name: string; role: string; href?: string; mark?: string };
type Chapter = { when: string; orgs: Org[]; text: string; rows: Row[] };

const ignaru = projectBySlug("ignaru")!;
const fracture = projectBySlug("derelict-depths")!;

// Dated facts only: the roles and years from his cv (scripts/cv.mjs), the company context from content/site.ts.
const JOURNEY: Chapter[] = [
  {
    when: "now",
    orgs: [
      { name: "ignura studio", role: "founder. my ad and brand studio.", href: "https://ignura.com", mark: "/logos/ignura.png" },
      { name: "bevel", role: "founder. a 3d art team for games.", href: "https://bevel.team", mark: "/logos/bevel.png" },
    ],
    text: "i run ignura, my ad and brand studio: ads and brands people stop for, designed and built from scratch. beside it i'm building ignaru, a design tool, and fracture, a roblox mining game. bevel, the 3d art team i founded, makes game art by the job.",
    rows: [
      { name: "ignura studio", href: "/work/ignura", stat: "six figure arr", line: "the studio's own site", mark: "/logos/ignura.png" },
      { name: "ignaru", href: "/work/ignaru", stat: "design tool", line: ignaru.lines[1], mark: "/logos/ignaru-mark.png" },
      { name: "the ads", href: "/work", stat: ADS.length + " ads", line: "independent brand concepts, not commissioned" },
      { name: "fracture", href: "/work/" + fracture.slug, stat: "roblox game", line: fracture.lines[1] },
      { name: "bevel", href: "https://bevel.team", stat: "six figure arr", line: "3d art that game studios hire by the job", mark: "/logos/bevel.png" },
    ],
  },
  {
    when: "summer 2026",
    orgs: [
      { name: "menufit", role: "product designer", href: "https://menufit.com", mark: "/logos/menufit.png" },
      { name: "okara", role: "product development intern", href: "https://okara.ai", mark: "/logos/okara.png" },
    ],
    text: "product designer at menufit, an 8-figure startup at 7-figure mrr: the app for eating out healthy, used by 1.5 million people. and product development intern at okara, an 8-figure ai startup, the ai cmo. both roles are in the past.",
    rows: [
      { name: "menufit", href: "https://menufit.com", stat: "7-figure mrr", line: "the app for eating out healthy", mark: "/logos/menufit.png" },
      { name: "menufit app screens", href: "/w/site-menufit", stat: "1.5m users", line: "meal screens, in light and dark" },
      { name: "okara", href: "https://okara.ai", stat: "8-figure", line: "the ai cmo", mark: "/logos/okara.png" },
    ],
  },
  {
    when: "from 13",
    orgs: [{ name: "cosmos models", role: "3d artist", href: "https://cosmosmodels.lovable.app" }],
    text: "i started making things for money at thirteen: 3d commissions under cosmos models, and 3d art for blade ball and fish it, two of roblox's biggest games.",
    rows: [
      { name: "blade ball and fish it", href: "/w/blade-ball", stat: "11b+ visits", line: "3d art, over 11 billion visits between the two games" },
      { name: "cosmos models", href: "https://cosmosmodels.lovable.app", stat: "3d portfolio", line: "commissions in zbrush, blender and substance" },
    ],
  },
];

const CASES = REAL.filter((p) => p.slug !== "ignaru");

function Mark({ src, name }: { src?: string; name: string }) {
  if (!src) return <span className="ab-mark ab-mark-x" aria-hidden="true">{name[0]}</span>;
  return <Image className="ab-mark" src={src} alt="" width={40} height={40} sizes="20px" />;
}

function Rows({ rows }: { rows: Row[] }) {
  return (
    <ul className="ab-rows">
      {rows.map((r) => {
        const body = (
          <>
            <Mark src={r.mark} name={r.name} />
            <span className="ab-rn">{r.name}</span>
            {r.stat ? <span className="ab-rs">{r.stat}</span> : null}
            {r.line ? <span className="ab-rl">{r.line}</span> : null}
          </>
        );
        return (
          <li key={r.href + r.name}>
            {r.href.startsWith("/") ? (
              <Link className="ab-row" href={r.href}>
                {body}
              </Link>
            ) : (
              <a className="ab-row" href={r.href} target="_blank" rel="noopener">
                {body}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default async function About() {
  const { total } = await getContributions();
  return (
    <main className="ab">
      <JsonLd data={LD} />
      <article className="ab-in">
        <header className="ab-top">
          <h1 className="ab-name">jawad jalal</h1>
          <p className="ab-id">hi! i&apos;m jawad jalal. 15, in london. i design it, and i build it.</p>
        </header>

        <section aria-labelledby="ab-journey">
          <h2 className="ab-h" id="ab-journey">
            journey
          </h2>
          <ol className="ab-tl">
            {JOURNEY.map((c) => (
              <li className="ab-ch" key={c.when}>
                <p className="ab-when">{c.when}</p>
                {c.orgs.map((o) => (
                  <div className="ab-org" key={o.name}>
                    <h3 className="ab-on">
                      <Mark src={o.mark} name={o.name} />
                      {o.href ? (
                        <a href={o.href} target="_blank" rel="noopener">
                          {o.name}
                        </a>
                      ) : (
                        o.name
                      )}
                    </h3>
                    <p className="ab-role">{o.role}</p>
                  </div>
                ))}
                <p className="ab-p">{c.text}</p>
                <Rows rows={c.rows} />
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="ab-projects">
          <h2 className="ab-h" id="ab-projects">
            projects
          </h2>
          <h3 className="ab-sub">products</h3>
          <Rows
            rows={[
              { name: "ignaru", href: "/work/ignaru", stat: "design tool", line: ignaru.lines[1], mark: "/logos/ignaru-mark.png" },
              { name: "github contributions", href: GITHUB, stat: total.toLocaleString("en-GB") + " in the past year", line: "a square a day, tracked live from github" },
            ]}
          />
          <h3 className="ab-sub">case studies</h3>
          <Rows rows={CASES.map((p) => ({ name: p.name, href: "/work/" + p.slug, stat: p.lane === "ads" ? adsOf(p.name).length + " ads" : undefined, line: p.lines[0] }))} />
        </section>

        <details className="ab-faq" id="faq">
          <summary data-m="press">the short answers</summary>
          <dl>
            {FAQ.map((f) => (
              <div key={f.q}>
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
        </details>
      </article>
      <Contact src="about" />
      <Footer src="about" graph={false} />
    </main>
  );
}
