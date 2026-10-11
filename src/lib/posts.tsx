// The blog, as data.
//
// Each post is its metadata, its body as JSX, and its FAQ as plain strings.
// The FAQ is data rather than markup because it is read twice: once as the
// questions at the foot of the post, and once as the FAQPage JSON-LD, and the
// two have to say the same thing.
//
// House style holds here too: no em dashes.

export type Post = {
  slug: string;
  title: string;
  /** The meta description. 160 characters at most, or search cuts it. */
  description: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  body: React.ReactNode;
  faq: { q: string; a: string }[];
};

export const POSTS: Post[] = [
  {
    slug: "why-i-started-ignura",
    title: "Why I started Ignura, a launch studio for apps",
    description:
      "I started Ignura because I kept watching great apps launch to silence. Here's why I built a launch studio of designers who also ship.",
    date: "2026-10-11",
    body: (
      <>
        <p>
          I started Ignura because I kept watching great apps launch to silence. The product was
          good, the founder had poured months into it, and on launch day almost nobody noticed.
        </p>

        <h2>Great apps, quiet launches</h2>
        <p>
          I design products and build my own, like wayari and bevel. Around them I kept seeing
          the same pattern. The app was rarely the problem. The launch was. All the craft went
          into the build, and the moment people actually met the product got whatever time was
          left: a post, a few screenshots, and a hope.
        </p>
        <p>
          That always felt backwards to me. Launch day is the first impression. It deserves the
          same care as the onboarding flow.
        </p>

        <h2>Designers who also ship</h2>
        <p>
          Most launch help splits in two. Designers make something beautiful and hand it over.
          Marketers push it out but never touch the craft. Things get lost in that handoff.
        </p>
        <p>
          I wanted one team that does both. So Ignura is an{" "}
          <a href="https://ignura.com">app launch studio</a> where the people who design
          your launch film, App Store screenshots and landing page are the same people who run
          launch day. There are four of us at the core. Our line is simple: you built it. we
          launch it.
        </p>

        <h2>What we actually do</h2>
        <p>
          Ignura is a launch studio for consumer apps, prosumer tools and B2B. Consumer apps are
          the core. We do design, launch films, App Store screenshots, landing pages, UGC and
          launch-day runs. Past work includes wayari, Okara and bevel, plus UGC for hypjam.
        </p>
        <p>
          Prices are on the table from the start. UGC starts from £3,000. Ignite, the whole
          four-week launch, starts from £16,000. Burn, our monthly plan, starts from £6,000. You
          can see all of it at <a href="https://ignura.com">ignura.com</a>.
        </p>

        <h2>If you've built something</h2>
        <p>
          We're booking November launches now. If your app is close and you want launch day to
          match the work you put in, <a href="https://ignura.com/call">book a free 15-min call</a>.
          Or email <a href="mailto:hello@ignura.com">hello@ignura.com</a>.
        </p>
      </>
    ),
    faq: [
      {
        q: "What is Ignura?",
        a: "Ignura is a launch studio for apps. We handle design, launch films, App Store screenshots, landing pages, UGC and launch-day runs.",
      },
      {
        q: "How much does a launch with Ignura cost?",
        a: "UGC starts from £3,000. Ignite, the whole four-week launch, starts from £16,000. Burn, the monthly plan, starts from £6,000.",
      },
      {
        q: "Who is Ignura for?",
        a: "Consumer apps are the core. We also do go-to-market for prosumer and B2B launches.",
      },
    ],
  },
];

export function postBySlug(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}

/** "11 Oct 2026". Fixed to UTC so the server and the reader agree on the day. */
export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
