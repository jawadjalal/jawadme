import type { Metadata } from "next";
import { Hero } from "@/components/ds/Hero";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <main className="neo-home no-dock">
      <Hero />
    </main>
  );
}
