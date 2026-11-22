"use client";

import { useEffect, useState } from "react";

/** Live ticking London time (Europe/London) in HH:MM:SS format for the Brass Hands industrial top bar. */
export function LondonClock() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  return <span className="bh-clock">{time} GMT</span>;
}
