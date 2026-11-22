import type { Metadata } from "next";
import { Contact } from "@/components/ds/Contact";
import { Footer } from "@/components/ds/Footer";
import { meta } from "@/lib/seo";

export const metadata: Metadata = meta({
  title: "contact",
  description: "book a free 15 minute video call with jawad jalal, or email him. two ways in, both one click.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="ct-p">
      <Contact src="contact" as="h1" />
      <Footer src="contact" first />
    </main>
  );
}
