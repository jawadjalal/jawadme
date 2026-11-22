import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Viewer } from "@/components/ds/Viewer";
import { PROJECTS } from "@/content/work";
import { ROOMS } from "@/lib/gallery";
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

/** What the picture shows: its alt text after its own line. */
const said = (c: P) => (c.alt.startsWith(c.line + ". ") ? c.alt.slice(c.line.length + 2) : c.alt);

/** Every piece of this one's campaign, itself included. */
const campaign = (i: number) => CURATED.filter((c) => c.group === CURATED[i].group);

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
  const own = i >= 0 ? campaign(i) : [];
  const k = own.findIndex((c) => c.id === p.id);
  const room = ROOMS.find((r) => r.title === p.group && r.entries.length === own.length);
  const at = i >= 0 ? { n: i + 1, of: n, prev: near(CURATED[(i - 1 + n) % n]), next: near(CURATED[(i + 1) % n]), strip: own.length > 1 ? own.map((c) => ({ id: c.id, sm: c.sm, alt: c.alt, said: said(c) })) : [] } : null;
  const camp = own.length > 1 ? { count: room?.count ?? own.length + " pieces", note: room?.note || undefined, caseHref: room?.caseHref, next: { id: own[(k + 1) % own.length].id, said: said(own[(k + 1) % own.length]) } } : null;
  const facts = { client: p.group, year: PROJECTS.find((c) => c.name === p.group)?.year, format: shape(p.w, p.h), of: own.length > 1 ? `${k + 1} of ${own.length}` : undefined };
  return (
    <>
      {p.credit.includes("jawad jalal") ? <JsonLd data={pieceWork(p)} /> : null}
      <Viewer piece={p} said={said(p)} at={at} facts={facts} camp={camp} />
    </>
  );
}
