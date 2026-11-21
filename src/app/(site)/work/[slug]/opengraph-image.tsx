import { card } from "@/app/_og/card";
import { REAL, laneLabel, projectBySlug } from "@/content/work";
export { contentType, size } from "@/app/_og/card";

export const alt = "A project by Jawad Jalal";
export const generateStaticParams = () => REAL.map((p) => ({ slug: p.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = projectBySlug((await params).slug)!;
  const tall = p.cover.h > p.cover.w;
  return card({ title: p.name, line: p.lines[0], bar: ["Jawad Jalal", laneLabel(p.lane), String(p.year)], side: { src: p.cover.src, w: tall ? 458 : 620 }, face: true });
}
