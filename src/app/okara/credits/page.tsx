import type { Metadata } from "next";
import "../okara.css";
import Solo from "../Solo";

export const metadata: Metadata = {
  // A reader with all 3 solo routes open needs the tab to say which is which.
  title: "Credits / Okara",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Solo which="credits" />;
}
