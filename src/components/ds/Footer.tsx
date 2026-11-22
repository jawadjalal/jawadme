import Image from "next/image";
import { BookLink } from "@/components/BookLink";
import { MailLink } from "@/components/MailLink";
import { SITE } from "@/content/site";
import { SOCIALS } from "@/lib/profile";
import "@/styles/footer.css";

const LINKS = SOCIALS.filter((s) => s.href.startsWith("https://") && s.label !== "linkedin");

/** Heavily refined Brass Hands × Directional Signpost Footer:
 *  Warm-graded signpost visual plate on the left paired with precision interactive directional sign arms on the right. */
export function Footer({ src = "footer" }: { src?: string; pillar?: boolean; book?: boolean; graph?: boolean }) {
  return (
    <footer className="sf-foot">
      <div className="sf-grid">
        <div className="sf-visual">
          <Image
            src="/world/poster/pillar-d.webp"
            alt="Wayfinder signpost"
            width={1440}
            height={846}
            sizes="(min-width: 960px) 44vw, 100vw"
            className="sf-img"
          />
        </div>

        <div className="sf-signs">
          <div className="sf-head">
            <h2 className="sf-h">Where to next?</h2>
            <span className="sf-sub">LONDON, UK · AVAILABLE NOW</span>
          </div>

          <div className="sf-arm-list">
            <BookLink src={src} className="sf-arm sf-arm-main">
              <span className="sf-arm-idx">01</span>
              <span className="sf-arm-lbl">BOOK A 15-MIN CALL</span>
              <span className="sf-arm-arr" aria-hidden="true">→</span>
            </BookLink>

            <MailLink src="footer-sign" className="sf-arm">
              <span className="sf-arm-idx">02</span>
              <span className="sf-arm-lbl">EMAIL · {SITE.email.toUpperCase()}</span>
              <span className="sf-arm-arr" aria-hidden="true">→</span>
            </MailLink>

            {LINKS.map((s, i) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener" className="sf-arm">
                <span className="sf-arm-idx">{String(i + 3).padStart(2, "0")}</span>
                <span className="sf-arm-lbl">{s.label.toUpperCase()}</span>
                <span className="sf-arm-arr" aria-hidden="true">↗</span>
              </a>
            ))}

            <a href={SITE.cv} download className="sf-arm">
              <span className="sf-arm-idx">{String(LINKS.length + 3).padStart(2, "0")}</span>
              <span className="sf-arm-lbl">DOWNLOAD CV (PDF)</span>
              <span className="sf-arm-arr" aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </div>

      <div className="sf-bar">
        <span>©2026 JAWAD JALAL</span>
        <span>LONDON, UK</span>
      </div>
    </footer>
  );
}
