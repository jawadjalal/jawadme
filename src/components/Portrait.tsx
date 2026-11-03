// His drawing, on the page as it is: no mat, no tape, no switch.

import Image from "next/image";
import { IDENTITY } from "@/lib/profile";

export function Portrait() {
  return (
    <div className="portrait">
      <Image
        src={IDENTITY.avatar}
        alt={`${IDENTITY.properName}, designer and founder`}
        width={320}
        height={320}
        priority
        className="portrait-frame select-none object-contain"
      />
    </div>
  );
}
