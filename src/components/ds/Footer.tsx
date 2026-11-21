import { BookLink } from "@/components/BookLink";
import { MailLink } from "@/components/MailLink";
import { FootStage } from "@/components/world/FootStage";
import { SITE } from "@/content/site";
import { SOCIALS } from "@/lib/profile";
import "@/styles/footer.css";

const LINKS = SOCIALS.filter((s) => s.href.startsWith("https://") && s.label !== "linkedin");

/** The page's last word on every page: the footer's chamber (FootStage), one object to play with and the ways out,
 *  then a plain row of every link. */
export function Footer({ src }: { src: string }) {
  return (
    <footer className="foot">
      <FootStage />
      <div className="foot-row">
        <span className="foot-c">©2026 jawad jalal</span>
        <span className="foot-links">
          {LINKS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener">
              {s.label}
            </a>
          ))}
          <a href="/about">about</a>
        </span>
        <span className="foot-reach">
          <MailLink src="footer" className="foot-mail" />
          <BookLink src={src} className="foot-book" cursor>
            {SITE.cta} ↗
          </BookLink>
        </span>
      </div>
    </footer>
  );
}
