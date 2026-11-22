import { BookLink } from "@/components/BookLink";
import { MailLink } from "@/components/MailLink";
import { Pillar } from "@/components/world/Pillar";
import { SITE } from "@/content/site";
import { SOCIALS } from "@/lib/profile";
import { Contributions } from "./Contributions";
import "@/styles/footer.css";

const LINKS = SOCIALS.filter((s) => s.href.startsWith("https://") && s.label !== "linkedin");

/** The page's last word on every page: the waymarker (Pillar), one sign per way out, then his GitHub year on its own
 *  row and a quiet row of every link. A page whose own scene already holds a signpost (the 404) leaves the Pillar out; a
 *  page where the Pillar is the largest paint (/contact) sets `first` so its poster loads eagerly at high priority. */
export function Footer({ src, pillar = true, first }: { src: string; pillar?: boolean; first?: boolean }) {
  return (
    <footer className="foot">
      {pillar ? <Pillar first={first} /> : null}
      <div className="foot-cg">
        <Contributions size="mini" />
      </div>
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
          <MailLink src="footer" />
          <BookLink src={src} className="foot-book" cursor>
            {SITE.cta} ↗
          </BookLink>
        </span>
      </div>
    </footer>
  );
}
