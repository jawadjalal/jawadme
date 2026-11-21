import { card } from "@/app/_og/card";
import { REAL, laneLabel, projectBySlug } from "@/content/work";

export { contentType, size } from "@/app/_og/card";
export const alt = "A project by Jawad Jalal";
export const generateStaticParams = () => REAL.map((p) => ({ slug: p.slug }));

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = projectBySlug((await params).slug)!;
  return card({ title: p.name, line: p.lines[0], bar: ["Jawad Jalal", laneLabel(p.lane), String(p.year)] });
}
