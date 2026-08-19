import type { Metadata } from "next";
import "./okara.css";
import Walkthrough from "./Walkthrough";

// Private pitch to one reader. Kept out of the index on purpose: it critiques
// another company's product, and neither of us wants it ranking.
export const metadata: Metadata = {
  title: "Okara dashboard, three changes",
  description: "Three changes to the Okara AI CMO dashboard, with the evidence behind each.",
  robots: { index: false, follow: false, nocache: true },
};

export default function OkaraPage() {
  return <Walkthrough />;
}
