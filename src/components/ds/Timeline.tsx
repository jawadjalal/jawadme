import { TitleTab } from "@/components/ds/TitleTab";
import { SITE, TIMELINE } from "@/content/site";

/** Where Jawad has worked, each place at display size with its role, years and one line beside it; the studio he runs
 *  now is set in the accent. The rows rise in turn as the section arrives. */
export function Timeline() {
  return (
    <section className="tl" aria-labelledby="tl-h">
      <TitleTab id="tl-h" tag="Where I've worked" side={<a href={SITE.cv}>CV ↗</a>}>
        Experience
      </TitleTab>
      <ol className="tl-rows" data-in="">
        {TIMELINE.map((t, i) => (
          <li key={t.co} className={"g16 tl-row" + (t.now ? " now" : "")} style={{ "--i": i } as React.CSSProperties}>
            <a className="tl-co" href={t.href} target="_blank" rel="noopener">
              {t.co} <span className="tl-arr">↗</span>
            </a>
            <span className="tl-side">
              <span className="tl-role">
                {t.role} <span className="tl-yr">{t.years}</span>
              </span>
              <span className="tl-what">{t.what}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
