import "../globals.css";
import { Gilded } from "@/components/gilded/Gilded";
import { ShaftMoment } from "@/components/moments/derelictdepths";
import { fontVars } from "../fonts";

// The game page's closing call band, added here so the page and its data pipeline stay untouched. It sets in the site's
// faces (Geist and Mastermind Display), which next/font preloads, so the hero sets in them from the first paint.

export default function DerelictDepthsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ShaftMoment />
      {children}
      <section aria-label="book a call" className={"bg-[#12100e] px-5 pb-20 pt-4 text-[#efe9df] " + fontVars} style={{ fontFamily: "var(--f-geist), Helvetica, Arial, sans-serif" }}>
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-[#efe9df]/15 pt-10">
          <p className="text-[28px] font-bold leading-tight tracking-[-0.02em] sm:text-[36px]" style={{ fontFamily: "var(--f-display), var(--f-geist), Helvetica, Arial, sans-serif" }}>
            want a game like this? <span className="text-[var(--accent)]">15 min, video.</span>
          </p>
          <Gilded variant="cta" src="derelictdepths" size="hero" />
        </div>
      </section>
    </>
  );
}
