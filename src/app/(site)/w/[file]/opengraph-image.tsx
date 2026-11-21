import { card } from "@/app/_og/card";
import { PIECES, pieceById } from "@/lib/pieces";
export { contentType, size } from "@/app/_og/card";

export const alt = "A piece from Jawad Jalal's work";
export const generateStaticParams = () => PIECES.map((p) => ({ file: p.id }));

export default async function Image({ params }: { params: Promise<{ file: string }> }) {
  const p = pieceById((await params).file)!;
  const r = p.w / p.h;
  return card({ title: p.group, line: p.line, bar: ["Jawad Jalal", p.kind, "jawadjalal.com"], side: { src: p.src, w: r > 1 ? 640 : Math.round(572 * Math.max(r, 0.7)) }, face: true });
}
