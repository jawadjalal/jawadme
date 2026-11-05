// The intro call's real state, read from Cal.com's public API when the page is built and every 30 minutes after:
// its length, where it happens, and the next free slots this week. Falls back to the plain link if Cal is down.
import { BOOK } from "./copy";

export type Booking = { minutes: number; where: "meet" | "video"; slots: { iso: string; day: string; time: string }[] };

const USER = "jawad-jalal-hesqbk", EVENT = "intro-call-with-ignura";
const FALLBACK: Booking = { minutes: 15, where: "video", slots: [] };

export async function getBooking(): Promise<Booking> {
  try {
    const now = new Date(), end = new Date(now.getTime() + 7 * 864e5);
    const d = (x: Date) => x.toISOString().slice(0, 10);
    const opt = { next: { revalidate: 1800 } } as RequestInit;
    const [ev, sl] = await Promise.all([
      fetch(`https://api.cal.com/v2/event-types?username=${USER}&eventSlug=${EVENT}`, { ...opt, headers: { "cal-api-version": "2024-06-14" } }).then((r) => r.json()),
      fetch(`https://api.cal.com/v2/slots?eventTypeSlug=${EVENT}&username=${USER}&start=${d(now)}&end=${d(end)}&timeZone=Europe/London`, { ...opt, headers: { "cal-api-version": "2024-09-04" } }).then((r) => r.json()),
    ]);
    const e = Array.isArray(ev?.data) ? ev.data[0] : ev?.data;
    const where = JSON.stringify(e?.locations ?? "").includes("google-meet") ? "meet" : "video";
    const all: string[] = Object.values((sl?.data ?? {}) as Record<string, { start: string }[]>).flat().map((s) => s.start);
    const day = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/London" });
    const time = new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Europe/London" });
    // one slot per day, the first, so the chips read as days to pick from
    const seen = new Set<string>();
    const slots = all
      .filter((iso) => new Date(iso) > now)
      .filter((iso) => (seen.has(iso.slice(0, 10)) ? false : (seen.add(iso.slice(0, 10)), true)))
      .slice(0, 4)
      .map((iso) => ({ iso, day: day.format(new Date(iso)), time: time.format(new Date(iso)).replace(":00", "").replace(" ", "") }));
    return { minutes: e?.lengthInMinutes ?? 15, where, slots };
  } catch {
    return FALLBACK;
  }
}

/** A booking link that opens Cal on the slot's day. */
export const dayLink = (iso: string) => `${BOOK}?date=${iso.slice(0, 10)}&month=${iso.slice(0, 7)}`;
