"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/** The filter row. When it runs past the screen, the gaps open just enough that the next pill peeks 24px past the
 *  screen's edge, so the row reads as one that scrolls on, and no pill sits cut in half. */
export function Chips({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const row = ref.current!;
    const fit = () => {
      row.style.removeProperty("--cg");
      if (row.scrollWidth <= row.clientWidth) return;
      const room = row.clientWidth - parseFloat(getComputedStyle(row).paddingLeft);
      let used = 0;
      let gap = 0;
      for (const [k, pill] of [...row.children].entries()) {
        if (k > 0) {
          const even = (room - 24 - used) / k;
          if (even < 8) break;
          gap = even;
        }
        used += (pill as HTMLElement).offsetWidth;
      }
      if (gap) row.style.setProperty("--cg", gap + "px");
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(row);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="chips-in" ref={ref}>
      {children}
    </div>
  );
}
