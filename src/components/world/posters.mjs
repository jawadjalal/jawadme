// Renders the world's posters (first paint, and the design on phones, reduced motion and weak GPUs) from the live
// scenes themselves with the kit's headless helper: every home chamber at its camera stop, and each footer take.
// Run against a running site: CHROME=/usr/bin/google-chrome node src/components/world/posters.mjs [http://localhost:3000] [only,names]
import { posters } from "./kit/posters.mjs";

const [base = "http://localhost:3000", only] = process.argv.slice(2);
const ROOMS = [["gate", "0&dim"], ["gate-lit", "0"], ["hall", "1"], ["theatre", "3"], ["river", "4"]];
const jobs = [
  ...ROOMS.map(([name, k]) => ({ name, path: "/?shot=" + k, stage: ".world-stage" })),
  ...["a", "b", "c"].map((v) => ({ name: "foot-" + v, path: "/work?footer=" + v, stage: ".foot-stage", scroll: true })),
].filter((j) => !only || only.split(",").includes(j.name));
await posters({ base, out: new URL("../../../public/world/poster/", import.meta.url).pathname, jobs });
