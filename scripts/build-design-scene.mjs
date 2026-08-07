// Turns the jawadOS scene templates in design/templates/*.html into React
// components under src/app/design/scene/.
//
// The templates come out of the design tool as HTML with a handful of custom
// directives. Rather than hand-convert ~1300 lines of inline-styled markup
// (and re-do it every time the scene is tweaked), this reads the templates and
// emits TSX. Edit the HTML, run `npm run design:scene`, commit both.
//
// Directives understood:
//   <sc-if value="{{ flag }}">…</sc-if>       → {V.flag ? <>…</> : null}
//   <sc-for list="{{ xs }}" as="item">…       → {V.xs.map((item, i) => …)}
//   sc-camel-on-click="{{ fn }}"              → onClick={V.fn}
//   ref="{{ fn }}"                            → ref={V.fn}
//   attr="{{ value }}"                        → attr={V.value}
//   {{ value }} in text                       → {V.value}
//   style="a:b;c:d"                           → style={{ a: "b", c: "d" }}
//   style-hover="a:b"                         → hoisted into a real :hover rule
//
// The hover rules are collected per template and emitted as a CSS string the
// component drops into a <style> tag, so hover states survive the port without
// a class-name-per-element hand pass.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Hover-class prefixes, one per emitted scene component. Distinct by
// construction so two templates can never emit the same class name.
const PREFIXES = {
  SceneDesktop: "jd",
  SceneMobile: "jm",
  SceneHomeDesktop: "jhd",
  SceneHomeMobile: "jhm",
};

const VOID = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

// Attribute names that differ in React. Everything else passes through, and
// sc-camel-* / style / style-hover / ref are handled specially.
const ATTR = {
  class: "className",
  for: "htmlFor",
  autocomplete: "autoComplete",
  tabindex: "tabIndex",
  maxlength: "maxLength",
  readonly: "readOnly",
  spellcheck: "spellCheck",
  colspan: "colSpan",
  rowspan: "rowSpan",
  srcset: "srcSet",
  novalidate: "noValidate",
  enterkeyhint: "enterKeyHint",
  inputmode: "inputMode",
  // SVG
  viewbox: "viewBox",
  preserveaspectratio: "preserveAspectRatio",
  fillrule: "fillRule",
  cliprule: "clipRule",
  clippath: "clipPath",
  strokewidth: "strokeWidth",
  strokelinecap: "strokeLinecap",
  strokelinejoin: "strokeLinejoin",
  stopcolor: "stopColor",
  stopopacity: "stopOpacity",
  gradientunits: "gradientUnits",
  textanchor: "textAnchor",
  "aria-hidden": "aria-hidden",
};

// Attributes React types as numbers rather than strings.
const NUMERIC = new Set(["rows", "cols", "size", "span", "start", "maxlength", "tabindex"]);

const dashToCamel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

// ── tokenizer ────────────────────────────────────────────────────────────────

function tokenize(html) {
  const out = [];
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf("<", i);
    if (lt < 0) {
      out.push({ t: "text", v: html.slice(i) });
      break;
    }
    if (lt > i) out.push({ t: "text", v: html.slice(i, lt) });
    if (html.startsWith("<!--", lt)) {
      const end = html.indexOf("-->", lt);
      i = end < 0 ? html.length : end + 3;
      continue;
    }
    // Attribute values may contain '>' (clip-path polygons do not, but data
    // URIs and CSS selectors can), so walk the tag respecting quotes.
    let j = lt + 1;
    let quote = null;
    while (j < html.length) {
      const c = html[j];
      if (quote) {
        if (c === quote) quote = null;
      } else if (c === '"' || c === "'") {
        quote = c;
      } else if (c === ">") break;
      j++;
    }
    const raw = html.slice(lt + 1, j);
    i = j + 1;
    if (raw.startsWith("/")) {
      out.push({ t: "close", name: raw.slice(1).trim().toLowerCase() });
      continue;
    }
    const selfClosing = raw.endsWith("/");
    const inner = selfClosing ? raw.slice(0, -1) : raw;
    const nameMatch = /^([a-zA-Z][\w:-]*)/.exec(inner);
    const name = nameMatch[1].toLowerCase();
    const attrs = [];
    const re = /([a-zA-Z_:][-\w:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
    re.lastIndex = nameMatch[0].length;
    let m;
    while ((m = re.exec(inner))) {
      attrs.push([m[1], m[2] ?? m[3] ?? m[4] ?? ""]);
    }
    out.push({
      t: "open",
      name,
      attrs,
      void: selfClosing || VOID.has(name),
    });
  }
  return out;
}

// ── tree ─────────────────────────────────────────────────────────────────────

function parse(html) {
  const root = { name: "#root", children: [] };
  const stack = [root];
  for (const tok of tokenize(html)) {
    const top = stack[stack.length - 1];
    if (tok.t === "text") {
      if (tok.v.trim()) top.children.push({ name: "#text", value: tok.v });
      continue;
    }
    if (tok.t === "open") {
      const node = { name: tok.name, attrs: tok.attrs, children: [] };
      top.children.push(node);
      if (!tok.void) stack.push(node);
      continue;
    }
    // close: unwind to the matching open, tolerating stray closes
    for (let k = stack.length - 1; k > 0; k--) {
      if (stack[k].name === tok.name) {
        stack.length = k;
        break;
      }
    }
  }
  return root;
}

// ── css → style object ───────────────────────────────────────────────────────

function splitDecls(css) {
  const out = [];
  let depth = 0;
  let quote = null;
  let cur = "";
  for (const c of css) {
    if (quote) {
      cur += c;
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      cur += c;
      continue;
    }
    if (c === "(") depth++;
    if (c === ")") depth--;
    if (c === ";" && depth === 0) {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function styleObject(css) {
  const pairs = [];
  for (const decl of splitDecls(css)) {
    const idx = decl.indexOf(":");
    if (idx < 0) continue;
    const prop = decl.slice(0, idx).trim();
    const value = decl.slice(idx + 1).trim();
    const key = prop.startsWith("--") ? `"${prop}"` : JSON.stringify(dashToCamel(prop));
    pairs.push(`${key}: ${JSON.stringify(value)}`);
  }
  return `{ ${pairs.join(", ")} }`;
}

// ── expressions ──────────────────────────────────────────────────────────────

const MUSTACHE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;

// `item.label` inside an sc-for refers to the loop variable, not the value bag.
function expr(source, scope) {
  const s = source.trim();
  if (s === "true") return "true";
  if (s === "false") return "false";
  const head = /^([A-Za-z_$][\w$]*)/.exec(s);
  if (head && scope.has(head[1])) return s;
  return `V.${s}`;
}

function textToJsx(value, scope) {
  // Collapse the template's indentation the way HTML would, then interleave
  // literal runs with {{ }} expressions.
  const parts = [];
  let last = 0;
  const re = /\{\{\s*([^}]+?)\s*\}\}/g;
  let m;
  while ((m = re.exec(value))) {
    if (m.index > last) parts.push(lit(value.slice(last, m.index)));
    parts.push(`{${expr(m[1], scope)}}`);
    last = m.index + m[0].length;
  }
  if (last < value.length) parts.push(lit(value.slice(last)));
  return parts.filter(Boolean).join("");
}

function lit(text) {
  const collapsed = text.replace(/\s+/g, " ");
  if (!collapsed.trim()) return collapsed.includes(" ") ? "{\" \"}" : "";
  // JSX text can't hold braces or angle brackets; ship it as a string child.
  return `{${JSON.stringify(collapsed)}}`;
}

// ── emit ─────────────────────────────────────────────────────────────────────

function build(html, componentName) {
  const root = parse(html);
  const hover = [];
  let hoverSeq = 0;
  // Hover classes are numbered per template, so every template needs its own
  // prefix or two scenes would define the same class names differently. Derived
  // from the component name rather than a mobile/desktop guess, so adding a
  // template cannot silently collide with an existing one.
  const prefix = PREFIXES[componentName];
  if (!prefix) throw new Error(`no hover-class prefix registered for ${componentName}`);

  function emitAttrs(attrs, scope) {
    const out = [];
    let className = null;
    for (const [rawName, rawValue] of attrs) {
      const name = rawName.toLowerCase();
      if (name === "style-hover") {
        const cls = `${prefix}h${hoverSeq++}`;
        hover.push(`.${cls}:hover{${rawValue}}`);
        className = className ? `${className} ${cls}` : cls;
        continue;
      }
      if (name === "style") {
        out.push(`style={s(${styleObject(rawValue)})}`);
        continue;
      }
      if (name.startsWith("hint-")) continue; // authoring-time only
      if (name === "class") {
        className = className ? `${rawValue} ${className}` : rawValue;
        continue;
      }
      let jsxName;
      if (name.startsWith("sc-camel-")) jsxName = dashToCamel(name.slice("sc-camel-".length));
      else jsxName = ATTR[name] || (name.includes("-") ? name : name);
      const mm = MUSTACHE.exec(rawValue);
      if (mm) out.push(`${jsxName}={${expr(mm[1], scope)}}`);
      else if (rawValue.includes("{{"))
        out.push(`${jsxName}={${"`"}${rawValue.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, e) => "${" + expr(e, scope) + "}")}${"`"}}`);
      else if (NUMERIC.has(name) && /^-?\d+$/.test(rawValue))
        out.push(`${jsxName}={${rawValue}}`);
      else out.push(`${jsxName}=${JSON.stringify(rawValue)}`);
    }
    if (className) out.push(`className=${JSON.stringify(className)}`);
    return out;
  }

  function emitChildren(children, scope, indent) {
    return children.map((c) => emit(c, scope, indent)).filter(Boolean).join("\n");
  }

  function emit(node, scope, indent) {
    const pad = "  ".repeat(indent);
    if (node.name === "#text") {
      const jsx = textToJsx(node.value, scope);
      return jsx ? pad + jsx : "";
    }
    if (node.name === "sc-if") {
      const cond = MUSTACHE.exec(attr(node, "value") ?? "")?.[1] ?? "false";
      return (
        `${pad}{${expr(cond, scope)} ? (\n${pad}  <>\n` +
        emitChildren(node.children, scope, indent + 2) +
        `\n${pad}  </>\n${pad}) : null}`
      );
    }
    if (node.name === "sc-for") {
      const list = MUSTACHE.exec(attr(node, "list") ?? "")?.[1] ?? "[]";
      const as = attr(node, "as") || "item";
      const inner = new Set([...scope, as]);
      return (
        `${pad}{(${expr(list, scope)} ?? []).map((${as}: any, ${as}Index: number) => (\n` +
        `${pad}  <Fragment key={${as}Index}>\n` +
        emitChildren(node.children, inner, indent + 2) +
        `\n${pad}  </Fragment>\n${pad}))}`
      );
    }
    const attrs = emitAttrs(node.attrs ?? [], scope);
    const open = [node.name, ...attrs].join(" ");
    if (!node.children.length) {
      return VOID.has(node.name) ? `${pad}<${open} />` : `${pad}<${open}></${node.name}>`;
    }
    return (
      `${pad}<${open}>\n` +
      emitChildren(node.children, scope, indent + 1) +
      `\n${pad}</${node.name}>`
    );
  }

  const scope = new Set();
  const body = emitChildren(root.children, scope, 3);

  const file = `// GENERATED by scripts/build-design-scene.mjs from design/templates.
// Do not edit by hand — edit the template and re-run \`npm run design:scene\`.
/* eslint-disable @next/next/no-img-element */
import { Fragment, type CSSProperties } from "react";

// The scene leans on CSS custom properties for every animated value, so most
// declarations are var()/calc() strings that React's own CSSProperties types
// reject on principle. One cast at the boundary beats 1200 of them.
const s = (o: Record<string, string | number>) => o as CSSProperties;

export const ${componentName}Hover = ${JSON.stringify(hover.join("\n"))};

export function ${componentName}({ V }: { V: any }) {
  return (
    <>
      <style>{${componentName}Hover}</style>
${body}
    </>
  );
}
`;
  return file;
}

function attr(node, name) {
  const hit = (node.attrs ?? []).find(([k]) => k.toLowerCase() === name);
  return hit ? hit[1] : undefined;
}

// ── run ──────────────────────────────────────────────────────────────────────

// template basename → [component name, hover-class prefix]
const TEMPLATES = [
  ["desktop", "SceneDesktop"],
  ["mobile", "SceneMobile"],
  ["home-desktop", "SceneHomeDesktop"],
  ["home-mobile", "SceneHomeMobile"],
];

mkdirSync(resolve(ROOT, "src/app/design/scene"), { recursive: true });
for (const [tpl, name] of TEMPLATES) {
  const src = resolve(ROOT, `design/templates/${tpl}.html`);
  // A registered template that has not been authored yet is skipped rather than
  // fatal, so the task stays runnable while a scene is being built.
  if (!existsSync(src)) {
    console.log(`skip ${tpl}.html (not present)`);
    continue;
  }
  const html = readFileSync(src, "utf8");
  const out = resolve(ROOT, `src/app/design/scene/${name}.tsx`);
  writeFileSync(out, build(html, name));
  console.log(`wrote ${out}`);
}
