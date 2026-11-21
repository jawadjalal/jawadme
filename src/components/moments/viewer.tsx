"use client";

import type { ReactNode } from "react";
import { Moment } from "./Moment";

/** The viewer's stage: the piece hangs in a quiet niche, columns and two low fires either side of it. */
export const ViewerMoment = ({ children }: { children: ReactNode }) => (
  <Moment set="niche-view" className="v-stage mo-view">
    {children}
  </Moment>
);
