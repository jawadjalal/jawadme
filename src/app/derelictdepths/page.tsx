import type { Metadata } from "next";
import Link from "next/link";
import facts from "./facts.json";
import { Feed, FeedMeta, LatestShipped, getFeed } from "./Feed";
import { LaunchBoard, getLaunch } from "./Launch";
import { CameraRig, JOIN_SEED, JoinBudget, type Point, SwingFrames } from "./figures";
import { Diagram, Shot, Still, Table } from "./ui";
import { LatestVisuals } from "./Visuals";
import "./minelight.css";

// Rebuilt at most every 3 minutes, so the shipped feed (a JSON the build box refreshes every 3 minutes) stays fresh
// without a redeploy. Everything else on the page is static.
export const revalidate = 180;

const TITLE = "Derelict Depths: the game from the loop down to the toolchain";
const DESCRIPTION =
  "Derelict Depths, a co-op action mining crawler for Roblox: the dive, the town, classes and talents, loot, the pixel-splat look, the camera, audio, the server-authoritative architecture and the agent crew that builds it, with a live feed of what shipped.";
const OG_ALT = "Derelict Depths key art: an in-engine capture of a miner in the Golden Room";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/derelictdepths" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/derelictdepths", type: "article", images: [{ url: "/derelictdepths/img/og.jpg", width: 1200, height: 630, alt: OG_ALT }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/derelictdepths/img/og.jpg"] },
};

const SECTIONS: [string, string][] = [
  ["art", "The release art"],
  ["today", "The game today"],
  ["look", "The look"],
  ["captures", "Captures"],
  ["shipped-now", "Just shipped"],
  ["launch", "Launch board"],
  ["visuals", "Latest visuals"],
  ["loop", "The core loop"],
  ["dive", "A dive, server side"],
  ["world", "Floors and Gloom"],
  ["bestiary", "Bestiary and minibosses"],
  ["progression", "Progression"],
  ["feel", "Combat feel in frames"],
  ["camera", "Camera and controls"],
  ["ui", "UI"],
  ["audio", "Audio"],
  ["architecture", "Server-authoritative architecture"],
  ["forge", "The forge toolchain"],
  ["trains", "CI and merge trains"],
  ["crew", "How the agent crew builds it"],
  ["shipped", "Everything that shipped"],
];

const n = (v: number) => v.toLocaleString("en-GB");
const mainDate = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(facts.main.date));

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="ml-sec">
      <p className="ml-eyebrow">{eyebrow}</p>
      <h2 className="ml-h2">{title}</h2>
      {children}
    </section>
  );
}

const SYSTEMS: { name: string; body: string; code: string }[] = [
  {
    name: "The dive",
    body: "The Lift lowers a cage down a shaft onto the landing spot, then a layer plays out of chambers: clear one and its doors unlock, so a dive is a chain of rooms ending in the floor's guardian.",
    code: "Descent.luau · Run.luau · Chambers.luau",
  },
  {
    name: "The town",
    body: "A hub with the Lift in the middle, the Smeltery, the forge, NPC stalls, a crew board, the Hall of Delvers and the Vigil fire. It is where every dive starts and every haul gets settled.",
    code: "TownPlan.luau · Meta/Renown.luau · Meta/Vigil.luau",
  },
  {
    name: "Classes",
    body: "Four of them, each with an ability and an ult: the Miner, the Demolitionist, the Prospector and the Alchemist. Each unlocks by banking a few bars and reaching a depth, so a new class is a reason for another dive.",
    code: "Meta/Progress.luau · content/meta/classes",
  },
  {
    name: "Talents",
    body: "One skill point a level in a shared Mining tree plus a constellation tree for each class. A node opens when any one of its prerequisites is learned, the root is free, and the top of every class tree holds a party perk.",
    code: "Meta/Trees.luau",
  },
  {
    name: "Characters",
    body: "Several characters on one account. One is the main you push furthest; the others share the account's bonuses and can be swapped in town, so a second character is a build, not a restart.",
    code: "Meta/Roster.luau · Swap.luau",
  },
  {
    name: "Loot on one card",
    body: "Every get speaks the same card language: a big icon, a short name, a rarity colour and one plain line that never holds a number. Relics, consumables and set pieces all read the same way.",
    code: "Items.luau · ItemRules.luau · ItemsCards.luau",
  },
  {
    name: "The reward room",
    body: "A chest per ore tier, from a free Wood chest up to Heartstone. The run's grade decides which ones open, each shows what is inside before you spend on it, so the room is a choice and a coin sink.",
    code: "Chests.luau · RunScore.luau",
  },
  {
    name: "Detours and puzzles",
    body: "Side chambers off the main line: spring rooms that launch you across, obby rooms, and puzzle rooms where you light four miners' lanterns in the order a chalk board shows, with a vault at the end.",
    code: "Detours.luau · Puzzle.luau · RoomMix.luau",
  },
  {
    name: "Gloom and the Surge",
    body: "Gloom is a floor's difficulty, 0 to V. Each level keeps every modifier below it, adds one named modifier and pays more. On a clock, a Gloom Surge rolls through and lifts everything for a while.",
    code: "Gloom.luau · Surge.luau",
  },
  {
    name: "Parties and crews",
    body: "A party of up to four, with invites that time out and join asks posted on the town's crew board. Crews live across servers: finishing the three daily crew tasks earns crew points for everyone in it.",
    code: "Party.luau · Meta/Crews.luau · CrewBoard.luau",
  },
  {
    name: "Trading",
    body: "Two players open one window, put up coins, bank items and a note, both lock and both confirm. After a short countdown the save settles it, so a trade is never one side's claim.",
    code: "Trade.luau · server/Trades.luau",
  },
  {
    name: "The Daily Mine",
    body: "One try a day on a build the whole server shares, so the day's board means something. The gate checks the try and the Lift are free before it asks the Run to start.",
    code: "Meta/DailyGate.luau · Meta/Board.luau",
  },
  {
    name: "The first thirty minutes",
    body: "The opening is scripted to the second: what a brand-new player meets and when. A guard fails the build when a scripted beat lands late, so the pacing cannot drift.",
    code: "FirstThirty.luau · FirstThirtyBeats.luau",
  },
  {
    name: "The Vigil fire",
    body: "Sit at Lantern Square's campfire, or just be away, and the lantern fills. A full lantern is three dives at plus a quarter luck, a third of it spent at each dive's start.",
    code: "Meta/Vigil.luau",
  },
];

export default async function MinelightPage() {
  const [feed, launch] = await Promise.all([getFeed(), getLaunch()]);
  const renderedAt = Date.now();
  const c = facts.counts;
  const cam = facts.camera;
  const jb = facts.joinBudget;
  const joinHistory = (facts as { joinHistory?: Point[] }).joinHistory ?? JOIN_SEED;
  return (
    <div className="ml">
      <div className="ml-wrap">
        <nav className="ml-top" aria-label="Site">
          <Link href="/">← jawadjalal.com</Link>
          <span>Built on main <code>{facts.main.sha}</code>, {mainDate}</span>
        </nav>

        <header className="ml-hero">
          <div>
            <h1 className="ml-wordmark">
              <span>Derelict</span> <span className="lt">Depths</span>
            </h1>
            <p className="ml-kicker">A co-op action mining crawler for Roblox</p>
            <p className="ml-lede">Dig deep with your friends. Smash monsters, crack glowing ore, beat the boss, forge better gear.</p>
            <p className="ml-sub">
              This page is the game as it stands today, and the machine that builds it: the dive a player feels, the systems under it, the look being
              built, and the numbers behind all of it. It is drawn from the game repo&apos;s main branch and the team&apos;s design docs. Its shipped feed
              updates every 3 minutes, and its latest visuals every hour.
            </p>
            <p className="ml-links">
              <a href="/reading/derelict-depths-book/">Read the Derelict Depths book →</a>
              <a href="#art">The release art</a>
            </p>
          </div>
          <figure className="ml-poster">
            <img src="/derelictdepths/img/poster-1280.jpg" fetchPriority="high" srcSet="/derelictdepths/img/poster-640.jpg 640w, /derelictdepths/img/poster-1280.jpg 1280w" sizes="(min-width: 900px) 540px, 100vw" width={1280} height={720} alt="A miner raises a pickaxe in the Golden Room in front of the Mole King" />
            <figcaption><span className="ml-badge art">In-engine + key art</span>A real in-engine capture of the Golden Room, graded, with rays and the title added.</figcaption>
          </figure>
        </header>

        <div className="ml-stats">
          <div className="ml-stat"><b>{n(c.mergedPRs)}+</b><span>pull requests merged into main</span></div>
          <div className="ml-stat"><b>{c.testFiles} + {c.engineTestFiles}</b><span>Lune test files, plus in-engine test files</span></div>
          <div className="ml-stat"><b>{c.remotes}</b><span>remotes: the only doors from a client to the server</span></div>
          <div className="ml-stat"><b>2 floors</b><span>Topsoil Tunnels and Iron Halls are the release; {c.floors - 2} more are greyboxed</span></div>
          <div className="ml-stat"><b>{c.ores} ores</b><span>{c.bars} bars, and a pickaxe ladder above them</span></div>
          <div className="ml-stat"><b>{c.classes} classes</b><span>Miner, Demolitionist, Prospector, Alchemist</span></div>
          <div className="ml-stat"><b>R6 hero</b><span>your own Roblox avatar, over a shoulder camera</span></div>
          <div className="ml-stat"><b>{n(jb.latestBuildBytes)} bytes</b><span>what a phone downloads to join, measured by JoinBudget on main {facts.main.sha}, against the {n(jb.bytesLine)} line</span></div>
        </div>

        <nav className="ml-toc" aria-label="Contents">
          <ol>{SECTIONS.map(([id, label]) => <li key={id}><a href={"#" + id}>{label}</a></li>)}</ol>
        </nav>

        <Section id="art" eyebrow="Visuals · release" title="The release art">
          <div className="ml-col">
            <p>
              The wordmark, the icon and the three store capsules, all built for release day. The capsules are the shots a player sees before any of the
              game: a dive, the Mole King and an ore room. Each alternates file is kept as a labelled option rather than shipped.
            </p>
          </div>
          <div className="ml-art">
            <figure className="ml-logo-fig">
              <img src="/derelictdepths/img/logo-1280.webp" srcSet="/derelictdepths/img/logo-640.webp 640w, /derelictdepths/img/logo-1280.webp 1280w" sizes="(min-width: 760px) 720px, 100vw" width={1280} height={727} alt="The Derelict Depths wordmark" loading="lazy" decoding="async" />
              <figcaption><b>The wordmark</b><span className="ml-badge">Logo</span>Built in code, so every size is a redraw rather than a stretched image.</figcaption>
            </figure>
            <figure className="ml-icon-fig">
              <img src="/derelictdepths/img/icon-256.png" width={256} height={256} alt="The Derelict Depths icon" loading="lazy" decoding="async" />
              <figcaption><b>The icon</b><span className="ml-badge">Store icon</span>What a player sees at thumbnail size in a list of games.</figcaption>
            </figure>
          </div>
          <div className="ml-pair">
            <Shot name="thumb-dive" w={1280} h={720} kind="Store thumbnail" title="Capsule one: the dive" note="A real capture, cropped to drop the HUD labels, with the wordmark composited on." />
            <Shot name="thumb-king" w={1280} h={720} kind="Store thumbnail" title="Capsule two: the Mole King" note="The guardian's arena, painted up from a real capture, with no generated lettering." />
          </div>
          <div className="ml-pair">
            <Shot name="thumb-ore" w={1280} h={720} kind="Store thumbnail" title="Capsule three: the ore room" note="A real capture of a Topsoil ore room." />
            <div className="ml-card">
              <h4>How the capsules were picked</h4>
              <p>Each capsule has one default and one or two alternates. The defaults are the ones a store upload reads; the alternates stay as labelled options for jawad&apos;s pick. Every file is 1920 × 1080 and carries the same wordmark, and none of them introduces a game, a name or a look that isn&apos;t in the build.</p>
            </div>
          </div>
        </Section>

        <Section id="today" eyebrow="Today · 18 Nov" title="The game today">
          <div className="ml-col">
            <p>
              Derelict Depths is a co-op action mining crawler. Up to four friends drop into a mine as their own Roblox avatars. They swing, dig, dodge,
              crack glowing ore and fight down to each floor&apos;s guardian, then go back to town to forge gear, trade, fill the Vigil fire and dive deeper.
              A dive takes minutes, so a phone player at a bus stop can finish one and a group of friends can do three in a session.
            </p>
            <p>
              The release is floors one and two, <strong>Topsoil Tunnels</strong> and <strong>Iron Halls</strong>, built end to end, with the engine
              playthrough still pending: the first thirty minutes, the tutorial, both guardians, the forge and the town around them. Everything below is on the game repo&apos;s main branch today, and
              each card names the modules that hold it.
            </p>
          </div>
          <div className="ml-sys">
            {SYSTEMS.map((s) => (
              <div className="ml-card" key={s.name}>
                <h4>{s.name}</h4>
                <p>{s.body}</p>
                <small>{s.code}</small>
              </div>
            ))}
          </div>
          <div className="ml-col">
            <h3 className="ml-h3">What a player meets, in order</h3>
            <p>
              The title hands the camera straight to the game. The Elder&apos;s card teaches one thing at a time (move, swing, fight, mine), the first dive
              cannot kill a brand-new player, and the first guardian falls in the first sitting. Everything after that is choice: which class to open, which
              chest to spend on, how deep to push before banking.
            </p>
          </div>
          <Table
            head={["Part of the game", "Where it lives"]}
            rows={[
              ["The dive", "A cage descent, chambers with locked doors, detour rooms, a miniboss, then the floor's guardian"],
              ["The town", "Lift, Smeltery, forge, NPC stalls, crew board, Hall of Delvers, the Vigil fire"],
              ["Your character", "Class, talents, level, gear, and several characters on one account"],
              ["What you bring back", "Ore and bars, coins, relic cards, chest picks, crew points"],
              ["Who you bring", "A party of up to four, crews across servers, trades that both sides confirm"],
              ["How hard it is", "Gloom 0 to V per floor, and a Gloom Surge on a clock"],
            ]}
          />
        </Section>

        <Section id="look" eyebrow="The look" title="Painted 3D, hard pixels">
          <div className="ml-col">
            <p>
              The look being built is painted 3D with hard pixels on top: block-built rooms with ink edges and a coarse pixel grain, and characters and
              monsters that keep their pixels at any distance. The second half is the hard part, because Roblox only keeps pixels hard on some surfaces,
              so the crew measured which ones before drawing anything.
            </p>
            <ul className="ml-list">
              <li><strong>Hard pixels need the right surface.</strong> An <code>ImageLabel</code> on a SurfaceGui or a BillboardGui keeps a 16-pixel sprite crisp at any size with <code>ResampleMode = Pixelated</code>. A SurfaceAppearance, a Decal or a Texture is filtered bilinearly whatever the setting says, so those get drawn small and upscaled nearest-neighbour before upload (the crew&apos;s 8× rule).</li>
              <li><strong>Monsters and heroes are 16-direction sprites.</strong> 16 angles from the front round to the back, so a monster turns like a painted model rather than sliding a flat card. Idle runs at 6 frames a second, an attack at 12, and a redraw costs about 3 ms.</li>
              <li><strong>One billboard, one creature.</strong> A guardian&apos;s sprite is a 12 × 15 stud billboard, and it measures brighter and more colourful than a texture-mapped mesh of the same monster, which is what makes it read on a phone.</li>
              <li><strong>The cel base underneath.</strong> One workspace attribute switches the cel look on: palettes from each floor&apos;s style kit bake lit, mid and shadow tones, every visible body gets an ink shell and a light band, and a pixel filter swaps the cel masks for a coarse grained version. The UI is never filtered.</li>
            </ul>
          </div>
          <div className="ml-pair">
            <Shot name="look-king-front" w={1583} h={1080} kind="Look study" title="The guardian, two ways" note="Left: the textured mesh. Right: the same monster as a sprite billboard. Photographed in Studio on a bare floor, not in the game." />
            <Shot name="look-king-slash" w={1583} h={1080} kind="Look study" title="A sprite mid-slash" note="One frame of the slash, drawn once. Idle is 6 frames a second and the slash 12." />
          </div>
          <div className="ml-pair">
            <Shot name="look-pixels-label" w={1354} h={1080} kind="Look study" title="Pixels that stay hard" note="The same 16-pixel image twice: the left one keeps its pixels on an ImageLabel, the right one is blurred by the default filter." />
            <Shot name="look-pixels-mesh" w={1354} h={1080} kind="Look study" title="Pixels a mesh blurs" note="On a mesh surface the same setting changes nothing: both halves blur, which is why those textures are upscaled before upload." />
          </div>
          <div className="ml-pair">
            <Shot name="splat-room-before" w={1280} h={667} kind="Look study" title="Room one, the toggle off" note="A Topsoil start room with the new pixel effects switched off. 0.22% of the frame changes when they come on." />
            <Shot name="splat-room-after" w={1280} h={667} kind="Look study" title="Room one, the toggle on" note="The same frame with them on: mobs and walls swap live, with no other change." />
          </div>
          <div className="ml-pair">
            <Shot name="splat-halls-before" w={1280} h={667} kind="Look study" title="Iron Halls, off" note="A golem and a miner in room one of Iron Halls." />
            <Shot name="splat-halls-after" w={1280} h={667} kind="Look study" title="Iron Halls, on" note="The same frame with the pixel effects on: 1.5% of the pixels change." />
          </div>
          <div className="ml-col">
            <p>
              Every shot above is a Studio study from 18 Nov, on the game&apos;s own camera but a preview build rather than the shipped place, which is where
              a look is proved before it lands. The rooms under Captures are the game itself.
            </p>
          </div>
        </Section>

        <Section id="captures" eyebrow="Captures" title="The game, in its own screens">
          <div className="ml-col">
            <p>
              Captured in Studio play from the game place on build <code>47ba0d7</code> (17 Nov, 08:55), with the game camera and the HUD on. The hero is a
              real Roblox avatar. The release capture set replaces these as soon as it lands; until then these are the frames that exist, shown as they were
              taken, and the interface and the look have moved on since.
            </p>
          </div>
          <div className="ml-stills">
            <Still name="town" title="The town" note="The Lift in the middle, the stations and their keepers around it." />
            <Still name="dive" title="The dive" note="The cage ride down the shaft onto the landing spot." />
            <Still name="ore-room" title="A Topsoil ore room" note="Lit tops, mid sides, ink edges, the ability arc bottom right." />
            <Still name="fight" title="A fight" note="The swing, the tell and the number, on the same frame." />
            <Still name="dodge" title="A dodge" note="Movement values are locked by a test." />
            <Still name="loot" title="Loot" note="Drops scatter from broken ore and fallen enemies." />
            <Still name="mole-king" title="The Mole King" note="The boss bar names the phase." />
            <Still name="mole-king-2" title="The Mole King, phase two" note="The guardian at full size under the game camera." />
            <Still name="results" title="The results card" note="Depth, kills, time, best combo and XP, then DIVE AGAIN or TOWN." />
            <Still name="flip-reveal" title="A rarity reveal" note="The card flips for the rare gets; rarity colours match the loot beams." />
            <Still name="forge" title="The forge" note="The timing strike: the beat is timed on the server." />
            <Still name="smeltery" title="The Smeltery" note="Ore becomes bars, five to one." />
            <Still name="gear" title="Gear" note="What you are wearing, on the same card language as everything else." />
          </div>
        </Section>

        <Section id="shipped-now" eyebrow="Live" title="Just shipped">
          <div className="ml-col">
            {feed ? (
              <>
                <FeedMeta feed={feed} renderedAt={renderedAt} />
                <LatestShipped feed={feed} />
                <p style={{ marginTop: 14 }}><a href="#shipped">Every merged PR, grouped by hour →</a></p>
              </>
            ) : (
              <p className="ml-note">The live feed is unavailable right now. It refreshes every 3 minutes.</p>
            )}
          </div>
        </Section>

        <Section id="launch" eyebrow="Live · today" title="Launch board">
          <LaunchBoard launch={launch} renderedAt={renderedAt} />
        </Section>

        <Section id="visuals" eyebrow="Live · hourly" title="Latest visuals">
          <LatestVisuals />
        </Section>

        <Section id="loop" eyebrow="01 · The player's view" title="The core loop">
          <div className="ml-col">
            <p>
              Town, dive, mine, fight, the guardian, bank, smelt, forge, dive again. The banking step is the one real decision in it: ore only counts once
              it is banked at a Lift station, and a wipe keeps your gear but loses whatever wasn&apos;t banked, so every room deeper is a bet.
            </p>
          </div>
          <Diagram name="loop" alt="Flowchart of the core loop: town, the Lift pad, dropping in, clearing chambers while mining and fighting, the miniboss, the guardian, banking at the Lift station, the results card, then the Smeltery, the forge and back to town." caption={<><b>The core loop.</b> Dashed: the wipe path.</>} />
          <div className="ml-col">
            <p>The loop nests. Each ring has its own length and its own reward, and a player who quits has broken out of one of them.</p>
          </div>
          <Diagram name="loops" alt="Five nested loops: the swing in about a second, the fight in 20 to 40 seconds, the dive in 5 to 8 minutes, the session in 15 to 30 minutes, and the return over days and weeks." caption={<><b>Five loops, from one swing to one month.</b></>} />
        </Section>

        <Section id="dive" eyebrow="02 · Run state" title="A dive, as the server sees it">
          <div className="ml-col">
            <p>
              A dive is one expedition, owned by the server&apos;s <code>Run</code> service. The run moves through <code>lobby</code>, <code>countdown</code>,{" "}
              <code>running</code> and <code>results</code>, and publishes its state as workspace attributes (<code>RunState</code>, <code>BossPhase</code>) that
              every client reads. Inside a run, each chamber is <code>idle</code> until a hero walks in, <code>active</code> with its doors locked until the
              last wave falls, then <code>cleared</code>.
            </p>
          </div>
          <Diagram name="run-state" alt="State diagram: lobby to countdown when a hero steps on the Lift pad, to running after 5 seconds, to results after banking or a wipe; inside running, chambers go idle, active, cleared, and heroes go up, downed and revived." caption={<><b>Run.state on the server.</b> One expedition per server for now.</>} />
          <Table
            head={["Rule", "Number"]}
            rows={[
              ["Lift pad countdown", "5 s"],
              ["Party size", "1 to 4"],
              ["Starting hearts and bombs", "3 hearts (6 half hearts), 3 bombs"],
              ["Revive", "2 s within 4.5 studs, back with 2 half hearts"],
              ["After a hit", "1 s invulnerable, 5 studs of knockback"],
              ["First dive", "Topsoil 1-1, the mole can't hurt a new miner before their first hit"],
            ]}
          />
        </Section>

        <Section id="world" eyebrow="03 · The world" title="Floors and Gloom">
          <div className="ml-col">
            <p>
              Six floors sit under a surface town, and eight layers of rock in total. Topsoil Tunnels and Iron Halls are the ones the release ships. Each
              floor has to earn its place with one new idea, a new enemy behaviour, a hazard or a new use for the lamp, and its own palette inside the shared
              style kit. The deeper you go the stranger it gets, but never muddier: even the Core glows rather than going dark.
            </p>
          </div>
          <div className="ml-grid two" style={{ alignItems: "start" }}>
            <Diagram name="floors" alt="The six floors in order under the town: Topsoil and Iron Halls playable, Crystal Grotto shut, Fungal Depths, Magma Forge and The Core greyboxed." caption={<><b>The floors today.</b></>} />
            <div>
              <h3 className="ml-h3" style={{ marginTop: 0 }}>Gloom: difficulty per floor</h3>
              <p>Each floor has Gloom levels 0 to V. Beating the floor&apos;s guardian at your highest Gloom unlocks the next. All the extra danger arrives at Gloom I; after that each level changes how the dive plays, and the reward keeps climbing.</p>
              <Table
                head={["Gloom", "Adds", "Yield, XP"]}
                rows={[
                  ["0", "the base dive", "x1"],
                  ["I · Restless", "enemies x1.5 HP, x1.25 damage", "x1.25"],
                  ["II · Dim", "the lamp shrinks to x0.75", "x1.5"],
                  ["III · Swarming", "+1 enemy a wave, an extra wild card", "x2"],
                  ["IV · Unstable", "the rumble fills x1.5 faster", "x2.5"],
                  ["V · Warden", "guardians x2 HP", "x3"],
                ]}
              />
            </div>
          </div>
        </Section>

        <Section id="bestiary" eyebrow="04 · Enemies" title="Bestiary and minibosses">
          <div className="ml-col">
            <p>
              Enemies are built from a few shared behaviours, each with a tell, an attack and a recovery window. A new enemy is mostly data (its look, its
              numbers, which behaviour), so the bestiary grows fast and players learn a small set of tells that keeps paying off. Every enemy file opens
              with the line a kid would say about it.
            </p>
          </div>
          <Diagram name="roles" alt="Each enemy role and the answer it asks for: chargers, exploders, buffers, shields, ranged enemies and burrowers." caption={<><b>Roles and their answers.</b></>} />
          <Table
            head={["Enemy", "Floor", "Role", "HP", "Shortest tell", "How to beat it"]}
            num={[3, 4]}
            rows={[
              ["Rat", "Topsoil", "lunger", "2", "20 f", "Sidestep the lunge, then punish its 0.75 s recovery."],
              ["Mole", "Topsoil", "burrower", "4", "28 f", "It dives, then bites; hit it right after the bite."],
              ["Fizzbug", "Topsoil", "exploder", "2", "45 f", "It blows up! Run, or whack it at enemies."],
              ["Glowmoth", "Topsoil", "buffer", "2", "30 f", "The shiny moth shields its friends. Catch it first!"],
              ["Shellback", "Topsoil", "shield", "5 / 8", "30 f", "Hit it from behind, or bomb it."],
              ["Spitbulb", "Topsoil", "ranged", "3 / 5", "30 f", "It spits seeds. Stand outside the circle."],
              ["Bolt Thrower", "Iron Halls", "ranged", "3 / 5", "36 f", "Red line? Get out of the line."],
              ["Drillmite", "Iron Halls", "burrower", "3", "30 f", "Shaking rock means a mite inside."],
              ["Foreman", "Iron Halls", "buffer", "5", "36 f", "Bell guy speeds up and wakes the others. Get him first!"],
              ["Ironclad", "Iron Halls", "shield", "6", "30 f", "Go around the shield, or bomb it."],
              ["Kegling", "Iron Halls", "exploder", "1", "60 f", "Kick it at the enemies!"],
              ["Railrunner", "Iron Halls", "charger", "6", "45 f", "Glowing lane? Step aside, then whack it."],
            ]}
          />
          <div className="ml-grid two">
            <div className="ml-card">
              <h4>Thornmaw, The Old Bulb</h4>
              <p>Topsoil&apos;s miniboss. 30 HP, a ranged plant with a 42-frame tell. Break its bark, then hit the bulb, and stay out of the circles and the thorn lines.</p>
            </div>
            <div className="ml-card">
              <h4>Rattletrap, The Runaway Cart</h4>
              <p>Iron Halls&apos; miniboss. 34 HP, a charger with a 45-frame tell. Jump out of its lane twice, then kick its kegs back at it.</p>
            </div>
          </div>
          <div className="ml-col">
            <p>
              A miniboss is a short, loud spike of 20 to 40 seconds in the middle of a dive: an intro card, a health bar at the top of the screen, a two-step
              pattern and a guaranteed loot beam. Its health scales with the party, and the beam drops one reward per player. Each floor&apos;s miniboss
              teaches the move its guardian will test.
            </p>
            <h3 className="ml-h3">The Mole King</h3>
            <p>
              Topsoil&apos;s guardian has 60 HP and a stagger bar of 12 hits. A party fights three named phases; a lone hero below Gloom I gets a shorter
              two-phase fight, so the boss is beatable solo without being trivial in a group.
            </p>
          </div>
          <Diagram name="moleking" alt="The Mole King's phases: intro, DIG, CLOD STORM and CAVE-IN for a party, or DIG then ENRAGED for a lone hero, with the numbers of each attack." caption={<><b>The Mole King's fight.</b> The Rust Golem (75 HP, Iron Halls) runs SLAM, ROCKET FIST, OVERHEAT.</>} />
        </Section>

        <Section id="progression" eyebrow="05 · Getting stronger" title="Progression">
          <div className="ml-col">
            <p>
              Ore becomes bars at the Smeltery (five ore to one bar), bars become gear at the forge, and gems become charms at the jeweller. The pickaxe ladder
              is the spine: each tier breaks harder rock, which opens rarer ore, which pays for the next tier. Every ore must feed at least one recipe, and a
              content test enforces it.
            </p>
          </div>
          <Diagram name="progression" alt="Ore to bars to gear: the pickaxe ladder from wooden to starmetal with the level each needs, and rebirth at level 30." caption={<><b>Ore to gear.</b> Level gates from the recipes on main.</>} />
          <Table
            head={["Class", "Unlock", "Ability", "Ult"]}
            rows={[
              ["Miner", "from the start", "Strike the Vein (8 s): a heavy slam that dazes and breaks the rock around you", "Cave Breaker: leap and slam"],
              ["Demolitionist", "6 copper bars, depth 2", "The Big One (20 s): a huge charge that opens tunnels", "Carpet Charge: five bombs in a line"],
              ["Prospector", "6 tin bars, depth 2", "Mark the Jackpot (15 s): the party hits marked enemies harder", "Lucky Strike: a fan of piercing gold nuggets"],
              ["Alchemist", "6 iron bars, depth 3", "Transmute (12 s): a flask that sets up a friend's combo", "Golden Brew: the party heals two hearts, untouchable for 3 s"],
            ]}
          />
          <div className="ml-grid three">
            <div className="ml-card"><h4>Levels</h4><p>Cap 50. Each level needs 80 × L<sup>1.45</sup> XP: 8,099 in total for level 10, 130,288 for 30, 463,101 for 50.</p></div>
            <div className="ml-card"><h4>Skill points</h4><p>One per level, two at levels 10 and 25, spent in a shared mining tree and one constellation tree per class. A node needs any one of its prerequisites; the root is free.</p></div>
            <div className="ml-card"><h4>Rebirth</h4><p>From level 30 with a Heartstone. It resets gear and the bank, keeps classes and cosmetics, and adds x0.25 yield each time, up to x5.</p></div>
          </div>
          <div className="ml-col">
            <p>
              Several characters can live on one account. One is the main you push furthest; the others keep their own class, gear and level while sharing the
              account&apos;s bonuses, so trying a second build never means throwing the first away. Nothing is bound to the character that forged it either: the
              town&apos;s vault moves gear between them, and class and level decide who can wear it.
            </p>
          </div>
        </Section>

        <Section id="feel" eyebrow="06 · Game feel" title="Combat feel in frames">
          <div className="ml-col">
            <p>
              The game counts in frames at 60 a second. Three numbers do most of the work: <strong>hit-stop</strong> freezes the game 4 frames on a hit and 6 on
              a kill (long enough to feel, short enough not to read as lag), an <strong>8-frame input buffer</strong> means a press 133 ms early still counts,
              and a <strong>perfect dodge</strong> in the first 10 frames of an enemy&apos;s hit makes your next hit a x2 crit, which turns defence into offence.
            </p>
          </div>
          <figure className="ml-fig ml-wide">
            <div className="ml-fig-body"><div className="ml-svg-box"><SwingFrames /></div></div>
            <figcaption><span><b>The Miner&apos;s moves.</b> Every ult winds up exactly 39 frames, so its sound lands on the beat.</span></figcaption>
          </figure>
          <Table
            head={["Feel value", "Number"]}
            rows={[
              ["Combo window", "14 f (233 ms)"],
              ["Input buffer", "8 f (133 ms)"],
              ["Hit-stop: hit, kill", "4 f (67 ms), 6 f (100 ms)"],
              ["Shortest enemy telegraph allowed", "18 f (300 ms)"],
              ["Dash", "10 f, 8 studs, i-frames f1 to f8, 2 pips"],
              ["Dodge roll", "16 f, 7 studs, i-frames f1 to f13, 24 f cooldown"],
              ["Walk speed", "15 studs/s; x0.25 while a swing starts, x0.6 in recovery"],
              ["Bomb", "1.5 s fuse, 8 stud radius, 20 damage to rock"],
              ["Ult charge", "hit 1.5%, kill 3%, perfect dodge 10%, co-op combo 10%"],
            ]}
          />
        </Section>

        <Section id="camera" eyebrow="07 · Camera and controls" title="The camera, and one click">
          <div className="ml-col">
            <p>
              The camera follows on its own from over the hero&apos;s right shoulder, so the view is cinematic and the keys stay world-steady: no right-drag,
              no zoom, no rotate key, which means a trackpad or a thumb is enough. The hero is an R6 rig wearing the player&apos;s own avatar, and the camera
              keeps its distance rather than pulling in, because rock between the eye and the hero fades instead of hiding them. The earlier forge-style
              follow (a held yaw, {cam.pitch}° down, {cam.distance} studs back) is still in the build as a setting.
            </p>
          </div>
          <figure className="ml-fig ml-wide">
            <div className="ml-fig-body"><div className="ml-svg-box"><CameraRig cam={cam} /></div></div>
            <figcaption><span><b>View.FORGE on main.</b> The held follow the shoulder style was built from, still selectable.</span></figcaption>
          </figure>
          <Table
            head={["Key in View.FORGE", "Value", "What it does"]}
            rows={[
              ["fov", String(cam.fov) + "°", "vertical field of view, Roblox's default"],
              ["pitch", String(cam.pitch) + "°", "degrees down, held: the player never tilts it"],
              ["yaw", String(cam.yaw) + "°", "held in town and in the mine; nothing the hero does turns it"],
              ["distance", String(cam.distance) + " studs", "eye to look point when nothing is in the way"],
              ["focusHeight", String(cam.focusHeight) + " studs", "look point above the hero's root, so the hero sits a little low"],
              ["popMargin, popMin", String(cam.popMargin) + ", " + String(cam.popMin) + " studs", "how the eye pops in front of a wall"],
              ["popOutSmooth", String(cam.popOutSmooth) + " s", "easing back out once the wall is gone"],
              ["teleport", String(cam.teleport) + " studs", "a jump this big in one frame (a respawn, the Lift) resets the camera"],
              ["focusEase, focusPull", String(cam.focusEase) + " s, " + String(cam.focusPull), "a boss intro eases onto its point and pulls in"],
            ]}
          />
          <h3 className="ml-h3">Controls</h3>
          <div className="ml-grid three">
            <div className="ml-card"><h4>PC</h4><p>WASD to move, <strong>click to swing</strong>, Space to dash, E for a bomb, F for the ability, R for the ult, 1 to 9 for the hotbar.</p></div>
            <div className="ml-card"><h4>Phone</h4><p>A thumbstick and one big SWING button, with the dash, bomb, ability and ult on an arc around it. The hotbar sits along the bottom and takes a tap.</p></div>
            <div className="ml-card"><h4>Click to swing</h4><p>The client plays the swing at once and sends an intent; the server decides what it hit. A hit is never the client&apos;s claim.</p></div>
          </div>
          <Diagram name="input" alt="Sequence diagram of one swing: the player clicks, the client plays the swing and sends an Attack intent, the server rate-limits and validates it, resolves the hit and broadcasts it, and every client plays the flash, sound and number." caption={<><b>One click, end to end.</b></>} />
        </Section>

        <Section id="ui" eyebrow="08 · Interface" title="UI">
          <div className="ml-col">
            <p>
              The interface is {c.uiModules} client modules on one design system: tokens for the palette, a pixel grid, type and motion, and a lint that refuses
              hand-written tweens so every screen opens, closes and presses the same way. The style is RPG: framed panels, rarity colours that match the
              world&apos;s loot beams, big numbers and a live title scene where the player&apos;s own avatar stands in the grove and PLAY hands the camera straight
              to the game.
            </p>
            <p>
              In play the HUD is deliberately small: health is a bar with its number, the hotbar runs along the bottom (keys 1 to 9, or a tap), and loot arrives
              as a card rather than a list. Every number a player reads goes through one formatter, so ore, coins and damage climb 1.2K, 4.8M, 2.1B without
              ever wrapping the line.
            </p>
          </div>
          <Diagram name="ui" alt="The UI layers from the world up: nametags, the HUD, announcements, panels, the results card, then toasts and the tutorial card, all styled by shared tokens." caption={<><b>What draws over what.</b></>} />
          <div className="ml-col">
            <p>Since 17 Nov a UI score counts only when it comes from the locked blind check against the best RPG game interfaces, anchored on jawad&apos;s own scores (JAW-156). His scale and scores are under Latest visuals.</p>
          </div>
        </Section>

        <Section id="audio" eyebrow="09 · Sound" title="Audio">
          <div className="ml-col">
            <p>
              Every hit is layered (a transient, a body and a tail) with small pitch and volume variations so repeats never sound copied. A mixer caps how
              many sounds of each kind play at once and lets the louder or nearer one win; the effects bus tames the top end for phone speakers. The music is
              an adaptive director whose tension stems rise in fights and boss lairs and duck under big moments. Guards in the tests check that every moment
              of the loop has a cue and that each bus sits inside its loudness window.
            </p>
          </div>
          <Diagram name="audio" alt="Audio flow: game events trigger layered cues, the mixer caps and prioritises them, the Sfx sound group plays them, and the adaptive music director ducks under big moments." caption={<><b>Sound, from event to speaker.</b></>} />
        </Section>

        <Section id="architecture" eyebrow="10 · Architecture" title="Server-authoritative, one script each side">
          <div className="ml-col">
            <p>
              The server is a single script that requires every service in a fixed order and registers each in a shared registry, <code>G</code>, so services
              call each other at runtime without circular requires. The server creates every remote. Clients only send intents; each is checked for type, range,
              rate and state by the service that handles it, and a per-player token bucket limits each remote. Results come back as events, and positions stream
              over an unreliable remote.
            </p>
          </div>
          <Diagram name="arch" alt="Architecture: client modules send intent events to the server's services, registered in G; the server answers with the Event remote and an unreliable Snapshot; Meta keeps the session-locked profile." caption={<><b>Client, remotes and server.</b></>} />
          <Table
            head={["Remote", "Direction", "Purpose"]}
            rows={[
              ["Attack, Dash, Bomb, Ability", "client to server", "combat intents, with a flat aim direction"],
              ["UseItem, UseSlot, CombineSlot, Pickup", "client to server", "items and the hotbar"],
              ["Station, Wildcard", "client to server", "town stations, wild-card picks"],
              ["FirstDive, DiveAgain, ToTown", "client to server", "run flow"],
              ["Event", "server to clients", "every result: hits, loot, announcements, results"],
              ["Snapshot (unreliable)", "server to clients", "positions, every frame, dropped if late"],
            ]}
          />
          <h3 className="ml-h3">Saves</h3>
          <div className="ml-col">
            <p>
              Progress lives in a session-locked profile (ProfileStore), autosaved and saved on leave. The only way a run touches the save is banking at a Lift
              station; run-only currencies stay out of it, and a test proves the two never collide. The forge&apos;s timing mini-game is timed on the server, so
              a client can&apos;t claim a perfect rhythm. A fuzz test throws random sequences at the progress rules, and a fairness test holds the line that
              nothing sells power.
            </p>
          </div>
          <Diagram name="saves" alt="Sequence diagram of a save's life: the profile loads session-locked on join, the run banks the haul into it, the server times forge strikes, and the profile saves and releases on leave." caption={<><b>A save&apos;s life.</b></>} />
        </Section>

        <Section id="forge" eyebrow="11 · Tooling" title="The forge toolchain">
          <div className="ml-col">
            <p>
              <code>forge</code> is the judge every change passes. It is written in Lune, so it runs the same on a Mac and on the Linux build boxes, every
              command takes <code>--json</code>, and any failure exits 1. Game content is TOML ({c.contentToml} files: ores, recipes, enemies, frame data, the
              camera) that forge compiles into typed Luau, so balance changes are data and a validator can refuse a bad one before it ever runs.
            </p>
          </div>
          <Diagram name="forge" alt="The forge check pipeline: Rojo sourcemap, luau-lsp strict analysis, selene, stylua, the Lune unit tests, the content validators and the asset manifest rules." caption={<><b>forge check, in order.</b> CI runs it as four parts: the static steps and three test shards.</>} />
          <Table
            head={["Command", "What it does"]}
            rows={[
              [<code key="a">check</code>, "the whole pipeline above; --only and --shard run parts"],
              [<code key="b">content compile</code>, "TOML in, typed Luau out, validated"],
              [<code key="c">build</code>, "the place file; the same commit always gives the same bytes"],
              [<code key="d">studio-test</code>, "in-engine tests in a leased Studio window, multiplayer with --players N"],
              [<code key="e">engine-test</code>, "the same tests headless through Open Cloud, no Studio and no Mac"],
              [<code key="f">remotefuzz</code>, "attacks every declared remote from a real client and fails on any that doesn't say no"],
              [<code key="g">perfbudget</code>, "scripted load in a multiplayer test against the frame and memory budget"],
              [<code key="h">stills</code>, "the visual CI's still set at 1920x1080 and phone size"],
            ]}
          />
          <h3 className="ml-h3">The Studio broker</h3>
          <div className="ml-col">
            <p>
              Studio is a scarce resource, and two windows starting at the same moment fight over one licence. So every agent reaches Studio through a broker:
              it hands out short leases on private copies of a place, starts one window at a time, times out hung calls, checks answers aren&apos;t cut, and
              refuses data store writes, publishes and edits to scripts (the repo owns the scripts, Studio is only a sync target).
            </p>
          </div>
          <Diagram name="broker" alt="Sequence diagram: a crew thread leases a Studio window from the broker, which queues, guards and times out its calls, then releases and reaps the window." caption={<><b>A Studio lease.</b> Leases run about 12 minutes.</>} />
          <h3 className="ml-h3">JoinBudget</h3>
          <div className="ml-col">
            <p>
              What a phone must download before it can play is the place itself, so a test holds two lines: {n(jb.instancesLine)} join instances and a byte line
              for the place. A PR that grows the join past them has to take something out first, or raise the line with the reason in the PR. The line was raised
              four times on purpose for the visual push, and it has to come back down to {n(jb.publishLine)} bytes before publish.
            </p>
          </div>
          <figure className="ml-fig ml-wide">
            <div className="ml-fig-body"><div className="ml-svg-box"><JoinBudget history={joinHistory} publishLine={jb.publishLine} /></div></div>
            <figcaption><span><b>Place bytes against the line, main by main.</b> Gold: the latest main, measured by the refresh job the way the test measures it.</span></figcaption>
          </figure>
        </Section>

        <Section id="trains" eyebrow="12 · Shipping" title="CI and merge trains">
          <div className="ml-col">
            <p>
              Nobody merges by hand. Every 30 minutes a merge train takes every PR labelled <code>train</code>, merges the batch onto main and runs forge check on
              a build box. If it passes, each PR is squash-merged at exactly the code that was tested. If it fails, the train splits the batch in half until it
              finds the culprit, comments the failing lines on it and sends it back. A PR that touches the join budget rides first and alone, so one shared line
              can&apos;t fail every half of a bisect.
            </p>
            <p>
              CI runs on self-hosted runners on the build boxes, so jobs spend no GitHub minutes. On a box, every check waits for a slot in a scheduler (four at
              once on a 16 GB box) so checks never run a box out of memory, and below 2 GB of free disk it starts nothing new.
            </p>
          </div>
          <Diagram name="train" alt="Merge train flowchart: labelled PRs, a timer at :25 and :55, budget PRs first, the batch check, squash-merge on pass, bisect on fail, then CI on main." caption={<><b>A merge train.</b></>} />
        </Section>

        <Section id="crew" eyebrow="13 · The studio" title="How the agent crew builds it">
          <div className="ml-col">
            <p>
              Derelict Depths is built by a crew of AI agents with one human director. A Captain agent turns direction into briefs and gives every piece of work
              one owner. About thirty crew agents each own a lane (the look, UI, combat, floors, audio, the camera, the tools) and work spec, tickets, tests
              first, code, forge check, playbot, review, pull request. Cheaper models draft the bulk tickets on the build boxes, and a stronger model reviews
              everything before it lands.
            </p>
            <p>
              Judges close the loop: a playbot that plays from town to the guardian to the results card, a locked, blind visual check that scores in-engine
              stills side by side against real references, and a blind tester that plays from screenshots like a first-timer. Every failure they find becomes a
              guard, a test, a lint rule or a workflow line, so the same mistake can&apos;t land twice.
            </p>
          </div>
          <Diagram name="crew" alt="The crew: director, Captain, crew agents, the swarm on the boxes, forge check, review, merge trains, main, then the playbot, visual judge and blind tester feeding lessons back as guards." caption={<><b>The machine that builds the game.</b></>} />
        </Section>

        <Section id="shipped" eyebrow="14 · Live" title="Everything that shipped">
          <div className="ml-col">
            <p>
              Every pull request merged into the game repo&apos;s main, newest first and grouped by the hour (London time), with a one-line plain summary. A job on
              the build box refreshes this list every 3 minutes; store and pricing work is kept private until launch.
            </p>
            <Feed feed={feed} renderedAt={renderedAt} />
          </div>
        </Section>

        <footer className="ml-foot">
          Numbers come from the game repo&apos;s main at <code>{facts.main.sha}</code> and the team&apos;s design docs. Diagrams are pre-rendered SVG, so the page
          works with JavaScript off.{" "}
          <Link href="/">jawadjalal.com</Link>
        </footer>
      </div>
    </div>
  );
}
