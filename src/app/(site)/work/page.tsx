import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/ds/Footer";
import { Media, Placeholder } from "@/components/ds/Media";
import { TLink } from "@/components/ds/TLink";
import { Badge, TitleTab } from "@/components/ds/TitleTab";
import { LANES, PROJECTS, laneLabel, type Lane } from "@/content/work";

export const metadata: Metadata = {
  title: "Work",
  description: "Every project by Jawad Jalal: ads, brand and web, 3D and Roblox.",
  alternates: { canonical: "/work" },
};

type Props = { searchParams: Promise<{ f?: string }> };

export default async function Work({ searchParams }: Props) {
  const { f } = await searchParams;
  const lane = LANES.find((l) => l.key === f)?.key as Lane | undefined;
  const list = lane ? PROJECTS.filter((p) => p.lane === lane) : PROJECTS;
  const count = (l?: Lane) => (l ? PROJECTS.filter((p) => p.lane === l) : PROJECTS).filter((p) => !p.placeholder).length;
  return (
    <main className="work">
      <TitleTab as="h1" tag={`${count()} projects`} side={<span className="tab-say">Brands, ads, 3D and Roblox games, designed and built.</span>}>
        Work
      </TitleTab>
      <nav className="filters wrap" aria-label="Filter by lane">
        <Link href="/work" aria-current={!lane ? "page" : undefined} scroll={false}>
          <span className="n">{count()}</span> All
        </Link>
        <span className="filters-r">
          {LANES.map((l) => (
            <Link key={l.key} href={`/work?f=${l.key}`} aria-current={lane === l.key ? "page" : undefined} scroll={false}>
              <span className="n">{count(l.key)}</span> {l.label}
            </Link>
          ))}
        </span>
      </nav>
      <div className="g16 work-grid">
        {list.map((p, i) =>
          p.placeholder ? (
            <div key={p.slug} className="card card-ph">
              <span className="card-meta">
                <Badge n={i + 1} />
                <span className="d-name">{p.name}</span>
                <span className="lbl dim">{laneLabel(p.lane)}</span>
              </span>
              <Placeholder label={p.placeholder} ratio="4 / 3" art={p.lane === "roblox" ? "/three/mark-brick.webp" : "/three/mark-felt.webp"} />
            </div>
          ) : (
            <TLink key={p.slug} href={`/work/${p.slug}`} vt={`cover-${p.slug}`} className="card" data-cursor="view">
              <span className="card-meta">
                <Badge n={i + 1} />
                <span className="d-name">{p.name}</span>
                <span className="lbl dim">
                  {laneLabel(p.lane)}{p.spec ? " · Spec" : ""}
                </span>
              </span>
              <Media m={p.cover} ratio="4 / 3" fit={p.cover.h > p.cover.w ? "contain" : "cover"} sizes="(min-width: 768px) 50vw, 100vw" />
            </TLink>
          ),
        )}
      </div>
      <Footer src="work" sheet="S-02" />
    </main>
  );
}
