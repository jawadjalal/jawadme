"use client";

import { useCallback } from "react";
import { BookLink } from "@/components/BookLink";
import { Gilded } from "@/components/gilded/Gilded";
import { MAIL, copyEmail, trackEmail } from "@/lib/mail";
import { SITE } from "@/content/site";
import { SOCIALS } from "@/lib/profile";
import { Flames } from "./kit/Flames";
import { Stage } from "./kit/Stage";
import type { Sign } from "./pillarScene";

// The footer's object: a waymarker at a crossroads in the underworld, one sign per way out (./pillarScene on the world
// kit's Stage). Each sign is a real link laid over the object: live, the scene moves it onto its sign every frame and
// lights the sign for it; over the poster (phones, weak GPUs, reduced motion) it sits where the poster shows that sign.
// "book a call" and "email" are the top arms, so booking lives on the pillar itself. The call's arm is gilded like the
// site's call: live, the 3D arm is gold leaf on dark enamel; over the poster (rendered without that arm) it is the
// Gilded arm itself.

const SOCIAL = ["x", "github", "instagram", "tiktok", "youtube"] as const;
const SIGNS: readonly Sign[] = ["cal", "email", ...SOCIAL];

/** Where each sign's label sits on the posters, as fractions of the frame: [desktop x, y, phone x, y]. */
const AT: Record<Sign, [number, number, number, number]> = {
  cal: [0.368, 0.2541, 0.605, 0.2257],
  email: [0.2597, 0.3097, 0.2641, 0.2743],
  youtube: [0.3993, 0.3593, 0.6282, 0.3157],
  x: [0.2632, 0.5142, 0.2744, 0.4471],
  github: [0.3958, 0.4492, 0.6179, 0.3929],
  tiktok: [0.3875, 0.5532, 0.5974, 0.4814],
  instagram: [0.2729, 0.6761, 0.3, 0.5857],
};

export function Pillar({ first }: { first?: boolean }) {
  const load = useCallback(
    () =>
      import("./pillarScene").then((m) => (host: HTMLElement, ctx: Parameters<typeof m.mount>[1]) =>
        m.mount(host, ctx, { signs: SIGNS, el: (k) => host.parentElement!.querySelector<HTMLElement>('[data-sign="' + k + '"]') }),
      ),
    [],
  );
  const at = (k: Sign) => {
    const [dx, dy, mx, my] = AT[k];
    return { "--dx": dx, "--dy": dy, "--mx": mx, "--my": my } as React.CSSProperties;
  };
  return (
    <div className="pl">
      <div className="pl-head">
        <h2 className="foot-h">where to next?</h2>
        <p className="foot-hint">pick a sign.</p>
      </div>
      <Stage load={load} poster={{ d: "/world/poster/pillar-d.webp", m: "/world/poster/pillar-m.webp", first }} className="pl-stage" margin="1200px 0px">
        <Flames of="pillar" />
        <nav className="pl-ui" aria-label="where to next">
          <span className="pl-a main" data-sign="cal" style={at("cal")}>
            <BookLink src="footer-pillar">
              <span className="vh">{SITE.cta}</span>
            </BookLink>
            <span className="pl-gild">
              <Gilded variant="arm" src="footer-pillar" />
            </span>
          </span>
          <span className="pl-a" data-sign="email" style={at("email")}>
            <a
              href={MAIL}
              onClick={() => {
                trackEmail("footer-pillar");
                void copyEmail();
              }}
            >
              <span className="vh">email</span>
            </a>
          </span>
          {SOCIAL.map((k) => (
            <span key={k} className="pl-a" data-sign={k} style={at(k)}>
              <a href={SOCIALS.find((s) => s.label === k)!.href} target="_blank" rel="noopener">
                <span className="vh">{k} (opens in a new tab)</span>
              </a>
            </span>
          ))}
        </nav>
      </Stage>
    </div>
  );
}
