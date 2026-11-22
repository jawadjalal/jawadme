import { BookLink } from "@/components/BookLink";
import { MailLink } from "@/components/MailLink";
import { Pillar } from "@/components/world/Pillar";
import { SITE } from "@/content/site";
import { SOCIALS } from "@/lib/profile";
import { Contributions } from "./Contributions";
import "@/styles/footer.css";

const LINKS = SOCIALS.filter((s) => s.href.startsWith("https://") && s.label !== "linkedin");

/** The page's last word on every page: the waymarker (Pillar), one sign per way out, then a quiet row of every link,
 *  with his GitHub year beside github. A page whose own scene already holds a signpost (the 404) leaves the Pillar out. */
export function Footer({ src, pillar = true }: { src: string; pillar?: boolean }) {
  return (
    <footer className="foot">
      {pillar ? <Pillar /> : null}
      <div className="foot-row">
        <span className="foot-c">©2026 jawad jalal</span>
        <span className="foot-links">
          {LINKS.map((s) => (
            <span key={s.label} className={s.label === "github" ? "foot-gh" : undefined}>
              <a href={s.href} target="_blank" rel="noopener">
                {s.label}
              </a>
              {s.label === "github" ? <Contributions size="mini" /> : null}
            </span>
          ))}
          <a href="/about">about</a>
        </span>
        <span className="foot-reach">
          <MailLink src="footer" />
          <BookLink src={src} className="foot-book" cursor>
            {SITE.cta} ↗
          </BookLink>
        </span>
      </div>
    </footer>
  );
}
