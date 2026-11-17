import sizes from "./diagrams.json";

const AREA: Record<string, string> = {
  Look: "#ffc043", Camera: "#7fd4ff", Combat: "#ff6b6b", Enemies: "#ff8fb1", Floors: "#9be37a", UI: "#c5a8ff",
  Audio: "#6ee7d8", Heroes: "#ffd59a", Loop: "#ffb36b", Tools: "#a8b3ff", Tests: "#8fd3a8", Docs: "#b9addb", Perf: "#f5e663",
};

export function Tag({ area }: { area: string }) {
  return <span className="ml-tag" style={{ color: AREA[area] ?? "#b9addb" }}>{area}</span>;
}

type Size = { w: number; h: number };

// A Mermaid diagram, pre-rendered to a static SVG by diagrams/render.sh. Wide ones scroll sideways on a phone.
export function Diagram({ name, alt, caption }: { name: string; alt: string; caption: React.ReactNode }) {
  const size = (sizes as Record<string, Size>)[name];
  const wide = size.w > 700;
  const src = "/minelight/d/" + name + ".svg";
  return (
    <figure className={"ml-fig" + (wide ? " ml-wide" : "")}>
      <div className="ml-fig-body">
        <img src={src} alt={alt} width={size.w} height={size.h} loading="lazy" decoding="async" style={{ maxWidth: size.w }} />
      </div>
      {wide ? <div className="ml-hint">Scroll sideways, or open it full size.</div> : null}
      <figcaption>
        <span>{caption}</span>
        <a href={src} target="_blank" rel="noopener">Open full size</a>
      </figcaption>
    </figure>
  );
}

export function Table({ head, rows, num = [] }: { head: string[]; rows: React.ReactNode[][]; num?: number[] }) {
  return (
    <div className={"ml-tbl" + (head.length >= 3 ? " ml-tbl-wide" : "")}>
      <table>
        <thead><tr>{head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} className={num.includes(j) ? "n" : undefined}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Still({ name, title, note, art = false, eager = false }: { name: string; title: string; note: string; art?: boolean; eager?: boolean }) {
  return (
    <figure className="ml-still">
      <img
        src={"/minelight/img/" + name + "-1280.jpg"}
        srcSet={"/minelight/img/" + name + "-640.jpg 640w, /minelight/img/" + name + "-1280.jpg 1280w"}
        sizes="(min-width: 760px) 520px, 100vw"
        width={1280}
        height={720}
        alt={title + " (" + (art ? "in-engine capture with key-art treatment" : "in-engine capture") + ")"}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
      <figcaption>
        <b>{title}</b>
        <span className={"ml-badge" + (art ? " art" : "")}>{art ? "In-engine + key art" : "In-engine capture"}</span>
        {note}
      </figcaption>
    </figure>
  );
}
