import type { Metadata } from "next";
import "../okara.css";
import Solo from "../Solo";

export const metadata: Metadata = {
  // A reader with all 3 solo routes open needs the tab to say which is which.
  title: "Agents feed / Okara",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Solo which="feed" />;
}
