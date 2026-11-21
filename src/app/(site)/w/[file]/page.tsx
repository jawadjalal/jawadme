import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Viewer } from "@/components/ds/Viewer";
import { adById } from "@/content/ads";
import { CURATED, PIECES, pieceById, pieceLine, type Piece as P } from "@/lib/pieces";
import { JsonLd, adWork, meta } from "@/lib/seo";

// One piece at its own address. The curated ads step through in curation order; the older permalinks open as pieces
// on their own.

type Props = { params: Promise<{ file: string }> };

const near = (c: P) => ({ id: c.id, src: c.src, w: c.w, h: c.h });

export const dynamicParams = false;
export const generateStaticParams = () => PIECES.map((p) => ({ file: p.id }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = pieceById((await params).file);
  if (!p) return {};
  return meta({ title: `${pieceLine(p)}, ${p.group}`, description: p.alt + " Designed by Jawad Jalal.", path: "/w/" + p.id, type: "article" });
}

export default async function Piece({ params }: Props) {
  const { file } = await params;
  const i = CURATED.findIndex((c) => c.id === file);
  const p = pieceById(file);
  if (!p) notFound();
  const n = CURATED.length;
  const at = i >= 0 ? { n: i + 1, of: n, prev: near(CURATED[(i - 1 + n) % n]), next: near(CURATED[(i + 1) % n]), strip: [-3, -2, -1, 0, 1, 2, 3].map((d) => CURATED[(i + d + n) % n]).map((c) => ({ id: c.id, sm: c.sm, alt: c.alt })) } : null;
  const ad = adById(file);
  return (
    <>
      {ad ? <JsonLd data={adWork(ad, pieceLine(ad))} /> : null}
      <Viewer piece={p} at={at} />
    </>
  );
}
