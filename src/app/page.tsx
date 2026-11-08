import { preload } from "react-dom";
import { Geist } from "next/font/google";
import { Edge } from "@/components/felt/Edge";
import { SoundToggle } from "@/components/felt/Sound";
import { Stage } from "@/components/felt/Stage";
import { getBooking } from "@/components/felt/booking";
import { Close } from "@/components/felt/Close";
import { MenuFit, Okara } from "@/components/felt/Companies";
import { Intro } from "@/components/felt/Intro";
import { Showcase } from "@/components/felt/Showcase";
import { Wayari } from "@/components/felt/Wayari";
import "@/components/felt/felt.css";
import "@/components/felt/intro.css";

// Not preloaded: the first paint is the felt, and the text may swap in a beat later.
const sans = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist-sans", preload: false });

// jawadjalal.com, after ignaru.com (components/home): the bar hanging from the top edge, and under it one page that
// reads top to bottom. It opens on Jawad's face over a halftone of the four felt colours, with a drawer already open
// beside it saying who he is; scrolling, Wayari rises over the opening on its own painting; then Okara and MenuFit on
// their own grounds with their own public numbers; then every site and ad, from one list (src/lib/showcase.ts); then
// the close. The drawers behind "more" (his products, the ads, about, a call) stay. The notch at the foot holds the
// socials and the CV. Everything is server-rendered, so the face and the first lines paint before any script runs.
//
// The About drawer's quote prints with <VerseText />, Jawad's own words in a misregistered comic print. Its glitch
// follows Spider-Man: Into the Spider-Verse (2018) and the component's sample caption is by Stan Lee and Steve Ditko,
// from Amazing Fantasy #15 (1962). A fan study with no link to Marvel or Sony.

export const revalidate = 1800;

export default async function Home() {
  const booking = await getBooking();
  // the face is the first screen's largest paint: ask for it in the head
  preload("/felt/jawad-head-640.webp", { as: "image", fetchPriority: "high", imageSrcSet: "/felt/jawad-head-320.webp 320w, /felt/jawad-head-640.webp 640w", imageSizes: "(max-width: 860px) 46vw, min(31vw, 46svh, 400px)" });
  return (
    <div className={`fh ${sans.variable}`}>
      <div className="fh-ground" aria-hidden="true" />
      <Edge />
      <Stage booking={booking}>
        <Intro />
        <Wayari />
        <Okara />
        <MenuFit />
        <Showcase />
        <Close />
      </Stage>
      <div className="fh-corner">
        <SoundToggle />
      </div>
    </div>
  );
}
