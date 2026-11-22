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
    title: "why i started ignura, a launch studio for apps",
    description:
      "why i started ignura after watching great apps launch to silence. ignura is a launch studio for consumer apps, prosumer tools and b2b.",
    date: "2026-10-11",
    body: (
      <>
        <p>
          i started ignura because i kept watching great apps launch to silence. the product was
          good, the founder had poured months into it, and on launch day almost nobody noticed.
        </p>

        <h2>great apps, quiet launches</h2>
        <p>
          i design products and build my own, like ignaru and bevel. around them i kept seeing
          the same pattern. the app was rarely the problem. the launch was. all the craft went
          into the build, and the moment people actually met the product got whatever time was
          left: a post, a few screenshots, and a hope.
        </p>
        <p>
          that always felt backwards to me. launch day is the first impression. it deserves the
          same care as the onboarding flow.
        </p>

        <h2>designers who also ship</h2>
        <p>
          most launch help splits in two. designers make something beautiful and hand it over.
          marketers push it out but never touch the craft. things get lost in that handoff.
        </p>
        <p>
          i wanted one team that does both. so ignura is an{" "}
          <a href="https://ignura.com">app launch studio</a> where the people who design
          your launch film, app store screenshots and landing page are the same people who run
          launch day. there are four of us at the core. our line is simple: you built it. we
          launch it.
        </p>

        <h2>what we actually do</h2>
        <p>
          ignura is a launch studio for consumer apps, prosumer tools and b2b. consumer apps are
          the core. we do design, launch films, app store screenshots, landing pages, ugc and
          launch-day runs. past work includes ignaru, okara and bevel, plus ugc for hypjam.
        </p>
        <p>
          prices are on the table from the start. ugc starts from £3,000. ignite, the whole
          four-week launch, starts from £16,000. burn, our monthly plan, starts from £6,000. you
          can see all of it at <a href="https://ignura.com">ignura.com</a>.
        </p>

        <h2>if you've built something</h2>
        <p>
          we're booking november launches now. if your app is close and you want launch day to
          match the work you put in, <a href="/cal?src=blog">book a free 15-min call</a>.
          or email <a href="mailto:hello@ignura.com">hello@ignura.com</a>.
        </p>
      </>
    ),
    faq: [
      {
        q: "what is ignura?",
        a: "ignura is a launch studio for apps. we handle design, launch films, app store screenshots, landing pages, ugc and launch-day runs.",
      },
      {
        q: "how much does a launch with ignura cost?",
        a: "ugc starts from £3,000. ignite, the whole four-week launch, starts from £16,000. burn, the monthly plan, starts from £6,000.",
      },
      {
        q: "who is ignura for?",
        a: "consumer apps are the core. we also do go-to-market for prosumer and b2b launches.",
      },
    ],
  },
];

export function postBySlug(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}

/** "11 oct 2026". Fixed to UTC so the server and the reader agree on the day. */
export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).toLowerCase();
}
