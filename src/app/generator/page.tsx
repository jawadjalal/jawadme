import type { Metadata } from "next";
import { meta } from "@/lib/seo";
import "../globals.css";
import "./generator.css";

// jawadjalal.com/generator: the ad canvas ambitious' posts are made in, full bleed. The page is a frame and one
// link to the source on GitHub; the tool itself is the static folder in public/generator, so the page ships no
// client JavaScript of its own and the same files run from a plain static server.

const LINE =
  "eight layouts, every word editable on the canvas, exported as an exact-pixel PNG. this is the generator behind ambitious' posts, and it is open source.";

export const metadata: Metadata = meta({ title: "generator", description: LINE, path: "/generator" });

export default function GeneratorPage() {
  return (
    <main className="gen">
      <iframe className="gen-frame" src="/generator/index.html" title="the ad canvas: eight layouts, editable, exported at exact pixels" />
      <div className="gen-foot">
        <a className="gen-source" href="https://github.com/jawadjalal/generator" target="_blank" rel="noreferrer">
          source
        </a>
      </div>
    </main>
  );
}
