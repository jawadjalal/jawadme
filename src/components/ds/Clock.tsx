"use client";

import { useEffect, useState } from "react";

const fmt = () => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/London" }).format(new Date());

/** [ LONDON 21:04 ], ticking. */
export function Clock() {
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = window.setInterval(() => setT(fmt()), 15000);
    return () => window.clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>[ London {t} ]</span>;
}
