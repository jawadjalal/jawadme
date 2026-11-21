import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { ART, type ArtKey } from "@/content/art";

/** One painted piece at its slot's crop. Without its file the slot is a marked stand-in, or the fallback if given. */
export function Art({ k, sizes = "100vw", priority, className = "", fallback }: { k: ArtKey; sizes?: string; priority?: boolean; className?: string; fallback?: React.ReactNode }) {
  const a = ART[k];
  const file = "/art/" + k + ".webp";
  const has = existsSync(path.join(process.cwd(), "public", file));
  if (!has && fallback) return <>{fallback}</>;
  return (
    <div className={"art art-" + k + " " + className} style={{ "--pos": a.pos } as React.CSSProperties} data-art={has ? "on" : "slot"}>
      {has ? (
        <Image src={file} alt={a.alt} fill sizes={sizes} priority={priority} quality={88} />
      ) : (
        <div className="art-slot" role="img" aria-label={a.alt || "Art to come"}>
          <span className="lbl">Art slot · {a.name}</span>
          <span className="lbl art-spec">{a.spec}</span>
        </div>
      )}
    </div>
  );
}
