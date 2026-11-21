import { getContributions, GITHUB } from "@/lib/github";
import { ContribGraph } from "./ContribGraph";

/** His GitHub year, live: a day per square, the total above. size="mini" is the small one for the footer pillar. */
export async function Contributions({ size = "full" }: { size?: "full" | "mini" }) {
  return <ContribGraph data={await getContributions()} href={GITHUB} size={size} />;
}
