// Renders the posters of every route moment (first paint, and the design on phones, reduced motion and weak GPUs)
// from the live sets themselves, with the world kit's headless helper, into public/moments/. Each set is drawn ?bare:
// its braziers' flames are left out and their places collected into ./marks.json, where ./Moment lays the world's
// flame flipbook over the poster.
// Run against a running site: CHROME=/usr/bin/google-chrome node src/components/moments/posters.mjs [http://localhost:3000] [only,names]
import { chromium } from "playwright";
import { posters, SIZES } from "../world/kit/posters.mjs";

// the call ticket (in the dock, and on the 404) still paints over a stage under the kit's visibility rule, so every page
// the kit opens drops it first (the kit shares this playwright instance)
const launch = chromium.launch.bind(chromium);
chromium.launch = async (o) => {
  const b = await launch(o);
  const open = b.newPage.bind(b);
  b.newPage = async (p) => {
    const page = await open(p);
    await page.addInitScript(() => addEventListener("DOMContentLoaded", () => document.head.append(Object.assign(document.createElement("style"), { textContent: ".dock, .bcb { display: none !important; }" }))));
    return page;
  };
  return b;
};

const [base = "http://localhost:3000", only] = process.argv.slice(2);
// the phone posters are the LCP on their pages: 720 wide (a 412 px phone at 1.75x) and a little under the kit's
// quality keeps each near 8 KB with the carved floors in them
const sizes = [SIZES[0], { ...SIZES[1], width: 720, quality: 50 }];
const jobs = [
  { name: "break3d", path: "/work", stage: ".mo-break3d", scroll: true },
  { name: "niche-ads", path: "/work/outpace", stage: ".mo-niche-ads" },
  { name: "niche-web", path: "/work/ignura", stage: ".mo-niche-web" },
  { name: "niche-game", path: "/work/derelict-depths", stage: ".mo-niche-game" },
  { name: "niche-view", path: "/w/midjourney-a", stage: ".mo-niche-view" },
  { name: "gate", path: "/cal", stage: ".mo-gate", sizes: [{ ...SIZES[0], width: 900 }] },
  { name: "shaft", path: "/derelictdepths", stage: ".mo-shaft" },
  { name: "deadend", path: "/nope", stage: ".mo-deadend" },
  { name: "reading", path: "/blog", stage: ".mo-reading" },
].filter((j) => !only || only.split(",").includes(j.name));

const out = new URL("../../../public/moments/", import.meta.url).pathname;
const marks = new URL("./marks.json", import.meta.url).pathname;
for (const j of jobs) await posters({ base, out, marks, jobs: [{ ...j, path: j.path + "?bare" }], sizes: j.sizes ?? sizes });
