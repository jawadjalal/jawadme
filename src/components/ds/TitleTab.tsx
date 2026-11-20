import type { ReactNode } from "react";

/** The name on a block of page, cut into a band of signal orange, with a mono tag on its corner. */
export function TitleTab({ children, tag, side, as: H = "h2", id }: { children: ReactNode; tag?: string; side?: ReactNode; as?: "h1" | "h2"; id?: string }) {
  return (
    <header className="tab" id={id}>
      <div className="tab-name">
        <H className="d-tab">{children}</H>
        {tag ? <span className="lbl tab-tag">[ {tag} ]</span> : null}
      </div>
      {side ? <div className="tab-side">{side}</div> : null}
    </header>
  );
}

export const Badge = ({ n }: { n: number }) => <span className="badge">{n}</span>;
