"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

type Doc = Document & { startViewTransition?: (cb: () => Promise<void>) => unknown };
type Win = Window & { __vtDone?: () => void };

/** A link that morphs into the next page: the picture inside it takes `vt` as its view-transition-name,
 *  the page it opens has the same name on its cover, and the browser animates one into the other. Browsers without
 *  the API, modified clicks and reduced motion navigate as usual. */
export function TLink({ href, vt, onClick, ...rest }: ComponentProps<typeof Link> & { href: string; vt?: string }) {
  const router = useRouter();
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        const doc = document as Doc;
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (!doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        e.preventDefault();
        const pic = e.currentTarget.querySelector<HTMLElement>(".media");
        if (pic && vt) pic.style.viewTransitionName = vt;
        doc.startViewTransition(
          () =>
            new Promise<void>((done) => {
              const w = window as Win;
              const t = window.setTimeout(done, 1200);
              w.__vtDone = () => {
                window.clearTimeout(t);
                done();
              };
              router.push(href);
            }),
        );
      }}
    />
  );
}
