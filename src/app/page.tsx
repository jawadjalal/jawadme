import { preload } from "react-dom";
import { Geist } from "next/font/google";
import { Edge } from "@/components/felt/Edge";
import { Slots } from "@/components/felt/Slots";
import { SoundToggle } from "@/components/felt/Sound";
import { Book } from "@/components/felt/Book";
import { getBooking } from "@/components/felt/booking";
import { LINE, SLOTS, SOCIALS, feltSrc } from "@/components/felt/copy";
import "@/components/felt/felt.css";

// Not preloaded: the first paint is the felt, and the text may swap in a beat later.
const sans = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist-sans", preload: false });

// jawadjalal.com, after ignaru.com: one black screen, four felt objects for the four things Jawad does, each opening
// a drawer; a tab docked to the foot with the name, the one line and the booking key (real slots from Cal.com). Server-rendered,
// so the first shapes and the tab paint before any script runs.

export const revalidate = 1800;

export default async function Home() {
  const booking = await getBooking();
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
        <Slots booking={booking} />
      </main>
      <footer className="fh-foot">
        <div className="fh-tab">
          <div className="fh-me">
            <p className="fh-name">Jawad Jalal</p>
            <h1 className="fh-line">{LINE}</h1>
            <nav className="fh-links" aria-label="Elsewhere">
              {SOCIALS.map((l) => (
                <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
          <Book b={booking} />
        </div>
      </footer>
    </div>
  );
}
