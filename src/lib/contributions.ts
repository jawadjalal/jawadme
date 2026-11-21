/** GitHub's public contribution calendar (github.com/users/<name>/contributions), parsed into the days and the
 *  year's total. Pure, with no imports, so the snapshot script and the test run it under plain node. */
export type Contributions = { total: number; start: string; levels: number[]; counts: number[] };

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const DAY = 86_400_000;

const attrs = (tag: string) => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));

export function parseContributions(html: string): Contributions {
  const tips = new Map<string, number>();
  for (const m of html.matchAll(/<tool-tip\b([^>]*)>([^<]*)<\/tool-tip>/g)) {
    const text = m[2].trim();
    const n = text.match(/^([\d,]+) contributions? on /);
    if (!n && !text.startsWith("No contributions on ")) throw new Error("unrecognised tooltip: " + text);
    tips.set(attrs(m[1]).for, n ? Number(n[1].replaceAll(",", "")) : 0);
  }
  const days: { date: string; level: number; count: number }[] = [];
  for (const m of html.matchAll(/<td\b[^>]*\bdata-date="[^"]*"[^>]*>/g)) {
    const a = attrs(m[0]);
    const count = tips.get(a.id);
    if (count === undefined) throw new Error("no count for " + a["data-date"]);
    days.push({ date: a["data-date"], level: Number(a["data-level"]), count });
  }
  days.sort((a, b) => (a.date < b.date ? -1 : 1));
  const total = html.match(/id="js-contribution-activity-description"[^>]*>\s*([\d,]+)\s+contributions?\s/);
  if (!total || days.length < 300) throw new Error("unrecognised contributions page");
  days.forEach((d, i) => {
    if (i && Date.parse(d.date) - Date.parse(days[i - 1].date) !== DAY) throw new Error("gap before " + d.date);
  });
  return { total: Number(total[1].replaceAll(",", "")), start: days[0].date, levels: days.map((d) => d.level), counts: days.map((d) => d.count) };
}

const dateOf = (start: string, i: number) => new Date(Date.parse(start) + i * DAY);

/** "714 contributions on 18 october 2026", lower case like the rest of the site. */
export function dayLabel(c: Contributions, i: number) {
  const d = dateOf(c.start, i);
  const n = c.counts[i];
  const what = n === 0 ? "no contributions" : n.toLocaleString("en-US") + (n === 1 ? " contribution" : " contributions");
  return `${what} on ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** The busiest calendar month in the window and the longest run of days with at least one contribution. */
export function summarise(c: Contributions) {
  const months = new Map<string, number>();
  let streak = 0;
  let run = 0;
  c.counts.forEach((n, i) => {
    const d = dateOf(c.start, i);
    const key = MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear();
    months.set(key, (months.get(key) ?? 0) + n);
    run = n > 0 ? run + 1 : 0;
    streak = Math.max(streak, run);
  });
  const [month, inMonth] = [...months].reduce((a, b) => (b[1] > a[1] ? b : a));
  return { month, inMonth, streak };
}
