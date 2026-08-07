import type { Metadata } from "next";
import DesignClient from "./DesignClient";
import "./design.css";

export const metadata: Metadata = {
  title: "jawadOS — design by Jawad Jalal",
  description:
    "Design, build and ship. jawadOS is a working desktop you scroll through: the work, the prices, and a brief you can send in one sitting.",
  openGraph: {
    title: "jawadOS — design by Jawad Jalal",
    description:
      "Design, build and ship. A working desktop you scroll through: the work, the prices, and a brief you can send in one sitting.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "jawadOS — design by Jawad Jalal",
    description:
      "Design, build and ship. A working desktop you scroll through: the work, the prices, and a brief you can send in one sitting.",
  },
};

export default function DesignPage() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <DesignClient />
    </>
  );
}
