import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import Link from "next/link";
import data from "./assets.json";
import { Gallery, type Asset } from "./Gallery";
import "./capy.css";

// jawadjalal.com/capy: every asset Jawad made for The Consumer Mobile Hackathon (Capy, 15 November), each one
// copyable to the clipboard and downloadable. The list is assets.json, written by scripts/capy-sync.mjs.

const sans = Inter({ subsets: ["latin"], display: "swap", variable: "--cp-sans" });
/** The home page's print face: Archivo's black italic, taken down to extra condensed. */
const print = Archivo({ subsets: ["latin"], style: ["italic"], axes: ["wdth"], display: "swap", variable: "--cp-print" });

const ASSETS = data.assets as Asset[];
const KIND_ORDER = ["strips", "rebuilds", "posters", "banners", "stickers", "wallpapers", "social", "badges", "signs", "slides", "motion"];
const kinds = [...new Set(ASSETS.map((a) => a.kind))].sort((a, b) => {
  const r = (k: string) => (KIND_ORDER.indexOf(k) < 0 ? 99 : KIND_ORDER.indexOf(k));
  return r(a) - r(b);
});

/** "Manga strips, posters, banners and more": the kinds the page really holds, in order. */
function kindList(): string {
  // the rebuilds are posters too, so the line names the strips and the kinds of thing
  const names = (kinds.length ? kinds : ["posters"]).filter((k) => k !== "rebuilds").map((k) => (k === "strips" ? "manga strips" : k));
  // three kinds at most, so the line stays two lines long
  const t =
    names.length > 3
      ? `${names.slice(0, 3).join(", ")} and more`
      : names.length === 1
        ? names[0]
        : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const TITLE = "Capy hackathon assets, by Jawad Jalal";
const LEAD = `${kindList()} for The Consumer Mobile Hackathon, November 15. Copy anything.`;

export const metadata: Metadata = {
  title: TITLE,
  description: LEAD,
  alternates: { canonical: "/capy" },
  openGraph: {
    title: TITLE,
    description: LEAD,
    url: "/capy",
    type: "website",
    images: data.og ? [{ url: data.og, width: 1200, height: 630, alt: "One of the posters from the page" }] : undefined,
  },
  twitter: { card: "summary_large_image", creator: "@jawadmakes", images: data.og ? [data.og] : undefined },
};

export default function CapyPage() {
  const sets = new Set(ASSETS.map((a) => a.group)).size;
  return (
    <div className={`capy ${sans.variable} ${print.variable}`}>
      <header className="cp-head">
        <Link href="/" className="cp-name">
          Jawad Jalal
        </Link>
        <h1 className="cp-title" data-text={"Capy hackathon\nassets"}>
          Capy hackathon
          <br />
          assets
        </h1>
        <div className="cp-intro">
          <p className="cp-lead">{LEAD}</p>
          <p className="cp-note">
            Made by Jawad, not an official Capy or YC page. Capy&apos;s characters and logos belong to Capy.
          </p>
        </div>
      </header>
      <Gallery assets={ASSETS} kinds={kinds} total={ASSETS.length} sets={sets} />
      <footer className="cp-foot">
        <Link href="/">jawadjalal.com</Link>
        <a href="https://x.com/jawadmakes">@jawadmakes</a>
      </footer>
    </div>
  );
}
