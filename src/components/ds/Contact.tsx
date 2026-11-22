import { Gilded } from "@/components/gilded/Gilded";
import { MailLink } from "@/components/MailLink";
import "./contact.css";

/** The two ways to reach him, side by side and equal: the call on the left, an email on the right. Both carry
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
          <Gilded variant="cta" src={src} size="hero" />
        </div>
        <div className="ct-c ct-mail">
          <span className="ct-k">or an email</span>
          <MailLink src={src} />
        </div>
      </div>
    </section>
  );
}
