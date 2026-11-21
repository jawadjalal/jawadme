import { MARK } from "./display/mark";

// The name in his lettering: "design mastermind" drawn on Geist by display/letter.py, the same contrast and touches as the
// headings' face plus the pieces only the name gets (the g's tail under the word, the s-t tie, the r-m join, the last
// d's lift). One path per letter, so each rises in turn; the loader reads these paths straight from the h1.

const MAX = Math.max(...MARK.words.map((w) => w.w));

/** The h1: the name as real text for readers and search, drawn in his lettering. */
export function Wordmark({ label, className }: { label: string; className?: string }) {
  let n = 0;
  return (
    <h1 className={"wm" + (className ? " " + className : "")}>
      <span className="vh">{label}</span>
      {MARK.words.map((w) => (
        <svg key={w.t} className="wm-w" viewBox={"0 " + -MARK.asc + " " + w.w + " " + (MARK.asc + MARK.desc)} style={{ "--w": w.w, "--r": w.w / MAX } as React.CSSProperties} aria-hidden="true">
          {w.g.map((d, j) => (
            <path key={j} d={d} className="wm-g" style={{ animationDelay: 40 + n++ * 26 + "ms" }} />
          ))}
        </svg>
      ))}
    </h1>
  );
}
