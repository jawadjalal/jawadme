import Link from "next/link";
import { BookLink } from "@/components/BookLink";
import { Art } from "@/components/ds/Art";
import { NAV, SITE, SOCIAL } from "@/content/site";

/** The page's last word: "Where to next?" beside a painted Greek signpost. Each board is a real link pointing at a
 *  section, the call board in ember at the foot of the post; they swing out from the post when the footer arrives. */

const ARMS = [...NAV.map((n) => ({ label: n.label, href: n.href })), { label: "Book a call", href: "/cal?src=footer-signpost" }];
const TILT = [-3, 2.5, -2, 3, -1.5];

export function Footer({ src }: { src: string }) {
  return (
    <footer className="foot">
      <div className="foot-in">
        <div className="foot-copy">
          <h2 className="d-cta foot-h" data-lines="">
            Where to next?
          </h2>
          <p className="t-line foot-line">
            Brands, ads, 3D and Roblox games. <a href={"mailto:" + SITE.email + "?subject=Project"}>{SITE.email}</a>
          </p>
        </div>
        <nav className="sign" aria-label="Where to next" data-in="">
          <Art k="sign" sizes="(min-width: 768px) 30vw, 70vw" className="sign-art" />
          <ol className="sign-arms">
            {ARMS.map((a, i) => {
              const book = i === ARMS.length - 1;
              const side = book || i % 2 ? "r" : "l";
              const style = { "--i": i, "--r": TILT[i] + "deg" } as React.CSSProperties;
              const inner = (
                <>
                  {side === "l" ? <span className="arr" aria-hidden="true">←</span> : null}
                  {a.label}
                  {side === "r" ? <span className="arr" aria-hidden="true">→</span> : null}
                </>
              );
              return (
                <li key={a.label} className={"sign-arm " + side + (book ? " book" : "")} style={style}>
                  {book ? (
                    <BookLink src="footer-signpost" className="sign-board" cursor>
                      {inner}
                    </BookLink>
                  ) : (
                    <Link href={a.href} className="sign-board" data-cursor="view">
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
          <span className="sign-foot" aria-hidden="true" />
        </nav>
      </div>
      <div className="bar ink foot-bar">
        <span>©2026 Jawad Jalal</span>
        <span className="foot-links">
          {SOCIAL.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener">
              {s.label}
            </a>
          ))}
          <a href="/blog">Blog</a>
          <a href={SITE.cv}>CV</a>
        </span>
        <BookLink src={src} className="foot-book" cursor>
          Book a call ↗
        </BookLink>
      </div>
    </footer>
  );
}
