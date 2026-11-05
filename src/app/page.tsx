import { preload } from "react-dom";
import { Geist } from "next/font/google";
import { Edge } from "@/components/felt/Edge";
import { Slots } from "@/components/felt/Slots";
import { SoundToggle } from "@/components/felt/Sound";
import { BOOK, LINE, SLOTS, SOCIALS, feltSrc } from "@/components/felt/copy";
import "@/components/felt/felt.css";

// Not preloaded: the first paint is the felt, and the text may swap in a beat later.
const sans = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist-sans", preload: false });

// jawadjalal.com, after ignaru.com: one black screen, four felt objects for the four things Jawad does, each opening
// a drawer; one line under them; a composer-shaped tab at the foot with the name and Book a call. Server-rendered,
// so the first shapes and the tab paint before any script runs.

export default function Home() {
  for (const s of SLOTS) {
    const img = feltSrc(s.shapes[0].src);
    preload(img.src, { as: "image", fetchPriority: "high", imageSrcSet: img.srcSet, imageSizes: "(max-width: 760px) 42vw, min(22vw, 320px)" });
  }
  return (
    <div className={`fh ${sans.variable}`}>
      <Edge />
      <header className="fh-top">
        <SoundToggle />
        <a className="fh-toplink" href="/blog">
          Blog
        </a>
      </header>
      <main className="fh-main">
        <Slots />
        <h1 className="fh-line">{LINE}</h1>
      </main>
      <footer className="fh-foot">
        <div className="fh-tab">
          <div className="fh-me">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/felt/petal-1x.webp" alt="" width={40} height={40} />
            <p>
              <b>Jawad Jalal</b>
              <span>Design engineer, 15, London</span>
            </p>
          </div>
          <nav className="fh-links" aria-label="Elsewhere">
            {SOCIALS.map((l) => (
              <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                {l.label}
              </a>
            ))}
          </nav>
          <a className="fh-btn fh-btn-a" href={BOOK} target="_blank" rel="noreferrer">
            Book a call
          </a>
        </div>
      </footer>
    </div>
  );
}
