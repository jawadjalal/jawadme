import type { ReactNode } from "react";
import type { Lane } from "@/content/work";
import { Moment } from "./Moment";

/** A case page's cover, held in a lit niche of the world: colonnades and fires either side, the cover itself in the
 *  middle as the page's own picture. Ads stand among amphorae, sites among stone blocks, the game among ore. */
export function CaseMoment({ lane, tall, children }: { lane: Lane; tall: boolean; children: ReactNode }) {
  const set = lane === "ads" ? "niche-ads" : lane === "roblox" || lane === "3d" ? "niche-game" : "niche-web";
  return (
    <Moment set={set} className={"mo-case" + (tall ? " tall" : "")}>
      {children}
    </Moment>
  );
}
