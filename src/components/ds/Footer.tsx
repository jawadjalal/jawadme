import Link from "next/link";
import { BookLink } from "@/components/BookLink";
import { NAV, SITE, SOCIAL } from "@/content/site";
import "@/styles/signpost.css";

/** The page's last word: "Where to next?" beside a carved signpost whose five arms point at the sections and the
 *  call. The list on the left is the real navigation (keyboard, screen readers, no JS); with live 3D the shared canvas
 *  draws the post into the [data-view="signpost"] box, reads its labels from this list and clicks these links.
 *  Otherwise the poster shows with a link laid over each arm. */

const ARMS = [...NAV.map((n) => ({ label: n.label, href: n.href })), { label: "Book a call", href: "/cal?src=footer-signpost" }];
const HITS: [number, number, number, number][] = [
  [46, 29, 32, 11],
  [17, 38, 29, 11],
  [47, 48, 24, 11],
  [12, 56, 33, 10],
  [46, 66, 44, 11],
];

export function Footer({ src, sheet }: { src: string; sheet: string }) {
  return (
    <footer className="sp" data-signpost="">
      <div className="sp-in">
        <div className="sp-copy">
          <h2 className="sp-title">Where to next?</h2>
          <nav aria-label="Where to next">
            <ol className="sp-list">
              {ARMS.map((a, i) => (
                <li key={a.label} data-arm={i} data-label={a.label}>
                  {i === ARMS.length - 1 ? (
                    <BookLink src="footer-signpost" className="sp-link sp-book" cursor>
                      <span className="sp-n" aria-hidden="true">{["I", "II", "III", "IV", "V"][i]}</span>
                      {a.label}
                    </BookLink>
                  ) : (
                    <Link href={a.href} className="sp-link" data-cursor="view">
                      <span className="sp-n" aria-hidden="true">{["I", "II", "III", "IV", "V"][i]}</span>
                      {a.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <div className="sp-stage" data-view="signpost">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="poster-3d sp-poster" src="/three/signpost-poster.webp" alt="" width={1000} height={1200} loading="lazy" decoding="async" />
          <div className="sp-hits" aria-hidden="true">
            {ARMS.map((a, i) => (
              <a
                key={a.label}
                href={a.href}
                tabIndex={-1}
                style={{ left: `${HITS[i][0]}%`, top: `${HITS[i][1]}%`, width: `${HITS[i][2]}%`, height: `${HITS[i][3]}%` }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="sp-meta">
        <span>©2026 Jawad Jalal</span>
        <a href={`mailto:${SITE.email}?subject=Project`}>{SITE.email}</a>
        <BookLink src={src} className="sp-meta-book" cursor>
          Book a call
        </BookLink>
        <span className="sp-social">
          {SOCIAL.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener">
              {s.label}
            </a>
          ))}
          <a href="/blog">Blog</a>
          <a href={SITE.cv}>CV</a>
        </span>
        <span className="sp-sheet">{sheet}</span>
      </div>
    </footer>
  );
}
