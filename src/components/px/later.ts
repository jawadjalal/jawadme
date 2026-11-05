// Runs `fn` once the page has loaded, a beat has passed and the browser is
// idle, so heavy setup (WebGL, shader compiles) never lands before the first
// screen has painted. Returns a cancel function.
export function later(fn: () => void, wait = 1200): () => void {
  let t = 0, id = 0;
  const idle = "requestIdleCallback" in window;
  const go = () => {
    t = window.setTimeout(() => {
      id = idle ? requestIdleCallback(fn, { timeout: 2000 }) : window.setTimeout(fn, 0);
    }, wait);
  };
  if (document.readyState === "complete") go();
  else addEventListener("load", go, { once: true });
  return () => {
    removeEventListener("load", go);
    clearTimeout(t);
    if (idle) cancelIdleCallback(id);
    else clearTimeout(id);
  };
}
