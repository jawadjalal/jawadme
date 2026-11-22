import "../globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { BookLink } from "@/components/BookLink";
import { Gilded } from "@/components/gilded/Gilded";
import { Dock } from "@/components/ds/Dock";
import { X_HANDLE, X_HREF } from "@/lib/seo";
import data from "./assets.json";
import { Gallery, type Asset } from "./Gallery";
import { Board, BoardLink } from "./Board";
import { fontVars } from "../fonts";
import { LEFT_OUT } from "./arrange";
import "@/styles/ds.css";
import "./capy.css";
import "./board.css";

// jawadjalal.com/capy: an explorable board (Board.tsx) of every asset Jawad made for The Consumer Mobile Hackathon (Capy, 15 November), each one
// copyable to the clipboard and downloadable. The list is assets.json, written by scripts/capy-sync.mjs.

// the posters built around a giant numeral 15 are left off
const ASSETS = (data.assets as Asset[]).filter((a) => !LEFT_OUT.test(a.id));
const KIND_ORDER = ["clean", "sponsors", "strips", "rebuilds", "posters", "banners", "stickers", "wallpapers", "social", "badges", "signs", "slides", "motion"];
const kinds = [...new Set(ASSETS.map((a) => a.kind))].sort((a, b) => {
  const r = (k: string) => (KIND_ORDER.indexOf(k) < 0 ? 99 : KIND_ORDER.indexOf(k));
  return r(a) - r(b);
});

/** "manga strips, posters, banners and more": the kinds the page really holds, in order. */
function kindList(): string {
  // the rebuilds are posters too, so the line names the strips and the kinds of thing
  const names = (kinds.length ? kinds : ["posters"]).filter((k) => k !== "rebuilds" && k !== "sponsors" && k !== "clean").map((k) => (k === "strips" ? "manga strips" : k));
  // three kinds at most, so the line stays two lines long
  const t =
    names.length > 3
      ? `${names.slice(0, 3).join(", ")} and more`
      : names.length === 1
        ? names[0]
        : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return t;
}

const TITLE = "capy hackathon assets, by jawad jalal";
const LEAD = `${kindList()} for the consumer mobile hackathon, november 15. copy anything.`;

export const metadata: Metadata = {
  title: TITLE,
  description: LEAD,
  alternates: { canonical: "/capy" },
  openGraph: {
    title: TITLE,
    description: LEAD,
    url: "/capy",
    type: "website",
    images: data.og ? [{ url: data.og, width: 1200, height: 630, alt: "one of the posters from the page" }] : undefined,
  },
  twitter: { card: "summary_large_image", creator: X_HANDLE, images: data.og ? [data.og] : undefined },
};

export default function CapyPage() {
  const sets = new Set(ASSETS.map((a) => a.group)).size;
  return (
    <div className={"capy " + fontVars}>
      <Board assets={ASSETS} kinds={kinds}>
      <header className="cp-head">
        <div className="cp-top">
          <Gilded variant="pill" href="/">
            ← jawad jalal
          </Gilded>
          <BoardLink />
          <Gilded variant="cta" src="capy" size="dock" />
        </div>
        <h1 className="cp-title" data-text={"capy hackathon\nassets"}>
          capy hackathon
          <br />
          assets
        </h1>
        <div className="cp-intro">
          <p className="cp-lead">{LEAD}</p>
          <p className="cp-note">
            made by jawad, not an official capy or yc page. capy&apos;s characters and logos belong to capy.
          </p>
        </div>
      </header>
      <Gallery assets={ASSETS} kinds={kinds} total={ASSETS.length} sets={sets} />
      <footer className="cp-foot">
        <Link href="/">jawadjalal.com</Link>
        <BookLink src="capy-foot">book a call</BookLink>
        {X_HREF ? <a href={X_HREF}>{X_HANDLE}</a> : null}
      </footer>
      </Board>
      <div className="ds cp-dock">
        <Dock />
      </div>
    </div>
  );
}
