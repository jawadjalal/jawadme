/*
 * Okara and MenuFit, each on its own ground with its own logo and its own public numbers. Only what each company states
 * in public, read on 8 Nov 2026:
 *   okara.ai/about: "150K websites on Okara" (Aug 2026), "14M launch video views" (Mar 2026), "10+ agents shipped"
 *   (Apr to July 2026). The homepage says "Trusted by 150,000+ businesses".
 *   menufit.com: "Join over 1.5 million happy users", "22.3 Million+ locations". The US App Store listing
 *   (id6746144481): 4.76 average from 54,556 ratings.
 * Logos: okara.ai's own `landing-mark` symbol; menufit.com/logo.webp. The Okara screens are Jawad's own teardown
 * mockups (public/okara); the MenuFit screens are his client design pass, from menufit-screens.vercel.app (public/menufit).
 */
import { OkaraMark } from "./Intro";

const OKARA_FACTS = [
  { n: "150k", what: "websites on okara by august" },
  { n: "14m", what: "views of its launch video" },
  { n: "10+", what: "agents shipped in four months" },
];

const MENUFIT_FACTS = [
  { n: "1.5m+", what: "people use it" },
  { n: "22.3m+", what: "restaurant locations it knows" },
  { n: "4.8", what: "on the app store, from 54,556 ratings" },
];

const SCREENS = [
  { key: "today", alt: "MenuFit's Today screen: room for a big lunch, 22g of protein so far, hacks for your lunch." },
  { key: "the-hack", alt: "A MenuFit hack: nearly four times the protein, 9g and 26g flowing into 35g." },
  { key: "hacks", alt: "MenuFit's hacks library, ranked by protein per calorie." },
  { key: "meal", alt: "A MenuFit meal with its macros." },
];

export function Okara() {
  return (
    <section className="ok" id="s-okara" aria-labelledby="ok-h">
      <div className="ok-in">
        <div className="ok-say">
          <a className="ok-brand" href="https://okara.ai" target="_blank" rel="noreferrer">
            <OkaraMark size={30} />
            <span>Okara</span>
          </a>
          <h2 id="ok-h" className="ok-h">product intern at okara</h2>
          <p className="ok-p">
            okara is an ai cmo: a team of marketing agents that works on a company&apos;s growth every day. i got the internship by
            using it for a week, taking its dashboard apart, and rebuilding three screens.
          </p>
        </div>
        <div className="ok-shots">
          <figure className="ok-shot ok-shot-a">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/okara/morning.webp" alt="My Okara morning note: 8 people saw your newest page, none of them clicked, and the fix ready to approve." width={1200} height={749} loading="lazy" decoding="async" />
          </figure>
          <figure className="ok-shot ok-shot-b">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/okara/feed.webp" alt="My Okara agents feed: each agent's next post, waiting for approval." width={800} height={1127} loading="lazy" decoding="async" />
          </figure>
          <figure className="ok-shot ok-shot-c">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/okara/credits.webp" alt="My Okara credits drawer: what each credit was spent on, line by line." width={1200} height={750} loading="lazy" decoding="async" />
          </figure>
          <p className="ok-cap">my teardown: the morning note, the agents feed and the credits drawer.</p>
        </div>
        <dl className="ok-facts">
          {OKARA_FACTS.map((f) => (
            <div key={f.n}>
              <dt>{f.n}</dt>
              <dd>{f.what}</dd>
            </div>
          ))}
        </dl>
        <p className="ok-src">
          numbers from{" "}
          <a href="https://okara.ai/about" target="_blank" rel="noreferrer">
            okara.ai/about
          </a>
          , november 2026
        </p>
      </div>
    </section>
  );
}

export function MenuFit() {
  return (
    <section className="mf" id="s-menufit" aria-labelledby="mf-h">
      <div className="mf-in">
        <div className="mf-say">
          <a className="mf-brand" href="https://menufit.com" target="_blank" rel="noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/menufit-bag-256.webp" alt="" width={46} height={52} loading="lazy" />
            <span>MenuFit</span>
          </a>
          <h2 id="mf-h" className="mf-h">new screens for menufit</h2>
          <p className="mf-p">
            menufit tells you what to order at any restaurant to hit your protein. it&apos;s a client, and i designed new screens for
            it: hack cards, macros that fill like liquid, the hacks library and the week.
          </p>
          <dl className="mf-facts">
            {MENUFIT_FACTS.map((f) => (
              <div key={f.n}>
                <dt>{f.n}</dt>
                <dd>{f.what}</dd>
              </div>
            ))}
          </dl>
          <p className="mf-src">
            numbers from{" "}
            <a href="https://menufit.com" target="_blank" rel="noreferrer">
              menufit.com
            </a>{" "}
            and its{" "}
            <a href="https://apps.apple.com/us/app/menufit/id6746144481" target="_blank" rel="noreferrer">
              app store page
            </a>
            , november 2026.{" "}
            <a href="https://menufit-screens.vercel.app" target="_blank" rel="noreferrer">
              every screen
            </a>
          </p>
        </div>
        <ul className="mf-phones">
          {SCREENS.map((s, i) => (
            <li key={s.key} style={{ ["--i" as string]: i }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/menufit/${s.key}-light.webp`} alt={s.alt} width={540} height={1169} loading="lazy" decoding="async" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
