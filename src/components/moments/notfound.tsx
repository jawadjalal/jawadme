import type { ReactNode } from "react";
import { Moment } from "./Moment";

/** The 404: a corridor that caved in, one fire lit, a signpost; the page's way back is laid over it. */
export const LostMoment = ({ children }: { children: ReactNode }) => (
  <Moment set="deadend" first className="mo-lost">
    {children}
  </Moment>
);
