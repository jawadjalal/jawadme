// The auto tour (press T): one continuous take, cut like a motion piece, so a 20 second screen recording of it is the
// video. Every shot is a camera move then a hold; during a hold the camera keeps drifting in so the frame never stops
// dead. `frac` frames part of a piece (x0, y0, x1, y1 as shares of it), which is how the tour reads a strip panel by panel.

export type TourTarget =
  | { all: true; wide?: number }
  | { cluster: string }
  | { group: string }
  | { piece: string; frac?: [number, number, number, number] };

export type Caption = { n: string; title: string; sub?: string };

export type Shot = {
  to: TourTarget;
  /** ms of camera move into the shot */
  move: number;
  /** ms the shot holds (drifting) before the next move */
  hold: number;
  /** how the move is paced: a smooth glide, or a whip that leaves fast and lands soft */
  ease?: "glide" | "whip" | "out";
  /** 0 flies straight, higher pulls further out between far-apart shots */
  rho?: number;
  caption?: Caption;
  /** how far the hold drifts in (share of the frame); 0 holds still */
  drift?: number;
};

export const TOUR: Shot[] = [
  // the title card over the whole board, pushing in
  { to: { all: true }, move: 1900, hold: 0, ease: "out", drift: 0 },
  { to: { cluster: "strips" }, move: 1200, hold: 650, ease: "glide", rho: 1, caption: { n: "01", title: "manga strips", sub: "91 pages, panel by panel" } },
  { to: { piece: "strips-s2-clock-a4" }, move: 950, hold: 450, ease: "glide", rho: 0.8 },
  { to: { piece: "strips-s2-clock-a4", frac: [0, 0.02, 1, 0.38] }, move: 750, hold: 850, ease: "glide", rho: 0.4 },
  { to: { piece: "strips-s2-clock-a4", frac: [0, 0.33, 1, 0.69] }, move: 700, hold: 850, ease: "glide", rho: 0.2 },
  { to: { piece: "strips-s2-clock-a4", frac: [0, 0.63, 1, 0.99] }, move: 700, hold: 650, ease: "glide", rho: 0.2 },
  { to: { cluster: "rebuilds" }, move: 1150, hold: 350, ease: "whip", rho: 1.2, caption: { n: "02", title: "rebuilds", sub: "72 posters, every size" } },
  { to: { piece: "tankobon-15-poster-24x36" }, move: 800, hold: 900, ease: "glide", rho: 0.8 },
  { to: { cluster: "stickers" }, move: 1000, hold: 300, ease: "whip", rho: 1.2, caption: { n: "03", title: "stickers", sub: "41 die-cuts" } },
  { to: { piece: "stickers-m-sticker-03-boom-1200x1200" }, move: 700, hold: 750, ease: "glide", rho: 0.8 },
  { to: { cluster: "signs" }, move: 950, hold: 700, ease: "whip", rho: 1.2, caption: { n: "04", title: "signs", sub: "wayfinding for the day" } },
  { to: { all: true }, move: 1500, hold: 1900, ease: "glide", rho: 1.2, drift: 0.02 },
];

export const TOUR_MS = TOUR.reduce((s, x) => s + x.move + x.hold, 0);

/** When the opening title card and the closing end card show, in tour ms. */
export const TITLE_CARD = { in: 0, out: 1500 };
export const END_CARD = TOUR_MS - TOUR[TOUR.length - 1].hold - 300;
