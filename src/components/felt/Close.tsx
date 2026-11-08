/*
 * The close: one line, the call and the email, and the name across the whole width. The bar's own key style
 * (felt.css, fh-key) so the one action on the page looks the same at the top and the bottom.
 */
import { BOOK, CV, EMAIL } from "./copy";
import { MeetMark } from "./Meet";

export function Close() {
  return (
    <footer className="cl" aria-labelledby="cl-h">
      <div className="cl-in">
        <h2 id="cl-h" className="cl-h">want one of these?</h2>
        <p className="cl-p">fifteen minutes about your launch, no prep needed. or write to me, i read everything.</p>
        <div className="cl-acts">
          <a className="fh-key" href={BOOK} target="_blank" rel="noreferrer">
            <MeetMark size={17} />
            <span>book a call</span>
          </a>
          <a className="cl-link" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          <a className="cl-link" href={CV} download>
            cv
          </a>
        </div>
      </div>
      <p className="cl-name" aria-hidden="true">
        jawad jalal
      </p>
    </footer>
  );
}
