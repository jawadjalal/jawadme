import { SITE, TIMELINE } from "@/content/site";

const METRICS: Record<string, string> = {
  "ignura studio": "SIX-FIGURE ARR",
  menufit: "1.5M USERS · 7-FIG MRR",
  okara: "14M LAUNCH VIEWS",
};

const LEDGER = [
  ...TIMELINE.map((t) => ({
    co: t.co,
    role: t.role,
    years: t.years,
    href: t.href,
    now: t.now,
    metric: METRICS[t.co] ?? "SHIPPED",
  })),
  {
    co: "cosmos models / bevel",
    role: "founder & 3d artist",
    years: "2024–2026",
    href: "/work",
    now: false,
    metric: "11B+ VISITS",
  },
];

/** Ultra-clean single-line experience rows. Zero fluff. */
export function Timeline() {
  return (
    <section className="led-sec" aria-labelledby="tl-h">
      <div className="sec-head sec-head-tight">
        <h2 id="tl-h" className="sec-title">
          EXPERIENCE
        </h2>
        <a href={SITE.cv} className="sec-all-link">
          CV (PDF) ↗
        </a>
      </div>

      <div className="led-table" role="list">
        {LEDGER.map((item) => {
          const ext = item.href.startsWith("http");
          return (
            <a
              key={item.co}
              href={item.href}
              target={ext ? "_blank" : undefined}
              rel={ext ? "noopener" : undefined}
              className={"led-row led-row-min" + (item.now ? " is-now" : "")}
              role="listitem"
            >
              <span className="led-yr">
                {item.now ? <i className="nh-dot" aria-hidden="true" /> : null}
                {item.years.toUpperCase()}
              </span>
              <span className="led-co">
                {item.co.toUpperCase()}
                <span className="led-arr" aria-hidden="true">↗</span>
              </span>
              <span className="led-role-min">{item.role.toUpperCase()}</span>
              <span className="led-metric">{item.metric}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
