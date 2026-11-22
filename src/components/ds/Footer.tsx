import { Pillar } from "@/components/world/Pillar";
import "@/styles/footer.css";

/** Clean pillar-only contact footer. All contact & social links live directly on the signpost. */
export function Footer({
  pillar = true,
}: {
  src?: string;
  pillar?: boolean;
  book?: boolean;
  graph?: boolean;
}) {
  return (
    <footer className="foot">
      {pillar ? <Pillar /> : null}
      <div className="foot-min-bar">
        <span>©2026 JAWAD JALAL</span>
        <span>LONDON</span>
      </div>
    </footer>
  );
}
