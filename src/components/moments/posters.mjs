// Renders the posters of every route moment (first paint, and the design on phones, reduced motion and weak GPUs)
// from the live sets themselves, with the world kit's headless helper, into public/moments/.
// Run against a running site: CHROME=/usr/bin/google-chrome node src/components/moments/posters.mjs [http://localhost:3000] [only,names]
import { posters } from "../world/kit/posters.mjs";

const [base = "http://localhost:3000", only] = process.argv.slice(2);
const jobs = [
  { name: "break3d", path: "/work", stage: ".mo-break3d", scroll: true },
  { name: "niche-ads", path: "/work/outpace", stage: ".mo-niche-ads" },
  { name: "niche-web", path: "/work/ignura", stage: ".mo-niche-web" },
  { name: "niche-game", path: "/work/derelict-depths", stage: ".mo-niche-game" },
  { name: "niche-view", path: "/w/midjourney-a", stage: ".mo-niche-view" },
  { name: "gate", path: "/cal", stage: ".mo-gate", sizes: [{ tag: "d", viewport: { width: 1440, height: 900 }, dpr: 1.25, width: 900, quality: 70 }] },
  { name: "study", path: "/about", stage: ".mo-study", scroll: true },
  { name: "shaft", path: "/derelictdepths", stage: ".mo-shaft" },
  { name: "deadend", path: "/nope", stage: ".mo-deadend" },
  { name: "reading", path: "/blog", stage: ".mo-reading" },
].filter((j) => !only || only.split(",").includes(j.name));

const out = new URL("../../../public/moments/", import.meta.url).pathname;
for (const j of jobs) await posters({ base, out, jobs: [j], ...(j.sizes ? { sizes: j.sizes } : {}) });
