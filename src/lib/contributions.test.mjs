// npm test. The fixture is GitHub's real contribution calendar for jawadjalal, saved on 21 november 2026.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dayLabel, parseContributions, summarise } from "./contributions.ts";

const html = readFileSync(new URL("./fixtures/github-contributions.html", import.meta.url), "utf8");

test("reads the total, the days, their levels and counts", () => {
  const c = parseContributions(html);
  assert.equal(c.total, 13207);
  assert.equal(c.start, "2025-11-16");
  assert.equal(c.levels.length, 371);
  assert.equal(c.counts.length, 371);
  assert.equal(c.counts.reduce((a, b) => a + b, 0), 13207);
  assert.ok(c.levels.every((l) => l >= 0 && l <= 4));
  assert.ok(c.counts.every((n, i) => (n === 0) === (c.levels[i] === 0)));
});

test("labels a day in lower case with its count", () => {
  const c = parseContributions(html);
  const i = c.counts.indexOf(714);
  assert.equal(dayLabel(c, i), "714 contributions on 18 october 2026");
  assert.equal(dayLabel(c, 0), "no contributions on 16 november 2025");
});

test("finds the busiest month and the longest streak", () => {
  const s = summarise(parseContributions(html));
  assert.ok(s.inMonth > 0 && s.streak > 0);
});

test("refuses a page it doesn't recognise rather than guessing", () => {
  assert.throws(() => parseContributions("<html>rate limited</html>"));
  assert.throws(() => parseContributions(html.replace(/No contributions on/, "Something else on")));
});
