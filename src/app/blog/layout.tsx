import Link from "next/link";
import { ContactModal } from "@/components/ContactModal";
import { SiteNav } from "@/components/SiteNav";
import { IDENTITY } from "@/lib/profile";

// The same reading column as the home page, under the same hanging bar. The
// home page's menus point at its own sections, so the blog's bar has none.

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <SiteNav home={false} />

      <main id="main" className="mx-auto w-full max-w-column px-4 pt-24 sm:px-6 sm:pt-28">
        {children}
        <footer className="mt-24 py-8 text-[15px] text-muted-foreground">
          <Link href="/" className="rp-link">{IDENTITY.properName}</Link>, designer and founder in London.
        </footer>
      </main>
      {/* after the page, so its heading never comes before the page's h1; a dialog draws in the top layer wherever it sits */}
      <ContactModal />
    </div>
  );
}
