import { BookLink } from "@/components/BookLink";
import { MailLink } from "@/components/MailLink";
import { SITE } from "@/content/site";
import { IDENTITY } from "@/lib/profile";

/** The two ways to reach him, side by side and equal: a call on the left, an email on the right. Both carry the
 *  page's src, so /cal?src= and email_open say where the ask came from. */
export function Contact({ src, as: H = "h2" }: { src: string; as?: "h1" | "h2" }) {
  return (
    <section className="ct" aria-labelledby={"ct-h-" + src}>
      <H id={"ct-h-" + src} className="ct-h">
        contact
      </H>
      <div className="ct-two">
        <BookLink src={src} className="ct-c ct-call" cursor>
          <span className="ct-k">
            book a call <span className="arr">↗</span>
          </span>
          <span className="ct-d">{SITE.detail}, free</span>
        </BookLink>
        <MailLink src={src} className="ct-c ct-mail">
          <span className="ct-k">
            email <span className="arr">↗</span>
          </span>
          <span className="ct-d">{IDENTITY.email}</span>
        </MailLink>
      </div>
    </section>
  );
}
