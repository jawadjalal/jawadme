"use client";

import { track as vercel } from "@vercel/analytics";

type Props = Record<string, string | number | boolean>;
type Sink = (event: string, props?: Props) => void;

let sink: Sink | null = null;
const queue: [string, Props | undefined][] = [];

/** Every product event goes through here: Vercel Analytics now, and PostHog once it has loaded (queued until then). */
export function track(event: string, props?: Props) {
  vercel(event, props);
  if (sink) sink(event, props);
  else if (queue.length < 50) queue.push([event, props]);
}

export function attach(s: Sink) {
  sink = s;
  queue.splice(0).forEach(([e, p]) => s(e, p));
}
