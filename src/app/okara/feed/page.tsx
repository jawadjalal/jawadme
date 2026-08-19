import type { Metadata } from "next";
import "../okara.css";
import Solo from "../Solo";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function Page() {
  return <Solo which="feed" />;
}
