import { BookLink } from "@/components/BookLink";
import { SITE, SOCIAL } from "@/content/site";
import { CallKey } from "./CallKey";

/** The page's last word: Book a call in display type beside the call key, the email as a fallback, then the row. */
export function Footer({ src, sheet }: { src: string; sheet: string }) {
  return (
    <footer className="foot hair">
      <div className="g16 foot-cta">
        <BookLink src={src} className="foot-big" cursor>
          <span className="lbl dim">[ Next step ]</span>
          <span className="d-cta" data-lines="">
            Book a call ↗
          </span>
        </BookLink>
        <div className="foot-key">
          <CallKey src={src} />
        </div>
      </div>
      <div className="wrap foot-meta hair">
        <span className="lbl">[ 15 min · video · replies within 24h ]</span>
        <span className="lbl dim">Prefer email?</span>
        <a href={`mailto:${SITE.email}?subject=Project`}>{SITE.email}</a>
      </div>
      <div className="wrap foot-row hair">
        {SOCIAL.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener">
            {s.label}
          </a>
        ))}
        <a href="/blog">Blog</a>
        <a href={SITE.cv}>CV</a>
        <span className="lbl dim">©2026 Jawad Jalal · [ {sheet} ↘ ]</span>
      </div>
    </footer>
  );
}
