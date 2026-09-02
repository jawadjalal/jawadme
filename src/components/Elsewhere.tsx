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
import { Preview } from "./Preview";
import { ELSEWHERE } from "@/lib/profile";

export function Elsewhere() {
  return (
    <details className="group">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 px-4 py-3 text-[15px] transition-colors hover:bg-muted sm:min-h-0 sm:px-6">
        <span className="text-muted-foreground transition-transform group-open:rotate-90">
          <Icon name="chev" size={14} />
        </span>
        Elsewhere
        <span className="font-mono text-xs text-muted-foreground">
          {ELSEWHERE.length} more
        </span>
      </summary>
      <div className="sec-body">
        {/* The overflow lives on this wrapper rather than on the list. A grid
            item that clips its own overflow reports a minimum contribution of
            zero, so the 1fr row resolved to the list's top border and nothing
            else: the section opened one pixel tall. */}
        <div className="sec-body-inner">
          <ul className="divide-y divide-border border-t border-border">
        {ELSEWHERE.map((e, i) => (
          <li
            key={e.name}
            className="else-row flex items-center gap-3 px-4 py-2.5 sm:px-6"
            style={{ ["--i" as string]: i }}
          >
            {e.logo ? (
              <Image
                src={e.logo}
                alt=""
                width={24}
                height={24}
                className="size-6 shrink-0 rounded-[6px] border border-border bg-white object-contain p-0.5"
              />
            ) : (
              <span
                aria-hidden="true"
                className="grid size-6 shrink-0 place-items-center rounded-[6px] border border-border font-mono text-[10px] text-muted-foreground"
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
                  className="tap font-display text-[15px] font-medium underline decoration-border underline-offset-[3px] transition-colors hover:decoration-foreground"
                >
                  {e.name}
                </a>
              </Preview>
              <span className="text-[13px] leading-snug text-muted-foreground sm:ml-auto sm:truncate sm:text-right">
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
