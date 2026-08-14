// Slack-ready text for the /responses table.
//
// There is no webhook, no Slack app and no automation behind this: the page
// formats each response the way Slack's composer wants it, the copy button puts
// it on the clipboard, and posting one is a paste. That is the whole pipeline,
// and it is deliberate — an incoming webhook is fifteen minutes of setup and a
// secret to keep, for a box that catches a handful of messages a week.
//
// Everything here is plain text on purpose. Slack's `<mailto:a@b|a@b>` link
// syntax only resolves for messages posted through the API; pasted into the
// composer it stays on screen as angle brackets. Bold markers survive, so the
// heading gets them and nothing else does.
//
// If an integration is ever worth building, it can post the output of these two
// functions unchanged.

import type { Reply } from "./replies";

const SITE = "jawadjalal.com";

// Shared with the table itself, so a row and the text copied off it never
// disagree about when something arrived. Fixed locale rather than the viewer's:
// this renders on the server, where there is no viewer to ask.
export function stamp(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// The message itself, quoted line by line so a reply that already contains
// blank lines still reads as one block in Slack rather than breaking into a
// quote, a gap, and some loose text.
const quote = (text: string) =>
  text
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");

const from = (reply: Reply) => reply.email ?? "no address left";

// One response, ready to paste on its own. It says where it came from, because
// pasted into a channel by itself there is nothing else to say so.
export function slackMessage(reply: Reply) {
  return [
    `*New reply from ${SITE}*`,
    `From: ${from(reply)}`,
    `When: ${stamp(reply.created_at)}`,
    quote(reply.message),
  ].join("\n");
}

// Several at once, oldest first — pasted into a channel they should read in the
// order they were written, which is the reverse of the order the table shows
// them in.
//
// The heading already names the site, so the blocks under it drop that line and
// lead with the address instead; repeating "New reply from jawadjalal.com" eight
// times buries the eight things actually worth reading. A bold first line is
// enough of a break between them to need no rule, which is just as well: a line
// of hyphens is a divider in some Slack clients and three literal hyphens in
// the composer of others.
export function slackDigest(replies: Reply[]) {
  if (replies.length === 0) return "";
  if (replies.length === 1) return slackMessage(replies[0]);
  const head = `*${replies.length} replies from ${SITE}*`;
  const blocks = [...replies]
    .reverse()
    .map((r) => [`*${from(r)}* · ${stamp(r.created_at)}`, quote(r.message)].join("\n"));
  return [head, ...blocks].join("\n\n");
}
