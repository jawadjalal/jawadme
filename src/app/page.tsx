// Jawad Jalal — personal site.
//
// The front door is a single column: portrait, name, and a handful of
// paragraphs that type themselves in. No scene, no windows, no desktop
// metaphor — jawadOS still runs at /design, which is the studio pitch, but the
// homepage is now just the person.
//
// Metadata for this route is owned by src/app/layout.tsx: the homepage and the
// site are the same thing, so there is one place to change the title and share
// card rather than two that can drift.

import HomeClient from "./home/HomeClient";
import "./home/home.css";

export default function Home() {
  return <HomeClient />;
}
