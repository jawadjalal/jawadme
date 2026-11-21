import "../globals.css";
import { preload } from "react-dom";
import { Gilded } from "@/components/gilded/Gilded";
import { ShaftMoment } from "@/components/moments/derelictdepths";

// The game page's closing call band, added here so the page and its data pipeline stay untouched. Its three faces are
// preloaded so the hero sets in them from the first paint instead of shifting when they arrive.

const FONTS = ["/fonts/satoshi-400.woff2", "/fonts/satoshi-700.woff2", "/fonts/chillax-600.woff2"];

export default function DerelictDepthsLayout({ children }: { children: React.ReactNode }) {
  for (const f of FONTS) preload(f, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  return (
    <>
      <ShaftMoment />
      {children}
      <section aria-label="book a call" className="bg-[#100c1c] px-5 pb-20 pt-4 text-[#f7efd9]">
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-[#f7efd9]/15 pt-10">
          <p className="text-[28px] font-semibold leading-tight tracking-[-0.02em] sm:text-[36px]">
            want a game like this? <span className="text-[#b9addb]">15 min, video.</span>
          </p>
          <Gilded variant="cta" src="derelictdepths" size="hero" />
        </div>
      </section>
    </>
  );
}
