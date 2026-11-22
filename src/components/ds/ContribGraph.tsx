"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type SyntheticEvent } from "react";
import { dayLabel, summarise, type Contributions } from "@/lib/contributions";

const fmt = (n: number) => n.toLocaleString("en-US");

export function ContribGraph({ data, href, size }: { data: Contributions; href: string; size: "full" | "mini" }) {
  const root = useRef<HTMLElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const [tip, setTip] = useState<{ i: number; x: number; y: number } | null>(null);
  const lead = new Date(data.start).getUTCDay();
  const weeks = Math.ceil((lead + data.levels.length) / 7);
  const last = data.levels.length - 1;
  const { month, inMonth, streak } = summarise(data);
  const total = fmt(data.total) + " contributions in the past year";

  const cells = useMemo(
    () =>
      data.levels.map((level, i) => {
        const w = Math.floor((lead + i) / 7);
        return (
          <li
            key={i}
            data-i={i}
            data-l={level}
            data-o={w < weeks - 26 ? "" : undefined}
            tabIndex={i === last ? 0 : -1}
            aria-label={dayLabel(data, i)}
            style={{ ["--w" as string]: w, gridRowStart: i === 0 ? lead + 1 : undefined }}
          />
        );
      }),
    [data, lead, weeks, last],
  );

  useEffect(() => {
    const el = root.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.arm = "";
    if (num.current) num.current.textContent = "0";
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        el.dataset.in = "";
        const t0 = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / 1400);
          if (num.current) num.current.textContent = fmt(Math.round(data.total * (1 - (1 - p) ** 3)));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [data.total]);

  const show = (e: SyntheticEvent) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>("li[data-i]");
    const box = cell?.offsetParent as HTMLElement | null;
    if (!cell || !box) return;
    const x = Math.min(Math.max(cell.offsetLeft + cell.offsetWidth / 2, 120), box.clientWidth - 120);
    setTip({ i: Number(cell.dataset.i), x, y: cell.offsetTop });
  };

  const move = (e: KeyboardEvent<HTMLOListElement>) => {
    const step = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1, Home: -Infinity, End: Infinity }[e.key];
    const cell = (e.target as HTMLElement).closest<HTMLElement>("li[data-i]");
    if (step === undefined || !cell) return;
    e.preventDefault();
    const list = [...e.currentTarget.children] as HTMLElement[];
    const visible = list.filter((li) => li.offsetParent !== null);
    const from = Number(cell.dataset.i);
    const to = Number.isFinite(step) ? from + step : step < 0 ? Number(visible[0].dataset.i) : last;
    const next = list[to];
    if (!next || next.offsetParent === null) return;
    cell.tabIndex = -1;
    next.tabIndex = 0;
    next.focus();
  };

  return (
    <figure ref={root} className="cg" data-size={size}>
      <a className="cg-total" href={href} aria-label={total + ", on github"}>
        <span ref={num}>{fmt(data.total)}</span> contributions in the past year
      </a>
      <div className="cg-box">
        <ol
          className="cg-grid"
          aria-label={`github contributions, a square a day: ${total}. busiest month ${month}, ${fmt(inMonth)}. longest streak ${streak} days. arrow keys move between days.`}
          onPointerOver={show}
          onPointerLeave={() => setTip(null)}
          onFocus={show}
          onBlur={() => setTip(null)}
          onKeyDown={move}
        >
          {cells}
        </ol>
        {tip ? (
          <span className="cg-tip" aria-hidden="true" style={{ left: tip.x, top: tip.y }}>
            {dayLabel(data, tip.i)}
          </span>
        ) : null}
      </div>
      <figcaption className="cg-cap">
        <span className="cg-y">a square a day, the past year</span>
        <span className="cg-h">a square a day, the past 26 weeks</span>
        <span className="cg-key" aria-hidden="true">
          less <i data-l="0" /><i data-l="1" /><i data-l="2" /><i data-l="3" /><i data-l="4" /> more
        </span>
      </figcaption>
    </figure>
  );
}
