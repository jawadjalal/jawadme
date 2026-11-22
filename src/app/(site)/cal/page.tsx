import type { Metadata } from "next";
import { CalInline } from "@/components/ds/CalInline";
import { Gilded } from "@/components/gilded/Gilded";
import { MailLink } from "@/components/MailLink";
import { CalMoment } from "@/components/moments/cal";
import { IDENTITY } from "@/lib/profile";
import { meta } from "@/lib/seo";
import "./cal.css";

export const metadata: Metadata = meta({ title: "book a call", description: "book a free 15 minute video call with jawad jalal about brands, ads, sites, 3d and roblox games.", path: "/cal" });

// The calendar is the page: one ink strip with the way back, the call's name and the facts, then Cal.com's own month
// view on the left and, beside it, the gate in a gilded frame with what the call is under it, held on screen.

type Props = { searchParams: Promise<{ src?: string }> };

export default async function Cal({ searchParams }: Props) {
  const { src: raw } = await searchParams;
  const src = raw && /^[a-z0-9-]{1,40}$/.test(raw) ? raw : "cal-page";
  return (
    <main className="cal no-dock">
      <header className="bar ink cal-bar">
        <Gilded variant="pill" href="/">
          ← jawad jalal
        </Gilded>
        <h1 className="cal-h">book a call</h1>
        <p className="cal-meta">15 min · video · free · europe/london</p>
      </header>
      <div className="cal-row">
        <div className="cal-main">
          <div className="cal-embed">
            <CalInline email={IDENTITY.email} theme="light" />
          </div>
          <p className="cal-mail cal-alt">
            rather write? <MailLink src="cal" />
          </p>
        </div>
        <aside className="cal-side">
          <figure className="cal-frame">
            <CalMoment />
          </figure>
          <p className="cal-what">a free 15 minute video call about brands, ads, sites, 3d and roblox games.</p>
          <p className="cal-mail cal-fb">
            calendar not loading?{" "}
            <a href={"https://cal.com/jawad-jalal-hesqbk/15min?src=" + src} target="_blank" rel="noopener">
              open on cal.com ↗
            </a>
          </p>
        </aside>
      </div>
    </main>
  );
}
