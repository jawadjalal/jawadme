"use client";

// Two phases, one after the other: the orbiting intro, then the page. They are
// never on screen together — the intro's dots fly to where the avatar lands and
// the swap happens on the frame after they have shrunk away, so the handoff
// looks like one continuous move rather than a cut.
//
// Anyone who has asked for reduced motion skips straight to the page.

import { useEffect, useState } from "react";
import Intro from "./Intro";
import Profile from "./Profile";

export default function HomeClient() {
  const [phase, setPhase] = useState<"intro" | "profile">("intro");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPhase("profile");
  }, []);

  return (
    <div className="hm">
      {phase === "intro" ? <Intro onDone={() => setPhase("profile")} /> : <Profile />}
    </div>
  );
}
