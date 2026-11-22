"use client";

// jawadjalal.com/capy as a board: every piece laid out once, seen from above, explorable like a design file. The engine
// (engine.ts) owns the canvas, camera, input and tour; this file is the chrome around it and the exports.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Gilded } from "@/components/gilded/Gilded";
import { layoutBoard, type Asset, type Piece } from "./arrange";
import { Engine, type EngineState } from "./engine";
import * as X from "./exporters";

type Scope = "piece" | "selection" | "view" | "board";
type Fmt = "png" | "svg" | "html" | "copy-svg" | "copy-html";

const PHONE = "(max-width: 899px)";
/** the way from the page to the board, which the page's top bar shows: "see the board" on a phone, "back to the board" from the list */
const ToBoard = createContext<{ label: string; go: () => void } | null>(null);

export function BoardLink() {
  const to = useContext(ToBoard);
  if (!to) return null;
  return (
    <span className="cp-board">
      <Gilded variant="pill" href="#board" onClick={to.go}>
        {to.label}
      </Gilded>
    </span>
  );
}
const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export function Board({ assets, kinds, children }: { assets: Asset[]; kinds: string[]; children: ReactNode }) {
  const board = useMemo(() => layoutBoard(assets, kinds), [assets, kinds]);
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const eng = useRef<Engine | null>(null);
  const [st, setSt] = useState<EngineState>({ z: 0, selected: [], cluster: 0, touring: false, hover: -1 });
  const [hidden, setHidden] = useState(false);
  const [list, setList] = useState(false);
  /** phones open on the list; the canvas loads only once they ask for the board */
  const [asked, setAsked] = useState(false);
  const [exp, setExp] = useState(false);
  const [help, setHelp] = useState(false);
  const [clustersOpen, setClustersOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastT = useRef<ReturnType<typeof setTimeout>>(undefined);

  const say = useCallback((t: string, ms = 2200) => {
    setToast(t);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), ms);
  }, []);

  // the engine, once
  useEffect(() => {
    if (list || !canvas.current) return;
    if (!asked && matchMedia(PHONE).matches) return;
    const e = new Engine(canvas.current, board);
    eng.current = e;
    e.redraw();
    e.onChange = setSt;
    const cs = getComputedStyle(root.current!);
    const sans = cs.getPropertyValue("--f-geist").trim();
    const print = cs.getPropertyValue("--f-display").trim();
    if (sans) e.fonts.sans = `${sans}, "Helvetica Neue", Arial, sans-serif`;
    if (print) e.fonts.print = `${print}, "Helvetica Neue", Arial, sans-serif`;
    Promise.all([document.fonts.load(`700 40px ${e.fonts.print}`), document.fonts.load(`500 12px ${e.fonts.sans}`)])
      .catch(() => {})
      .finally(() => e.redraw());
    // a link to one piece (#id) opens on it
    const id = decodeURIComponent(location.hash.slice(1));
    const hit = id && board.pieces.find((p) => p.a.id === id);
    if (hit) e.focus(hit.i);
    // the recorder's handle: ?record freezes the clock so frames can be stepped exactly
    const q = new URLSearchParams(location.search);
    const w = window as unknown as { __capy?: unknown };
    w.__capy = {
      engine: e,
      record: q.has("record"),
      settle: () =>
        new Promise<void>((ok) => {
          const check = () => (e.pics.idle ? ok() : setTimeout(check, 30));
          check();
        }),
    };
    return () => {
      e.destroy();
      eng.current = null;
      delete w.__capy;
    };
  }, [board, list, asked]);

  // the chrome's footprint, so fits and flights land in the clear part of the screen
  useEffect(() => {
    const e = eng.current;
    if (!e) return;
    const set = () => {
      const wide = window.innerWidth >= 900;
      e.inset = hidden ? { t: 24, r: 24, b: 24, l: 24 } : { t: wide ? 96 : 250, r: wide ? 24 : 16, b: wide ? 96 : 88, l: wide ? 228 : 16 };
      e.hidden = hidden;
      if (!e.touched) e.view = e.openView();
      e.redraw();
    };
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, [hidden, list]);

  // the selection rides in the URL so a piece can be linked
  useEffect(() => {
    if (list) return;
    const one = st.selected.length === 1 ? board.pieces[st.selected[0]].a.id : "";
    const want = one ? `#${one}` : "";
    if (location.hash !== want) history.replaceState(null, "", `${location.pathname}${location.search}${want}`);
  }, [st.selected, board, list]);

  const selPieces = useMemo(() => st.selected.map((i) => board.pieces[i]), [st.selected, board]);

  const run = useCallback(
    async (scope: Scope, fmt: Fmt) => {
      const e = eng.current;
      if (!e) return;
      const ps: Piece[] = scope === "piece" || scope === "selection" ? selPieces : scope === "view" ? e.visiblePieces() : board.pieces;
      if (!ps.length) return say("nothing in view to export");
      const base = scope === "piece" ? X.fileBase(ps[0].a) : `capy-${scope}${scope === "selection" ? `-${ps.length}` : ""}`;
      const title = scope === "board" ? "capy hackathon assets, the board" : scope === "view" ? "capy hackathon assets, the view" : `capy hackathon assets, ${ps.length} pieces`;
      const svg = () => (scope === "piece" ? X.svgOf(ps[0].a).then((r) => r.text) : X.svgSheet(ps));
      const html = () =>
        scope === "piece"
          ? X.htmlOf(ps[0].a)
          : scope === "board"
            ? X.boardHtml(
                ps,
                board.clusters.map((c) => ({ x: c.x, y: c.y + c.title * 1.25, size: c.title, text: c.name })),
                board,
              )
            : X.htmlSheet(ps, title);
      try {
        say(fmt.startsWith("copy") ? "copying…" : "exporting…", 60000);
        if (fmt === "png") {
          let blob: Blob;
          if (scope === "piece") blob = await X.pngOf(ps[0].a);
          else if (scope === "view") blob = await X.viewPng(e.vw, e.vh, 2, (ctx) => e.draw(ctx, e.view, e.vw, e.vh, 2, false));
          else blob = await X.pngSheet(ps, scope === "board" ? 8000 : 6000);
          X.save(blob, `${base}.png`);
          say(`saved ${base}.png, ${X.mb(blob.size)}`);
        } else if (fmt === "svg") {
          const t = await svg();
          X.save(new Blob([t], { type: "image/svg+xml" }), `${base}.svg`);
          say(`saved ${base}.svg, ${X.mb(t.length)}`);
        } else if (fmt === "html") {
          const t = await html();
          X.save(new Blob([t], { type: "text/html" }), `${base}.html`);
          say(`saved ${base}.html, ${X.mb(t.length)}`);
        } else if (fmt === "copy-svg") {
          await X.copyText(svg());
          say("copied as svg");
        } else {
          await X.copyText(html());
          say("copied as html");
        }
      } catch {
        say("that export failed. try png, or a smaller selection.", 3500);
      }
    },
    [board, selPieces, say],
  );

  // keys
  useEffect(() => {
    if (list) return;
    const onKey = (ev: KeyboardEvent) => {
      const e = eng.current;
      if (!e) return;
      const t = ev.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (ev.metaKey || ev.ctrlKey || ev.altKey) {
        // cmd + and cmd - zoom the board, not the page
        if (ev.key === "=" || ev.key === "+" || ev.key === "-") {
          ev.preventDefault();
          e.stopMotion();
          e.zoomBy(ev.key === "-" ? 1 / 1.6 : 1.6);
        }
        return;
      }
      const k = ev.key;
      if (ev.repeat && /^[tThHeE?]$/.test(k)) return ev.preventDefault();
      let used = true;
      if (e.tour && k.startsWith("Arrow")) e.stopTour();
      if (k === "Escape") {
        if (exp || help || clustersOpen) {
          setExp(false);
          setHelp(false);
          setClustersOpen(false);
        } else e.escape();
      } else if (k === "t" || k === "T") {
        if (e.tour) e.stopTour();
        else {
          setExp(false);
          setHelp(false);
          e.startTour();
        }
      } else if (k === "h" || k === "H") setHidden((h) => !h);
      else if (k === "1" || k === "!") (e.stopMotion(), e.fit());
      else if (k === "0" || k === ")") (e.stopMotion(), e.actualSize());
      else if (k === "+" || k === "=") (e.stopMotion(), e.zoomBy(1.6));
      else if (k === "-" || k === "_") (e.stopMotion(), e.zoomBy(1 / 1.6));
      else if (k === "ArrowRight") (e.stopMotion(), e.step(1));
      else if (k === "ArrowLeft") (e.stopMotion(), e.step(-1));
      else if (k === "ArrowDown") (e.stopMotion(), e.step(1, true));
      else if (k === "ArrowUp") (e.stopMotion(), e.step(-1, true));
      else if (k === "e" || k === "E") setExp((v) => !v);
      else if (k === "?") setHelp((v) => !v);
      else used = false;
      if (used) ev.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [list, exp, help, clustersOpen]);

  if (list)
    return (
      <div ref={root} className="cb-list">
        <ToBoard.Provider value={{ label: "back to the board", go: () => setList(false) }}>{children}</ToBoard.Provider>
      </div>
    );

  const chromeOff = hidden || st.touring;
  const c = board.clusters[st.cluster];
  const one = selPieces.length === 1 ? selPieces[0] : null;
  const oneCluster = one ? board.clusters[one.cluster] : null;
  const pct = st.z >= 0.1 ? Math.round(st.z * 100) : Math.round(st.z * 1000) / 10;
  const e = eng.current;

  return (
    <>
    {asked ? null : (
      <div className="cb-phone">
        <ToBoard.Provider value={{ label: "see the board", go: () => setAsked(true) }}>{children}</ToBoard.Provider>
      </div>
    )}
    <div ref={root} id="board" className={`cb${asked ? " cb-asked" : ""}${chromeOff ? " cb-off" : ""}${st.selected.length ? " cb-has-sel" : ""}`}>
      <canvas ref={canvas} className="cb-canvas" role="img" aria-label={`a board of ${board.pieces.length} capy hackathon assets in ${board.clusters.length} clusters. drag to pan, scroll or pinch to zoom, click a piece to fly to it.`} />

      <header className="cb-head">
        <Gilded variant="pill" href="/">
          ← jawad jalal
        </Gilded>
        <h1 className="cb-title" data-text="capy hackathon assets">
          capy hackathon assets
        </h1>
        <p className="cb-fan">unofficial, unsolicited fan work. not made by or for capy or yc.</p>
      </header>
      <span className="cb-call">
        <Gilded variant="cta" src="capy" size="dock" />
      </span>

      <nav className={`cb-clusters${clustersOpen ? " cb-open" : ""}`} aria-label="clusters">
        <ol>
          {board.clusters.map((k, i) => (
            <li key={k.kind}>
              <button
                aria-current={i === st.cluster}
                onClick={() => {
                  setClustersOpen(false);
                  e?.stopMotion();
                  e?.forget();
                  e?.select([], false);
                  e?.flyTo(e.fitView(k, 0));
                }}
              >
                <span>{k.name}</span>
                <em>{k.count}</em>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {one && oneCluster && (
        <aside className="cb-info" aria-live="polite">
          <p className="cb-info-title">{one.a.title}</p>
          <p className="cb-info-meta">
            {one.a.size}
            <span>·</span>
            {oneCluster.name} {one.i - oneCluster.first + 1} of {oneCluster.last - oneCluster.first + 1}
          </p>
          <div className="cb-info-row">
            <button onClick={() => e?.step(-1)} aria-label="previous piece">
              ←
            </button>
            <button onClick={() => e?.step(1)} aria-label="next piece">
              →
            </button>
            <a href={one.a.original} download>
              original
            </a>
            <button onClick={() => run("piece", "png")}>png</button>
          </div>
        </aside>
      )}
      {selPieces.length > 1 && (
        <aside className="cb-info">
          <p className="cb-info-title">{selPieces.length} pieces selected</p>
          <div className="cb-info-row">
            <button onClick={() => setExp(true)}>export…</button>
            <button onClick={() => e?.select([], false)}>clear</button>
          </div>
        </aside>
      )}

      <div className="cb-bar" role="toolbar" aria-label="board">
        <button onClick={() => e?.zoomBy(1 / 1.6)} aria-label="zoom out">
          −
        </button>
        <button className="cb-zoom" onClick={() => e?.actualSize()} title="100% (0)">
          {pct}%
        </button>
        <button onClick={() => e?.zoomBy(1.6)} aria-label="zoom in">
          +
        </button>
        <i />
        <button onClick={() => e?.fit()} title="fit the board (1)">
          fit
        </button>
        <button className="cb-mob" onClick={() => setClustersOpen((v) => !v)}>
          {c?.name ?? "clusters"}
        </button>
        <button onClick={() => e?.startTour()} title="auto tour (t)">
          tour <kbd>t</kbd>
        </button>
        <button onClick={() => setExp((v) => !v)} aria-expanded={exp}>
          export
        </button>
        <i className="cb-wide" />
        <button className="cb-wide" onClick={() => setList(true)}>
          list
        </button>
        <button className="cb-wide" onClick={() => setHelp((v) => !v)} aria-label="shortcuts">
          ?
        </button>
      </div>

      {exp && <ExportPanel sel={selPieces} onRun={run} onClose={() => setExp(false)} />}

      {help && (
        <div className="cb-help" role="dialog" aria-label="shortcuts">
          <dl>
            <dt>drag</dt>
            <dd>pan, with a throw</dd>
            <dt>pinch, {isMac() ? "⌘" : "ctrl"} scroll</dt>
            <dd>zoom toward the cursor</dd>
            <dt>click</dt>
            <dd>fly to a piece</dd>
            <dt>shift drag</dt>
            <dd>select several</dd>
            <dt>← →  ↑ ↓</dt>
            <dd>step through a cluster, or across clusters</dd>
            <dt>esc</dt>
            <dd>fly back out</dd>
            <dt>t</dt>
            <dd>auto tour, 20 seconds</dd>
            <dt>h</dt>
            <dd>hide everything</dd>
            <dt>1, 0, + −</dt>
            <dd>fit, 100%, zoom</dd>
            <dt>e</dt>
            <dd>export</dd>
          </dl>
        </div>
      )}

      <p className="cb-hint">drag to pan. pinch or scroll to zoom. click to fly in, esc to fly out. t for the tour.</p>
      {st.touring && !hidden && <p className="cb-tourhint">esc to stop · h hides this</p>}
      {toast && (
        <p className="cb-toast" role="status">
          {toast}
        </p>
      )}
    </div>
    </>
  );
}

function ExportPanel({ sel, onRun, onClose }: { sel: Piece[]; onRun: (s: Scope, f: Fmt) => void; onClose: () => void }) {
  const scopes: { id: Scope; label: string }[] = [
    ...(sel.length === 1 ? [{ id: "piece" as Scope, label: "this piece" }] : []),
    ...(sel.length > 1 ? [{ id: "selection" as Scope, label: `selection (${sel.length})` }] : []),
    { id: "view", label: "current view" },
    { id: "board", label: "whole board" },
  ];
  const [scope, setScope] = useState<Scope>(scopes[0].id);
  useEffect(() => setScope(scopes[0].id), [sel.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const one = scope === "piece" ? sel[0]?.a : null;
  return (
    <div className="cb-exp" role="dialog" aria-label="export">
      <div className="cb-exp-head">
        <p>export</p>
        <button onClick={onClose} aria-label="close">
          ×
        </button>
      </div>
      <div className="cb-seg" role="radiogroup">
        {scopes.map((s) => (
          <button key={s.id} role="radio" aria-checked={scope === s.id} onClick={() => setScope(s.id)}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="cb-fmts">
        <button onClick={() => onRun(scope, "png")}>png</button>
        <button onClick={() => onRun(scope, "svg")}>svg</button>
        <button onClick={() => onRun(scope, "html")}>html</button>
        <button onClick={() => onRun(scope, "copy-svg")}>copy svg</button>
        <button onClick={() => onRun(scope, "copy-html")}>copy html</button>
        {one?.type === "video" && (
          <a href={one.original} download>
            mp4
          </a>
        )}
      </div>
      <p className="cb-exp-note">
        {one && X.isVector(one)
          ? "this svg is true vector."
          : "svg and html wrap the pictures: none of these pieces has a vector source, so the svg is not true vector."}{" "}
        {scope === "view" ? "the view png is what you see, at 2x." : scope === "board" ? "the board exports use small copies so the file stays sendable." : ""} every file carries the fan work line.
      </p>
    </div>
  );
}
