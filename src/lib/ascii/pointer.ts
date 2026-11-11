/**
 * Pointer tracking for ASCII renderers: where the pointer is over an
 * element in uv space (y up, as fields see it), how fast it moves, whether
 * it's there at all, and where the last press landed. Values are smoothed
 * so glyphs glide after the pointer instead of snapping to it.
 *
 * Listens on `window`, so it works on elements with `pointer-events: none`
 * (every decorative ASCII canvas) and keeps tracking through overlays.
 * Writes into preallocated arrays; nothing allocates per frame.
 */

export interface PointerTracker {
  /** uv x, uv y (y up), presence 0..1 (smoothed). */
  readonly pointer: Float32Array;
  /** Smoothed velocity in uv per second, y up. */
  readonly velocity: Float32Array;
  /** uv x, uv y of the last press, then seconds since it. */
  readonly click: Float32Array;
  /** Advance the smoothing by `delta` seconds. Call once per frame. */
  update(delta: number): void;
  /** Stop listening. */
  dispose(): void;
}

// Seconds for the smoothed position and presence to cover ~63% of a jump.
const FOLLOW = 0.08;
const FADE = 0.25;

/** Track the pointer over `element`. Browser only. */
export const trackPointer = (element: Element): PointerTracker => {
  const pointer = new Float32Array([0.5, 0.5, 0]);
  const velocity = new Float32Array(2);
  const click = new Float32Array([0.5, 0.5, 1e3]);
  let targetX = 0.5;
  let targetY = 0.5;
  let inside = false;
  let seen = false;

  const locate = (event: PointerEvent): boolean => {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return false;
    }
    const x = (event.clientX - rect.left) / rect.width;
    const y = 1 - (event.clientY - rect.top) / rect.height;
    inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
    targetX = x;
    targetY = y;
    if (!seen) {
      // The first sighting starts at the pointer, not gliding in from the centre.
      seen = true;
      pointer[0] = x;
      pointer[1] = y;
    }
    return inside;
  };

  const onMove = (event: PointerEvent) => {
    locate(event);
  };
  const onDown = (event: PointerEvent) => {
    if (locate(event)) {
      click[0] = targetX;
      click[1] = targetY;
      click[2] = 0;
    }
  };
  const onLeave = () => {
    inside = false;
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerdown", onDown, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);

  return {
    click,
    dispose: () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    },
    pointer,
    update: (delta) => {
      if (delta <= 0) {
        return;
      }
      const follow = 1 - Math.exp(-delta / FOLLOW);
      const fade = 1 - Math.exp(-delta / FADE);
      const previousX = pointer[0] ?? 0.5;
      const previousY = pointer[1] ?? 0.5;
      const x = previousX + (targetX - previousX) * follow;
      const y = previousY + (targetY - previousY) * follow;
      pointer[0] = x;
      pointer[1] = y;
      pointer[2] =
        (pointer[2] ?? 0) + ((inside ? 1 : 0) - (pointer[2] ?? 0)) * fade;
      velocity[0] =
        (velocity[0] ?? 0) +
        ((x - previousX) / delta - (velocity[0] ?? 0)) * fade;
      velocity[1] =
        (velocity[1] ?? 0) +
        ((y - previousY) / delta - (velocity[1] ?? 0)) * fade;
      click[2] = Math.min(1e3, (click[2] ?? 0) + delta);
    },
    velocity,
  };
};
