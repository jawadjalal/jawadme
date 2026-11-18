#!/usr/bin/env bash
# Renders every diagrams/*.mmd to public/minelight/d/<name>.svg and writes src/app/minelight/diagrams.json
# (each SVG's width and height, which the page needs for <img>). Needs @mermaid-js/mermaid-cli and a Chromium:
#   MMDC=/path/to/mmdc CHROME=/usr/bin/chromium bash src/app/minelight/diagrams/render.sh
# Run it from the repo root after editing a .mmd. Labels are measured in Arial (Liberation Sans on Linux has the
# same metrics), so the boxes fit on every device.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../../../.." && pwd)"
out="$root/public/minelight/d"
mkdir -p "$out"
printf '{"executablePath":"%s","args":["--no-sandbox","--disable-gpu"]}' "${CHROME:-/usr/bin/chromium}" > /tmp/ml-puppeteer.json
for f in "$here"/*.mmd; do
  name="$(basename "$f" .mmd)"
  "${MMDC:-mmdc}" -q -i "$f" -o "$out/$name.svg" -c "$here/mermaid.json" -b transparent -p /tmp/ml-puppeteer.json
done
node -e '
const fs = require("fs"), path = require("path");
const dir = process.argv[1], dest = process.argv[2];
const sizes = {};
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".svg")).sort()) {
  const svg = fs.readFileSync(path.join(dir, f), "utf8");
  const vb = svg.match(/viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/);
  if (!vb) throw new Error("no viewBox in " + f);
  sizes[f.replace(/\.svg$/, "")] = { w: Math.ceil(+vb[3]), h: Math.ceil(+vb[4]) };
}
fs.writeFileSync(dest, JSON.stringify(sizes, null, 2) + "\n");
console.log(Object.keys(sizes).length + " diagrams");
' "$out" "$here/../diagrams.json"
