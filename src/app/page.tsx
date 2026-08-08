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
import { allPosts } from "@/lib/posts";
import "./design/design.css";

export default function Home() {
  // The Writing window names real posts rather than just pointing at the route,
  // so an empty blog looks empty and a published one looks published. Dates are
  // formatted here, on the server, so the client cannot render a different
  // string on hydration.
  const posts = allPosts()
    .slice(0, 3)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      date: new Date(p.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    }));

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <HomeClient posts={posts} />
    </>
  );
}
