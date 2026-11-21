import type { Metadata } from "next";
import { Footer } from "@/components/ds/Footer";
import { Media } from "@/components/ds/Media";
import { Timeline } from "@/components/ds/Timeline";
import { TitleTab } from "@/components/ds/TitleTab";
import { SITE } from "@/content/site";
import { FAQ } from "@/lib/facts";
import { ENTITY, JsonLd, PERSON_ID, abs, meta } from "@/lib/seo";

export const metadata: Metadata = meta({
  title: "About",
  description: "Jawad Jalal is a 15-year-old designer and founder in London. Where he has worked, what he designs and builds, and the short answers.",
  path: "/about",
  type: "profile",
});

const LD = [
  { "@type": "ProfilePage", "@id": abs("/about"), url: abs("/about"), name: "About Jawad Jalal", mainEntity: { "@id": PERSON_ID } },
  { "@type": "FAQPage", "@id": abs("/about") + "#faq", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
];

export default function About() {
  return (
    <main className="about-p">
      <JsonLd data={LD} />
      <TitleTab as="h1" tag="Jawad Jalal, London" side={<span className="tab-say">15, designing and building things.</span>}>
        About
      </TitleTab>
      <section className="g16 ab-intro" aria-label="Who">
        <div className="ab-pic">
          <Media m={SITE.portrait} ratio="1 / 1" sizes="(min-width: 768px) 25vw, 50vw" priority />
        </div>
        <p className="t-line ab-line">{ENTITY}</p>
      </section>
      <Timeline />
      <section className="faq" aria-labelledby="faq-h">
        <TitleTab id="faq-h" tag="The short answers">
          Questions
        </TitleTab>
        <dl className="g16 faq-l">
          {FAQ.map((f) => (
            <div key={f.q} className="faq-r">
              <dt>{f.q}</dt>
              <dd>{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
      <Footer src="about" />
    </main>
  );
}
