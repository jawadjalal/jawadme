import type { Metadata } from "next";
import Link from "next/link";
import { BookLink } from "@/components/BookLink";
import { Dock } from "@/components/ds/Dock";
import { Footer } from "@/components/ds/Footer";
import { LostMoment } from "@/components/moments/notfound";
import { fontVars } from "./fonts";
import "@/styles/ds.css";

export const metadata: Metadata = { title: "Wrong turn", robots: { index: false } };

export default function NotFound() {
  return (
    <div className={"ds " + fontVars}>
      <main className="lost">
        <LostMoment>
          <p className="lost-k">404, nothing lives at this address</p>
          <h1 className="lost-h">Wrong turn.</h1>
          <p className="lost-line">The corridor caved in. The signpost knows the way back.</p>
          <nav className="lost-ways" aria-label="Ways back">
            <Link href="/work">Work ↗</Link>
            <Link href="/">Home ↗</Link>
            <BookLink src="404" className="lost-call">
              Book a call ↗
            </BookLink>
          </nav>
        </LostMoment>
      </main>
      <Footer src="404" />
      <Dock />
    </div>
  );
}
