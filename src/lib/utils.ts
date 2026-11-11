/** Join class names, skipping empty ones (what the vendored ASCII engine in lib/ascii expects from `cn`). */
export const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");
