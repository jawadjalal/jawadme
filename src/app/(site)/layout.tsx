import { Dock } from "@/components/ds/Dock";
import { Motion } from "@/components/ds/Motion";
import { fontVars } from "../fonts";
import "@/styles/ds.css";
import "@/styles/motion.css";
import "@/styles/motion-chrome.css";
import "@/styles/world.css";

// The chrome for every page in this group: the type, the dock, and the one ticker. The game pages, the
// blog and the unlisted pages keep their own layouts.

const JS = "document.documentElement.classList.add('js');document.addEventListener('touchstart',function(){},{passive:true})";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={"ds " + fontVars}>
      <script dangerouslySetInnerHTML={{ __html: JS }} />
      {children}
      <Dock />
      <Motion />
    </div>
  );
}
