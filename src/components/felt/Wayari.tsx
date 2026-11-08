/*
 * Wayari, the thing the page turns into. It rises over the opening on plain native scroll (intro.css pulls it up one
 * screen, `wy`), on wayari.com's own painting, in its own face (Chillax, from the wayari-site repo) and ink and pink.
 * Every picture is a real wayari.com asset: the field painting, the app icon, and the product panels the site plays
 * (public/wayari, pulled from wayari.com on 8 Nov 2026). The lines under each panel are wayari.com's own copy.
 */
const STEPS = [
  {
    key: "plan",
    w: 1654,
    h: 880,
    title: "a swarm maps the plan",
    line: "the crew reads your repo first, and leaves you a note on anything the code can't answer, like whether to prorate mid-cycle.",
    alt: "Wayari's route map: four scouts read the repo, a plan.md with three questions, and the route of three tickets.",
  },
  {
    key: "build",
    w: 1067,
    h: 880,
    title: "a team of focused builders",
    line: "one builder takes the schema, another the api, and nobody trips over anybody.",
    alt: "Three Wayari channels, #schema, #api and #settings, each with its own builder and its diff landed.",
  },
  {
    key: "review",
    w: 1571,
    h: 880,
    title: "a specialised review swarm",
    line: "reviewers go through every line and catch things like an 11th seat on a 10-seat plan. the builder doesn't get a vote.",
    alt: "Wayari's review: three reviewers on billing/seats.ts, a fixed line, five gates green, ready for your merge.",
  },
] as const;

export function Wayari() {
  return (
    <section className="wy" id="wayari" aria-labelledby="wy-h">
      <div className="wy-sky">
        <div className="wy-paint" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/wayari/field-1920.webp" srcSet="/wayari/field-960.webp 960w, /wayari/field-1920.webp 1920w" sizes="100vw" alt="" width={1920} height={1080} loading="lazy" decoding="async" />
        </div>
        <div className="wy-hero">
          <div className="wy-say">
            <a className="wy-brand" href="https://wayari.com" target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/wayari/icon.svg" alt="" width={44} height={44} />
              <span>wayari</span>
            </a>
            <h2 id="wy-h" className="wy-h">
              <span>your ai writes it.</span> <span>but does it know it?</span>
            </h2>
            <p className="wy-p">
              wayari is what i&apos;m building. it runs coding agents on your own branches and ends in one pull request a person merges.
            </p>
            <div className="wy-acts">
              <a className="wy-key" href="https://wayari.com" target="_blank" rel="noreferrer">
                download for free
              </a>
              <span className="wy-note">a week free, no card, no signup</span>
            </div>
          </div>
          <figure className="wy-merge">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/wayari/merge-1400.webp" srcSet="/wayari/merge-700.webp 700w, /wayari/merge-1400.webp 1400w" sizes="(max-width: 860px) 92vw, 44vw" alt="Wayari's merge window: team billing with seat limits, typecheck, tests and build green, two readers approved, merged into main by you." width={1069} height={880} loading="lazy" decoding="async" />
            <figcaption>a merge, on your word. nothing merges until you say so.</figcaption>
          </figure>
        </div>
      </div>

      <div className="wy-steps">
        <h3 className="wy-steps-h">how a job goes</h3>
        <ol className="wy-list">
          {STEPS.map((s) => (
            <li key={s.key} className={`wy-step wy-step-${s.key}`}>
              <figure>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/wayari/${s.key}-1400.webp`} srcSet={`/wayari/${s.key}-700.webp 700w, /wayari/${s.key}-1400.webp 1400w`} sizes="(max-width: 860px) 92vw, 60vw" alt={s.alt} width={s.w} height={s.h} loading="lazy" decoding="async" />
              </figure>
              <div className="wy-step-say">
                <h4>{s.title}</h4>
                <p>{s.line}</p>
              </div>
            </li>
          ))}
        </ol>
        <a className="wy-more" href="https://wayari.com" target="_blank" rel="noreferrer">
          see it run on wayari.com
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false">
            <path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </section>
  );
}
