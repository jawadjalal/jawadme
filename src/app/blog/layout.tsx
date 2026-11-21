import "../globals.css";
import Link from "next/link";
import { BookLink } from "@/components/BookLink";
import { ContactModal } from "@/components/ContactModal";
import { BlogMoment } from "@/components/moments/blog";
import { SiteNav } from "@/components/SiteNav";
import { IDENTITY } from "@/lib/profile";

// The same reading column as the home page, under the same hanging bar. The
// home page's menus point at its own sections, so the blog's bar has none.

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <ContactModal />
      <SiteNav home={false} />

      <BlogMoment />
      <main id="main" className="mx-auto w-full max-w-column px-4 pt-12 sm:px-6 sm:pt-16">
        {children}
        <footer className="mt-24 px-4 py-8 text-[15px] text-muted-foreground sm:px-6">
          <Link href="/" className="rp-link">{IDENTITY.properName}</Link>, designer and founder in london.{" "}
          <BookLink src="blog" className="rp-link">
            book a call ↗
          </BookLink>
        </footer>
      </main>
    </div>
  );
}
