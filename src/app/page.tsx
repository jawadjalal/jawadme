import Image from "next/image";
import { Brand } from "@/components/Brand";
import { Cursor } from "@/components/Cursor";
import { Elsewhere } from "@/components/Elsewhere";
import { Logo } from "@/components/Logo";
import { Portrait } from "@/components/Portrait";
import { Rail } from "@/components/Rail";
import { ScrollCta } from "@/components/ScrollCta";
import { NavMenu } from "@/components/NavMenu";
import { DotField } from "@/components/DotField";
import { Icon, type IconName } from "@/components/Icon";
import { Preview } from "@/components/Preview";
import { Rotator } from "@/components/Rotator";
import { Streamed } from "@/components/Streamed";
import { Theme } from "@/components/Theme";
import { parseProse } from "@/components/prose";
import {
  ABOUT, ABOUT_ROLES, ABOUT_TAIL, ARCHIVE, heroFor, NAV, IDENTITY, NOW, ROLES, SKILLS_TABLE, SOCIALS, VENN, type Item,
} from "@/lib/profile";

// One ruled column, 715px wide, on a hatched ground. Every section is
// separated by a hairline that runs the column's full width rather than being
// inset to the text, which is what makes a long page read as one ruled sheet
// instead of a stack of unrelated cards.

export default function Home() {
  return (
    <div className="min-h-dvh">
      <Cursor label="hi" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:border focus:bg-background focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      <Header />
      <Rail />

      <main id="main" className="column-ground mx-auto w-full max-w-column border-border md:border-x">
        {/* The band of dots the pointer pushes around. Decorative, and the
            first thing on the page that responds to you at all. */}
        <div className="screen-line-bottom h-24 w-full sm:h-32" aria-label="Interactive dot field">
          <DotField />
        </div>

        <Hero />
        <About />

        <Section title="Now" id="now" aside={`${NOW.length} things`}>
          <ul className="space-y-5 px-4 py-5 sm:px-6">
            {NOW.map((item) => <Role key={item.key} item={item} />)}
          </ul>
        </Section>

        <Section title="Projects" id="projects" aside="live work">
          <Grid items={NOW.filter((i) => i.shot || i.video || i.emoji)} />
        </Section>

        <Section title="Also mine" aside="still live">
          <ul className="space-y-5 px-4 py-5 sm:px-6">
            {ARCHIVE.map((item) => <Role key={item.key} item={item} />)}
          </ul>
        </Section>

        <Section title="Skills" id="skills">
          <table className="w-full border-collapse text-left">
            <tbody className="block sm:table-row-group">
              {SKILLS_TABLE.map((row) => (
                <tr key={row.area} className="block border-b border-border last:border-0 sm:table-row">
                  <th
                    scope="row"
                    className="block whitespace-nowrap px-4 pb-1 pt-3 align-top text-[15px] font-semibold sm:table-cell sm:w-28 sm:px-6 sm:py-3"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <span style={{ color: `var(--hue-${row.icon === "pen" ? "ember" : row.icon === "code" ? "violet" : "slate"})` }}>
                        <Icon name={row.icon} size={15} />
                      </span>
                      {row.area}
                    </span>
                  </th>
                  <td className="block px-4 pb-3 align-top sm:table-cell sm:px-6 sm:py-3">
                    <p className="text-[13px] text-muted-foreground">{row.what}</p>
                    <ul className="grid-table mt-2 grid-cols-2 sm:grid-cols-3">
                      {row.tools.map((t) => (
                        <li key={t.label} className="text-muted-foreground">
                          <span className="cell-mark">
                            {t.brand ? <Brand name={t.brand} size={13} /> : null}
                          </span>
                          <span className="cell-label">{t.label}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <section id="elsewhere" className="screen-line-top scroll-mt-14">
          <Elsewhere />
        </section>

        <Section title="Contact" id="contact">
          {/* One table, not six floating boxes. Six separately bordered
              tiles read as six unrelated things; sharing the rules says
              these are one set of ways to reach the same person. */}
          <div className="px-4 py-5 sm:px-6">
            <div className="grid-table grid-cols-2 sm:grid-cols-3">
              {SOCIALS.map((so) => (
                <a
                  key={so.label}
                  href={so.href}
                  target={so.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  data-cur={so.label === "Email" ? "say hi" : "open"}
                  className="tap min-h-11 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  <span className="cell-mark">
                    {so.brand ? <Brand name={so.brand} size={14} /> : <Icon name={so.icon!} size={14} />}
                  </span>
                  <span className="cell-label">{so.label}</span>
                </a>
              ))}
            </div>
          </div>
        </Section>

        <div className="screen-line-top px-4 py-8 sm:px-6">
          <p className="text-[15px]">
            Still reading? That means something clicked. Let&rsquo;s talk.
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {IDENTITY.email}
          </p>
        </div>

        <Section title="Where it overlaps" id="overlaps">
          <div className="px-4 py-8 sm:px-10">
            <Venn />
          </div>
        </Section>

        <footer className="screen-line-top overflow-hidden px-4 pb-2 pt-8 sm:px-6">
          {/* The name, set large and nearly gone. A footer that repeats the
              location and a build note is two more things to read at the
              point where the reader has finished reading. */}
          <p
            aria-hidden="true"
            className="select-none text-center font-display font-semibold leading-[0.85] tracking-tight"
            style={{
              fontSize: "clamp(3.25rem, 17vw, 9rem)",
              color: "color-mix(in oklch, var(--foreground) 7%, transparent)",
            }}
          >
            {IDENTITY.properName}
          </p>
        </footer>
      </main>
    </div>
  );
}

function Header() {
  return (
    <div className="sticky top-0 isolate z-50 w-full bg-background/85 pt-1 backdrop-blur">
      <div className="mx-auto w-full max-w-column">
        <div className="screen-line-top screen-line-bottom mt-1 flex w-full items-center justify-between gap-2 px-4 py-1.5">
          <a href="#main" className="tap rounded-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
            <span className="font-pixel text-2xl uppercase leading-none tracking-wide">
              {IDENTITY.wordmark}
            </span>
          </a>
          <div className="flex items-center gap-2 md:gap-4">
            <nav aria-label="Main" className="hidden md:block">
              <NavMenu groups={NAV} />
            </nav>
            <span className="hidden h-4 w-px bg-border md:block" aria-hidden="true" />
            <ScrollCta />
            <Theme />
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <header className="flex w-full items-start">
      <div className="p-4">
        <Portrait />
      </div>
      <div className="flex min-w-0 flex-1 flex-col pt-4">
        <h1 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
          {IDENTITY.properName}
        </h1>
        <p className="flex min-h-6 items-center text-sm font-medium text-muted-foreground md:text-base">
          <Rotator items={ROLES} />
        </p>
        <div id="hero-cta" className="mt-2 flex flex-wrap items-center gap-2">
          <a
            href={`mailto:${IDENTITY.email}`}
            data-cur="say hi"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-foreground px-3 py-1 text-[13px] font-medium leading-4 text-background sm:gap-[5px] sm:text-xs transition-opacity hover:opacity-90 sm:min-h-0 sm:px-2"
          >
            <Icon name="mail" size={14} />
            Send an email
          </a>
          <a
            href="https://x.com/jawadmakes"
            data-cur="dm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 py-1 text-[13px] font-medium leading-4 transition-colors sm:gap-[5px] sm:text-xs hover:border-foreground/20 hover:bg-muted sm:min-h-0 sm:px-2"
          >
            <Icon name="send" size={14} />
            DM on X
          </a>
          <a
            href={IDENTITY.cv}
            data-cur="read"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 py-1 text-[13px] font-medium leading-4 transition-colors sm:gap-[5px] sm:text-xs hover:border-foreground/20 hover:bg-muted sm:min-h-0 sm:px-2"
          >
            <Icon name="doc" size={14} />
            Read the CV
          </a>
        </div>
      </div>
    </header>
  );
}

function About() {
  // Parsed on the server: the icon tokens never reach the browser as text,
  // and the finished sentence is in the HTML for anyone who never runs the
  // script.
  const intro = ABOUT.map(parseProse);
  const tail = ABOUT_TAIL.map(parseProse);

  return (
    <section aria-labelledby="about" className="screen-line-top">
      <div className="screen-line-bottom flex w-full items-center justify-between gap-4 px-4 py-1">
        <h2 id="about" className="scroll-mt-20 font-display text-xl font-medium tracking-tight sm:text-2xl">
          About
        </h2>
      </div>

      <div className="space-y-3 px-4 py-5 text-[15px] leading-relaxed sm:px-6">
        {intro.map((parsed, i) => (
          <Streamed key={i} parsed={parsed} animate delay={i * 0.3} />
        ))}

        {/* The roles, as a ruled table. The product's own logo identifies
            each row, a dashed leader carries the eye across, and the role
            sits in the right column. This replaced a run-on sentence with
            six chips in it, which is where the chips stopped meaning
            anything: a phrase reads as emphasised only while most of the
            phrases around it are not. */}
        <ul className="grid gap-x-8 gap-y-2 py-1.5 sm:grid-cols-2">
          {ABOUT_ROLES.map((r) => (
            <li key={r.key} className="flex items-baseline gap-2 text-[14px]">
              <Logo src={r.logo} emoji={r.emoji} size={18} className="translate-y-[3px]" />
              {/* Same hover card as the project grid, read off the same
                  item, so the two can never show different screenshots. */}
              <Preview {...(heroFor(r.name) ?? {})}>
                {r.href ? (
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap font-medium underline decoration-border underline-offset-[3px] transition-colors hover:decoration-foreground"
                  >
                    {r.name}
                  </a>
                ) : (
                  <span className="font-medium">{r.name}</span>
                )}
              </Preview>
              <span className="lead" aria-hidden="true" />
              <span className="shrink-0 text-[13px] text-muted-foreground">{r.role}</span>
            </li>
          ))}
        </ul>

        {tail.map((parsed, i) => (
          <Streamed key={i} parsed={parsed} animate delay={0.8 + i * 0.3} />
        ))}
      </div>
    </section>
  );
}

function Section({
  title, id, aside, children,
}: {
  title: string; id?: string; aside?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section id={id} className="screen-line-top scroll-mt-14">
      <div className="screen-line-bottom flex w-full items-center justify-between gap-4 px-4 py-1">
        <h2 className="scroll-mt-20 font-display text-xl font-medium tracking-tight sm:text-2xl">{title}</h2>
        {aside && <span className="font-mono text-xs text-muted-foreground">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

/** One thing he works on, as a row in a ruled table. */
function Role({ item }: { item: Item }) {
  const name = item.href ? (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="tap underline decoration-border underline-offset-[3px] transition-colors hover:decoration-foreground"
    >
      {item.name}
    </a>
  ) : (
    item.name
  );

  return (
    <li className="role-row -mx-2 rounded-lg px-2 py-2">
      <div className="flex items-stretch gap-3">
        {/* Sized to the two lines beside it rather than to one. At 40px it
            sat against a 60px stack and read as a bullet that had come
            loose from its row. */}
        <Logo
          src={item.logo}
          emoji={item.emoji}
          size={56}
          className="role-logo self-start"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="shrink-0 text-[15px] font-semibold leading-snug">
              <Preview shot={item.shot} label={item.domain ?? "no site yet"}>
                {name}
              </Preview>
            </h3>
            <span className="lead" aria-hidden="true" />
            <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
              {item.period}
            </p>
          </div>
          <p className="mt-1 flex items-center text-[13px] leading-snug">
            {/* The role, and nothing else. A status glyph here was a second
                mark on a row that already says what the thing is, and the
                grid below carries the live/building state anyway. */}
            <span className="rp-role">
              <Icon name={item.roleIcon} size={12} className="rp-role-icon" />
              {item.role}
            </span>
            {item.roleNote && <span className="role-note">({item.roleNote})</span>}
          </p>
        </div>
      </div>
      <p className="mt-1.5 pl-[68px] text-[13px] leading-relaxed text-muted-foreground">
        {item.blurb}
      </p>
    </li>
  );
}

/** The project grid: two columns with a rule down the middle, matching the
 *  column's own hairlines rather than boxing each card in its own border. */
function Grid({ items }: { items: Item[] }) {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 top-0 z-0 hidden w-px bg-border sm:block"
      />
      <div className="relative grid grid-cols-1 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.key} className="proj group/card flex flex-col gap-2 border-t border-border p-4 first:border-t-0 sm:border-t-0">
            <div className="group/media relative block overflow-hidden rounded-md border border-border">
              {item.video ? (
                <Film video={item.video} />
              ) : item.emoji ? (
                // Nothing to screenshot yet. A white panel carrying the mark
                // itself, drawn as text so it stays crisp at any size, rather
                // than a blank rectangle that reads as a failed image.
                <div className="proj-shot flex h-44 w-full items-center justify-center bg-white sm:h-48">
                  <span className="text-6xl leading-none" aria-hidden="true">
                    {item.emoji}
                  </span>
                </div>
              ) : (
                <Image
                  src={item.shot!}
                  alt=""
                  width={1200}
                  height={630}
                  className="proj-shot h-44 w-full object-cover object-top sm:h-48"
                />
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="min-w-0 text-[15px] font-semibold leading-snug">
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="tap transition-colors hover:opacity-70">
                    {item.name}
                  </a>
                ) : (
                  item.name
                )}
              </h3>
              <div className="flex shrink-0 items-center gap-1.5">
                <Status status={item.status} />
              </div>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">{item.blurb}</p>
            {item.tags && (
              <ul className="grid-table mt-0.5 grid-cols-2">
                {item.tags.map((t) => (
                  <li key={t.label} className="text-muted-foreground">
                    <span className="cell-mark">
                      {t.brand ? <Brand name={t.brand} size={13} /> : null}
                    </span>
                    <span className="cell-label">{t.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** The Okara launch film. Muted, looping and `preload="none"`, so nothing
 *  downloads until someone actually asks for it: the file is 22MB. */
function Film({
  video,
}: {
  video: { mp4: string; poster: string; note: string; full?: string };
}) {
  return (
    <div className="proj-shot relative overflow-hidden rounded-md border border-border">
      <video
        preload="none"
        controls
        playsInline
        poster={video.poster}
        className="h-44 w-full bg-black object-cover object-top sm:h-48"
      >
        <source src={video.mp4} type="video/mp4" />
      </video>
      <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white">
        <Icon name="play" size={11} />
        {video.note}
      </span>
      {video.full && (
        <a
          href={video.full}
          target="_blank"
          rel="noopener noreferrer"
          data-cur="watch"
          className="tap absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white transition-opacity hover:opacity-80"
        >
          full film
        </a>
      )}
    </div>
  );
}

// Status, as a glyph rather than a pill.
//
// Three pills in a row all saying "Building" is three pieces of furniture
// carrying one bit of information. A glyph in the status colour says the same
// thing at a glance and leaves the row to the words that matter.
const STATUS: Record<string, { icon: IconName; hue: string; say: string }> = {
  Live: { icon: "check", hue: "var(--live)", say: "Live" },
  Building: { icon: "bolt", hue: "var(--building)", say: "Being built" },
  Waitlist: { icon: "clock", hue: "var(--building)", say: "Waitlist open" },
};

function Status({ status }: { status: string }) {
  const s = STATUS[status] ?? STATUS.Building;
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium"
      style={{ color: s.hue }}
      title={s.say}
    >
      <Icon name={s.icon} size={13} />
      <span className="sr-only">{s.say}</span>
    </span>
  );
}

/**
 * Four overlapping circles with him in the middle.
 *
 * Positions are percentages of a square box, so the whole thing scales from a
 * phone to a desktop without a media query and without a label drifting off
 * its circle. The circles are 55% of the box, the largest they can be while
 * still leaving a clear centre for the portrait.
 *
 * Each ring takes one of the page's five hues at low alpha. This is the only
 * place all of them appear together, which is what makes the diagram read as
 * a summary of the page rather than as another section of it.
 */
function Venn() {
  const [top, left, right, bottom] = VENN;
  const hues = ["violet", "ember", "olive", "amber"];
  const spots = [
    "top-0 left-1/2 -translate-x-1/2",
    "top-[22%] left-[2%]",
    "top-[22%] right-[2%]",
    "bottom-0 left-1/2 -translate-x-1/2",
  ];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[540px]">
      {/* Plain rings, one hue each. A pass with pattern fills in them looked
          like graph paper and buried the labels: the overlaps already do the
          work, and the whole point of the figure is what happens where they
          cross. Nothing else on the page uses all four hues at once. */}
      {spots.map((pos, i) => (
        <div
          key={i}
          aria-hidden="true"
          className={`absolute size-[58%] rounded-full border ${pos}`}
          style={{
            borderColor: `color-mix(in oklch, var(--hue-${hues[i]}) 55%, transparent)`,
            background: `color-mix(in oklch, var(--hue-${hues[i]}) 7%, transparent)`,
          }}
        />
      ))}

      {/* The two side labels are pulled further in on a phone and set a
          shade smaller. The positions are percentages, but the words are not:
          at 375 "Frontend & Build" is a quarter of the box wide at 13% inset
          and lands on top of its own ring. */}
      <span className="absolute left-1/2 top-[12%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] text-muted-foreground sm:text-sm">
        {top}
      </span>
      <span className="absolute left-[16%] top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] text-muted-foreground sm:left-[13%] sm:text-sm">
        {left}
      </span>
      <span className="absolute right-[16%] top-1/2 -translate-y-1/2 translate-x-1/2 whitespace-nowrap text-[10px] text-muted-foreground sm:right-[13%] sm:text-sm">
        {right}
      </span>
      <span className="absolute bottom-[12%] left-1/2 -translate-x-1/2 translate-y-1/2 whitespace-nowrap text-[10px] text-muted-foreground sm:text-sm">
        {bottom}
      </span>

      <Image
        src={IDENTITY.avatar}
        alt=""
        width={160}
        height={160}
        className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-background object-cover shadow-md sm:size-24"
      />
    </div>
  );
}
