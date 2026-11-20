import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Viewer } from "@/components/ds/Viewer";
import { ADS } from "@/content/ads";
import { FEED, type Picture } from "@/content/feed";

// One piece at its own address. The curated ads step through in curation order; every older permalink from the
// previous wall (its files are unchanged) still opens, as a piece on its own.

type Props = { params: Promise<{ file: string }> };
type Item = { id: string; src: string; w: number; h: number; alt: string; group: string; spec: boolean };

const OLD: Item[] = FEED.filter((e): e is Picture => "file" in e && !("embed" in e)).map((p) => ({
  id: p.file,
  src: `/work/2026-11/${p.file}.webp`,
  w: p.w,
  h: p.h,
  alt: p.alt,
  group: p.brand,
  spec: Boolean(p.unsolicited),
}));
const CURATED: (Item & { sm: string })[] = ADS.map((a) => ({ id: a.id, src: a.src, sm: a.sm, w: a.w, h: a.h, alt: a.alt, group: a.campaign, spec: a.spec }));
const ALL = [...CURATED, ...OLD.filter((o) => !CURATED.some((c) => c.id === o.id))];

export const dynamicParams = false;
export const generateStaticParams = () => ALL.map((p) => ({ file: p.id }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { file } = await params;
  const p = ALL.find((x) => x.id === file);
  if (!p) return {};
  const title = `${p.group}, by Jawad Jalal`;
  return {
    title,
    description: p.alt,
    alternates: { canonical: `/w/${p.id}` },
    openGraph: { title, description: p.alt, images: [{ url: p.src, width: p.w, height: p.h, alt: p.alt }] },
    twitter: { card: "summary_large_image", creator: "@jawadmakes", title, images: [p.src] },
  };
}

export default async function Piece({ params }: Props) {
  const { file } = await params;
  const i = CURATED.findIndex((c) => c.id === file);
  const p = ALL.find((x) => x.id === file);
  if (!p) notFound();
  const at = i >= 0 ? { n: i + 1, of: CURATED.length, prev: CURATED[(i - 1 + CURATED.length) % CURATED.length].id, next: CURATED[(i + 1) % CURATED.length].id, strip: [-3, -2, -1, 0, 1, 2, 3].map((d) => CURATED[(i + d + CURATED.length) % CURATED.length]).map((c) => ({ id: c.id, sm: c.sm, alt: c.alt })) } : null;
  return <Viewer piece={p} at={at} />;
}
