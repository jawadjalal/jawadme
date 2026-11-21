/** A lettered "design mastermind": one path per letter, 1000 units to the em, baseline at 0, y down; asc and desc
 *  bound the drawing above and below the baseline. w is each word's advance. */
export type Mark = { asc: number; desc: number; words: { t: string; w: number; g: string[] }[] };
