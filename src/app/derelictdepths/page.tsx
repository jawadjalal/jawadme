import type { Metadata } from "next";
import Link from "next/link";
import { Gilded } from "@/components/gilded/Gilded";
import { fontVars } from "../fonts";
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

const TITLE = "derelict depths: the game from the loop down to the toolchain";
const DESCRIPTION =
  "derelict depths, a co-op action mining crawler for roblox: the dive, the town, classes and talents, loot, the pixel-splat look, the camera, audio, the server-authoritative architecture and the agent crew that builds it, with a live feed of what shipped.";
const OG_ALT = "derelict depths key art: an in-engine capture of a miner in the golden room";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/derelictdepths" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/derelictdepths", type: "article", images: [{ url: "/derelictdepths/img/og.jpg", width: 1200, height: 630, alt: OG_ALT }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/derelictdepths/img/og.jpg"] },
};

const SECTIONS: [string, string][] = [
  ["art", "the release art"],
  ["today", "the game today"],
  ["look", "the look"],
  ["captures", "captures"],
  ["shipped-now", "just shipped"],
  ["launch", "launch board"],
  ["visuals", "latest visuals"],
  ["loop", "the core loop"],
  ["dive", "a dive, server side"],
  ["world", "floors and gloom"],
  ["bestiary", "bestiary and minibosses"],
  ["progression", "progression"],
  ["feel", "combat feel in frames"],
  ["camera", "camera and controls"],
  ["ui", "ui"],
  ["audio", "audio"],
  ["architecture", "server-authoritative architecture"],
  ["forge", "the forge toolchain"],
  ["trains", "ci and merge trains"],
  ["crew", "how the agent crew builds it"],
  ["shipped", "everything that shipped"],
];

const n = (v: number) => v.toLocaleString("en-gb");

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
    name: "the dive",
    body: "the lift lowers a cage down a shaft onto the landing spot, then a layer plays out of chambers: clear one and its doors unlock, so a dive is a chain of rooms ending in the floor's guardian.",
    code: "descent.luau · run.luau · chambers.luau",
  },
  {
    name: "the town",
    body: "a hub with the lift in the middle, the smeltery, the forge, npc stalls, a crew board, the hall of delvers and the vigil fire. it is where every dive starts and every haul gets settled.",
    code: "townplan.luau · meta/renown.luau · meta/vigil.luau",
  },
  {
    name: "classes",
    body: "four of them, each with an ability and an ult: the miner, the demolitionist, the prospector and the alchemist. each unlocks by banking a few bars and reaching a depth, so a new class is a reason for another dive.",
    code: "meta/progress.luau · content/meta/classes",
  },
  {
    name: "talents",
    body: "one skill point a level in a shared mining tree plus a constellation tree for each class. a node opens when any one of its prerequisites is learned, the root is free, and the top of every class tree holds a party perk.",
    code: "meta/trees.luau",
  },
  {
    name: "characters",
    body: "several characters on one account. one is the main you push furthest; the others share the account's bonuses and can be swapped in town, so a second character is a build, not a restart.",
    code: "meta/roster.luau · swap.luau",
  },
  {
    name: "loot on one card",
    body: "every get speaks the same card language: a big icon, a short name, a rarity colour and one plain line that never holds a number. relics, consumables and set pieces all read the same way.",
    code: "items.luau · itemrules.luau · itemscards.luau",
  },
  {
    name: "the reward room",
    body: "a chest per ore tier, from a free wood chest up to heartstone. the run's grade decides which ones open, each shows what is inside before you spend on it, so the room is a choice and a coin sink.",
    code: "chests.luau · runscore.luau",
  },
  {
    name: "detours and puzzles",
    body: "side chambers off the main line: spring rooms that launch you across, obby rooms, and puzzle rooms where you light four miners' lanterns in the order a chalk board shows, with a vault at the end.",
    code: "detours.luau · puzzle.luau · roommix.luau",
  },
  {
    name: "gloom and the surge",
    body: "gloom is a floor's difficulty, 0 to v. each level keeps every modifier below it, adds one named modifier and pays more. on a clock, a gloom surge rolls through and lifts everything for a while.",
    code: "gloom.luau · surge.luau",
  },
  {
    name: "parties and crews",
    body: "a party of up to four, with invites that time out and join asks posted on the town's crew board. crews live across servers: finishing the three daily crew tasks earns crew points for everyone in it.",
    code: "party.luau · meta/crews.luau · crewboard.luau",
  },
  {
    name: "trading",
    body: "two players open one window, put up coins, bank items and a note, both lock and both confirm. after a short countdown the save settles it, so a trade is never one side's claim.",
    code: "trade.luau · server/trades.luau",
  },
  {
    name: "the daily mine",
    body: "one try a day on a build the whole server shares, so the day's board means something. the gate checks the try and the lift are free before it asks the run to start.",
    code: "meta/dailygate.luau · meta/board.luau",
  },
  {
    name: "the first thirty minutes",
    body: "the opening is scripted to the second: what a brand-new player meets and when. a guard fails the build when a scripted beat lands late, so the pacing cannot drift.",
    code: "firstthirty.luau · firstthirtybeats.luau",
  },
  {
    name: "the vigil fire",
    body: "sit at lantern square's campfire, or just be away, and the lantern fills. a full lantern is three dives at plus a quarter luck, a third of it spent at each dive's start.",
    code: "meta/vigil.luau",
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
    <div className={"ml " + fontVars}>
      <div className="ml-wrap">
        <nav className="ml-top" aria-label="site">
          <Gilded variant="pill" href="/">← jawadjalal.com</Gilded>
        </nav>

        <header className="ml-hero">
          <div>
            <h1 className="ml-wordmark">
              <span>derelict</span> <span className="lt">depths</span>
            </h1>
            <p className="ml-kicker">a co-op action mining crawler for roblox</p>
            <p className="ml-lede">dig deep with your friends. smash monsters, crack glowing ore, beat the boss, forge better gear.</p>
            <p className="ml-sub">
              this page is the game as it stands today, and the machine that builds it: the dive a player feels, the systems under it, the look being
              built, and the numbers behind all of it. it is drawn from the game repo&apos;s main branch and the team&apos;s design docs. its shipped feed
              updates every 3 minutes, and its latest visuals every hour.
            </p>
            <p className="ml-links">
              <Gilded variant="pill" href="/reading/derelict-depths-book/">read the derelict depths book →</Gilded>
              <Gilded variant="pill" href="#art">the release art</Gilded>
            </p>
          </div>
          <figure className="ml-poster">
            <img src="/derelictdepths/img/poster-1280.jpg" srcSet="/derelictdepths/img/poster-640.jpg 640w, /derelictdepths/img/poster-768.jpg 768w, /derelictdepths/img/poster-1280.jpg 1280w" sizes="(min-width: 900px) 540px, 100vw" width={1280} height={720} alt="a miner raises a pickaxe in the golden room in front of the mole king" />
            <figcaption><span className="ml-badge art">in-engine + key art</span>a real in-engine capture of the golden room, graded, with rays and the title added.</figcaption>
          </figure>
        </header>

        <div className="ml-stats">
          <div className="ml-stat"><b>{n(c.mergedPRs)}+</b><span>pull requests merged into main</span></div>
          <div className="ml-stat"><b>{c.testFiles} + {c.engineTestFiles}</b><span>lune test files, plus in-engine test files</span></div>
          <div className="ml-stat"><b>{c.remotes}</b><span>remotes: the only doors from a client to the server</span></div>
          <div className="ml-stat"><b>2 floors</b><span>topsoil tunnels and iron halls are the release; {c.floors - 2} more are greyboxed</span></div>
          <div className="ml-stat"><b>{c.ores} ores</b><span>{c.bars} bars, and a pickaxe ladder above them</span></div>
          <div className="ml-stat"><b>{c.classes} classes</b><span>miner, demolitionist, prospector, alchemist</span></div>
          <div className="ml-stat"><b>r6 hero</b><span>your own roblox avatar, over a shoulder camera</span></div>
          <div className="ml-stat"><b>{n(jb.latestBuildBytes)} bytes</b><span>what a phone downloads to join, measured by joinbudget, against the {n(jb.bytesLine)} line</span></div>
        </div>

        <nav className="ml-toc" aria-label="contents">
          <ol>{SECTIONS.map(([id, label]) => <li key={id}><a href={"#" + id}>{label}</a></li>)}</ol>
        </nav>

        <Section id="art" eyebrow="visuals · release" title="the release art">
          <div className="ml-col">
            <p>
              the wordmark, the icon and the three store capsules, all built for release day. the capsules are the shots a player sees before any of the
              game: a dive, the mole king and an ore room. each alternates file is kept as a labelled option rather than shipped.
            </p>
          </div>
          <div className="ml-art">
            <figure className="ml-logo-fig">
              <img src="/derelictdepths/img/logo-1280.webp" srcSet="/derelictdepths/img/logo-640.webp 640w, /derelictdepths/img/logo-768.webp 768w, /derelictdepths/img/logo-1280.webp 1280w" sizes="(min-width: 760px) 720px, 100vw" width={1280} height={727} alt="the derelict depths wordmark" loading="lazy" decoding="async" />
              <figcaption><b>the wordmark</b><span className="ml-badge">logo</span>built in code, so every size is a redraw rather than a stretched image.</figcaption>
            </figure>
            <figure className="ml-icon-fig">
              <img src="/derelictdepths/img/icon-256.jpg" width={256} height={256} alt="the derelict depths icon" loading="lazy" decoding="async" />
              <figcaption><b>the icon</b><span className="ml-badge">store icon</span>what a player sees at thumbnail size in a list of games.</figcaption>
            </figure>
          </div>
          <div className="ml-pair">
            <Shot name="thumb-dive" w={1280} h={720} kind="store thumbnail" title="capsule one: the dive" note="a real capture, cropped to drop the hud labels, with the wordmark composited on." />
            <Shot name="thumb-king" w={1280} h={720} kind="store thumbnail" title="capsule two: the mole king" note="the guardian's arena, painted up from a real capture, with no generated lettering." />
          </div>
          <div className="ml-pair">
            <Shot name="thumb-ore" w={1280} h={720} kind="store thumbnail" title="capsule three: the ore room" note="a real capture of a topsoil ore room." />
            <div className="ml-card">
              <h3>how the capsules were picked</h3>
              <p>each capsule has one default and one or two alternates. the defaults are the ones a store upload reads; the alternates stay as labelled options for jawad&apos;s pick. every file is 1920 × 1080 and carries the same wordmark, and none of them introduces a game, a name or a look that isn&apos;t in the build.</p>
            </div>
          </div>
        </Section>

        <Section id="today" eyebrow="today · 18 nov" title="the game today">
          <div className="ml-col">
            <p>
              derelict depths is a co-op action mining crawler. up to four friends drop into a mine as their own roblox avatars. they swing, dig, dodge,
              crack glowing ore and fight down to each floor&apos;s guardian, then go back to town to forge gear, trade, fill the vigil fire and dive deeper.
              a dive takes minutes, so a phone player at a bus stop can finish one and a group of friends can do three in a session.
            </p>
            <p>
              the release is floors one and two, <strong>topsoil tunnels</strong> and <strong>iron halls</strong>, built end to end, with the engine
              playthrough still pending: the first thirty minutes, the tutorial, both guardians, the forge and the town around them. everything below is on the game repo&apos;s main branch today, and
              each card names the modules that hold it.
            </p>
          </div>
          <div className="ml-sys">
            {SYSTEMS.map((s) => (
              <div className="ml-card" key={s.name}>
                <h3>{s.name}</h3>
                <p>{s.body}</p>
                <small>{s.code}</small>
              </div>
            ))}
          </div>
          <div className="ml-col">
            <h3 className="ml-h3">what a player meets, in order</h3>
            <p>
              the title hands the camera straight to the game. the elder&apos;s card teaches one thing at a time (move, swing, fight, mine), the first dive
              cannot kill a brand-new player, and the first guardian falls in the first sitting. everything after that is choice: which class to open, which
              chest to spend on, how deep to push before banking.
            </p>
          </div>
          <Table
            head={["part of the game", "where it lives"]}
            rows={[
              ["the dive", "a cage descent, chambers with locked doors, detour rooms, a miniboss, then the floor's guardian"],
              ["the town", "lift, smeltery, forge, npc stalls, crew board, hall of delvers, the vigil fire"],
              ["your character", "class, talents, level, gear, and several characters on one account"],
              ["what you bring back", "ore and bars, coins, relic cards, chest picks, crew points"],
              ["who you bring", "a party of up to four, crews across servers, trades that both sides confirm"],
              ["how hard it is", "gloom 0 to v per floor, and a gloom surge on a clock"],
            ]}
          />
        </Section>

        <Section id="look" eyebrow="the look" title="painted 3d, hard pixels">
          <div className="ml-col">
            <p>
              the look being built is painted 3d with hard pixels on top: block-built rooms with ink edges and a coarse pixel grain, and characters and
              monsters that keep their pixels at any distance. the second half is the hard part, because roblox only keeps pixels hard on some surfaces,
              so the crew measured which ones before drawing anything.
            </p>
            <ul className="ml-list">
              <li><strong>hard pixels need the right surface.</strong> an <code>imagelabel</code> on a surfacegui or a billboardgui keeps a 16-pixel sprite crisp at any size with <code>resamplemode = pixelated</code>. a surfaceappearance, a decal or a texture is filtered bilinearly whatever the setting says, so those get drawn small and upscaled nearest-neighbour before upload (the crew&apos;s 8× rule).</li>
              <li><strong>monsters and heroes are 16-direction sprites.</strong> 16 angles from the front round to the back, so a monster turns like a painted model rather than sliding a flat card. idle runs at 6 frames a second, an attack at 12, and a redraw costs about 3 ms.</li>
              <li><strong>one billboard, one creature.</strong> a guardian&apos;s sprite is a 12 × 15 stud billboard, and it measures brighter and more colourful than a texture-mapped mesh of the same monster, which is what makes it read on a phone.</li>
              <li><strong>the cel base underneath.</strong> one workspace attribute switches the cel look on: palettes from each floor&apos;s style kit bake lit, mid and shadow tones, every visible body gets an ink shell and a light band, and a pixel filter swaps the cel masks for a coarse grained version. the ui is never filtered.</li>
            </ul>
          </div>
          <div className="ml-pair">
            <Shot name="look-king-front" w={1583} h={1080} kind="look study" title="the guardian, two ways" note="left: the textured mesh. right: the same monster as a sprite billboard. photographed in studio on a bare floor, not in the game." />
            <Shot name="look-king-slash" w={1583} h={1080} kind="look study" title="a sprite mid-slash" note="one frame of the slash, drawn once. idle is 6 frames a second and the slash 12." />
          </div>
          <div className="ml-pair">
            <Shot name="look-pixels-label" w={1354} h={1080} kind="look study" title="pixels that stay hard" note="the same 16-pixel image twice: the left one keeps its pixels on an imagelabel, the right one is blurred by the default filter." />
            <Shot name="look-pixels-mesh" w={1354} h={1080} kind="look study" title="pixels a mesh blurs" note="on a mesh surface the same setting changes nothing: both halves blur, which is why those textures are upscaled before upload." />
          </div>
          <div className="ml-pair">
            <Shot name="splat-room-before" w={1280} h={667} kind="look study" title="room one, the toggle off" note="a topsoil start room with the new pixel effects switched off. 0.22% of the frame changes when they come on." />
            <Shot name="splat-room-after" w={1280} h={667} kind="look study" title="room one, the toggle on" note="the same frame with them on: mobs and walls swap live, with no other change." />
          </div>
          <div className="ml-pair">
            <Shot name="splat-halls-before" w={1280} h={667} kind="look study" title="iron halls, off" note="a golem and a miner in room one of iron halls." />
            <Shot name="splat-halls-after" w={1280} h={667} kind="look study" title="iron halls, on" note="the same frame with the pixel effects on: 1.5% of the pixels change." />
          </div>
          <div className="ml-col">
            <p>
              every shot above is a studio study from 18 nov, on the game&apos;s own camera but a preview build rather than the shipped place, which is where
              a look is proved before it lands. the rooms under captures are the game itself.
            </p>
          </div>
        </Section>

        <Section id="captures" eyebrow="captures" title="the game, in its own screens">
          <div className="ml-col">
            <p>
              captured in studio play from the game place (17 nov, 08:55), with the game camera and the hud on. the hero is a
              real roblox avatar. the release capture set replaces these as soon as it lands; until then these are the frames that exist, shown as they were
              taken, and the interface and the look have moved on since.
            </p>
          </div>
          <div className="ml-stills">
            <Still name="town" title="the town" note="the lift in the middle, the stations and their keepers around it." />
            <Still name="dive" title="the dive" note="the cage ride down the shaft onto the landing spot." />
            <Still name="ore-room" title="a topsoil ore room" note="lit tops, mid sides, ink edges, the ability arc bottom right." />
            <Still name="fight" title="a fight" note="the swing, the tell and the number, on the same frame." />
            <Still name="dodge" title="a dodge" note="movement values are locked by a test." />
            <Still name="loot" title="loot" note="drops scatter from broken ore and fallen enemies." />
            <Still name="mole-king" title="the mole king" note="the boss bar names the phase." />
            <Still name="mole-king-2" title="the mole king, phase two" note="the guardian at full size under the game camera." />
            <Still name="results" title="the results card" note="depth, kills, time, best combo and xp, then dive again or town." />
            <Still name="flip-reveal" title="a rarity reveal" note="the card flips for the rare gets; rarity colours match the loot beams." />
            <Still name="forge" title="the forge" note="the timing strike: the beat is timed on the server." />
            <Still name="smeltery" title="the smeltery" note="ore becomes bars, five to one." />
            <Still name="gear" title="gear" note="what you are wearing, on the same card language as everything else." />
          </div>
        </Section>

        <Section id="shipped-now" eyebrow="live" title="just shipped">
          <div className="ml-col">
            {feed ? (
              <>
                <FeedMeta feed={feed} renderedAt={renderedAt} />
                <LatestShipped feed={feed} />
                <p style={{ marginTop: 14 }}><a href="#shipped">every merged pr, grouped by hour →</a></p>
              </>
            ) : (
              <p className="ml-note">the live feed is unavailable right now. it refreshes every 3 minutes.</p>
            )}
          </div>
        </Section>

        <Section id="launch" eyebrow="live · today" title="launch board">
          <LaunchBoard launch={launch} renderedAt={renderedAt} />
        </Section>

        <Section id="visuals" eyebrow="live · hourly" title="latest visuals">
          <LatestVisuals />
        </Section>

        <Section id="loop" eyebrow="01 · the player's view" title="the core loop">
          <div className="ml-col">
            <p>
              town, dive, mine, fight, the guardian, bank, smelt, forge, dive again. the banking step is the one real decision in it: ore only counts once
              it is banked at a lift station, and a wipe keeps your gear but loses whatever wasn&apos;t banked, so every room deeper is a bet.
            </p>
          </div>
          <Diagram name="loop" alt="flowchart of the core loop: town, the lift pad, dropping in, clearing chambers while mining and fighting, the miniboss, the guardian, banking at the lift station, the results card, then the smeltery, the forge and back to town." caption={<><b>the core loop.</b> dashed: the wipe path.</>} />
          <div className="ml-col">
            <p>the loop nests. each ring has its own length and its own reward, and a player who quits has broken out of one of them.</p>
          </div>
          <Diagram name="loops" alt="five nested loops: the swing in about a second, the fight in 20 to 40 seconds, the dive in 5 to 8 minutes, the session in 15 to 30 minutes, and the return over days and weeks." caption={<><b>five loops, from one swing to one month.</b></>} />
        </Section>

        <Section id="dive" eyebrow="02 · run state" title="a dive, as the server sees it">
          <div className="ml-col">
            <p>
              a dive is one expedition, owned by the server&apos;s <code>run</code> service. the run moves through <code>lobby</code>, <code>countdown</code>,{" "}
              <code>running</code> and <code>results</code>, and publishes its state as workspace attributes (<code>runstate</code>, <code>bossphase</code>) that
              every client reads. inside a run, each chamber is <code>idle</code> until a hero walks in, <code>active</code> with its doors locked until the
              last wave falls, then <code>cleared</code>.
            </p>
          </div>
          <Diagram name="run-state" alt="state diagram: lobby to countdown when a hero steps on the lift pad, to running after 5 seconds, to results after banking or a wipe; inside running, chambers go idle, active, cleared, and heroes go up, downed and revived." caption={<><b>run.state on the server.</b> one expedition per server for now.</>} />
          <Table
            head={["rule", "number"]}
            rows={[
              ["lift pad countdown", "5 s"],
              ["party size", "1 to 4"],
              ["starting hearts and bombs", "3 hearts (6 half hearts), 3 bombs"],
              ["revive", "2 s within 4.5 studs, back with 2 half hearts"],
              ["after a hit", "1 s invulnerable, 5 studs of knockback"],
              ["first dive", "topsoil 1-1, the mole can't hurt a new miner before their first hit"],
            ]}
          />
        </Section>

        <Section id="world" eyebrow="03 · the world" title="floors and gloom">
          <div className="ml-col">
            <p>
              six floors sit under a surface town, and eight layers of rock in total. topsoil tunnels and iron halls are the ones the release ships. each
              floor has to earn its place with one new idea, a new enemy behaviour, a hazard or a new use for the lamp, and its own palette inside the shared
              style kit. the deeper you go the stranger it gets, but never muddier: even the core glows rather than going dark.
            </p>
          </div>
          <div className="ml-grid two" style={{ alignItems: "start" }}>
            <Diagram name="floors" alt="the six floors in order under the town: topsoil and iron halls playable, crystal grotto shut, fungal depths, magma forge and the core greyboxed." caption={<><b>the floors today.</b></>} />
            <div>
              <h3 className="ml-h3" style={{ marginTop: 0 }}>gloom: difficulty per floor</h3>
              <p>each floor has gloom levels 0 to v. beating the floor&apos;s guardian at your highest gloom unlocks the next. all the extra danger arrives at gloom i; after that each level changes how the dive plays, and the reward keeps climbing.</p>
              <Table
                head={["gloom", "adds", "yield, xp"]}
                rows={[
                  ["0", "the base dive", "x1"],
                  ["i · restless", "enemies x1.5 hp, x1.25 damage", "x1.25"],
                  ["ii · dim", "the lamp shrinks to x0.75", "x1.5"],
                  ["iii · swarming", "+1 enemy a wave, an extra wild card", "x2"],
                  ["iv · unstable", "the rumble fills x1.5 faster", "x2.5"],
                  ["v · warden", "guardians x2 hp", "x3"],
                ]}
              />
            </div>
          </div>
        </Section>

        <Section id="bestiary" eyebrow="04 · enemies" title="bestiary and minibosses">
          <div className="ml-col">
            <p>
              enemies are built from a few shared behaviours, each with a tell, an attack and a recovery window. a new enemy is mostly data (its look, its
              numbers, which behaviour), so the bestiary grows fast and players learn a small set of tells that keeps paying off. every enemy file opens
              with the line a kid would say about it.
            </p>
          </div>
          <Diagram name="roles" alt="each enemy role and the answer it asks for: chargers, exploders, buffers, shields, ranged enemies and burrowers." caption={<><b>roles and their answers.</b></>} />
          <Table
            head={["enemy", "floor", "role", "hp", "shortest tell", "how to beat it"]}
            num={[3, 4]}
            rows={[
              ["rat", "topsoil", "lunger", "2", "20 f", "sidestep the lunge, then punish its 0.75 s recovery."],
              ["mole", "topsoil", "burrower", "4", "28 f", "it dives, then bites; hit it right after the bite."],
              ["fizzbug", "topsoil", "exploder", "2", "45 f", "it blows up! run, or whack it at enemies."],
              ["glowmoth", "topsoil", "buffer", "2", "30 f", "the shiny moth shields its friends. catch it first!"],
              ["shellback", "topsoil", "shield", "5 / 8", "30 f", "hit it from behind, or bomb it."],
              ["spitbulb", "topsoil", "ranged", "3 / 5", "30 f", "it spits seeds. stand outside the circle."],
              ["bolt thrower", "iron halls", "ranged", "3 / 5", "36 f", "red line? get out of the line."],
              ["drillmite", "iron halls", "burrower", "3", "30 f", "shaking rock means a mite inside."],
              ["foreman", "iron halls", "buffer", "5", "36 f", "bell guy speeds up and wakes the others. get him first!"],
              ["ironclad", "iron halls", "shield", "6", "30 f", "go around the shield, or bomb it."],
              ["kegling", "iron halls", "exploder", "1", "60 f", "kick it at the enemies!"],
              ["railrunner", "iron halls", "charger", "6", "45 f", "glowing lane? step aside, then whack it."],
            ]}
          />
          <div className="ml-grid two">
            <div className="ml-card">
              <h3>thornmaw, the old bulb</h3>
              <p>topsoil&apos;s miniboss. 30 hp, a ranged plant with a 42-frame tell. break its bark, then hit the bulb, and stay out of the circles and the thorn lines.</p>
            </div>
            <div className="ml-card">
              <h3>rattletrap, the runaway cart</h3>
              <p>iron halls&apos; miniboss. 34 hp, a charger with a 45-frame tell. jump out of its lane twice, then kick its kegs back at it.</p>
            </div>
          </div>
          <div className="ml-col">
            <p>
              a miniboss is a short, loud spike of 20 to 40 seconds in the middle of a dive: an intro card, a health bar at the top of the screen, a two-step
              pattern and a guaranteed loot beam. its health scales with the party, and the beam drops one reward per player. each floor&apos;s miniboss
              teaches the move its guardian will test.
            </p>
            <h3 className="ml-h3">the mole king</h3>
            <p>
              topsoil&apos;s guardian has 60 hp and a stagger bar of 12 hits. a party fights three named phases; a lone hero below gloom i gets a shorter
              two-phase fight, so the boss is beatable solo without being trivial in a group.
            </p>
          </div>
          <Diagram name="moleking" alt="the mole king's phases: intro, dig, clod storm and cave-in for a party, or dig then enraged for a lone hero, with the numbers of each attack." caption={<><b>the mole king's fight.</b> the rust golem (75 hp, iron halls) runs slam, rocket fist, overheat.</>} />
        </Section>

        <Section id="progression" eyebrow="05 · getting stronger" title="progression">
          <div className="ml-col">
            <p>
              ore becomes bars at the smeltery (five ore to one bar), bars become gear at the forge, and gems become charms at the jeweller. the pickaxe ladder
              is the spine: each tier breaks harder rock, which opens rarer ore, which pays for the next tier. every ore must feed at least one recipe, and a
              content test enforces it.
            </p>
          </div>
          <Diagram name="progression" alt="ore to bars to gear: the pickaxe ladder from wooden to starmetal with the level each needs, and rebirth at level 30." caption={<><b>ore to gear.</b> level gates from the recipes on main.</>} />
          <Table
            head={["class", "unlock", "ability", "ult"]}
            rows={[
              ["miner", "from the start", "strike the vein (8 s): a heavy slam that dazes and breaks the rock around you", "cave breaker: leap and slam"],
              ["demolitionist", "6 copper bars, depth 2", "the big one (20 s): a huge charge that opens tunnels", "carpet charge: five bombs in a line"],
              ["prospector", "6 tin bars, depth 2", "mark the jackpot (15 s): the party hits marked enemies harder", "lucky strike: a fan of piercing gold nuggets"],
              ["alchemist", "6 iron bars, depth 3", "transmute (12 s): a flask that sets up a friend's combo", "golden brew: the party heals two hearts, untouchable for 3 s"],
            ]}
          />
          <div className="ml-grid three">
            <div className="ml-card"><h3>levels</h3><p>cap 50. each level needs 80 × l<sup>1.45</sup> xp: 8,099 in total for level 10, 130,288 for 30, 463,101 for 50.</p></div>
            <div className="ml-card"><h3>skill points</h3><p>one per level, two at levels 10 and 25, spent in a shared mining tree and one constellation tree per class. a node needs any one of its prerequisites; the root is free.</p></div>
            <div className="ml-card"><h3>rebirth</h3><p>from level 30 with a heartstone. it resets gear and the bank, keeps classes and cosmetics, and adds x0.25 yield each time, up to x5.</p></div>
          </div>
          <div className="ml-col">
            <p>
              several characters can live on one account. one is the main you push furthest; the others keep their own class, gear and level while sharing the
              account&apos;s bonuses, so trying a second build never means throwing the first away. nothing is bound to the character that forged it either: the
              town&apos;s vault moves gear between them, and class and level decide who can wear it.
            </p>
          </div>
        </Section>

        <Section id="feel" eyebrow="06 · game feel" title="combat feel in frames">
          <div className="ml-col">
            <p>
              the game counts in frames at 60 a second. three numbers do most of the work: <strong>hit-stop</strong> freezes the game 4 frames on a hit and 6 on
              a kill (long enough to feel, short enough not to read as lag), an <strong>8-frame input buffer</strong> means a press 133 ms early still counts,
              and a <strong>perfect dodge</strong> in the first 10 frames of an enemy&apos;s hit makes your next hit a x2 crit, which turns defence into offence.
            </p>
          </div>
          <figure className="ml-fig ml-wide">
            <div className="ml-fig-body"><div className="ml-svg-box"><SwingFrames /></div></div>
            <figcaption><span><b>the miner&apos;s moves.</b> every ult winds up exactly 39 frames, so its sound lands on the beat.</span></figcaption>
          </figure>
          <Table
            head={["feel value", "number"]}
            rows={[
              ["combo window", "14 f (233 ms)"],
              ["input buffer", "8 f (133 ms)"],
              ["hit-stop: hit, kill", "4 f (67 ms), 6 f (100 ms)"],
              ["shortest enemy telegraph allowed", "18 f (300 ms)"],
              ["dash", "10 f, 8 studs, i-frames f1 to f8, 2 pips"],
              ["dodge roll", "16 f, 7 studs, i-frames f1 to f13, 24 f cooldown"],
              ["walk speed", "15 studs/s; x0.25 while a swing starts, x0.6 in recovery"],
              ["bomb", "1.5 s fuse, 8 stud radius, 20 damage to rock"],
              ["ult charge", "hit 1.5%, kill 3%, perfect dodge 10%, co-op combo 10%"],
            ]}
          />
        </Section>

        <Section id="camera" eyebrow="07 · camera and controls" title="the camera, and one click">
          <div className="ml-col">
            <p>
              the camera follows on its own from over the hero&apos;s right shoulder, so the view is cinematic and the keys stay world-steady: no right-drag,
              no zoom, no rotate key, which means a trackpad or a thumb is enough. the hero is an r6 rig wearing the player&apos;s own avatar, and the camera
              keeps its distance rather than pulling in, because rock between the eye and the hero fades instead of hiding them. the earlier forge-style
              follow (a held yaw, {cam.pitch}° down, {cam.distance} studs back) is still in the build as a setting.
            </p>
          </div>
          <figure className="ml-fig ml-wide">
            <div className="ml-fig-body"><div className="ml-svg-box"><CameraRig cam={cam} /></div></div>
            <figcaption><span><b>view.forge on main.</b> the held follow the shoulder style was built from, still selectable.</span></figcaption>
          </figure>
          <Table
            head={["key in view.forge", "value", "what it does"]}
            rows={[
              ["fov", String(cam.fov) + "°", "vertical field of view, roblox's default"],
              ["pitch", String(cam.pitch) + "°", "degrees down, held: the player never tilts it"],
              ["yaw", String(cam.yaw) + "°", "held in town and in the mine; nothing the hero does turns it"],
              ["distance", String(cam.distance) + " studs", "eye to look point when nothing is in the way"],
              ["focusHeight", String(cam.focusHeight) + " studs", "look point above the hero's root, so the hero sits a little low"],
              ["popmargin, popmin", String(cam.popMargin) + ", " + String(cam.popMin) + " studs", "how the eye pops in front of a wall"],
              ["popOutSmooth", String(cam.popOutSmooth) + " s", "easing back out once the wall is gone"],
              ["teleport", String(cam.teleport) + " studs", "a jump this big in one frame (a respawn, the lift) resets the camera"],
              ["focusease, focuspull", String(cam.focusEase) + " s, " + String(cam.focusPull), "a boss intro eases onto its point and pulls in"],
            ]}
          />
          <h3 className="ml-h3">controls</h3>
          <div className="ml-grid three">
            <div className="ml-card"><h3>pc</h3><p>wasd to move, <strong>click to swing</strong>, space to dash, e for a bomb, f for the ability, r for the ult, 1 to 9 for the hotbar.</p></div>
            <div className="ml-card"><h3>phone</h3><p>a thumbstick and one big swing button, with the dash, bomb, ability and ult on an arc around it. the hotbar sits along the bottom and takes a tap.</p></div>
            <div className="ml-card"><h3>click to swing</h3><p>the client plays the swing at once and sends an intent; the server decides what it hit. a hit is never the client&apos;s claim.</p></div>
          </div>
          <Diagram name="input" alt="sequence diagram of one swing: the player clicks, the client plays the swing and sends an attack intent, the server rate-limits and validates it, resolves the hit and broadcasts it, and every client plays the flash, sound and number." caption={<><b>one click, end to end.</b></>} />
        </Section>

        <Section id="ui" eyebrow="08 · interface" title="ui">
          <div className="ml-col">
            <p>
              the interface is {c.uiModules} client modules on one design system: tokens for the palette, a pixel grid, type and motion, and a lint that refuses
              hand-written tweens so every screen opens, closes and presses the same way. the style is rpg: framed panels, rarity colours that match the
              world&apos;s loot beams, big numbers and a live title scene where the player&apos;s own avatar stands in the grove and play hands the camera straight
              to the game.
            </p>
            <p>
              in play the hud is deliberately small: health is a bar with its number, the hotbar runs along the bottom (keys 1 to 9, or a tap), and loot arrives
              as a card rather than a list. every number a player reads goes through one formatter, so ore, coins and damage climb 1.2k, 4.8m, 2.1b without
              ever wrapping the line.
            </p>
          </div>
          <Diagram name="ui" alt="the ui layers from the world up: nametags, the hud, announcements, panels, the results card, then toasts and the tutorial card, all styled by shared tokens." caption={<><b>what draws over what.</b></>} />
          <div className="ml-col">
            <p>since 17 nov a ui score counts only when it comes from the locked blind check against the best rpg game interfaces, anchored on jawad&apos;s own scores. his scale and scores are under latest visuals.</p>
          </div>
        </Section>

        <Section id="audio" eyebrow="09 · sound" title="audio">
          <div className="ml-col">
            <p>
              every hit is layered (a transient, a body and a tail) with small pitch and volume variations so repeats never sound copied. a mixer caps how
              many sounds of each kind play at once and lets the louder or nearer one win; the effects bus tames the top end for phone speakers. the music is
              an adaptive director whose tension stems rise in fights and boss lairs and duck under big moments. guards in the tests check that every moment
              of the loop has a cue and that each bus sits inside its loudness window.
            </p>
          </div>
          <Diagram name="audio" alt="audio flow: game events trigger layered cues, the mixer caps and prioritises them, the sfx sound group plays them, and the adaptive music director ducks under big moments." caption={<><b>sound, from event to speaker.</b></>} />
        </Section>

        <Section id="architecture" eyebrow="10 · architecture" title="server-authoritative, one script each side">
          <div className="ml-col">
            <p>
              the server is a single script that requires every service in a fixed order and registers each in a shared registry, <code>g</code>, so services
              call each other at runtime without circular requires. the server creates every remote. clients only send intents; each is checked for type, range,
              rate and state by the service that handles it, and a per-player token bucket limits each remote. results come back as events, and positions stream
              over an unreliable remote.
            </p>
          </div>
          <Diagram name="arch" alt="architecture: client modules send intent events to the server's services, registered in g; the server answers with the event remote and an unreliable snapshot; meta keeps the session-locked profile." caption={<><b>client, remotes and server.</b></>} />
          <Table
            head={["remote", "direction", "purpose"]}
            rows={[
              ["attack, dash, bomb, ability", "client to server", "combat intents, with a flat aim direction"],
              ["useitem, useslot, combineslot, pickup", "client to server", "items and the hotbar"],
              ["station, wildcard", "client to server", "town stations, wild-card picks"],
              ["firstdive, diveagain, totown", "client to server", "run flow"],
              ["event", "server to clients", "every result: hits, loot, announcements, results"],
              ["snapshot (unreliable)", "server to clients", "positions, every frame, dropped if late"],
            ]}
          />
          <h3 className="ml-h3">saves</h3>
          <div className="ml-col">
            <p>
              progress lives in a session-locked profile (profilestore), autosaved and saved on leave. the only way a run touches the save is banking at a lift
              station; run-only currencies stay out of it, and a test proves the two never collide. the forge&apos;s timing mini-game is timed on the server, so
              a client can&apos;t claim a perfect rhythm. a fuzz test throws random sequences at the progress rules, and a fairness test holds the line that
              nothing sells power.
            </p>
          </div>
          <Diagram name="saves" alt="sequence diagram of a save's life: the profile loads session-locked on join, the run banks the haul into it, the server times forge strikes, and the profile saves and releases on leave." caption={<><b>a save&apos;s life.</b></>} />
        </Section>

        <Section id="forge" eyebrow="11 · tooling" title="the forge toolchain">
          <div className="ml-col">
            <p>
              <code>forge</code> is the judge every change passes. it is written in lune, so it runs the same on a mac and on the linux build boxes, every
              command takes <code>--json</code>, and any failure exits 1. game content is toml ({c.contentToml} files: ores, recipes, enemies, frame data, the
              camera) that forge compiles into typed luau, so balance changes are data and a validator can refuse a bad one before it ever runs.
            </p>
          </div>
          <Diagram name="forge" alt="the forge check pipeline: rojo sourcemap, luau-lsp strict analysis, selene, stylua, the lune unit tests, the content validators and the asset manifest rules." caption={<><b>forge check, in order.</b> ci runs it as four parts: the static steps and three test shards.</>} />
          <Table
            head={["command", "what it does"]}
            rows={[
              [<code key="a">check</code>, "the whole pipeline above; --only and --shard run parts"],
              [<code key="b">content compile</code>, "toml in, typed luau out, validated"],
              [<code key="c">build</code>, "the place file; the same commit always gives the same bytes"],
              [<code key="d">studio-test</code>, "in-engine tests in a leased studio window, multiplayer with --players n"],
              [<code key="e">engine-test</code>, "the same tests headless through open cloud, no studio and no mac"],
              [<code key="f">remotefuzz</code>, "attacks every declared remote from a real client and fails on any that doesn't say no"],
              [<code key="g">perfbudget</code>, "scripted load in a multiplayer test against the frame and memory budget"],
              [<code key="h">stills</code>, "the visual ci's still set at 1920x1080 and phone size"],
            ]}
          />
          <h3 className="ml-h3">the studio broker</h3>
          <div className="ml-col">
            <p>
              studio is a scarce resource, and two windows starting at the same moment fight over one licence. so every agent reaches studio through a broker:
              it hands out short leases on private copies of a place, starts one window at a time, times out hung calls, checks answers aren&apos;t cut, and
              refuses data store writes, publishes and edits to scripts (the repo owns the scripts, studio is only a sync target).
            </p>
          </div>
          <Diagram name="broker" alt="sequence diagram: a crew thread leases a studio window from the broker, which queues, guards and times out its calls, then releases and reaps the window." caption={<><b>a studio lease.</b> leases run about 12 minutes.</>} />
          <h3 className="ml-h3">joinbudget</h3>
          <div className="ml-col">
            <p>
              what a phone must download before it can play is the place itself, so a test holds two lines: {n(jb.instancesLine)} join instances and a byte line
              for the place. a pr that grows the join past them has to take something out first, or raise the line with the reason in the pr. the line was raised
              four times on purpose for the visual push, and it has to come back down to {n(jb.publishLine)} bytes before publish.
            </p>
          </div>
          <figure className="ml-fig ml-wide">
            <div className="ml-fig-body"><div className="ml-svg-box"><JoinBudget history={joinHistory} publishLine={jb.publishLine} /></div></div>
            <figcaption><span><b>place bytes against the line, main by main.</b> gold: the latest main, measured by the refresh job the way the test measures it.</span></figcaption>
          </figure>
        </Section>

        <Section id="trains" eyebrow="12 · shipping" title="ci and merge trains">
          <div className="ml-col">
            <p>
              nobody merges by hand. every 30 minutes a merge train takes every pr labelled <code>train</code>, merges the batch onto main and runs forge check on
              a build box. if it passes, each pr is squash-merged at exactly the code that was tested. if it fails, the train splits the batch in half until it
              finds the culprit, comments the failing lines on it and sends it back. a pr that touches the join budget rides first and alone, so one shared line
              can&apos;t fail every half of a bisect.
            </p>
            <p>
              ci runs on self-hosted runners on the build boxes, so jobs spend no github minutes. on a box, every check waits for a slot in a scheduler (four at
              once on a 16 gb box) so checks never run a box out of memory, and below 2 gb of free disk it starts nothing new.
            </p>
          </div>
          <Diagram name="train" alt="merge train flowchart: labelled prs, a timer at :25 and :55, budget prs first, the batch check, squash-merge on pass, bisect on fail, then ci on main." caption={<><b>a merge train.</b></>} />
        </Section>

        <Section id="crew" eyebrow="13 · the studio" title="how the agent crew builds it">
          <div className="ml-col">
            <p>
              derelict depths is built by a crew of ai agents with one human director. a captain agent turns direction into briefs and gives every piece of work
              one owner. about thirty crew agents each own a lane (the look, ui, combat, floors, audio, the camera, the tools) and work spec, tickets, tests
              first, code, forge check, playbot, review, pull request. cheaper models draft the bulk tickets on the build boxes, and a stronger model reviews
              everything before it lands.
            </p>
            <p>
              judges close the loop: a playbot that plays from town to the guardian to the results card, a locked, blind visual check that scores in-engine
              stills side by side against real references, and a blind tester that plays from screenshots like a first-timer. every failure they find becomes a
              guard, a test, a lint rule or a workflow line, so the same mistake can&apos;t land twice.
            </p>
          </div>
          <Diagram name="crew" alt="the crew: director, captain, crew agents, the swarm on the boxes, forge check, review, merge trains, main, then the playbot, visual judge and blind tester feeding lessons back as guards." caption={<><b>the machine that builds the game.</b></>} />
        </Section>

        <Section id="shipped" eyebrow="14 · live" title="everything that shipped">
          <div className="ml-col">
            <p>
              every pull request merged into the game repo&apos;s main, newest first and grouped by the hour (london time), with a one-line plain summary. a job on
              the build box refreshes this list every 3 minutes; store and pricing work is kept private until launch.
            </p>
            <Feed feed={feed} renderedAt={renderedAt} />
          </div>
        </Section>

        <footer className="ml-foot">
          numbers come from the game repo&apos;s main and the team&apos;s design docs. diagrams are pre-rendered svg, so the page
          works with javascript off.{" "}
          <Link href="/">jawadjalal.com</Link>
        </footer>
      </div>
    </div>
  );
}
