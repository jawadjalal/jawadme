import { INK } from "./ink";

/** Marginalia drawn with the mark's nib, laid over the text it marks: a scribbled underline or a loose ring. */
export function Ink({ kind, children }: { kind: keyof typeof INK; children: React.ReactNode }) {
  const s = INK[kind];
  return (
    <span className={"mg mg-" + kind}>
      {children}
      <svg viewBox={"0 0 " + s.w + " " + s.h} preserveAspectRatio="none" aria-hidden="true">
        <path d={s.d} />
      </svg>
    </span>
  );
}
