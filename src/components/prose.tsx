// Art and colour inside the text. Carried over from ripwebsite.
//
// A paragraph in this file's callers is plain text, plus two things it can
// carry:
//
//   :gem:                     a bare icon, on the baseline at that point
//   :gem:{half a million}     a MARK: that phrase highlighted, with the icon
//                             in front of it
//
// The mark is the thing that puts colour on this page: a tinted background
// behind the phrase, the icon stroked in a matching accent, and the text
// itself left in the page's ordinary ink. That last part is the whole trick.
// Colouring the words would either fail contrast or turn the paragraph into a
// link farm; tinting behind them reads as a highlighter someone ran over the
// line, and the sentence still reads as one sentence.
//
// Five hues, no more. Each is assigned to an icon below rather than chosen
// per use, so the same idea is always the same colour down the page and the
// palette cannot quietly grow to nine.
//
// The mark lights up only once the typing cursor has passed its last
// character, so the highlight sweeps in behind the words a beat after they
// land rather than being painted there from the start.

import { Brand, isBrandKey, type BrandKey } from "./Brand";
import { Icon, isIconName, type IconName } from "./Icon";
import { Preview } from "./Preview";
import { heroFor } from "@/lib/profile";


export type Hue = "violet" | "amber" | "olive" | "slate" | "ember" | "orange";

export type Segment =
  // `dim` is supporting text: the connective tissue between the phrases that
  // carry the point. It types at the same rate, it is just quieter.
  | { kind: "text"; value: string; at: number; dim: boolean }
  | { kind: "icon"; name: string; at: number; tight: boolean }
  // A highlighted phrase. `value` is its text and counts toward the cursor,
  // so words inside a mark type at the same rate as words outside it.
  | { kind: "mark"; name: string; hue: Hue; value: string; at: number; tight: boolean }
  // An inline link carrying a brand mark, for the socials in the About block.
  | { kind: "link"; brand?: BrandKey; icon?: string; value: string; href: string; at: number }
  // Coloured text, no chip and no glyph. The tinted mark is loud, so it is
  // rationed to the handful of phrases that name a thing; everything else
  // that wants emphasis takes the hue on the words themselves.
  | { kind: "tint"; hue: Hue; value: string; href?: string; at: number }
  | { kind: "ink"; name: string; value: string; at: number };

export type Parsed = { segments: Segment[]; length: number };

/**
 * Which hue each icon wears.
 *
 * Keyed by icon rather than chosen at the call site on purpose: "product"
 * should be the same colour in every paragraph, and a per-use hue is how a
 * palette becomes a mess. An icon with no entry falls back to slate, the
 * quietest.
 */
const HUES: Partial<Record<string, Hue>> = {
  trend: "olive", gem: "olive", check: "olive", globe: "olive",
  bolt: "amber", send: "amber", clock: "amber", sparkle: "amber",
  code: "violet", list: "violet", target: "violet", block: "violet",
  team: "ember", quote: "ember", pen: "ember",
  game: "slate", cube: "slate", mail: "slate", doc: "slate",
  // The one orange thing on the page, which is what makes it read as news.
  rocket: "orange",
};

export const hueFor = (name: string): Hue => HUES[name] ?? "slate";

// Deliberately narrow: letters, digits and dashes between two colons, then an
// optional braced phrase. A time like "10:30" cannot match, and neither can a
// URL's scheme.
// Three forms, deliberately narrow so ordinary prose cannot trip them:
//
//   :gem:                        a bare icon on the baseline
//   :gem:{a phrase}              that phrase highlighted, icon in front
//   :x:{on x|https://x.com/...}  an inline link with the brand's own mark
//   :rocket:[yc soon]            that phrase in the icon's hue, nothing else
//   :cube:<end to end>           that phrase in the page ink, with its icon
//   :rocket:[yc soon|https://…]  the same, as a link
//
// A time like "10:30" cannot match, and neither can a URL's scheme.
// {0,20} not {1,20}: the second quantifier counts the characters AFTER the
// first, so {1,20} silently required a two-character name and the one brand
// whose name is a single letter, X, fell through as literal text.
const TOKEN = /:([a-z][a-z0-9-]{0,20}):(?:\{([^{}|]{1,90})(?:\|([^{}]{1,200}))?\}|\[([^\[\]|]{1,90})(?:\|([^\[\]]{1,200}))?\]|<([^<>]{1,90})>)?/gi;

// Supporting text, wrapped in tildes. Chosen because it is the one wrapper
// that never appears in this copy for any other reason.
const DIM = /~([^~]{1,400})~/g;

type Raw =
  | { kind: "text"; value: string; dim: boolean }
  | { kind: "icon"; name: string }
  | { kind: "mark"; name: string; hue: Hue; value: string }
  | { kind: "link"; brand?: BrandKey; icon?: string; value: string; href: string }
  | { kind: "tint"; hue: Hue; value: string; href?: string }
  | { kind: "ink"; name: string; value: string };

/** Splits a run into dim and plain pieces, keeping source order. */
function splitDim(text: string): { value: string; dim: boolean }[] {
  const out: { value: string; dim: boolean }[] = [];
  let cursor = 0;
  for (const m of text.matchAll(DIM)) {
    const i = m.index ?? 0;
    if (i > cursor) out.push({ value: text.slice(cursor, i), dim: false });
    out.push({ value: m[1], dim: true });
    cursor = i + m[0].length;
  }
  if (cursor < text.length) out.push({ value: text.slice(cursor), dim: false });
  return out.filter((r) => r.value);
}

export function parseProse(text: string): Parsed {
  // Pass one: split on tokens, keeping the raw text either side.
  const raw: Raw[] = [];
  let cursor = 0;

  const pushText = (value: string) => {
    for (const piece of splitDim(value)) raw.push({ kind: "text", ...piece });
  };

  for (const match of text.matchAll(TOKEN)) {
    const name = match[1].toLowerCase();
    const phrase = match[2];
    const href = match[3];
    const tinted = match[4];
    const tintHref = match[5];
    const inked = match[6];
    const icon = isIconName(name);
    // A token naming neither an icon nor a brand is left as literal text,
    // rather than silently vanishing from the sentence.
    if (!icon && !isBrandKey(name)) continue;

    const index = match.index ?? 0;
    if (index > cursor) pushText(text.slice(cursor, index));

    if (inked && icon) {
      raw.push({ kind: "ink", name, value: inked });
    } else if (tinted && icon) {
      raw.push({ kind: "tint", hue: hueFor(name), value: tinted, href: tintHref });
    } else if (href && phrase) {
      raw.push(
        isBrandKey(name)
          ? { kind: "link", brand: name as BrandKey, value: phrase, href }
          : { kind: "link", icon: name, value: phrase, href },
      );
    } else if (phrase && icon) {
      raw.push({ kind: "mark", name, hue: hueFor(name), value: phrase });
    } else if (icon) {
      raw.push({ kind: "icon", name });
    }
    cursor = index + match[0].length;
  }

  if (cursor < text.length) pushText(text.slice(cursor));

  // Pass two: a bare icon owns the space around itself.
  //
  // A token is written with a space either side (`ships :bolt: fast`), because
  // that is how it reads in the source. But the rendered mark already carries
  // a margin on both sides, so keeping the source spaces too puts very nearly
  // three word-spaces between the two words and the sentence visibly comes
  // apart around every icon. The source spaces go; the margin stays.
  const tight: Record<number, boolean> = {};
  for (let i = 0; i < raw.length; i++) {
    const here = raw[i];
    const next = raw[i + 1];

    // A MARK keeps its ordinary word spaces, but its tint carries padding on
    // the right. Against punctuation that padding reads as a space and the
    // sentence gets "at nooli ." with the full stop adrift.
    if (here.kind === "mark") {
      tight[i] = next?.kind === "text" ? /^[,.;:!?)\]]/.test(next.value) : false;
      continue;
    }
    if (here.kind !== "icon") continue;

    const before = raw[i - 1];
    if (before?.kind === "text") before.value = before.value.replace(/[ \t]+$/, "");
    if (next?.kind === "text") next.value = next.value.replace(/^[ \t]+/, "");
    tight[i] = next?.kind === "text" ? /^[,.;:!?)\]]/.test(next.value) : false;
  }

  // Pass three: assign offsets, dropping any run that trimming emptied.
  const segments: Segment[] = [];
  let at = 0;
  for (const [i, item] of raw.entries()) {
    if (item.kind === "icon") {
      segments.push({ kind: "icon", name: item.name, at, tight: tight[i] ?? false });
      continue;
    }
    if (item.kind === "mark") {
      segments.push({ ...item, at, tight: tight[i] ?? false });
      at += item.value.length;
      continue;
    }
    if (item.kind === "link" || item.kind === "tint" || item.kind === "ink") {
      segments.push({ ...item, at });
      at += item.value.length;
      continue;
    }
    if (!item.value) continue;
    segments.push({ kind: "text", value: item.value, at, dim: item.dim });
    at += item.value.length;
  }

  return { segments, length: at };
}

/**
 * The plain text of a paragraph, tokens removed but marked phrases kept. Used
 * for metadata and structured data, where a colon-wrapped word would be noise
 * but the words inside a highlight are still part of the sentence.
 */
export function stripTokens(text: string) {
  return parseProse(text)
    .segments
    // A bare icon becomes a space, not nothing. The parser deliberately trims
    // the source spaces from either side of one, so dropping it outright would
    // weld its neighbours together and turn "design :pen: and" into
    // "designand". The collapse below tidies the space this leaves behind at a
    // sentence edge.
    .map((s) => (s.kind === "icon" ? " " : s.value))
    .join("")
    .replace(/\s{2,}/g, " ")
    // Tidies the space a removed icon leaves in front of punctuation. The
    // colon is deliberately NOT in this class: it is the token delimiter, so
    // including it would eat the space in front of any unrecognised token and
    // turn "a stray :typo:" into "a stray:typo:".
    .replace(/\s+([,.;!?])/g, "$1")
    .trim();
}

/**
 * One icon on the text baseline, with nothing highlighted.
 *
 * Sized in `em` so it scales with whatever type it lands in, and given a word
 * space either side so it reads as a beat in the sentence rather than
 * punctuation welded to the previous character.
 */
export function InlineIcon({
  name,
  tight = false,
  /** Ahead of the cursor: hidden, but still holding its space in the line. */
  pending = false,
}: {
  name: string;
  tight?: boolean;
  pending?: boolean;
}) {
  return (
    <span
      className={`rp-ink ${tight ? "is-tight" : ""} ${pending ? "is-pending" : ""}`}
      aria-hidden="true"
    >
      <Icon name={name as IconName} size={18} className="rp-ink-mark" />
    </span>
  );
}

/** An inline link wearing the platform's own mark. */
export function BrandLink({
  brand,
  icon,
  href,
  children,
}: {
  brand?: BrandKey;
  icon?: string;
  href: string;
  children: React.ReactNode;
}) {
  // A mailto opens the reader's own client, so it must not be forced into a
  // new tab: that leaves an orphan blank window behind on most browsers.
  const external = /^https?:/i.test(href);
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="rp-link"
      data-cur={brand === "x" ? "dm" : href.startsWith("mailto:") ? "say hi" : "open"}
    >
      <span className="rp-link-glyph" aria-hidden="true">
        {brand ? <Brand name={brand} size={15} /> : <Icon name={icon as IconName} size={15} />}
      </span>
      {children}
    </a>
  );
}

/**
 * A highlighted phrase: tint behind it, icon in front of it, ink text.
 *
 * `lit` is false until the cursor has passed the phrase's last character,
 * which is what makes the highlight sweep in behind the words rather than
 * being there before them. The tint and the icon run on their own
 * transitions, so the two arrive together without having to be one element.
 */
export function Mark({
  name,
  hue,
  lit,
  tight = false,
  children,
}: {
  name: string;
  hue: Hue;
  lit: boolean;
  /** Followed immediately by punctuation: drop the trailing padding. */
  tight?: boolean;
  children: React.ReactNode;
}) {
  const hero = typeof children === "string" ? heroFor(children) : null;

  const mark = (
    <span className={`rp-hl is-${hue} ${lit ? "is-lit" : ""} ${tight ? "is-tight" : ""}`}>
      <span className="rp-hl-glyph" aria-hidden="true">
        <Icon name={name as IconName} size={15} />
      </span>
      {children}
    </span>
  );

  // Only once the phrase has finished typing. A card that opened over a
  // half-written word would cover the rest of it as it arrived.
  if (!hero || !lit) return mark;
  return (
    <Preview shot={hero.shot} emoji={hero.emoji} label={hero.label}>
      {mark}
    </Preview>
  );
}
