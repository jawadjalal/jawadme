"use client";

// The long tail, folded away.
//
// Nine rows of client work between the skills table and the contact block
// pushed everything that matters below the fold, and none of it is what
// anyone came to read. It is a `<details>` rather than a state hook so that
// it opens with scripting off, and so the browser's own find-in-page can
// reach inside it.

import Image from "next/image";
import { Icon } from "./Icon";
import { Obj } from "./Obj";
import { Preview } from "./Preview";
import { ELSEWHERE } from "@/lib/profile";

export function Elsewhere() {
  return (
    <details className="group">
      <summary className="else-sum">
        <Obj name="elsewhere" size={30} />
        <span className="text-[17px] font-bold tracking-[-0.01em]">Elsewhere</span>
        <span className="text-[14px] text-muted-foreground">{ELSEWHERE.length} more</span>
        <span className="ml-auto text-muted-foreground transition-transform group-open:rotate-90">
          <Icon name="chev" size={14} />
        </span>
      </summary>
      <div className="sec-body">
        {/* The overflow lives on this wrapper rather than on the list. A grid
            item that clips its own overflow reports a minimum contribution of
            zero, so the 1fr row resolved to the list's top border and nothing
            else: the section opened one pixel tall. */}
        <div className="sec-body-inner">
          <ul className="pt-2">
        {ELSEWHERE.map((e, i) => (
          <li
            key={e.name}
            className="else-row flex items-center gap-3 rounded-[12px] px-3 py-2.5 transition-colors hover:bg-muted"
            style={{ ["--i" as string]: i }}
          >
            {e.logo ? (
              <Image
                src={e.logo}
                alt=""
                width={24}
                height={24}
                className="logo-tile size-7 shrink-0 rounded-[8px] bg-white object-contain p-0.5"
              />
            ) : (
              <span
                aria-hidden="true"
                className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-muted text-[12px] font-bold text-muted-foreground"
              >
                {e.name[0]}
              </span>
            )}
            <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-3">
              <Preview shot={e.shot} label={e.domain}>
                <a
                  href={e.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap text-[16px] font-bold underline decoration-transparent underline-offset-[3px] transition-colors hover:decoration-foreground"
                >
                  {e.name}
                </a>
              </Preview>
              <span className="text-[14px] leading-snug text-muted-foreground sm:ml-auto sm:truncate sm:text-right">
                {e.note}
              </span>
            </div>
          </li>
        ))}
          </ul>
        </div>
      </div>
    </details>
  );
}
