import "../globals.css";
import { BookLink } from "@/components/BookLink";

// The game page's closing call band, added here so the page and its data pipeline stay untouched.

export default function DerelictDepthsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <section aria-label="Book a call" className="bg-[#100c1c] px-5 pb-20 pt-4 text-[#f7efd9]">
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-[#f7efd9]/15 pt-10">
          <p className="text-[28px] font-semibold leading-tight tracking-[-0.02em] sm:text-[36px]">
            Want a game like this? <span className="text-[#b9addb]">15 min, video.</span>
          </p>
          <BookLink
            src="derelictdepths"
            className="rounded-full bg-[#ffc043] px-6 py-3 text-[17px] font-semibold text-[#05030a] transition-colors hover:bg-[#ffe08f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffc043]"
          >
            Book a call ↗
          </BookLink>
        </div>
      </section>
    </>
  );
}
