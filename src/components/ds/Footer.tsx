import { BookLink } from "@/components/BookLink";
import { FootStage } from "@/components/world/FootStage";
import { SITE, SOCIAL } from "@/content/site";
import "@/styles/footer.css";

/** The page's last word on every page: the footer's chamber (FootStage), one object to play with and the ways out,
 *  then a plain row of every link. */
export function Footer({ src }: { src: string }) {
  return (
    <footer className="foot">
      <FootStage />
      <div className="foot-row">
        <span className="foot-c">©2026 Jawad Jalal</span>
        <span className="foot-links">
          {SOCIAL.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener">
              {s.label}
            </a>
          ))}
          <a href="/about">About</a>
          <a href="/blog">Blog</a>
          <a href={SITE.cv}>CV</a>
          <a href={"mailto:" + SITE.email}>{SITE.email}</a>
        </span>
        <BookLink src={src} className="foot-book" cursor>
          {SITE.cta} ↗
        </BookLink>
      </div>
    </footer>
  );
}
