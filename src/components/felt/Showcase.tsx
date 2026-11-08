"use client";

/*
 * The work list, read from one file (src/lib/showcase.ts), grouped by kind. On a wide screen it is an index: the names
 * run down the right, and the still of the one you point at (or the one in the middle of the screen as you scroll) sits
 * large in a frame that stays put on the left. The frame swaps on hover, focus or an IntersectionObserver crossing, so
 * React renders once per change, never per scroll frame. On a phone every entry carries its own still.
 */
import { useEffect, useRef, useState } from "react";
import { KIND_NAME, LABEL_NAME, SHOWCASE, type ShowcaseKind } from "@/lib/showcase";

const ORDER: ShowcaseKind[] = ["site", "ad", "product"];

export function Showcase() {
  const [at, setAt] = useState(0);
  // the frame keeps only the stills that have been shown, so a long list costs one image until you move through it
  const [seen, setSeen] = useState<ReadonlySet<number>>(() => new Set([0]));
  if (!seen.has(at)) setSeen(new Set(seen).add(at));
  const list = useRef<HTMLDivElement>(null);
  const items = ORDER.flatMap((k) => SHOWCASE.filter((s) => s.kind === k));

  useEffect(() => {
    const root = list.current;
    if (!root || typeof IntersectionObserver !== "function" || !matchMedia("(min-width: 861px)").matches) return;
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setAt(Number((e.target as HTMLElement).dataset.i));
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    root.querySelectorAll("[data-i]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const cur = items[at] ?? items[0];
  return (
    <section className="sc" id="work" aria-labelledby="sc-h">
      <div className="sc-head">
        <h2 id="sc-h" className="sc-h">sites and ads</h2>
        <p className="sc-p">
          each one says what it was. client work was paid for, a concept is a redesign nobody asked for, and spec was made to
          pitch.
        </p>
      </div>
      <div className="sc-body">
        <div className="sc-stage" aria-hidden="true">
          <div className="sc-frame">
            {items.map((s, i) =>
              !seen.has(i) ? null : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s.name}
                className={i === at ? "is-on" : undefined}
                src={s.image}
                alt=""
                width={1440}
                height={900}
                loading="lazy"
                decoding="async"
              />
              ),
            )}
          </div>
          <p className="sc-now">
            <b>{cur?.name}</b> {cur ? new URL(cur.href).host.replace(/^www\./, "") : ""}
          </p>
        </div>
        <div className="sc-list" ref={list}>
          {ORDER.map((k) => {
            const group = items.map((s, i) => ({ s, i })).filter(({ s }) => s.kind === k);
            if (!group.length) return null;
            return (
              <div key={k} className="sc-group">
                <h3 className="sc-gh">
                  {KIND_NAME[k]} <span>{group.length}</span>
                </h3>
                <ul>
                  {group.map(({ s, i }) => (
                    <li key={s.name} data-i={i} className={i === at ? "is-on" : undefined}>
                      <a href={s.href} target="_blank" rel="noreferrer" onPointerEnter={() => setAt(i)} onFocus={() => setAt(i)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="sc-thumb" src={s.small ?? s.image} alt={`${s.name}: ${s.line}`} width={720} height={450} loading="lazy" decoding="async" />
                        <span className="sc-name">{s.name}</span>
                        <span className="sc-line">
                          <i className={`sc-tag sc-tag-${s.label}`}>{LABEL_NAME[s.label]}</i> {s.line}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
