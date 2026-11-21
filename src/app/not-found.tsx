import type { Metadata } from "next";
import Link from "next/link";
import { BookCallB } from "@/components/cta/BookCallB";
import { Dock } from "@/components/ds/Dock";
import { Footer } from "@/components/ds/Footer";
import { LostMoment } from "@/components/moments/notfound";
import { fontVars } from "./fonts";
import "@/styles/ds.css";
import "@/styles/motion.css";

export const metadata: Metadata = { title: "wrong turn", robots: { index: false } };

export default function NotFound() {
  return (
    <div className={"ds " + fontVars}>
      <main className="lost">
        <LostMoment>
          <p className="lost-k">404, nothing lives at this address</p>
          <h1 className="lost-h">wrong turn.</h1>
          <p className="lost-line">the corridor caved in. the signpost knows the way back.</p>
          <nav className="lost-ways" aria-label="ways back">
            <Link href="/work" data-m="press lift">work ↗</Link>
            <Link href="/" data-m="press lift">home ↗</Link>
            <BookCallB src="404" size="hero" />
          </nav>
        </LostMoment>
      </main>
      <Footer src="404" />
      <Dock />
    </div>
  );
}
