import { BookCallB } from "@/components/cta/BookCallB";
import { MailLink } from "@/components/MailLink";
import { IDENTITY } from "@/lib/profile";

/** The two ways to reach him, side by side and equal: the call ticket on the left, an email on the right. Both carry
 *  the page's src, so /cal?src= and email_open say where the ask came from. */
export function Contact({ src, as: H = "h2" }: { src: string; as?: "h1" | "h2" }) {
  return (
    <section className="ct" aria-labelledby={"ct-h-" + src}>
      <H id={"ct-h-" + src} className="ct-h">
        contact
      </H>
      <div className="ct-two">
        <div className="ct-c ct-call">
          <span className="ct-k">a 15 minute call</span>
          <BookCallB src={src} size="hero" />
        </div>
        <div className="ct-c ct-mail">
          <span className="ct-k">or an email</span>
          <MailLink src={src} className="ct-m">
            {IDENTITY.email} <span className="arr">↗</span>
          </MailLink>
        </div>
      </div>
    </section>
  );
}
