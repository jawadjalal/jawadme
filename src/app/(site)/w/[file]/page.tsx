import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Viewer } from "@/components/ds/Viewer";
import { PROJECTS } from "@/content/work";
import { CURATED, PIECES, pieceById, type Piece as P } from "@/lib/pieces";
import { JsonLd, meta, pieceWork } from "@/lib/seo";
import "./piece.css";

// One piece at its own address. The gallery's pieces step through in the order /work hangs them; the older permalinks
// open as pieces on their own.

type Props = { params: Promise<{ file: string }> };

const near = (c: P) => ({ id: c.id, src: c.src, w: c.w, h: c.h });

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
/** The picture's shape as a ratio when it reduces to one people say (4:5, 16:9), else its pixel size. */
const shape = (w: number, h: number) => {
  const d = gcd(w, h);
  return w / d <= 21 && h / d <= 21 ? `${w / d}:${h / d}` : `${w} × ${h}`;
};

/** The four pieces beside this one: the rest of its room first, then its neighbours on the wall. */
function beside(i: number) {
  const n = CURATED.length;
  const own = CURATED.filter((c, j) => j !== i && c.group === CURATED[i].group);
  const ring = [1, -1, 2, -2, 3, -3, 4, -4].map((d) => CURATED[(i + d + n) % n]);
  return [...own, ...ring.filter((c) => !own.includes(c))].slice(0, 4).map((c) => ({ id: c.id, sm: c.sm, alt: c.alt }));
}

export const dynamicParams = false;
export const generateStaticParams = () => PIECES.map((p) => ({ file: p.id }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = pieceById((await params).file);
  if (!p) return {};
  return meta({ title: `${p.line}, ${p.group}`, description: `${p.alt} ${p.group}, ${p.credit}.`, path: "/w/" + p.id, type: "article" });
}

export default async function Piece({ params }: Props) {
  const { file } = await params;
  const i = CURATED.findIndex((c) => c.id === file);
  const p = pieceById(file);
  if (!p) notFound();
  const n = CURATED.length;
  const at = i >= 0 ? { n: i + 1, of: n, prev: near(CURATED[(i - 1 + n) % n]), next: near(CURATED[(i + 1) % n]), strip: beside(i) } : null;
  const facts = { client: p.group, year: PROJECTS.find((c) => c.name === p.group)?.year, role: `${p.kind}, ${shape(p.w, p.h)}` };
  return (
    <>
      {p.credit.includes("jawad jalal") ? <JsonLd data={pieceWork(p)} /> : null}
      <Viewer piece={p} at={at} facts={facts} />
    </>
  );
}
