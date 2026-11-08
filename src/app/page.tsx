import { preload } from "react-dom";
import { Geist, Instrument_Serif } from "next/font/google";
import { Edge } from "@/components/felt/Edge";
import { SoundToggle } from "@/components/felt/Sound";
import { Stage } from "@/components/felt/Stage";
import { getBooking } from "@/components/felt/booking";
import { DRAWERS, feltSrc } from "@/components/felt/copy";
import "@/components/felt/felt.css";

// Not preloaded: the first paint is the felt, and the text may swap in a beat later.
const sans = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist-sans", preload: false });
// The drawers' one font switch: a word in a claim set in the serif, italic.
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", display: "swap", variable: "--font-serif", preload: false });

// jawadjalal.com, after ignaru.com (components/home): one black screen over a halftone of the four felt colours, the bar
// hanging from the top edge, five felt doors on a dial round one line (who he is: Ignaru, and sites and ads for
// startups), a bento drawer behind each door (his work first, then ads, sites, Ignaru and contact), and a notch at the
// foot with the socials and the CV. The dial and the bar are server-rendered, so the first shapes and the line paint
// before any script runs.

export const revalidate = 1800;

export default async function Home() {
  const booking = await getBooking();
  // the first door, large at the ring's lower left, is the first screen's largest paint: ask for it in the head
  const first = feltSrc(DRAWERS[0].art);
  preload(first.src, { as: "image", fetchPriority: "high", imageSrcSet: first.srcSet, imageSizes: "(max-width: 760px) 26vw, 17vw" });
  return (
    <div className={`fh ${sans.variable} ${serif.variable}`}>
      <div className="fh-ground" aria-hidden="true" />
      <Edge />
      <Stage booking={booking} />
      <div className="fh-corner">
        <SoundToggle />
      </div>
    </div>
  );
}
