import type { Metadata } from "next";
import { Gilded } from "@/components/gilded/Gilded";
import { BookPill } from "@/components/ds/BookPill";
import { Dock } from "@/components/ds/Dock";
import { LostMoment } from "@/components/moments/notfound";
import { fontVars } from "./fonts";
import "@/styles/ds.css";
import "@/styles/motion.css";
import "./lost.css";

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
            <Gilded variant="pill" href="/work">
              work
            </Gilded>
            <Gilded variant="pill" href="/">
              home
            </Gilded>
            <BookPill src="404" />
          </nav>
        </LostMoment>
      </main>
      <Dock />
    </div>
  );
}
