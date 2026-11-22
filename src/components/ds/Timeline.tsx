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
    what: t.what,
    years: t.years,
    href: t.href,
    now: t.now,
    metric: METRICS[t.co] ?? "SHIPPED",
  })),
  {
    co: "cosmos models / bevel",
    role: "founder & 3d artist",
    what: "3d assets & game art for blade ball and fish it, two of roblox's largest games",
    years: "2024 to 2026",
    href: "/work",
    now: false,
    metric: "11B+ GAME VISITS",
  },
];

/** Brass Hands–style Field Record / Experience Ledger.
 *  Replaces the oversized display list with a crisp, scannable Neo-Industrial spec table. */
export function Timeline() {
  return (
    <section className="led-sec" aria-labelledby="tl-h">
      <div className="sec-head">
        <div className="sec-head-l">
          <span className="sec-idx">[04] // FIELD RECORD</span>
          <h2 id="tl-h" className="sec-title">
            WHERE I&apos;VE SHIPPED.
          </h2>
        </div>
        <div className="sec-head-r">
          <a href={SITE.cv} className="sec-all-link">
            DOWNLOAD CV (PDF) ↗
          </a>
        </div>
      </div>

      <div className="led-table" role="list">
        <div className="led-row led-head" aria-hidden="true">
          <span>PERIOD</span>
          <span>ORGANIZATION</span>
          <span>ROLE &amp; SCOPE</span>
          <span>SCALE</span>
        </div>
        {LEDGER.map((item) => {
          const ext = item.href.startsWith("http");
          return (
            <a
              key={item.co}
              href={item.href}
              target={ext ? "_blank" : undefined}
              rel={ext ? "noopener" : undefined}
              className={"led-row" + (item.now ? " is-now" : "")}
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
              <span className="led-scope">
                <strong>{item.role.toUpperCase()}</strong>
                <span>{item.what}</span>
              </span>
              <span className="led-metric">{item.metric}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
