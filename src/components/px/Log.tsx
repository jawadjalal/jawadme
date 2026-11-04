import type { Work } from "@/lib/work";

// The build log: one square per day over the last nine weeks, filled on the
// days a site went up. Drawn from the dates in work.ts, so the claim in the
// heading ("a site a day") is checked by the page itself.

const DAY = 86_400_000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

export function Log({ work }: { work: Work[] }) {
  const byDay = new Map<string, Work[]>();
  for (const w of work) if (w.date) byDay.set(w.date, [...(byDay.get(w.date) ?? []), w]);
  const last = Math.max(...work.filter((w) => w.date).map((w) => Date.parse(w.date + "T00:00:00Z")));
  // the grid ends on the Sunday of the latest week and runs nine weeks back
  const dow = (new Date(last).getUTCDay() + 6) % 7; // Monday 0
  const end = last + (6 - dow) * DAY;
  const start = end - (9 * 7 - 1) * DAY;
  const weeks: { t: number; key: string; items: Work[] }[][] = [];
  for (let t = start; t <= end; t += DAY) {
    const wi = Math.floor((t - start) / (7 * DAY));
    (weeks[wi] ??= []).push({ t, key: iso(t), items: byDay.get(iso(t)) ?? [] });
  }
  const recent = work.filter((w) => w.date && Date.parse(w.date + "T00:00:00Z") > last - 8 * DAY);
  const daysOn = new Set(recent.map((w) => w.date)).size;
  const month = (t: number) => new Date(t).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }).toLowerCase();

  return (
    <figure className="log" aria-label="Build log: the days a site went up, over the last nine weeks">
      <span className="tape" aria-hidden="true" />
      <span className="log-title" aria-hidden="true">build log</span>
      <div className="log-grid">
        <div className="log-rows" aria-hidden="true">
          {["m", "t", "w", "t", "f", "s", "s"].map((d, i) => (
            <span key={i}>{i % 2 === 0 ? d : ""}</span>
          ))}
        </div>
        {weeks.map((wk, i) => (
          <div key={i} className="log-col">
            <span className="log-month" aria-hidden="true">
              {i === 0 || month(wk[0].t) !== month(weeks[i - 1][0].t) ? month(wk[0].t) : ""}
            </span>
            {wk.map((d) => {
              const n = d.items.length;
              const future = d.t > last;
              return (
                <span
                  key={d.key}
                  className={`log-d ${n > 1 ? "is-many" : n ? "is-one" : ""} ${future ? "is-future" : ""}`}
                  title={n ? `${d.key}: ${d.items.map((x) => x.name).join(", ")}` : d.key}
                >
                  {n > 1 ? n : ""}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <figcaption className="log-cap">
        <b>{recent.length}</b>
        <span>
          sites in the last 8 days
          <br />
          {daysOn} of those 8 days shipped
        </span>
      </figcaption>
    </figure>
  );
}
