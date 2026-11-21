import type { ReactNode } from "react";

/** A section's name at display size over an ink info bar: a short fact on the left, a link or a line on the right. */
export function TitleTab({ children, tag, side, as: H = "h2", id }: { children: ReactNode; tag?: string; side?: ReactNode; as?: "h1" | "h2"; id?: string }) {
  return (
    <header className="tab" id={id}>
      <H className="d-tab" data-lines="">
        {children}
      </H>
      <div className="bar ink tab-bar" data-in="">
        <span>{tag ?? ""}</span>
        {side ? <span className="tab-side">{side}</span> : null}
      </div>
    </header>
  );
}
