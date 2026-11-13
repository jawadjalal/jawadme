// A sticker of his own work stuck into a line of type: a cut-out with a white keyline, or a square card with a white
// border, tilted a few degrees, with a soft shadow, overlapping the letters a little. It wobbles when you point at it.
// `tuck` pulls it over the sticker before it, the way stickers pile up on a laptop lid.

export type StickerPic = { pic: string; alt: string; w: number; h: number; tilt: number; cut?: boolean; tuck?: boolean };

export function Sticker({ s, eager }: { s: StickerPic; eager?: boolean }) {
  return (
    <span
      className="stk"
      data-cut={s.cut ? "" : undefined}
      data-tuck={s.tuck ? "" : undefined}
      style={{ "--tilt": `${s.tilt}deg`, "--ar": s.w / s.h } as React.CSSProperties}
    >
      <img src={s.pic} alt={s.alt} width={s.w} height={s.h} loading={eager ? "eager" : "lazy"} decoding="async" />
    </span>
  );
}
