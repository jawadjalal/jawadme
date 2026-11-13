// What search engines and answer engines read about the site, in one place. Every fact here is on the live home page
// (content/story.ts): his name, what he does, his two companies, his email and his X handle. Nothing is added to it
// that the page does not say.

import { IDENTITY } from "@/lib/profile";
import { BOOK, EMAIL } from "@/components/felt/copy";
import { DOES, HIRE, PAST, TIMELINE, X_HANDLE } from "@/content/story";

export const SITE_URL = IDENTITY.site;
export const PERSON_ID = `${SITE_URL}/#person`;
export const SITE_ID = `${SITE_URL}/#website`;

/** The last day the words on each page changed. The sitemap and the pages' dateModified both read these, so a deploy
 *  that touches no copy does not tell a crawler the page is new. Bump a date when the page's words change. */
export const LASTMOD = {
  home: "2026-11-13",
  call: "2026-11-13",
  magnitude: "2026-11-13",
  blog: "2026-10-11",
} as const;

export const HOME_TITLE = `${IDENTITY.properName}, designer and founder of Ignura and Ignaru`;
export const HOME_DESCRIPTION =
  "Jawad Jalal designs brands, ads and sites for startups. He runs Ignura, an ad and brand studio, and is building Ignaru, a design tool. Book a call.";
export const CALL_TITLE = "Book a call with Jawad Jalal";
export const CALL_DESCRIPTION =
  "Book a short video call with Jawad Jalal about brand design, ads and design engineering for your startup.";
export const MAGNITUDE_URL = `${SITE_URL}/magnitude`;

const X_URL = `https://x.com/${X_HANDLE}`;

export const personNode = () => ({
  "@type": "Person",
  "@id": PERSON_ID,
  name: IDENTITY.properName,
  url: SITE_URL,
  email: `mailto:${EMAIL}`,
  image: `${SITE_URL}/design/jawad-die.webp`,
  description: "Designer and founder. Brand design, ads and design engineering for startups.",
  knowsAbout: [...DOES],
  sameAs: [X_URL],
  owns: TIMELINE.map((t) => ({ "@type": "Organization", name: t.name, url: t.href, description: t.role })),
  affiliation: PAST.map((p) => ({ "@type": "Organization", name: p.name, url: p.href })),
});

export const websiteNode = () => ({
  "@type": "WebSite",
  "@id": SITE_ID,
  url: SITE_URL,
  name: IDENTITY.properName,
  inLanguage: "en",
  publisher: { "@id": PERSON_ID },
});

export const siteGraph = () => ({ "@context": "https://schema.org", "@graph": [personNode(), websiteNode()] });

const profileNode = () => ({
  "@type": "ProfilePage",
  "@id": `${SITE_URL}/#profile`,
  url: SITE_URL,
  name: HOME_TITLE,
  description: HOME_DESCRIPTION,
  inLanguage: "en",
  dateModified: LASTMOD.home,
  isPartOf: { "@id": SITE_ID },
  mainEntity: { "@id": PERSON_ID },
  primaryImageOfPage: { "@type": "ImageObject", url: `${SITE_URL}/og.png`, width: 1200, height: 630 },
});

/** The profile page with the person inline in the same graph, so `mainEntity` resolves on its own. */
export const profilePage = () => ({ "@context": "https://schema.org", "@graph": [profileNode(), personNode()] });

export const callPage = () => ({
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": `${SITE_URL}${HIRE}#page`,
  url: `${SITE_URL}${HIRE}`,
  name: CALL_TITLE,
  description: CALL_DESCRIPTION,
  inLanguage: "en",
  dateModified: LASTMOD.call,
  isPartOf: { "@id": SITE_ID },
  about: { "@id": PERSON_ID },
  potentialAction: { "@type": "ReserveAction", target: BOOK, name: "Book a call with Jawad Jalal" },
});

export const BOOKING_URL = BOOK;
