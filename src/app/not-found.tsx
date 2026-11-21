import type { Metadata } from "next";
import { Dock } from "@/components/ds/Dock";
import { Footer } from "@/components/ds/Footer";
import { fontVars } from "./fonts";
import "@/styles/ds.css";

export const metadata: Metadata = { title: "Wrong turn", robots: { index: false } };

export default function NotFound() {
  return (
    <div className={"ds " + fontVars}>
      <main className="lost">
        <div className="bar ink">
          <span>404</span>
          <span>Nothing lives at this address</span>
        </div>
        <h1 className="lost-h">Wrong turn.</h1>
        <p className="lost-line">This page isn't in the labyrinth. The signpost knows the way back.</p>
      </main>
      <Footer src="404" />
      <Dock />
    </div>
  );
}
