import { card } from "@/app/_og/card";
import { PIECES, pieceById, pieceLine } from "@/lib/pieces";
export { contentType, size } from "@/app/_og/card";

export const alt = "An ad by Jawad Jalal";
export const generateStaticParams = () => PIECES.map((p) => ({ file: p.id }));

export default async function Image({ params }: { params: Promise<{ file: string }> }) {
  const p = pieceById((await params).file)!;
  const r = p.w / p.h;
  return card({ title: p.group, line: pieceLine(p), bar: ["Jawad Jalal", "Ad design", "jawadjalal.com"], side: { src: p.src, w: r > 1 ? 640 : Math.round(572 * Math.max(r, 0.7)) }, face: true });
}
