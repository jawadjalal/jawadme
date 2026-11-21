import type { Metadata } from "next";
import { labFonts } from "./fonts";
import "./lab.css";

// Hero and /cal directions for review. Unlisted: no index, not in the sitemap.

export const metadata: Metadata = { title: "Lab", robots: { index: false, follow: false } };

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <div className={"lab " + labFonts}>{children}</div>;
}
