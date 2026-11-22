import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Contact } from "@/components/ds/Contact";
import { Contributions } from "@/components/ds/Contributions";
import { Footer } from "@/components/ds/Footer";
import { ADS } from "@/content/ads";
import { TIMELINE } from "@/content/site";
import { FAQ } from "@/lib/facts";
import { JsonLd, PERSON_ID, abs, meta } from "@/lib/seo";
import "./about.css";

export const metadata: Metadata = meta({
  title: "about",
  description: "jawad jalal is a 15-year-old designer and founder in london. what he designs and builds, where he has worked, and the short answers.",
  path: "/about",
  type: "profile",
});

const LD = [
  { "@type": "ProfilePage", "@id": abs("/about"), url: abs("/about"), name: "about jawad jalal", mainEntity: { "@id": PERSON_ID } },
  { "@type": "FAQPage", "@id": abs("/about") + "#faq", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
];

const studio = TIMELINE.find((t) => t.now);

// About is the words, set large: a few paragraphs from his own facts (site.ts, work.ts, ads.ts), then the two ways in.
export default function About() {
  return (
    <main className="ab">
      <JsonLd data={LD} />
      <article className="ab-text">
        <h1 className="ab-k">about</h1>
        <p className="ab-lead">hi! i&apos;m jawad jalal. i&apos;m 15 and in london, designing and building things.</p>
        <p>
          brands, ads, websites, 3d and roblox games. i design it, and i build it: the brand, the interface, and the thing that
          actually ships. <Link href="/work">{ADS.length} of my ads</Link> are on the work page, beside the sites and the games.
        </p>
        {studio ? (
          <p>
            i run <a href={studio.href}>{studio.co.toLowerCase()}</a>, a design studio: websites for startups, built from scratch. and i&apos;m
            building <Link href="/work/ignaru">ignaru</Link>, an agent-native design tool.
          </p>
        ) : null}
        <p>
          before that, i was a product designer at <a href="https://menufit.com">menufit</a>, an <span className="nw">8-figure</span> startup at{" "}
          <span className="nw">7-figure</span> mrr, and a product development intern at <a href="https://okara.ai">okara</a>, an{" "}
          <span className="nw">8-figure</span> ai startup.
        </p>
        <p>i made 3d art for blade ball and fish it, two of roblox&apos;s biggest games (over 11 billion visits between them).</p>
        <figure className="ab-face">
          <Image src="/portrait.png" alt="jawad jalal" width={400} height={400} sizes="(max-width: 767px) 300px, 400px" />
        </figure>
        <Contributions />
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
      <Footer src="about" />
    </main>
  );
}
