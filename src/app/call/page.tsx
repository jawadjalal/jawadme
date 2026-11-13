import type { Metadata } from "next";
import { CallEmbed } from "@/components/portfolio/CallEmbed";
import { DriftWall } from "@/components/portfolio/DriftWall";
import { Sticker } from "@/components/portfolio/Sticker";
import { WorkFeed } from "@/components/portfolio/WorkFeed";
import { print, sans } from "@/components/portfolio/fonts";
import { getBooking } from "@/components/felt/booking";
import { FEED } from "@/content/feed";
import { BOOKING, CLOSING, SECOND } from "@/content/story";
import "@/components/portfolio/portfolio.css";
import { CALL_DESCRIPTION, CALL_TITLE, callPage } from "@/lib/seo";

// jawadjalal.com/call: the booking calendar in the left column, the same endless wall of his work on the right. The
// call's length and where it happens come from Cal.com's public API (components/felt/booking), rebuilt every 30 minutes.

export const revalidate = 1800;

export const metadata: Metadata = {
  title: CALL_TITLE,
  description: CALL_DESCRIPTION,
  alternates: { canonical: "/call" },
  openGraph: {
    title: CALL_TITLE,
    description: CALL_DESCRIPTION,
    url: "/call",
    siteName: "Jawad Jalal",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Jawad Jalal. I design ads, brands and sites for startups. Beside it, a wall of his ads." }],
  },
  twitter: { card: "summary_large_image", creator: "@jawadmakes", title: CALL_TITLE, description: CALL_DESCRIPTION, images: ["/og.png"] },
};

const MEMOJI = { pic: "/design/jawad-die.webp", alt: "Jawad's memoji", cut: true, w: 697, h: 781, tilt: 5 } as const;

export default async function Call() {
  const b = await getBooking();
  const where = b.where === "meet" ? "on Google Meet" : "on video";
  return (
    <div className={`pf pf-call ${sans.variable} ${print.variable}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(callPage()) }} />
      <aside className="col col-call">
        <div className="col-top">
          <div className="col-h1">
            <p className="col-lead">
              <span className="col-line">
                Let&apos;s talk. <Sticker s={MEMOJI} eager />
              </span>
            </p>
            <h1 className="col-main">
              <span className="col-line">
                {b.minutes} minutes, {where}.
              </span>
            </h1>
          </div>
        </div>
        <CallEmbed booking={BOOKING} email={SECOND.address} />
      </aside>
      <main className="pf-main" id="work">
        <h2 className="pf-sr">Work</h2>
        <div className="wall-drift">
          <DriftWall entries={FEED} href={BOOKING} />
        </div>
        <div className="wall-flow">
          <WorkFeed entries={FEED} href={BOOKING} closing={CLOSING} name="Jawad Jalal" />
        </div>
      </main>
    </div>
  );
}
