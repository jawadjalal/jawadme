// Jawad Jalal — personal site.
//
// The homepage is jawadOS: a fake operating system rendered as a CRT on a desk,
// scrolled through rather than clicked around. Four windows — Me, Experience,
// Writing and Contact — driven by ./design/RoomHome. It shares the OS look, the
// stylesheet and the room shell with /design, which is the studio pitch: same
// machine, different software.
//
// Metadata for this route is owned by src/app/layout.tsx, since the homepage and
// the site are now the same thing. Nothing is declared here, so there is only
// one place to change the title and share card.

import HomeClient from "./HomeClient";
import "./design/design.css";

export default function Home() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <HomeClient />
    </>
  );
}
