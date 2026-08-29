import { ImageResponse } from "next/og";
import { IDENTITY } from "@/lib/profile";

// Share card for /okara/agentsfeed. Same family as the walkthrough's card and
// the same reasoning behind it (see ../opengraph-image.tsx for why no fonts are
// passed), but on the prototype's own light ground rather than the walkthrough's
// dark one, because that is what the link opens.

export const alt = "The Okara agents feed, as a working prototype";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GROUND = "#e6e3dc";
const CARD = "#ffffff";
const HAIR = "#f1ede4";
const INK = "#1c1917";
const MUTED = "#57534e";
const FAINT = "#a8a29e";
const GREEN = "#16a34a";

// The two rows the panel opens on, named so the card says what you get.
const ROWS = [
  { tag: "X AGENT", line: "Next draft ready, behind a blur" },
  { tag: "INFLUENCER AGENT", line: "Launch your first campaign" },
];

export default function AgentsFeedOpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: GROUND,
          padding: 56,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 560, marginRight: 44 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", width: 10, height: 10, background: GREEN, marginRight: 16 }} />
            <div style={{ display: "flex", fontSize: 24, letterSpacing: 5, color: MUTED }}>
              OKARA PROTOTYPE
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 28,
              fontSize: 74,
              lineHeight: 1.06,
              color: INK,
            }}
          >
            <div style={{ display: "flex" }}>The agents</div>
            <div style={{ display: "flex" }}>feed, working.</div>
          </div>

          <div style={{ display: "flex", fontSize: 29, color: MUTED, marginTop: 22, lineHeight: 1.4 }}>
            Reveal the draft, post it, then meet the paywall. Scroll and it is back in the dashboard.
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "auto",
              paddingTop: 30,
            }}
          >
            <div style={{ display: "flex", fontSize: 32, color: INK }}>{IDENTITY.properName}</div>
            <div style={{ display: "flex", width: 1, height: 26, background: FAINT, margin: "0 20px" }} />
            <div style={{ display: "flex", fontSize: 22, letterSpacing: 3, color: FAINT }}>
              PRIVATE LINK
            </div>
          </div>
        </div>

        {/* A shorthand of the panel itself, cropped by the edge the way it is on the page. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            background: CARD,
            border: `1px solid ${HAIR}`,
            borderRadius: 18,
            padding: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", marginBottom: 22 }}>
            <div style={{ display: "flex", fontSize: 24, letterSpacing: 3, color: INK }}>
              AGENTS FEED
            </div>
            <div style={{ display: "flex", width: 8, height: 8, borderRadius: 4, background: GREEN, marginLeft: 12 }} />
          </div>

          {ROWS.map((r) => (
            <div
              key={r.tag}
              style={{
                display: "flex",
                flexDirection: "column",
                border: `1px solid ${HAIR}`,
                borderRadius: 13,
                background: "#fbfaf8",
                padding: "18px 20px",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", fontSize: 21, letterSpacing: 2, color: INK }}>{r.tag}</div>
              <div style={{ display: "flex", fontSize: 24, color: MUTED, marginTop: 8 }}>{r.line}</div>
            </div>
          ))}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 72,
              border: `1px dashed ${HAIR}`,
              borderRadius: 13,
              fontSize: 22,
              color: FAINT,
            }}
          >
            Eight agents are asleep
          </div>
        </div>
      </div>
    ),
    size,
  );
}
