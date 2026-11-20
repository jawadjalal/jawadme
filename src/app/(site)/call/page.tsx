import type { Metadata } from "next";
import Image from "next/image";
import { CalInline } from "@/components/ds/CalInline";
import { TitleTab } from "@/components/ds/TitleTab";
import { RAIL } from "@/content/ads";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "Book a call",
  description: "Book a 15 minute video call with Jawad Jalal about brands, ads, 3D and Roblox games.",
  alternates: { canonical: "/call" },
};

export default function Call() {
  const best = RAIL.slice(0, 6);
  return (
    <main className="call no-dock">
      <div className="g16 call-grid">
        <aside className="call-side">
          <TitleTab as="h1" tag="15 min">
            Book a call
          </TitleTab>
          <div className="call-meta">
            <p className="lbl">[ 15 min · video · London time shown in yours ]</p>
            <p>
              <span className="dim">Prefer email? </span>
              <a href={`mailto:${SITE.email}?subject=Project`}>{SITE.email}</a>
            </p>
            <a href="/" className="lbl call-home">
              ← Back to the work
            </a>
          </div>
        </aside>
        <div className="call-cal">
          <CalInline email={SITE.email} />
        </div>
      </div>
      <div className="call-rail" aria-hidden="true">
        <div className="call-rail-track">
          {[...best, ...best].map((a, i) => (
            <Image key={i} src={a.sm} width={a.w} height={a.h} alt="" sizes="220px" />
          ))}
        </div>
      </div>
    </main>
  );
}
