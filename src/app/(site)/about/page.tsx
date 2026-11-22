import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Contributions } from "@/components/ds/Contributions";
import { LondonClock } from "@/components/ds/LondonClock";
import { MailLink } from "@/components/MailLink";
import { SITE } from "@/content/site";
import { meta } from "@/lib/seo";
import "./about.css";

export const metadata: Metadata = meta({
  title: "about",
  description: "Jawad Jalal. Founder and designer in London.",
  path: "/about",
});

/** leo.here-inspired minimal personal about page with dithered top header and dashed journey timeline. */
export default function About() {
  return (
    <main className="leo-about">
      <div className="leo-dither" aria-hidden="true" />

      <div className="leo-wrap">
        <div className="leo-meta">
          <span>London</span>
          <span>·</span>
          <LondonClock />
        </div>

        <header className="leo-head">
          <div className="leo-name-row">
            <h1>Jawad</h1>
            <div className="leo-socials">
              <a href="https://x.com/jawadjalal" target="_blank" rel="noopener" aria-label="X">
                𝕏
              </a>
              <a href="https://github.com/jawadjalal" target="_blank" rel="noopener" aria-label="GitHub">
                GH
              </a>
              <MailLink src="about" className="leo-mail">
                EMAIL
              </MailLink>
              <a href={SITE.cv} download>
                CV
              </a>
            </div>
          </div>
          <p className="leo-sub">founder &amp; designer, London</p>
          <p className="leo-bio">
            I design and build ads, brands, websites, and 3D worlds. Currently running{" "}
            <a href="https://ignura.com" target="_blank" rel="noopener">
              Ignura Studio
            </a>{" "}
            and building{" "}
            <Link href="/work/ignaru">Ignaru</Link> and{" "}
            <Link href="/work/fracture">Fracture</Link>.
          </p>
        </header>

        <section className="leo-journey" aria-label="Journey">
          <h2 className="leo-sec-lbl">Journey</h2>

          <div className="leo-tl">
            <article className="leo-era is-now">
              <span className="leo-dot" aria-hidden="true" />
              <span className="leo-when">Now</span>
              <div className="leo-era-title">
                <Image src="/logos/clean/ignura.png" alt="" width={20} height={20} unoptimized />
                <h3>Ignura Studio &amp; Products</h3>
              </div>
              <p className="leo-era-desc">
                Running my design studio for frontier startups, alongside shipping my own design tools and games.
              </p>

              <div className="leo-cards">
                <Link href="/work/ignaru" className="leo-card">
                  <Image src="/logos/clean/ignaru.png" alt="" width={24} height={24} unoptimized />
                  <div>
                    <div className="leo-card-t">
                      <span>Ignaru</span>
                      <span className="leo-badge">new</span>
                    </div>
                    <p>Circle what&apos;s wrong on canvas. Your coding agent fixes it.</p>
                  </div>
                  <span className="leo-arr" aria-hidden="true">↗</span>
                </Link>

                <Link href="/work/fracture" className="leo-card">
                  <Image src="/logos/clean/bevel.png" alt="" width={24} height={24} unoptimized />
                  <div>
                    <div className="leo-card-t">
                      <span>Fracture</span>
                    </div>
                    <p>Roblox mining game. 68 ores, six floors, one Mole King.</p>
                  </div>
                  <span className="leo-arr" aria-hidden="true">↗</span>
                </Link>
              </div>
            </article>

            <article className="leo-era">
              <span className="leo-dot" aria-hidden="true" />
              <span className="leo-when">2026</span>
              <div className="leo-era-title">
                <Image src="/logos/clean/menufit.png" alt="" width={20} height={20} unoptimized />
                <h3>MenuFit &amp; Okara</h3>
              </div>
              <p className="leo-era-desc">
                Product design at MenuFit (1.5M users, 7-figure MRR) and product development intern at Okara (14M launch views).
              </p>
            </article>

            <article className="leo-era">
              <span className="leo-dot" aria-hidden="true" />
              <span className="leo-when">2024 - 2026</span>
              <div className="leo-era-title">
                <Image src="/logos/clean/bevel.png" alt="" width={20} height={20} unoptimized />
                <h3>Cosmos Models &amp; Bevel</h3>
              </div>
              <p className="leo-era-desc">
                Founded a 3D art team and built assets for Blade Ball and Fish It (11B+ combined Roblox visits).
              </p>
            </article>
          </div>
        </section>

        <section className="leo-gh">
          <Contributions />
        </section>
      </div>
    </main>
  );
}
