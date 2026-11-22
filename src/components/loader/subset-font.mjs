// Rebuilds aref-ruqaa-b.woff2 from the words in LoaderB.tsx (the WORD_AR array is the single source).
// Usage: node src/components/loader/subset-font.mjs   (needs python3 with fonttools + brotli: pip install fonttools brotli)
// Aref Ruqaa Bold is SIL OFL 1.1 (OFL-ArefRuqaa.txt). Layout features are kept because the ruqaa joining and stacking
// need init/medi/fina/calt; dropping calt breaks خط and جمر.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const here = new URL(".", import.meta.url).pathname;
const words = JSON.parse("[" + readFileSync(here + "LoaderB.tsx", "utf8").match(/WORD_AR = \[(.*?)\];/)[1] + "]");
const dir = mkdtempSync(join(tmpdir(), "aref-"));
const ttf = join(dir, "ArefRuqaa-Bold.ttf");
execFileSync("curl", ["-sSfL", "-o", ttf, "https://github.com/google/fonts/raw/main/ofl/arefruqaa/ArefRuqaa-Bold.ttf"]);
const out = here + "aref-ruqaa-b.woff2";
execFileSync(
  process.env.PYFTSUBSET || "pyftsubset",
  [ttf, "--text=" + words.join(" "), "--layout-features=init,medi,fina,isol,rlig,calt,liga,ccmp,locl,mark,mkmk,kern,curs,dist", "--no-hinting", "--drop-tables+=DSIG,meta,gasp", "--flavor=woff2", "--output-file=" + out],
  { stdio: "inherit" },
);
const kb = statSync(out).size;
console.log(words.join(" ") + " -> " + out.split("/").slice(-1)[0] + " " + kb + " B");
if (kb > 25000) throw new Error("subset is over 25 KB");
