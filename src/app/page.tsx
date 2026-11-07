import { preload } from "react-dom";
import { Geist } from "next/font/google";
import { Edge } from "@/components/felt/Edge";
import { SoundToggle } from "@/components/felt/Sound";
import { Stage } from "@/components/felt/Stage";
import { getBooking } from "@/components/felt/booking";
import { DRAWERS, feltSrc } from "@/components/felt/copy";
import "@/components/felt/felt.css";

// Not preloaded: the first paint is the felt, and the text may swap in a beat later.
const sans = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist-sans", preload: false });

// jawadjalal.com, after ignaru.com (components/home): one black screen over a halftone of the four felt colours, the bar
// hanging from the top edge, ten felt doors on a ring round the line, a drawer behind each door (his products, Okara,
// MenuFit, Bevel, the ads, the sites, about, a call), and a notch at the foot with the socials and the CV. The ring
// and the bar are server-rendered, so the first shapes and the line paint before any script runs.
//
// The About drawer's quote prints with <VerseText />, Jawad's own words in a misregistered comic print. Its glitch
// follows Spider-Man: Into the Spider-Verse (2018) and the component's sample caption is by Stan Lee and Steve Ditko,
// from Amazing Fantasy #15 (1962). A fan study with no link to Marvel or Sony.

export const revalidate = 1800;

export default async function Home() {
  const booking = await getBooking();
  // the first door, large at the ring's lower left, is the first screen's largest paint: ask for it in the head
  const first = feltSrc(DRAWERS[0].art);
  preload(first.src, { as: "image", fetchPriority: "high", imageSrcSet: first.srcSet, imageSizes: "(max-width: 760px) 26vw, 17vw" });
  return (
    <div className={`fh ${sans.variable}`}>
      <div className="fh-ground" aria-hidden="true" />
      <Edge />
      <Stage booking={booking} />
      <div className="fh-corner">
        <SoundToggle />
      </div>
    </div>
  );
}
