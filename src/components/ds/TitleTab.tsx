import type { ReactNode } from "react";

/** A section's name at display size with its line beside it: a short fact, and a link or a sentence under it, set on
 *  the title's baseline so the heading and its context read as one line of the page. */
export function TitleTab({ children, tag, side, as: H = "h2", id }: { children: ReactNode; tag?: string; side?: ReactNode; as?: "h1" | "h2"; id?: string }) {
  return (
    <header className="tab" id={id}>
      <H className="d-tab" data-lines="">
        {children}
      </H>
      <p className="tab-meta" data-in="">
        {tag ? <span className="tab-tag">{tag}</span> : null}
        {side ? <span className="tab-side">{side}</span> : null}
      </p>
    </header>
  );
}
