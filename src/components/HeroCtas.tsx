"use client";

// The three buttons under the name, each leaning toward the pointer.
//
// One component rather than three so the magnetism is declared once. The pull
// is applied to an inner span, not the anchor: moving the anchor itself would
// shift its own hit area out from under the cursor, which on a small control
// means the pointer can fall off the thing it is pulling.

import { Brand } from "./Brand";
import { Icon, type IconName } from "./Icon";
import { Obj } from "./Obj";
import { openContact } from "./contact";
import { useMagnetic } from "./magnetic";
import { IDENTITY } from "@/lib/profile";

type Cta = {
  label: string;
  href: string;
  cur: string;
  icon?: IconName;
  brand?: "x";
  solid?: boolean;
  /** Warms the glyph. Only the primary button gets it: a second yellow icon
   *  and neither one is the one you are meant to press. */
  warm?: boolean;
  external?: boolean;
};

const CTAS: Cta[] = [
  { label: "Send an email", href: `mailto:${IDENTITY.email}`, cur: "say hi", icon: "mail", solid: true, warm: true },
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
      onClick={(e) => {
        // Kept as a real mailto in the markup, so with no JavaScript this is
        // still a working way to reach him rather than a dead button.
        if (!cta.href.startsWith("mailto:")) return;
        e.preventDefault();
        openContact();
      }}
      target={cta.external ? "_blank" : undefined}
      rel={cta.external ? "noopener noreferrer" : undefined}
      className={`key h-12 text-[16px] ${cta.solid ? "key-ink pl-2 pr-4" : "key-soft px-4"}`}
    >
      <span ref={inner} className="inline-flex items-center gap-2">
        {cta.solid ? (
          <span className="key-tile">
            <Obj name="contact" size={24} />
          </span>
        ) : cta.brand ? (
          <Brand name={cta.brand} size={15} />
        ) : (
          <Icon name={cta.icon!} size={16} />
        )}
        {cta.label}
      </span>
    </a>
  );
}

export function HeroCtas() {
  return (
    <div id="hero-cta" className="mt-7 flex flex-wrap items-center gap-2">
      {CTAS.map((c) => (
        <HeroCta key={c.label} cta={c} />
      ))}
    </div>
  );
}
