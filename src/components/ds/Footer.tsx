import Image from "next/image";
import Link from "next/link";
import { BookLink } from "@/components/BookLink";
import { MailLink } from "@/components/MailLink";
import { SITE } from "@/content/site";
import { SOCIALS } from "@/lib/profile";
import { Contributions } from "./Contributions";
import "@/styles/footer.css";

const LINKS = SOCIALS.filter((s) => s.href.startsWith("https://") && s.label !== "linkedin");

/** Clean Architectural Wayfinder Footer:
 *  Replaces the broken 3D Pillar signpost with a framed ember-graded Hades wayfinder plate
 *  alongside a structured Brass Hands–style contact matrix and GitHub activity graph. */
export function Footer({
  src,
  pillar = true,
  book = true,
  graph = true,
}: {
  src: string;
  pillar?: boolean;
  book?: boolean;
  graph?: boolean;
}) {
  return (
    <footer className="bh-foot">
      <div className="bh-foot-top">
        <div className="bh-foot-main">
          <span className="sec-idx">[05] // INITIATE PROJECT</span>
          <h2 className="bh-foot-h">
            READY TO SHIP SOMETHING <span className="nh-accent">UNFORGETTABLE?</span>
          </h2>
          <p className="bh-foot-sub">
            15-minute intro call or direct email. Available for brands, ad campaigns, high-craft websites, and 3D/Roblox work.
          </p>
          <div className="bh-foot-actions">
            {book ? (
              <BookLink src={src} className="bh-cta bh-cta-lg">
                <span className="bh-cta-in">{SITE.cta.toUpperCase()} ↗</span>
              </BookLink>
            ) : null}
            <MailLink src="footer" className="bh-btn-sec bh-foot-mail" />
          </div>
          {graph ? (
            <div className="bh-foot-cg">
              <Contributions size="mini" />
            </div>
          ) : null}
        </div>

        {pillar ? (
          <figure className="bh-foot-plate">
            <div className="bh-foot-plate-head">
              <span>FIG. 04 // WAYFINDER</span>
              <span>LONDON · UTC</span>
            </div>
            <div className="bh-foot-plate-art">
              <Image
                src="/world/poster/pillar-d.webp"
                alt="Hades-style isometric wayfinder diagram"
                width={1440}
                height={846}
                sizes="(min-width: 1024px) 38vw, 100vw"
              />
            </div>
            <div className="bh-foot-plate-links">
              {LINKS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener">
                  <span>{s.label.toUpperCase()}</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
              <a href={SITE.cv}>
                <span>CV (PDF)</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </figure>
        ) : null}
      </div>

      <div className="bh-foot-bar">
        <span>©2026 JAWAD JALAL // ALL RIGHTS RESERVED</span>
        <span className="bh-foot-nav">
          <Link href="/work">WORK</Link>
          <Link href="/about">ABOUT</Link>
          <Link href="/contact">CONTACT</Link>
          <a href={SITE.cv}>CV</a>
        </span>
        <span>DESIGNED &amp; ENGINEERED IN LONDON</span>
      </div>
    </footer>
  );
}
