import type { Metadata } from "next";
import Link from "next/link";
import facts from "./facts.json";
import { Feed, FeedMeta, LatestShipped, getFeed } from "./Feed";
import { CameraRig, JOIN_SEED, JoinBudget, type Point, SwingFrames } from "./figures";
import { Diagram, Still, Table } from "./ui";
import "./minelight.css";

// Rebuilt at most every 3 minutes, so the shipped feed (a JSON the build box refreshes every 3 minutes) stays fresh
// without a redeploy. Everything else on the page is static.
export const revalidate = 180;

const TITLE = "Minelight, explained: the game from the loop down to the toolchain";
const DESCRIPTION =
  "How Minelight works, a co-op action mining game for Roblox: the loop, floors, bestiary, camera, cel look, UI, audio, the server-authoritative architecture and the agent crew that builds it, with a live feed of what shipped.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/minelight" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/minelight", type: "article", images: [{ url: "/minelight/img/og.jpg", width: 1200, height: 630, alt: "Minelight key art: an in-engine capture of a miner and the Mole King" }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/minelight/img/og.jpg"] },
};

const SECTIONS: [string, string][] = [
  ["shipped-now", "Just shipped"],
  ["what", "What it is"],
  ["loop", "The core loop"],
  ["dive", "A dive, server side"],
  ["world", "Floors and Gloom"],
  ["bestiary", "Bestiary and minibosses"],
  ["progression", "Progression"],
  ["feel", "Combat feel in frames"],
  ["camera", "Camera and controls"],
  ["look", "The look pipeline"],
  ["ui", "UI"],
  ["audio", "Audio"],
  ["architecture", "Server-authoritative architecture"],
  ["forge", "The forge toolchain"],
  ["trains", "CI and merge trains"],
  ["crew", "How the agent crew builds it"],
  ["stills", "In-engine stills"],
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

export default async function MinelightPage() {
  const feed = await getFeed();
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
            <h1 style={{ margin: 0 }}>
              <img src="/minelight/img/logo-wide.webp" srcSet="/minelight/img/logo-wide-600.webp 600w, /minelight/img/logo-wide.webp 1024w" sizes="(min-width: 900px) 520px, 90vw" width={1024} height={242} alt="MINELIGHT" className="ml-logo" />
            </h1>
            <p className="ml-kicker">A co-op action mining game for Roblox</p>
            <p className="ml-lede">Dig deep with your friends. Smash monsters, crack glowing ore, beat the boss, forge better gear.</p>
            <p className="ml-sub">
              This page is the whole game on one sheet: the loop a player feels, the numbers under it, and the machine that builds it.
              It is drawn from the game repo's main branch and the team's design docs, and its shipped feed updates every 3 minutes.
            </p>
          </div>
          <figure className="ml-poster">
            <img src="/minelight/img/poster-1280.jpg" srcSet="/minelight/img/poster-640.jpg 640w, /minelight/img/poster-1280.jpg 1280w" sizes="(min-width: 900px) 540px, 100vw" width={1280} height={720} alt="A miner in a white space suit raises a pickaxe in front of the purple Mole King" />
            <figcaption><span className="ml-badge art">In-engine + key art</span>A real in-engine capture of the Golden Room, graded, with rays and the logo added.</figcaption>
          </figure>
        </header>

        <div className="ml-stats">
          <div className="ml-stat"><b>{n(c.mergedPRs)}+</b><span>pull requests merged into main</span></div>
          <div className="ml-stat"><b>{c.testFiles} + {c.engineTestFiles}</b><span>Lune test files, plus in-engine test files</span></div>
          <div className="ml-stat"><b>{c.remotes}</b><span>remotes: the only doors from a client to the server</span></div>
          <div className="ml-stat"><b>{c.floors} floors</b><span>2 playable today, 4 more greyboxed</span></div>
          <div className="ml-stat"><b>{c.ores} ores</b><span>{c.bars} bars, 11 pickaxe tiers</span></div>
          <div className="ml-stat"><b>{c.classes} classes</b><span>Miner, Demolitionist, Prospector, Alchemist</span></div>
          <div className="ml-stat"><b>{cam.pitch}° · {cam.distance} studs</b><span>the forge camera: fixed yaw, no camera input</span></div>
          <div className="ml-stat"><b>{(jb.latestBuildBytes / 1e6).toFixed(2)} MB</b><span>the place a phone downloads to join (line {(jb.bytesLine / 1e6).toFixed(2)} MB)</span></div>
        </div>

        <nav className="ml-toc" aria-label="Contents">
          <ol>{SECTIONS.map(([id, label]) => <li key={id}><a href={"#" + id}>{label}</a></li>)}</ol>
        </nav>

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

        <Section id="what" eyebrow="01 · The pitch" title="What Minelight is">
          <div className="ml-col">
            <p>
              Minelight is a co-op action mining crawler. Up to four friends drop into a mine as their own Roblox avatars. They swing, dig, dodge, crack glowing ore and fight to a boss, then
              go back to town, forge better gear and dive deeper. A dive takes minutes, so a phone player at a bus stop can finish one and a group of friends can do three in a session.
            </p>
            <p>
              Other mining games are about the grind. Minelight is a boss raid in a mine with your friends: short, loud dives that end in a fight. Four rules decide what gets built.
            </p>
          </div>
          <div className="ml-grid two">
            <div className="ml-card"><h4>Friends first</h4><p>Good solo, built for 2 to 4. Rooms and bosses scale with the party, revives are free and take 2 seconds, and everyone sees the loot beams.</p></div>
            <div className="ml-card"><h4>Every hit feels amazing</h4><p>The swing is the product: flash, hit-stop, layered sound, particles and a number on the same frame. Movement values are locked by a test.</p></div>
            <div className="ml-card"><h4>Bright, readable, gorgeous</h4><p>Most players are on phones, so the look reads at thumb size: three flat tones, black ink, a faint pixel grain and nothing muddy.</p></div>
            <div className="ml-card"><h4>Always a next thing</h4><p>Every dive ends with something: ore for the forge, XP for a skill point, a key to the next floor. Nothing sells power.</p></div>
          </div>
        </Section>

        <Section id="loop" eyebrow="02 · The player's view" title="The core loop">
          <div className="ml-col">
            <p>
              Town, dive, mine, fight, the King, bank, smelt, forge, dive again. The banking step is the one real decision in it: ore only counts once it is banked at a Lift station, and a wipe
              keeps your gear but loses whatever wasn't banked, so every room deeper is a bet.
            </p>
          </div>
          <Diagram name="loop" alt="Flowchart of the core loop: town, the Lift pad, dropping in, clearing chambers while mining and fighting, the miniboss, the guardian, banking at the Lift station, the results card, then the Smeltery, the forge and back to town." caption={<><b>The core loop.</b> Dashed: the wipe path.</>} />
          <div className="ml-col">
            <p>The loop nests. Each ring has its own length and its own reward, and a player who quits has broken out of one of them.</p>
          </div>
          <Diagram name="loops" alt="Five nested loops: the swing in about a second, the fight in 20 to 40 seconds, the dive in 5 to 8 minutes, the session in 15 to 30 minutes, and the return over days and weeks." caption={<><b>Five loops, from one swing to one month.</b></>} />
        </Section>

        <Section id="dive" eyebrow="03 · Run state" title="A dive, as the server sees it">
          <div className="ml-col">
            <p>
              A dive is one expedition, owned by the server's <code>Run</code> service. The run moves through <code>lobby</code>, <code>countdown</code>, <code>running</code> and <code>results</code>, and publishes
              its state as workspace attributes (<code>RunState</code>, <code>BossPhase</code>) that every client reads. Inside a run, each chamber is <code>idle</code> until a hero walks in, <code>active</code> with its
              doors locked until the last wave falls, then <code>cleared</code>.
            </p>
          </div>
          <Diagram name="run-state" alt="State diagram: lobby to countdown when a hero steps on the Lift pad, to running after 5 seconds, to results after banking or a wipe; inside running, chambers go idle, active, cleared, and heroes go up, downed and revived." caption={<><b>Run.state on the server.</b> One expedition per server for now.</>} />
          <Table
            head={["Rule", "Number"]}
            num={[1]}
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

        <Section id="world" eyebrow="04 · The world" title="Floors and Gloom">
          <div className="ml-col">
            <p>
              Six floors sit under a surface town. Each floor has to earn its place with one new idea, a new enemy behaviour, a hazard or a new use for the lamp, and its own palette inside the
              shared style kit. The deeper you go the stranger it gets, but never muddier: even the Core glows rather than going dark.
            </p>
          </div>
          <div className="ml-grid two" style={{ alignItems: "start" }}>
            <Diagram name="floors" alt="The six floors in order under the town: Topsoil and Iron Halls playable, Crystal Grotto shut, Fungal Depths, Magma Forge and The Core greyboxed." caption={<><b>The floors today.</b></>} />
            <div>
              <h3 className="ml-h3" style={{ marginTop: 0 }}>Gloom: difficulty per floor</h3>
              <p>Each floor has Gloom levels 0 to V. Beating the floor's guardian at your highest Gloom unlocks the next. All the extra danger arrives at Gloom I; after that each level changes how the dive plays, and the reward keeps climbing.</p>
              <Table
                head={["Gloom", "Adds", "Yield, XP"]}
                num={[2]}
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

        <Section id="bestiary" eyebrow="05 · Enemies" title="Bestiary and minibosses">
          <div className="ml-col">
            <p>
              Enemies are built from a few shared behaviours, each with a tell, an attack and a recovery window. A new enemy is mostly data (its look, its numbers, which behaviour), so the bestiary grows
              fast and players learn a small set of tells that keeps paying off. Every enemy file opens with the line a kid would say about it.
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
              <p>Topsoil's miniboss. 30 HP, a ranged plant with a 42-frame tell. Break its bark, then hit the bulb, and stay out of the circles and the thorn lines.</p>
            </div>
            <div className="ml-card">
              <h4>Rattletrap, The Runaway Cart</h4>
              <p>Iron Halls' miniboss. 34 HP, a charger with a 45-frame tell. Jump out of its lane twice, then kick its kegs back at it.</p>
            </div>
          </div>
          <div className="ml-col">
            <p>
              A miniboss is a short, loud spike of 20 to 40 seconds in the middle of a dive: an intro card, a health bar at the top of the screen, a two-step pattern and a guaranteed loot beam. Its health
              scales with the party, and the beam drops one reward per player. Each floor's miniboss teaches the move its guardian will test.
            </p>
            <h3 className="ml-h3">The Mole King</h3>
            <p>
              Topsoil's guardian has 60 HP and a stagger bar of 12 hits. A party fights three named phases; a lone hero below Gloom I gets a shorter two-phase fight, so the boss is beatable solo
              without being trivial in a group.
            </p>
          </div>
          <Diagram name="moleking" alt="The Mole King's phases: intro, DIG, CLOD STORM and CAVE-IN for a party, or DIG then ENRAGED for a lone hero, with the numbers of each attack." caption={<><b>The Mole King's fight.</b> The Rust Golem (75 HP, Iron Halls) runs SLAM, ROCKET FIST, OVERHEAT.</>} />
        </Section>

        <Section id="progression" eyebrow="06 · Getting stronger" title="Progression">
          <div className="ml-col">
            <p>
              Ore becomes bars at the Smeltery (five ore to one bar), bars become gear at the forge, and gems become charms at the jeweller. The pickaxe ladder is the spine: each tier breaks harder rock,
              which opens rarer ore, which pays for the next tier. Every ore must feed at least one recipe, and a content test enforces it.
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
            <div className="ml-card"><h4>Skill points</h4><p>One per level, two at levels 10 and 25, spent in a shared mining tree and one tree per class.</p></div>
            <div className="ml-card"><h4>Rebirth</h4><p>From level 30 with a Heartstone. It resets gear and the bank, keeps classes and cosmetics, and adds x0.25 yield each time, up to x5.</p></div>
          </div>
        </Section>

        <Section id="feel" eyebrow="07 · Game feel" title="Combat feel in frames">
          <div className="ml-col">
            <p>
              The game counts in frames at 60 a second. Three numbers do most of the work: <strong>hit-stop</strong> freezes the game 4 frames on a hit and 6 on a kill (long enough to feel, short enough not
              to read as lag), an <strong>8-frame input buffer</strong> means a press 133 ms early still counts, and a <strong>perfect dodge</strong> in the first 10 frames of an enemy's hit makes your next hit
              a x2 crit, which turns defence into offence.
            </p>
          </div>
          <figure className="ml-fig ml-wide">
            <div className="ml-fig-body"><div className="ml-svg-box"><SwingFrames /></div></div>
            <figcaption><span><b>The Miner's moves.</b> Every ult winds up exactly 39 frames, so its sound lands on the beat.</span></figcaption>
          </figure>
          <Table
            head={["Feel value", "Number"]}
            num={[1]}
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

        <Section id="camera" eyebrow="08 · Camera and controls" title="The forge camera">
          <div className="ml-col">
            <p>
              The camera sits behind and above the hero at a held angle and follows on its own. There is no camera input at all: no right-drag, no zoom, no rotate key, so a trackpad or a thumb is enough.
              Its yaw is fixed at {cam.yaw}°, the eye due south of the hero, so the keys stay world-steady (W is always up the screen) and held strafes go straight. Rock, walls and a shut door between the
              eye and the hero fade instead of hiding them.
            </p>
          </div>
          <figure className="ml-fig ml-wide">
            <div className="ml-fig-body"><div className="ml-svg-box"><CameraRig cam={cam} /></div></div>
            <figcaption><span><b>View.FORGE on main.</b> The classic room camera (FOV 20°, 60° down, 96 studs) stays as a setting.</span></figcaption>
          </figure>
          <Table
            head={["Key in View.FORGE", "Value", "What it does"]}
            num={[1]}
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
            <div className="ml-card"><h4>PC</h4><p>WASD to move, <strong>click to swing</strong>, Space to dash, E for a bomb, F for the ability, R for the ult, 1 to 3 for the hotbar.</p></div>
            <div className="ml-card"><h4>Phone</h4><p>A thumbstick and one big SWING button, with the dash, bomb, ability and ult on an arc around it.</p></div>
            <div className="ml-card"><h4>Click to swing</h4><p>The client plays the swing at once and sends an intent; the server decides what it hit. A hit is never the client's claim.</p></div>
          </div>
          <Diagram name="input" alt="Sequence diagram of one swing: the player clicks, the client plays the swing and sends an Attack intent, the server rate-limits and validates it, resolves the hit and broadcasts it, and every client plays the flash, sound and number." caption={<><b>One click, end to end.</b></>} />
        </Section>

        <Section id="look" eyebrow="09 · Rendering" title="The look pipeline">
          <div className="ml-col">
            <p>
              Roblox has no full-screen post-processing shader, so the cel look is built into the assets and a few client scripts. One workspace attribute, <code>Look3D</code>, switches the whole look on, and it
              ships on by default.
            </p>
            <ul className="ml-list">
              <li><strong>Cel ramps.</strong> Each floor's style kit defines palettes in Python (<code>packages/art/artkit/blocks.py</code>). <code>art look build</code> generates <code>Cel.luau</code>: for every palette key, a lit, mid and shadow tone, lit on top faces, mid on the sides and shadow underneath, plus cel mask textures four studs a tile.</li>
              <li><strong>Ink shells.</strong> On the client, every visible part of a body gets an ink shell welded behind it and a light band decal, which turn to the camera and the key light each frame. It works on any R15 avatar and its accessories with no per-avatar art.</li>
              <li><strong>The pixel filter.</strong> A workspace attribute (<code>off</code>, <code>faint</code>, <code>medium</code>) swaps every cel mask for a coarse, grained version, so surfaces read as big pixels. Faint won the judge's A/B. The UI is never filtered.</li>
              <li><strong>Avatar cel.</strong> The server reads each player's avatar once, maps it to a <code>HeroLook</code> attribute that replicates to every client, and each client builds the avatar body (in a collision group that touches nothing) and inks it.</li>
            </ul>
          </div>
          <Diagram name="look" alt="Flowchart of the look pipeline: style kit palettes generate Cel.luau and cel mask textures, which Room3D and Rock3D apply, then the pixel filter; Look3D gates rooms, rigs and the HUD; the avatar path runs from AvatarLook to the HeroLook attribute to the client's body and ink shells." caption={<><b>From palette to pixels.</b></>} />
        </Section>

        <Section id="ui" eyebrow="10 · Interface" title="UI">
          <div className="ml-col">
            <p>
              The interface is {c.uiModules} client modules on one design system: tokens for the palette, a pixel grid, type and motion, and a lint that refuses hand-written tweens so every screen opens,
              closes and presses the same way. The style is RPG: framed panels, rarity colours that match the world's loot beams, big numbers and a live title scene where the player's own avatar stands in
              the grove and PLAY hands the camera straight to the game.
            </p>
          </div>
          <Diagram name="ui" alt="The UI layers from the world up: nametags, the HUD, announcements, panels, the results card, then toasts and the tutorial card, all styled by shared tokens." caption={<><b>What draws over what.</b></>} />
          <div className="ml-col">
            <p>A visual judge scores every round of screens on a fixed rubric from in-engine stills, and nothing under 7 out of 10 is shown as finished.</p>
          </div>
        </Section>

        <Section id="audio" eyebrow="11 · Sound" title="Audio">
          <div className="ml-col">
            <p>
              Every hit is layered (a transient, a body and a tail) with small pitch and volume variations so repeats never sound copied. A mixer caps how many sounds of each kind play at once and lets the
              louder or nearer one win; the effects bus tames the top end for phone speakers. The music is an adaptive director whose tension stems rise in fights and boss lairs and duck under big moments.
              Guards in the tests check that every moment of the loop has a cue and that each bus sits inside its loudness window.
            </p>
          </div>
          <Diagram name="audio" alt="Audio flow: game events trigger layered cues, the mixer caps and prioritises them, the Sfx sound group plays them, and the adaptive music director ducks under big moments." caption={<><b>Sound, from event to speaker.</b></>} />
        </Section>

        <Section id="architecture" eyebrow="12 · Architecture" title="Server-authoritative, one script each side">
          <div className="ml-col">
            <p>
              The server is a single script that requires every service in a fixed order and registers each in a shared registry, <code>G</code>, so services call each other at runtime without circular
              requires. The server creates every remote. Clients only send intents; each is checked for type, range, rate and state by the service that handles it, and a per-player token bucket
              limits each remote. Results come back as events, and positions stream over an unreliable remote.
            </p>
          </div>
          <Diagram name="arch" alt="Architecture: client modules send 14 intent events to the server's services, registered in G; the server answers with the Event remote and an unreliable Snapshot; Meta keeps the session-locked profile." caption={<><b>Client, remotes and server.</b></>} />
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
              Progress lives in a session-locked profile (ProfileStore), autosaved and saved on leave. The only way a run touches the save is banking at a Lift station; run-only currencies stay out of
              it, and a test proves the two never collide. The forge's timing mini-game is timed on the server, so a client can't claim a perfect rhythm. A fuzz test throws random sequences at the
              progress rules, and a fairness test holds the line that nothing sells power.
            </p>
          </div>
          <Diagram name="saves" alt="Sequence diagram of a save's life: the profile loads session-locked on join, the run banks the haul into it, the server times forge strikes, and the profile saves and releases on leave." caption={<><b>A save's life.</b></>} />
        </Section>

        <Section id="forge" eyebrow="13 · Tooling" title="The forge toolchain">
          <div className="ml-col">
            <p>
              <code>forge</code> is the judge every change passes. It is written in Lune, so it runs the same on a Mac and on the Linux build boxes, every command takes <code>--json</code>, and any failure
              exits 1. Game content is TOML ({c.contentToml} files: ores, recipes, enemies, frame data, the camera) that forge compiles into typed Luau, so balance changes are data and a validator can
              refuse a bad one before it ever runs.
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
              Studio is one signed-in licence on one Mac, and two windows starting at the same moment revoke the shared sign-in. So every agent reaches Studio through a broker: it hands out short leases on
              private copies of a place, starts one window at a time, times out hung calls, checks answers aren't cut, and refuses data store writes, publishes and edits to scripts (the repo owns the
              scripts, Studio is only a sync target).
            </p>
          </div>
          <Diagram name="broker" alt="Sequence diagram: a crew thread leases a Studio window from the broker, which queues, guards and times out its calls, then releases and reaps the window." caption={<><b>A Studio lease.</b> Leases ran 12 minutes overnight.</>} />
          <h3 className="ml-h3">JoinBudget</h3>
          <div className="ml-col">
            <p>
              What a phone must download before it can play is the place itself, so a test holds two lines: {n(jb.instancesLine)} join instances and a byte line for the place. A PR that grows the join past
              them has to take something out first, or raise the line with the reason in the PR. Overnight the line was raised four times on purpose for the visual push, and it has to come back down to{" "}
              {n(jb.publishLine)} bytes before publish.
            </p>
          </div>
          <figure className="ml-fig ml-wide">
            <div className="ml-fig-body"><div className="ml-svg-box"><JoinBudget history={joinHistory} publishLine={jb.publishLine} /></div></div>
            <figcaption><span><b>Place bytes against the line, main by main.</b> Gold: the latest main, measured by the refresh job the way the test measures it.</span></figcaption>
          </figure>
        </Section>

        <Section id="trains" eyebrow="14 · Shipping" title="CI and merge trains">
          <div className="ml-col">
            <p>
              Nobody merges by hand. Every 30 minutes a merge train takes every PR labelled <code>train</code>, merges the batch onto main and runs forge check on a build box. If it passes, each PR is
              squash-merged at exactly the code that was tested. If it fails, the train splits the batch in half until it finds the culprit, comments the failing lines on it and sends it back.
              A PR that touches the join budget rides first and alone, so one shared line can't fail every half of a bisect.
            </p>
            <p>
              CI runs on self-hosted runners on Instabox boxes, so jobs spend no GitHub minutes. On a box, every check waits for a slot in a scheduler (four at once on a 16 GB box) so checks never run
              a box out of memory, and below 2 GB of free disk it starts nothing new.
            </p>
          </div>
          <Diagram name="train" alt="Merge train flowchart: labelled PRs, a timer at :25 and :55, budget PRs first, the batch check, squash-merge on pass, bisect on fail, then CI on main." caption={<><b>A merge train.</b></>} />
        </Section>

        <Section id="crew" eyebrow="15 · The studio" title="How the agent crew builds it">
          <div className="ml-col">
            <p>
              Minelight is built by a crew of AI agents with one human director. A Captain agent turns direction into briefs and gives every piece of work one owner. About thirty crew agents each own a
              lane (the look, UI, combat, floors, audio, the camera, the tools) and work spec, tickets, tests first, code, forge check, playbot, review, pull request. Cheaper models draft the bulk tickets on
              the build boxes, and a stronger model reviews everything before it lands.
            </p>
            <p>
              Judges close the loop: a playbot that plays from town to the Mole King to the results card, a visual judge that scores in-engine stills on a fixed rubric, and a blind tester that plays from
              screenshots like a first-timer. Every failure they find becomes a guard, a test, a lint rule or a workflow line, so the same mistake can't land twice.
            </p>
          </div>
          <Diagram name="crew" alt="The crew: director, Captain, crew agents, the swarm on the boxes, forge check, review, merge trains, main, then the playbot, visual judge and blind tester feeding lessons back as guards." caption={<><b>The machine that builds the game.</b></>} />
        </Section>

        <Section id="stills" eyebrow="16 · Pictures" title="In-engine stills">
          <div className="ml-col">
            <p>
              Captured in Roblox Studio play on main <code>0d0724c</code> (06:15, 17 Nov) with the game camera and the HUD on, except where marked. Key art frames are in-engine captures with grading, rays
              and the logo added on top. The hero is a real Roblox avatar.
            </p>
          </div>
          <div className="ml-stills">
            <Still name="town" title="The surface town" note="The Lift pad in the middle, stations and keepers around it." eager />
            <Still name="ore-room" title="Topsoil, an ore room" note="Lit tops, mid sides, ink edges, and the ability arc bottom right." />
            <Still name="fight" title="The first fight" note="The tutorial mole and the Elder's card." />
            <Still name="dodge" title="A dodge" note="Movement values are locked by a test." />
            <Still name="loot" title="Loot" note="Drops scatter from ore and enemies." />
            <Still name="mole-king" title="The Mole King, phase 1" note="The boss bar names the phase: DIG." />
            <Still name="mole-king-2" title="The Mole King, later" note="The guardian at full size under the forge camera." />
            <Still name="results" title="The results card" note="Depth, kills, time, best combo, XP, then DIVE AGAIN or TOWN." />
            <Still name="relic" title="A mythic relic reveal" note="Rarity cards match the loot beam colours." />
            <Still name="smeltery" title="The Smeltery" note="Five ore to one bar." />
            <Still name="coop" title="Co-op" note="Up to four avatars in one dive." art />
            <Still name="ore-impact" title="An ore strike" note="The moment a vein cracks." art />
          </div>
        </Section>

        <Section id="shipped" eyebrow="17 · Live" title="Everything that shipped">
          <div className="ml-col">
            <p>
              Every pull request merged into the game repo's main, newest first and grouped by the hour (London time), with a one-line plain summary. A job on the build box refreshes this list every 3
              minutes; store and pricing work is kept private until launch.
            </p>
            <Feed feed={feed} renderedAt={renderedAt} />
          </div>
        </Section>

        <footer className="ml-foot">
          Numbers come from the game repo's main at <code>{facts.main.sha}</code> and the team's design docs. Diagrams are pre-rendered SVG, so the page works with JavaScript off.{" "}
          <Link href="/">jawadjalal.com</Link>
        </footer>
      </div>
    </div>
  );
}
