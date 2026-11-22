import { SITE, TIMELINE } from "@/content/site";

const ITEMS = [
  ...TIMELINE.map((t) => ({
    co: t.co,
    role: t.role,
    what: t.what,
    years: t.years === "2026 to now" ? "2026 - Present" : t.years,
    href: t.href,
    now: t.now,
  })),
  {
    co: "Cosmos Models & Bevel",
    role: "Founder & 3D Artist",
    what: "3D assets and game art for Blade Ball and Fish It (11B+ combined visits).",
    years: "2024 - 2026",
    href: "/work",
    now: false,
  },
];

/** Clean, minimal vertical timeline. No vibe-coded uppercase boxes or metric pills. */
export function Timeline() {
  return (
    <section className="tl-clean" aria-labelledby="tl-h">
      <div className="tl-clean-head">
        <h2 id="tl-h">Experience</h2>
        <a href={SITE.cv} className="tl-cv">
          CV (PDF) ↗
        </a>
      </div>

      <ol className="tl-track">
        {ITEMS.map((item) => {
          const ext = item.href.startsWith("http");
          return (
            <li key={item.co} className={"tl-item" + (item.now ? " is-now" : "")}>
              <span className="tl-node" aria-hidden="true" />
              <span className="tl-date">{item.years}</span>
              <a
                href={item.href}
                target={ext ? "_blank" : undefined}
                rel={ext ? "noopener" : undefined}
                className="tl-body"
              >
                <span className="tl-top">
                  <strong className="tl-name">{item.co}</strong>
                  <span className="tl-role">{item.role}</span>
                </span>
                <span className="tl-desc">{item.what}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
