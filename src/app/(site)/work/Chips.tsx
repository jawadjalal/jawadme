"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

/** The filter row. When it runs past the screen, the gaps open just enough that the screen's edge falls between two
 *  pills, so no pill sits cut in half before the row is scrolled. */
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
        used += (pill as HTMLElement).offsetWidth;
        const even = (room - used) / (k + 1);
        if (even < 8) break;
        gap = even;
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
