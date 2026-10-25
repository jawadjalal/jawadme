// The bar that hangs from the top of the screen, as on ignura.com: square at
// the top, the page's 12px radius on its two bottom corners, one soft grey
// step off the paper with a hairline rim and a single tight contact shade, so
// it reads as a tab pulled down rather than as a floating pill.
//
// One component for the home page and the blog. The home page passes its menus;
// the blog passes none and gets a single link back.

import Link from "next/link";
import { Mark } from "./Obj";
import { NavEmail } from "./NavEmail";
import { NavMenu, type NavGroup } from "./NavMenu";
import { Theme } from "./Theme";
import { IDENTITY } from "@/lib/profile";

export function SiteNav({ groups, home = true }: { groups?: NavGroup[]; home?: boolean }) {
  return (
    <header className="nv">
      <div className="nv-bar">
        <Link
          href={home ? "#main" : "/"}
          className="tap flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          aria-label={home ? `${IDENTITY.properName}, back to the top` : `${IDENTITY.properName}, home`}
        >
          <Mark size={24} />
          <span className="text-[15px] font-bold tracking-[-0.01em]">{IDENTITY.properName}</span>
        </Link>
        <div className="flex items-center gap-1.5 md:gap-2">
          {groups ? (
            <nav aria-label="Main" className="hidden md:block">
              <NavMenu groups={groups} />
            </nav>
          ) : (
            <Link href="/blog" className="nv-link">
              Blog
            </Link>
          )}
          <Theme />
          <NavEmail />
        </div>
      </div>
    </header>
  );
}
