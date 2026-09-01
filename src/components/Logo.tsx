import Image from "next/image";

// A brand mark in its tile.
//
// The tile is always light, in both themes. Most of these marks are published
// as black on transparent, and Okara's is nothing but black rules, so on the
// dark page it disappeared into the background entirely. Pinning the tile
// light is what a favicon strip does for the same reason, and it means a new
// logo can be dropped in without first checking whether it survives dark mode.

export function Logo({
  src,
  emoji,
  size = 40,
  tile,
  className = "",
}: {
  src?: string;
  /** Stands in where there is no file yet. */
  emoji?: string;
  size?: number;
  /** Overrides the white tile, for a mark that is drawn to sit on its own
   *  colour and loses its figure without it. */
  tile?: string;
  className?: string;
}) {
  const box = `shrink-0 overflow-hidden rounded-[10px] border border-border ${
    tile ? "" : "bg-white"
  } ${className}`;
  const tileStyle = tile ? { background: tile } : undefined;

  if (emoji) {
    return (
      <span
        className={`grid place-items-center ${box}`}
        style={{ width: size, height: size, fontSize: size * 0.5, ...tileStyle }}
        aria-hidden="true"
      >
        {emoji}
      </span>
    );
  }

  return (
    <span className={`grid place-items-center ${box}`} style={{ width: size, height: size, ...tileStyle }}>
      <Image
        src={src!}
        alt=""
        width={size}
        height={size}
        // Next refuses to run SVG through the image optimizer without
        // `dangerouslyAllowSVG`. These are our own static files, so the
        // simpler answer is to skip the optimizer for them entirely.
        unoptimized={src!.endsWith(".svg")}
        // Inset, so a mark drawn to the edge of its own canvas is not welded
        // to the tile's border.
        className={tile ? "size-full object-cover" : "size-[78%] object-contain"}
      />
    </span>
  );
}
