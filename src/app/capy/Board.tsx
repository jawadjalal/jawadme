"use client";

// jawadjalal.com/capy as a board: every piece laid out once, seen from above, explorable like a design file. The engine
// (engine.ts) owns the canvas, camera, input and tour; this file is the chrome around it and the exports.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { layoutBoard, type Asset, type Piece } from "./arrange";
import { Engine, type EngineState } from "./engine";
import * as X from "./exporters";

type Scope = "piece" | "selection" | "view" | "board";
type Fmt = "png" | "svg" | "html" | "copy-svg" | "copy-html";

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export function Board({ assets, kinds, children }: { assets: Asset[]; kinds: string[]; children: ReactNode }) {
  const board = useMemo(() => layoutBoard(assets, kinds), [assets, kinds]);
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const eng = useRef<Engine | null>(null);
  const [st, setSt] = useState<EngineState>({ z: 0, selected: [], cluster: 0, touring: false, hover: -1 });
  const [hidden, setHidden] = useState(false);
  const [list, setList] = useState(false);
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
    const e = new Engine(canvas.current, board);
    eng.current = e;
    e.redraw();
    e.onChange = setSt;
    const cs = getComputedStyle(root.current!);
    const sans = cs.getPropertyValue("--cp-sans").trim();
    const print = cs.getPropertyValue("--cp-print").trim();
    if (sans) e.fonts.sans = `${sans}, ui-sans-serif, system-ui, sans-serif`;
    if (print) e.fonts.print = `${print}, Impact, sans-serif`;
    Promise.all([document.fonts.load(`italic 900 40px ${e.fonts.print}`), document.fonts.load(`500 12px ${e.fonts.sans}`)])
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
  }, [board, list]);

  // the chrome's footprint, so fits and flights land in the clear part of the screen
  useEffect(() => {
    const e = eng.current;
    if (!e) return;
    const set = () => {
      const wide = window.innerWidth >= 900;
      e.inset = hidden ? { t: 24, r: 24, b: 24, l: 24 } : { t: wide ? 96 : 136, r: wide ? 24 : 16, b: wide ? 96 : 88, l: wide ? 228 : 16 };
      e.hidden = hidden;
      if (!e.touched) e.view = e.fitView(e.board);
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
      if (!ps.length) return say("Nothing in view to export");
      const base = scope === "piece" ? X.fileBase(ps[0].a) : `capy-${scope}${scope === "selection" ? `-${ps.length}` : ""}`;
      const title = scope === "board" ? "Capy hackathon assets, the board" : scope === "view" ? "Capy hackathon assets, the view" : `Capy hackathon assets, ${ps.length} pieces`;
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
        say(fmt.startsWith("copy") ? "Copying…" : "Exporting…", 60000);
        if (fmt === "png") {
          let blob: Blob;
          if (scope === "piece") blob = await X.pngOf(ps[0].a);
          else if (scope === "view") blob = await X.viewPng(e.vw, e.vh, 2, (ctx) => e.draw(ctx, e.view, e.vw, e.vh, 2, false));
          else blob = await X.pngSheet(ps, scope === "board" ? 8000 : 6000);
          X.save(blob, `${base}.png`);
          say(`Saved ${base}.png, ${X.mb(blob.size)}`);
        } else if (fmt === "svg") {
          const t = await svg();
          X.save(new Blob([t], { type: "image/svg+xml" }), `${base}.svg`);
          say(`Saved ${base}.svg, ${X.mb(t.length)}`);
        } else if (fmt === "html") {
          const t = await html();
          X.save(new Blob([t], { type: "text/html" }), `${base}.html`);
          say(`Saved ${base}.html, ${X.mb(t.length)}`);
        } else if (fmt === "copy-svg") {
          await X.copyText(svg());
          say("Copied as SVG");
        } else {
          await X.copyText(html());
          say("Copied as HTML");
        }
      } catch {
        say("That export failed. Try PNG, or a smaller selection.", 3500);
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
        <button className="cb-back" onClick={() => setList(false)}>
          Back to the board
        </button>
        {children}
      </div>
    );

  const chromeOff = hidden || st.touring;
  const c = board.clusters[st.cluster];
  const one = selPieces.length === 1 ? selPieces[0] : null;
  const oneCluster = one ? board.clusters[one.cluster] : null;
  const pct = st.z >= 0.1 ? Math.round(st.z * 100) : Math.round(st.z * 1000) / 10;
  const e = eng.current;

  return (
    <div ref={root} className={`cb${chromeOff ? " cb-off" : ""}${st.selected.length ? " cb-has-sel" : ""}`}>
      <canvas ref={canvas} className="cb-canvas" role="img" aria-label={`A board of ${board.pieces.length} Capy hackathon assets in ${board.clusters.length} clusters. Drag to pan, scroll or pinch to zoom, click a piece to fly to it.`} />

      <header className="cb-head">
        <a href="/" className="cb-name">
          Jawad Jalal
        </a>
        <h1 className="cb-title" data-text="Capy hackathon assets">
          Capy hackathon assets
        </h1>
        <p className="cb-fan">Unofficial, unsolicited fan work. Not made by or for Capy or YC.</p>
      </header>

      <nav className={`cb-clusters${clustersOpen ? " cb-open" : ""}`} aria-label="Clusters">
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
            <button onClick={() => e?.step(-1)} aria-label="Previous piece">
              ←
            </button>
            <button onClick={() => e?.step(1)} aria-label="Next piece">
              →
            </button>
            <a href={one.a.original} download>
              Original
            </a>
            <button onClick={() => run("piece", "png")}>PNG</button>
          </div>
        </aside>
      )}
      {selPieces.length > 1 && (
        <aside className="cb-info">
          <p className="cb-info-title">{selPieces.length} pieces selected</p>
          <div className="cb-info-row">
            <button onClick={() => setExp(true)}>Export…</button>
            <button onClick={() => e?.select([], false)}>Clear</button>
          </div>
        </aside>
      )}

      <div className="cb-bar" role="toolbar" aria-label="Board">
        <button onClick={() => e?.zoomBy(1 / 1.6)} aria-label="Zoom out">
          −
        </button>
        <button className="cb-zoom" onClick={() => e?.actualSize()} title="100% (0)">
          {pct}%
        </button>
        <button onClick={() => e?.zoomBy(1.6)} aria-label="Zoom in">
          +
        </button>
        <i />
        <button onClick={() => e?.fit()} title="Fit the board (1)">
          Fit
        </button>
        <button className="cb-mob" onClick={() => setClustersOpen((v) => !v)}>
          {c?.name ?? "Clusters"}
        </button>
        <button onClick={() => e?.startTour()} title="Auto tour (T)">
          Tour <kbd>T</kbd>
        </button>
        <button onClick={() => setExp((v) => !v)} aria-expanded={exp}>
          Export
        </button>
        <i className="cb-wide" />
        <button className="cb-wide" onClick={() => setList(true)}>
          List
        </button>
        <button className="cb-wide" onClick={() => setHelp((v) => !v)} aria-label="Shortcuts">
          ?
        </button>
      </div>

      {exp && <ExportPanel sel={selPieces} onRun={run} onClose={() => setExp(false)} />}

      {help && (
        <div className="cb-help" role="dialog" aria-label="Shortcuts">
          <dl>
            <dt>Drag</dt>
            <dd>Pan, with a throw</dd>
            <dt>Pinch, {isMac() ? "⌘" : "Ctrl"} scroll</dt>
            <dd>Zoom toward the cursor</dd>
            <dt>Click</dt>
            <dd>Fly to a piece</dd>
            <dt>Shift drag</dt>
            <dd>Select several</dd>
            <dt>← →  ↑ ↓</dt>
            <dd>Step through a cluster, or across clusters</dd>
            <dt>Esc</dt>
            <dd>Fly back out</dd>
            <dt>T</dt>
            <dd>Auto tour, 20 seconds</dd>
            <dt>H</dt>
            <dd>Hide everything</dd>
            <dt>1, 0, + −</dt>
            <dd>Fit, 100%, zoom</dd>
            <dt>E</dt>
            <dd>Export</dd>
          </dl>
        </div>
      )}

      <p className="cb-hint">Drag to pan. Pinch or scroll to zoom. Click to fly in, Esc to fly out. T for the tour.</p>
      {st.touring && !hidden && <p className="cb-tourhint">Esc to stop · H hides this</p>}
      {toast && (
        <p className="cb-toast" role="status">
          {toast}
        </p>
      )}
    </div>
  );
}

function ExportPanel({ sel, onRun, onClose }: { sel: Piece[]; onRun: (s: Scope, f: Fmt) => void; onClose: () => void }) {
  const scopes: { id: Scope; label: string }[] = [
    ...(sel.length === 1 ? [{ id: "piece" as Scope, label: "This piece" }] : []),
    ...(sel.length > 1 ? [{ id: "selection" as Scope, label: `Selection (${sel.length})` }] : []),
    { id: "view", label: "Current view" },
    { id: "board", label: "Whole board" },
  ];
  const [scope, setScope] = useState<Scope>(scopes[0].id);
  useEffect(() => setScope(scopes[0].id), [sel.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const one = scope === "piece" ? sel[0]?.a : null;
  return (
    <div className="cb-exp" role="dialog" aria-label="Export">
      <div className="cb-exp-head">
        <p>Export</p>
        <button onClick={onClose} aria-label="Close">
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
        <button onClick={() => onRun(scope, "png")}>PNG</button>
        <button onClick={() => onRun(scope, "svg")}>SVG</button>
        <button onClick={() => onRun(scope, "html")}>HTML</button>
        <button onClick={() => onRun(scope, "copy-svg")}>Copy SVG</button>
        <button onClick={() => onRun(scope, "copy-html")}>Copy HTML</button>
        {one?.type === "video" && (
          <a href={one.original} download>
            MP4
          </a>
        )}
      </div>
      <p className="cb-exp-note">
        {one && X.isVector(one)
          ? "This SVG is true vector."
          : "SVG and HTML wrap the pictures: none of these pieces has a vector source, so the SVG is not true vector."}{" "}
        {scope === "view" ? "The view PNG is what you see, at 2x." : scope === "board" ? "The board exports use small copies so the file stays sendable." : ""} Every file carries the fan work line.
      </p>
    </div>
  );
}
