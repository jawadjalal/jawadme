import { preload } from "react-dom";
import { Geist } from "next/font/google";
import { Edge } from "@/components/felt/Edge";
import { Slots } from "@/components/felt/Slots";
import { SoundToggle } from "@/components/felt/Sound";
import { About, AboutLink, Contact } from "@/components/felt/About";
import { MeetPill } from "@/components/felt/Meet";
import { getBooking } from "@/components/felt/booking";
import { LINE, SLOTS, feltSrc } from "@/components/felt/copy";
import { Socials } from "@/components/felt/Socials";
import { Index } from "@/components/felt/Index";
import { VerseText } from "@/components/verse-text";
import "@/components/felt/felt.css";

// Not preloaded: the first paint is the felt, and the text may swap in a beat later.
const sans = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist-sans", preload: false });

// jawadjalal.com, after ignaru.com: one black screen, four felt objects for the kinds of work Jawad does, the line, and a
// felt row naming every drawer (his products, Okara, MenuFit, the ads, the sites, a call); a tab docked to the foot with
// the name and the booking key (real slots from Cal.com). Server-rendered, so the first shapes and the tab paint before
// any script runs.
//
// The line prints with <VerseText />, Jawad's own words in a misregistered comic print. Its glitch follows
// Spider-Man: Into the Spider-Verse (2018) and the component's sample caption is by Stan Lee and Steve Ditko, from
// Amazing Fantasy #15 (1962). A fan study with no link to Marvel or Sony.

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
      <About />
      <header className="fh-top">
        <SoundToggle />
        <nav className="fh-toplinks">
          <AboutLink className="fh-toplink">About</AboutLink>
          <a className="fh-toplink" href="/blog">
            Blog
          </a>
        </nav>
      </header>
      <main className="fh-main">
        <Slots booking={booking} />
        <h1 className="fh-line">
          <VerseText text={LINE} tone="dark" seed={1507} className="fh-vt" />
        </h1>
        <Index />
      </main>
      <footer className="fh-foot">
        <div className="fh-tab">
          <div className="fh-me">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="fh-av" src="/felt/jawad-av-96.webp" srcSet="/felt/jawad-av-96.webp 1x, /felt/jawad-av.webp 2x" alt="Jawad" width={48} height={48} />
            <AboutLink className="fh-me-name">
              <b>Jawad Jalal</b>
              <span>
                Design engineer, London<span className="fh-me-more"> · about me</span>
              </span>
            </AboutLink>
          </div>
          <Socials />
          <Contact />
          <MeetPill minutes={booking.minutes} />
        </div>
      </footer>
    </div>
  );
}
