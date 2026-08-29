import type { Metadata } from "next";
import "./design.css";
import "./stage.css";
import Stage from "./Stage";

// The agents feed on its own, then the same panel inside the dashboard. Kept
// out of the index for the same reason as the rest of /okara.
export const metadata: Metadata = {
  title: "Okara agents feed",
  description: "The agents feed as a working prototype, then the same panel inside the dashboard.",
  robots: { index: false, follow: false, nocache: true },
  openGraph: {
    title: "Okara agents feed",
    description: "A working prototype. Reveal a draft, post it, then watch the paywall land.",
    url: "/okara/agentsfeed",
    siteName: "jawad jalal",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Okara agents feed",
    description: "A working prototype. Reveal a draft, post it, then watch the paywall land.",
  },
};

export default function Page() {
  return <Stage />;
}
