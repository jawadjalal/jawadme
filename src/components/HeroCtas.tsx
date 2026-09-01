"use client";

// The three buttons under the name, each leaning toward the pointer.
//
// One component rather than three so the magnetism is declared once. The pull
// is applied to an inner span, not the anchor: moving the anchor itself would
// shift its own hit area out from under the cursor, which on a small control
// means the pointer can fall off the thing it is pulling.

import { Brand } from "./Brand";
import { Icon, type IconName } from "./Icon";
import { useMagnetic } from "./magnetic";
import { IDENTITY } from "@/lib/profile";

type Cta = {
  label: string;
  href: string;
  cur: string;
  icon?: IconName;
  brand?: "x";
  solid?: boolean;
  external?: boolean;
};

const CTAS: Cta[] = [
  { label: "Send an email", href: `mailto:${IDENTITY.email}`, cur: "say hi", icon: "mail", solid: true },
  { label: "DM on X", href: "https://x.com/jawadmakes", cur: "dm", brand: "x", external: true },
  { label: "Read the CV", href: IDENTITY.cv, cur: "read", icon: "doc" },
];

function HeroCta({ cta }: { cta: Cta }) {
  const { host, inner } = useMagnetic<HTMLAnchorElement, HTMLSpanElement>();

  return (
    <a
      ref={host}
      href={cta.href}
      data-cur={cta.cur}
      target={cta.external ? "_blank" : undefined}
      rel={cta.external ? "noopener noreferrer" : undefined}
      className={`inline-flex min-h-11 items-center rounded-md px-3 py-1 text-[13px] font-medium leading-4 sm:min-h-0 sm:px-2 sm:text-xs ${
        cta.solid
          ? "bg-foreground text-background transition-opacity hover:opacity-90"
          : "border border-border transition-colors hover:border-foreground/20 hover:bg-muted"
      }`}
    >
      <span ref={inner} className="inline-flex items-center gap-1.5 sm:gap-[5px]">
        {cta.brand ? <Brand name={cta.brand} size={13} /> : <Icon name={cta.icon!} size={14} />}
        {cta.label}
      </span>
    </a>
  );
}

export function HeroCtas() {
  return (
    <div id="hero-cta" className="mt-2 flex flex-wrap items-center gap-2">
      {CTAS.map((c) => (
        <HeroCta key={c.label} cta={c} />
      ))}
    </div>
  );
}
