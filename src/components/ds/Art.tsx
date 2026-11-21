import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { ART, type ArtKey } from "@/content/art";

export const hasArt = (k: ArtKey) => existsSync(path.join(process.cwd(), "public", "art", k + ".webp"));

/** One painted piece at its slot's crop. Until its file is in public/art the slot renders its fallback, or nothing. */
export function Art({ k, sizes = "100vw", priority, className = "", fallback }: { k: ArtKey; sizes?: string; priority?: boolean; className?: string; fallback?: React.ReactNode }) {
  if (!hasArt(k)) return fallback ? <>{fallback}</> : null;
  const a = ART[k];
  return (
    <div className={"art art-" + k + " " + className} style={{ "--pos": a.pos } as React.CSSProperties}>
      <Image src={"/art/" + k + ".webp"} alt={a.alt} fill sizes={sizes} priority={priority} quality={88} />
    </div>
  );
}
