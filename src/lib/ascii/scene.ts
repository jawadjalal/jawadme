import type { ComponentProps, RefObject } from "react";

import type { AsciiHandle } from "@/lib/ascii/frame";
import type { AsciiLook } from "@/lib/ascii/look";

/**
 * Props every scene in `components/asciicn/scenes` takes, whichever
 * renderer draws it. The look props switch live: a scene redraws in the
 * new charset, colours or effects without remounting.
 */
export interface AsciiSceneProps
  extends AsciiLook, Omit<ComponentProps<"div">, "children"> {
  /** Cell height in CSS pixels. Default `--ascii-cell`, or the scene's own. */
  cell?: number;
  /** Time multiplier. Default 1. */
  speed?: number;
  /** `false` holds a still frame. Default `true`. */
  animate?: boolean;
  /** Frame rate cap. Default 30 (scenes may raise it). */
  fps?: number;
  /** The moment drawn when motion is off or reduced, in seconds. */
  stillTime?: number;
  /** Drag-to-turn on the 3D objects. Scenes and cities ignore it: nothing reacts to hover. */
  interactive?: boolean;
  /** Filled with a handle for export (.txt, .ans, .svg, .png, video). */
  handle?: RefObject<AsciiHandle | null>;
}
