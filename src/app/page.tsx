import Image from "next/image";
import { Brand } from "@/components/Brand";
import { ContactModal } from "@/components/ContactModal";
import { Cta } from "@/components/Cta";
import { HeroCtas } from "@/components/HeroCtas";
import { Cursor } from "@/components/Cursor";
import { Elsewhere } from "@/components/Elsewhere";
import { Logo } from "@/components/Logo";
import { Face, Obj, type ObjName } from "@/components/Obj";
import { IconPipe, Pipes } from "@/components/Pipes";
import { Portrait } from "@/components/Portrait";
import { Rail } from "@/components/Rail";
import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/Section";
import { SiteNav } from "@/components/SiteNav";
import { DotField } from "@/components/DotField";
import { Icon, type IconName } from "@/components/Icon";
import { Preview } from "@/components/Preview";
import { Rotator } from "@/components/Rotator";
import { Streamed } from "@/components/Streamed";
import { parseProse } from "@/components/prose";
import {
  ABOUT, ABOUT_ROLES, ABOUT_TAIL, ARCHIVE, heroFor, HERO, NAV, IDENTITY, NOW, ROLES, SKILLS_TABLE, SOCIALS, VENN, type Item,
} from "@/lib/profile";

// One reading column on white paper, in ignura.com's black and white: Satoshi
// alone, a soft grey step for anything that sits on the page, the 12px radius,
// glossy black objects leading each heading, and one orange word. Sections are
// told apart by space and by that grey step, never by a rule.

const SKILL_OBJ: Record<"pen" | "code" | "sparkle" | "cube", ObjName> = {
  pen: "work",
  code: "gear",
  sparkle: "chat",
  cube: "stack",
};

export default function Home() {
  return (
    <div className="relative min-h-dvh">
      <Pipes />
      <Cursor label="hi" />
      <ContactModal />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      <SiteNav groups={NAV} />
      <Rail />

      {/* The halftone the bar hangs over. The pointer pushes the dots and they
          warm to the orange, the page's one moving texture. */}
      <div className="dot-band h-28 w-full sm:h-36" aria-hidden="true">
        <DotField />
      </div>

      <main id="main" className="mx-auto w-full max-w-column px-4 sm:px-6">
        <Hero />
        <About />

        <Section title="Projects" id="projects" obj="work" aside="live work">
          <Grid items={NOW.filter((i) => i.shot || i.emoji)} />
        </Section>

        <Section title="Also mine" obj="previously" aside="still live">
          <ul className="space-y-1">
            {ARCHIVE.map((item, i) => (
              <Reveal key={item.key} as="li" index={i}>
                <Role item={item} />
              </Reveal>
            ))}
          </ul>
        </Section>

        <Section title="Skills" id="skills" obj="skills">
          {/* Each area is a station: its glossy object, joined to the next by
              ignura's pipe, then what it covers and the tools in it. */}
          <ul className="skills">
            <IconPipe />
            {SKILLS_TABLE.map((row, i) => (
              <Reveal key={row.area} as="li" index={i} step={0.07} className="skill">
                <span className="skill-ico" data-ipipe-ico>
                  <Obj name={SKILL_OBJ[row.icon]} size={44} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[20px] font-bold leading-tight tracking-[-0.02em]">{row.area}</h3>
                  <p className="mt-0.5 text-[15px] text-[var(--ink-read)]">{row.what}</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {row.tools.map((t) => (
                      <li key={t.label} className="tool">
                        {t.brand ? <Brand name={t.brand} size={14} /> : t.icon ? <Icon name={t.icon} size={14} /> : null}
                        {t.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </ul>
        </Section>

        <section id="elsewhere" className="sec scroll-mt-20">
          <Elsewhere />
        </section>

        <Section title="Where it overlaps" id="overlaps" obj="overlaps">
          <div className="py-4 sm:px-8">
            <Venn />
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <header className="pt-10 sm:pt-14">
      <div className="flex items-end gap-5 sm:gap-6">
        <Portrait />
        <div className="min-w-0 pb-7 sm:pb-8">
          <h1 className="hero-name">{IDENTITY.properName}</h1>
          <p className="mt-1 flex min-h-7 items-center text-[17px] font-medium text-muted-foreground sm:text-[20px]">
            <Rotator items={ROLES} />
          </p>
        </div>
      </div>
      <p className="hero-say mt-7">
        {HERO.lines.map((line, i) => (
          <span key={i} className="hero-line">
            {line.map((v) => (
              <span key={v.text}>
                {v.lead && `${v.lead} `}
                <span className="hero-verb">
                  <Obj name={v.obj} size={0} className="hero-ico" />
                  {v.text.split(" ")[0]}
                </span>
                {` ${v.text.split(" ").slice(1).join(" ")} `}
              </span>
            ))}
            {i === HERO.lines.length - 1 && (
              <>
                <em className="rev" data-t={HERO.pop}>
                  {HERO.pop}
                </em>
                .
              </>
            )}
          </span>
        ))}
      </p>
      <HeroCtas />
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
    <Section title="About" id="about" obj="about">
      <div className="space-y-3 text-[17px] leading-relaxed">
        {intro.map((parsed, i) => (
          <Streamed key={i} parsed={parsed} animate delay={i * 0.3} className={i === 0 ? "about-lead" : ""} />
        ))}

        {/* The roles, on one soft slab: the product's own logo, its name, and
            what he does there on the right. One surface rather than a box per
            row, so it reads as one list. */}
        <ul className="roles my-5">
          {ABOUT_ROLES.map((r) => (
            <li key={r.key}>
              <Logo src={r.logo} emoji={r.emoji} tile={r.logoTile} size={28} />
              <Preview {...(heroFor(r.name) ?? {})}>
                {r.href ? (
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap font-bold underline decoration-transparent underline-offset-[3px] transition-colors hover:decoration-foreground"
                  >
                    {r.name}
                  </a>
                ) : (
                  <span className="font-bold">{r.name}</span>
                )}
              </Preview>
              <span className="ml-auto text-right text-[15px] text-muted-foreground">
                {r.role}
                {r.stat && <span className="text-foreground"> · {r.stat}</span>}
              </span>
            </li>
          ))}
        </ul>

        {tail.map((parsed, i) => (
          <Streamed key={i} parsed={parsed} animate delay={0.8 + i * 0.3} />
        ))}
      </div>
    </Section>
  );
}

/** One thing he works on, as a row that lifts onto the soft grey. */
function Role({ item }: { item: Item }) {
  const dead = item.status === "Discontinued";
  const name = item.href ? (
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      // Scribbled out, not greyed. Grey would say "less important"; the mark
      // says "this is over", which is the actual fact, and the site is still
      // standing so the link stays live.
      className={`tap underline-offset-[3px] transition-colors ${
        dead ? "scribble" : "underline decoration-transparent hover:decoration-foreground"
      }`}
    >
      {item.name}
    </a>
  ) : (
    item.name
  );

  return (
    // The card opens from anywhere on the line, not only from the name.
    <Preview block shot={item.shot} label={item.domain ?? "no site yet"}>
      <div className="role-row">
        <Logo
          src={item.logo}
          emoji={item.emoji}
          tile={item.logoTile}
          size={52}
          className="role-logo"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[17px] font-bold leading-snug tracking-[-0.01em]">{name}</h3>
            <p className="shrink-0 text-[13px] tabular-nums text-muted-foreground">{item.period}</p>
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-[14px] leading-snug">
            <span className="rp-role">
              <Icon name={item.roleIcon} size={13} className="rp-role-icon" />
              {item.role}
            </span>
            {item.roleNote && <span className="role-note">{item.roleNote}</span>}
            {dead && <Status status={item.status} />}
          </p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--ink-read)]">{item.blurb}</p>
        </div>
      </div>
    </Preview>
  );
}

/** The project grid. With an odd count the first project is drawn across the
 *  full width and the rest sit in pairs under it, so five reads as one
 *  headline and two rows of two rather than four and an orphan. */
function Grid({ items }: { items: Item[] }) {
  const lead = items.length % 2 === 1 ? items[0] : null;
  const pairs = lead ? items.slice(1) : items;

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
      {lead && <Card item={lead} index={0} wide />}
      {pairs.map((item, i) => (
        <Card key={item.key} item={item} index={i + (lead ? 1 : 0)} />
      ))}
    </div>
  );
}

function Card({ item, index, wide = false }: { item: Item; index: number; wide?: boolean }) {
  return (
    <Reveal
      index={index}
      step={0.08}
      className={`proj group/card relative flex flex-col ${wide ? "sm:col-span-2" : ""}`}
    >
      {item.href && (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          data-cur="open"
          className="absolute inset-0 z-[1] rounded-[12px] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <span className="sr-only">{`Open ${item.name}`}</span>
        </a>
      )}
      {/* The shot sits on a soft grey slab, inset at the top and sides and
          running off the bottom edge, like a screen standing in a tray. */}
      <div className="proj-slab">
        {item.emoji ? (
          <div className={`proj-shot flex w-full items-center justify-center bg-white ${wide ? "h-52 sm:h-72" : "h-48 sm:h-52"}`}>
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
            className={`proj-shot w-full object-cover object-top ${wide ? "h-52 sm:h-72" : "h-48 sm:h-52"}`}
          />
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <h3 className="flex min-w-0 items-center gap-2 text-[17px] font-bold leading-snug tracking-[-0.01em]">
          {item.name}
          {item.roleNote && (
            <span className="text-[13px] font-normal text-muted-foreground">{item.roleNote}</span>
          )}
        </h3>
        <span className="proj-go" aria-hidden="true">
          <Status status={item.status} />
          <Icon name="chev" size={14} className="proj-arrow" />
        </span>
      </div>
      <p className="mt-1 text-[15px] leading-relaxed text-[var(--ink-read)]">{item.blurb}</p>
    </Reveal>
  );
}

// Status, as a glyph rather than a pill. A live thing gets a small green tick;
// a thing being built gets the orange bolt; a thing that is over is greyed.
const STATUS: Record<string, { icon: IconName; hue: string; say: string }> = {
  Live: { icon: "check", hue: "var(--live)", say: "Live" },
  Building: { icon: "bolt", hue: "var(--building)", say: "Being built" },
  Waitlist: { icon: "clock", hue: "var(--building)", say: "Waitlist open" },
  Discontinued: { icon: "target", hue: "var(--muted-foreground)", say: "Not worked on any more" },
};

function Status({ status }: { status: string }) {
  const s = STATUS[status] ?? STATUS.Building;
  return (
    <span
      className="inline-flex items-center gap-1 text-[12px] font-medium"
      style={{ color: s.hue }}
      title={s.say}
    >
      <Icon name={s.icon} size={14} />
      <span className="sr-only">{s.say}</span>
    </span>
  );
}

/**
 * Four overlapping discs with him in the middle.
 *
 * Positions are percentages of a square box, so the whole thing scales from a
 * phone to a desktop without a media query. In black and white the discs are
 * one faint ink each, so where two cross the grey deepens on its own and the
 * centre, where all four meet, is the darkest place on the figure.
 */
function Venn() {
  const objs: ObjName[] = ["work", "chat", "gear", "stack"];
  const discs = [
    "top-0 left-1/2 -translate-x-1/2",
    "top-[22%] left-[2%]",
    "top-[22%] right-[2%]",
    "bottom-0 left-1/2 -translate-x-1/2",
  ];
  const labels = [
    "left-1/2 top-[13%] -translate-x-1/2 -translate-y-1/2",
    "left-[17%] top-1/2 -translate-x-1/2 -translate-y-1/2 sm:left-[15%]",
    "right-[17%] top-1/2 -translate-y-1/2 translate-x-1/2 sm:right-[15%]",
    "bottom-[13%] left-1/2 -translate-x-1/2 translate-y-1/2",
  ];

  return (
    <div className="venn relative mx-auto aspect-square w-full max-w-[540px]">
      {discs.map((pos, i) => (
        <div key={i} aria-hidden="true" className={`venn-disc absolute size-[58%] rounded-full ${pos}`} />
      ))}
      {VENN.map((label, i) => (
        <span key={label} className={`venn-label ${labels[i]}`}>
          <Obj name={objs[i]} size={0} className="venn-obj" />
          {label}
        </span>
      ))}
      <span className="venn-face absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <Image src={IDENTITY.avatar} alt="" width={200} height={200} className="size-full rounded-[16px] object-cover" />
      </span>
    </div>
  );
}

/**
 * The close, after ignura.com's: a field of dots the pointer pushes around,
 * and a soft card rising out of it with curved top corners. The card carries
 * the ask, the page's links, and the name set large with its mark, so the last
 * screen is a designed end rather than a sitemap.
 */
function Footer() {
  const PAGE = [
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Skills", href: "#skills" },
    { label: "Blog", href: "/blog" },
  ];
  const ELSE = SOCIALS.filter((s) => s.label !== "Email");

  return (
    <footer id="contact" className="foot scroll-mt-10">
      <div className="foot-field" aria-hidden="true">
        <DotField />
      </div>
      <div className="foot-card">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <h2 className="foot-ask">Still reading? Let&rsquo;s talk.</h2>
            <p className="mt-3 max-w-sm text-[17px] text-[var(--ink-read)]">
              Something clicked, then. Send a line about what you are making.
            </p>
            <div className="mt-6">
              <Cta />
            </div>
          </div>
          <FootList title="The page" items={PAGE} />
          <FootList title="Elsewhere" items={ELSE.map((s) => ({ label: s.label, href: s.href, brand: s.brand, icon: s.icon }))} />
        </div>
        <div className="mt-16 flex flex-wrap items-end justify-between gap-6 sm:mt-24">
          <p aria-hidden="true" className="foot-mark">
            <Face className="foot-mark-box" />
            {IDENTITY.wordmark.charAt(0) + IDENTITY.wordmark.slice(1).toLowerCase()}
          </p>
          <p className="pb-3 text-[15px] text-muted-foreground">
            Designer and founder in London. &copy; {IDENTITY.properName} 2026
          </p>
        </div>
      </div>
    </footer>
  );
}

function FootList({
  title,
  items,
}: {
  title: string;
  items: { label: string; href: string; brand?: import("@/components/Brand").BrandKey; icon?: IconName }[];
}) {
  return (
    <div>
      <h3 className="text-[15px] font-medium text-muted-foreground">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li key={it.label}>
            <a
              href={it.href}
              target={it.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="foot-link"
            >
              {it.brand ? <Brand name={it.brand} size={14} /> : it.icon ? <Icon name={it.icon} size={14} /> : null}
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
