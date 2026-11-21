import { TitleTab } from "@/components/ds/TitleTab";
import { SITE, TIMELINE } from "@/content/site";

/** Where Jawad has worked, as one rule running down the page: an ember node for what he does now, hollow ones for
 *  what he has left. The rule draws down as the section arrives and each row follows its node. */
export function Timeline() {
  return (
    <section className="tl" aria-labelledby="tl-h">
      <TitleTab id="tl-h" tag="Where I've worked" side={<a href={SITE.cv}>CV ↗</a>}>
        Experience
      </TitleTab>
      <ol className="tl-rows" data-in="">
        {TIMELINE.map((t, i) => (
          <li key={t.co} className={"g16 tl-row" + (t.now ? " now" : "")} style={{ "--i": i } as React.CSSProperties}>
            <span className="tl-yr">{t.years}</span>
            <span className="tl-node" aria-hidden="true" />
            <span className="tl-main">
              <a className="tl-co" href={t.href} target="_blank" rel="noopener">
                {t.co} <span className="tl-arr">↗</span>
              </a>
              <span className="tl-what">{t.what}</span>
            </span>
            <span className="tl-role">{t.role}</span>
            <span className="tl-state">{t.now ? "Now" : "Past"}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
