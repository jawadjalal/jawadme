import Link from "next/link";
import { Theme } from "@/components/Theme";
import { IDENTITY } from "@/lib/profile";

// The same ruled column as the home page, with a shorter header: the home
// page's menus point at its own sections, which do not exist here.

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <div className="sticky top-0 isolate z-50 w-full bg-background/85 pt-1 backdrop-blur">
        <div className="mx-auto w-full max-w-column">
          <div className="screen-line-top screen-line-bottom mt-1 flex w-full items-center justify-between gap-2 px-4 py-1.5">
            <Link href="/" className="tap rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
              <span className="font-pixel text-2xl uppercase leading-none tracking-wide">
                {IDENTITY.wordmark}
              </span>
            </Link>
            <div className="flex items-center gap-2 md:gap-4">
              <Link href="/blog" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Blog
              </Link>
              <Theme />
            </div>
          </div>
        </div>
      </div>

      <main id="main" className="column-ground mx-auto w-full max-w-column border-border md:border-x">
        {children}
        <footer className="screen-line-top px-4 py-6 text-sm text-muted-foreground sm:px-6">
          <Link href="/" className="rp-link">{IDENTITY.properName}</Link>, designer and founder in London.
        </footer>
      </main>
    </div>
  );
}
