import { Cursor } from "@/components/ds/Cursor";
import { Dock } from "@/components/ds/Dock";
import { Motion } from "@/components/ds/Motion";
import { fontVars } from "../fonts";
import "@/styles/ds.css";

// The chrome for every page in this group: the type, the dock, the one ticker and the cursor. The game pages, the
// blog and the unlisted pages keep their own layouts.

const JS = "document.documentElement.classList.add('js')";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={"ds " + fontVars}>
      <script dangerouslySetInnerHTML={{ __html: JS }} />
      {children}
      <Dock />
      <Motion />
      <Cursor />
    </div>
  );
}
