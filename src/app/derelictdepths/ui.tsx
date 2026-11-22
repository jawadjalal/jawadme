import sizes from "./diagrams.json";

export function Tag({ area }: { area: string }) {
  return <span className="ml-tag">{area}</span>;
}

// The feed and the launch board come from the game repo's own text, which cites tickets (#421, robl-40, jaw-280 p1) and
// commits. The page shows the words without them: each id goes, with the preposition or brackets it leaves dangling.
const ID = String.raw`(?:#\d+|\b(?:robl|jaw)-\d+\b(?:\s+(?:p\d+|items?\s+\d+(?:(?:,\s*|\s+and\s+)\d+)*|polish))?|\b(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}\b)`;
const LEAD_ID = new RegExp(String.raw`\b(?:since|from|on|at|in|per|via|see|supersedes)\s+` + ID, "gi");
const BARE_ID = new RegExp(ID, "gi");

export function scrub(t: string): string {
  return t
    .replace(LEAD_ID, "")
    .replace(BARE_ID, "")
    .replace(/\(\s*(?:[,;:]\s*)+/g, "(")
    .replace(/(?:\s*[,;:])+\s*\)/g, ")")
    .replace(/\s*\(\s*\)/g, "")
    .replace(/,\s*(?=[,.;:])/g, "")
    .replace(/([.;:])\s*,\s*/g, "$1 ")
    .replace(/\s+([,.;:)])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,.;:]+/, "")
    .trim();
}

type Size = { w: number; h: number };

// A Mermaid diagram, pre-rendered to a static SVG by diagrams/render.sh. Wide ones scroll sideways on a phone.
export function Diagram({ name, alt, caption }: { name: string; alt: string; caption: React.ReactNode }) {
  const size = (sizes as Record<string, Size>)[name];
  const wide = size.w > 700;
  const src = "/derelictdepths/d/" + name + ".svg";
  return (
    <figure className={"ml-fig" + (wide ? " ml-wide" : "")}>
      {wide ? <div className="ml-hint">scroll sideways, or open it full size.</div> : null}
      <div className="ml-fig-body" {...(wide ? { tabIndex: 0, role: "region", "aria-label": alt } : {})}>
        <img src={src} alt={alt} width={size.w} height={size.h} loading="lazy" decoding="async" style={{ maxWidth: size.w }} />
      </div>
      <figcaption>
        <span>{caption}</span>
        <a href={src} target="_blank" rel="noopener">open full size</a>
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
        src={"/derelictdepths/img/" + name + "-1280.jpg"}
        srcSet={"/derelictdepths/img/" + name + "-640.jpg 640w, /derelictdepths/img/" + name + "-768.jpg 768w, /derelictdepths/img/" + name + "-1280.jpg 1280w"}
        sizes="(min-width: 760px) 520px, 100vw"
        width={1280}
        height={720}
        alt={title + " (" + (art ? "in-engine capture with key-art treatment" : "in-engine capture") + ")"}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
      <figcaption>
        <b>{title}</b>
        <span className={"ml-badge" + (art ? " art" : "")}>{art ? "in-engine + key art" : "in-engine capture"}</span>
        {note}
      </figcaption>
    </figure>
  );
}

// A captured frame at its own size: a Studio look study, or a game capture whose shape isn't 16:9.
export function Shot({ name, w, h, title, note, kind, eager = false }: { name: string; w: number; h: number; title: string; note: string; kind: string; eager?: boolean }) {
  return (
    <figure className="ml-shot">
      <img
        src={"/derelictdepths/img/" + name + "-1280.jpg"}
        srcSet={"/derelictdepths/img/" + name + "-640.jpg 640w, /derelictdepths/img/" + name + "-768.jpg 768w, /derelictdepths/img/" + name + "-1280.jpg 1280w"}
        sizes="(min-width: 760px) 520px, 100vw"
        width={w}
        height={h}
        alt={title + " (" + kind.toLowerCase() + ")"}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
      <figcaption>
        <b>{title}</b>
        <span className="ml-badge">{kind}</span>
        {note}
      </figcaption>
    </figure>
  );
}
