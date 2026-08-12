"use client";

// Two phases, one after the other: the orbiting intro, then the page. They are
// never on screen together — the intro's dots fly to where the avatar lands and
// the swap happens on the frame after they have shrunk away, so the handoff
// looks like one continuous move rather than a cut.
//
// The server renders the finished page, fully typed. That is what a crawler,
// an agent, or anyone with JavaScript off receives — the words have to be in
// the HTML, not drawn into it afterwards. The animation is then a progressive
// enhancement: on mount this component rewinds to the intro and replays.
//
// The rewind would otherwise flash the finished page first, since the browser
// paints the server HTML before React hydrates. An inline script in the head
// sets data-js before that paint, and the stylesheet hides the column while it
// is set; `is-live` below puts it back the moment this component is mounted and
// has decided which phase to show. No script, no attribute, nothing hidden.

import { useLayoutEffect, useState } from "react";
import Intro from "./Intro";
import Profile from "./Profile";

export default function HomeClient() {
  const [phase, setPhase] = useState<"intro" | "profile">("profile");
  const [live, setLive] = useState(false);
  const [animate, setAnimate] = useState(false);

  useLayoutEffect(() => {
    setLive(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setAnimate(true);
    setPhase("intro");
  }, []);

  return (
    <div className={`hm ${live ? "is-live" : ""}`}>
      {phase === "intro" ? (
        <Intro onDone={() => setPhase("profile")} />
      ) : (
        <Profile animate={animate} />
      )}
    </div>
  );
}
