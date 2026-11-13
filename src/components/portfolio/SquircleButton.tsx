// The hire button: a squircle, the same button as ignura.com's. Its shape and motion are in portfolio.css (.sq).

type Size = "md" | "sm";

/** The hire button, the same button as ignura.com's ("book a call"): a squircle (CSS corner-shape where the browser
 *  has it, a 16px radius where it does not), 52px tall, that swells a little on a spring when you point at it and
 *  sinks a pixel when you press it. */
export function SquircleButton({
  href,
  children = "hire me",
  size = "md",
  className = "",
  label,
}: {
  href: string;
  children?: React.ReactNode;
  size?: Size;
  className?: string;
  /** an accessible name when the visible label needs more context */
  label?: string;
}) {
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      className={`sq ${className}`}
      data-size={size}
      aria-label={label}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
    >
      <span>{children}</span>
    </a>
  );
}
