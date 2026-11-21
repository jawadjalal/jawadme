import Link from "next/link";

const ITEMS = [
  ["/lab/hero-1", "Hero 1", "Wordmark and a wall of work. Joyco's structure: a name set as a mark, a signal bar, the statement in Public Sans."],
  ["/lab/hero-2", "Hero 2", "Quiet centre and a ring of ads. Outpace's restraint: a small headline, one button, the work curving round you."],
  ["/lab/hero-3", "Hero 3", "Fracture: one object in the dark. The cracked pillar lit by the brazier, embers, nothing else."],
  ["/lab/hero-4", "Hero 4", "Fracture: light through the crack. One seam of crystal light splits the name."],
  ["/lab/cal-1", "/cal 1", "Light and plain: the calendar as the page, in the site's own type."],
  ["/lab/cal-2", "/cal 2", "Night: the call as a lit doorway, the calendar open below."],
];

export default function Lab() {
  return (
    <main className="lab-index">
      <h1>Directions</h1>
      <ol>
        {ITEMS.map(([href, name, note]) => (
          <li key={href}>
            <Link href={href}>{name}</Link>
            <p>{note}</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
