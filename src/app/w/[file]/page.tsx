import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage, PIECES } from "@/components/portfolio/Home";
import { captionOf } from "@/content/feed";

// One piece of work at its own address: the home page with the viewer open on it. Its link card is the piece itself,
// full size, so a link posted on X unfurls as the ad (or the breakdown's cover, or the reel's first frame).

type Props = { params: Promise<{ file: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PIECES.map((p) => ({ file: p.file }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { file } = await params;
  const p = PIECES.find((x) => x.file === file);
  if (!p) return {};
  const title = `${captionOf(p)}, by Jawad Jalal`;
  const description = p.slides ? `${p.alt} ${p.slides.length + 1} slides.` : p.alt;
  // the clean card from scripts/og-cards.mjs: the piece on white, whose it is and what it is beside it
  const image = { url: `/og/w-${p.file}.jpg`, width: 1200, height: 630, alt: p.alt };
  return {
    title,
    description,
    openGraph: { title, description, url: `/w/${p.file}`, images: [image], type: "article" },
    twitter: { card: "summary_large_image", creator: "@jawadmakes", title, description, images: [image] },
    alternates: { canonical: `/w/${p.file}` },
  };
}

export default async function Piece({ params }: Props) {
  const { file } = await params;
  if (!PIECES.some((p) => p.file === file)) notFound();
  return <HomePage open={file} />;
}
