"use client";

// The About drawer, opened from the top bar or the name in the tab: what Jawad has built and run, from the facts
// already on this site (lib/profile.ts) and the sites he made. No dates or numbers beyond those. Styles: felt.css.
import { useEffect, useRef, useState } from "react";
import { EMAIL, SITES } from "./copy";

const RUN = [
  { name: "Ignura", what: "Founder. A web design studio for startups, at six-figure ARR.", href: "https://ignura.com" },
  { name: "Ignaru", what: "Founder. An agent-native design tool: design and code on one canvas.", href: "https://ignaru.com" },
  { name: "Bevel", what: "Founder. A 3D art team for games, at six-figure ARR.", href: "https://bevel.team" },
  { name: "MenuFit", what: "Design. An app for eating out healthy, with 1.5 million users.", href: "https://menufit.com" },
  { name: "Okara", what: "Design.", href: "https://okara.ai" },
];
const BUILT = ["rocquire", "paradev", "hyperspell", "treg", "mercy", "dobig"];

export function About() {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = () => setOpen(true);
    addEventListener("fh-about", show);
    return () => removeEventListener("fh-about", show);
  }, []);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    const done = () => setOpen(false);
    d.addEventListener("close", done);
    return () => d.removeEventListener("close", done);
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="fh-dr"
      aria-labelledby="fh-ab-t"
      style={{ ["--c" as string]: "#9a4dea", ["--ci" as string]: "#fff" }}
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
    >
      <div className="fh-dr-bar">
        <span className="fh-dr-count">About</span>
        <button type="button" onClick={() => ref.current?.close()} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
          </svg>
        </button>
      </div>
      {open && (
        <article className="fh-dr-page">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="fh-dr-art fh-ab-av" src="/felt/jawad-av.webp" alt="" width={192} height={192} />
          <header className="fh-dr-head fh-in" style={{ ["--d" as string]: 0 }}>
            <h2 id="fh-ab-t">Jawad Jalal, design engineer in London.</h2>
            <p>I design and build my own companies, and sites for founders. These are the things I have run and made.</p>
          </header>
          <section className="fh-in" style={{ ["--d" as string]: 1 }}>
            <h3 className="fh-ab-h">Companies</h3>
            <ol className="fh-tl">
              {RUN.map((r) => (
                <li key={r.name}>
                  <a href={r.href} target="_blank" rel="noreferrer">
                    <b>{r.name}</b>
                    <span>{r.what}</span>
                    <em>{r.href.replace("https://", "")} ↗</em>
                  </a>
                </li>
              ))}
            </ol>
          </section>
          <section className="fh-in" style={{ ["--d" as string]: 2 }}>
            <h3 className="fh-ab-h">Sites for founders</h3>
            <ol className="fh-tl">
              {BUILT.map((k) => SITES.find((s) => s.key === k)).filter(Boolean).map((s) => (
                <li key={s!.key}>
                  <a href={`https://${s!.host}`} target="_blank" rel="noreferrer">
                    <b>{s!.name}</b>
                    <span>{s!.line}</span>
                    <em>{s!.host} ↗</em>
                  </a>
                </li>
              ))}
            </ol>
          </section>
          <footer className="fh-dr-foot fh-in" style={{ ["--d" as string]: 3 }}>
            <p>Want the CV or to say hi?</p>
            <Contact />
          </footer>
        </article>
      )}
    </dialog>
  );
}

/** Quiet Email (copies the address, then opens mail) and CV (the real PDF) keys. */
export function Contact() {
  const [got, setGot] = useState(false);
  return (
    <span className="fh-ct">
      <a
        className="fh-ghost"
        href={`mailto:${EMAIL}`}
        onClick={() => {
          void navigator.clipboard?.writeText(EMAIL);
          setGot(true);
          setTimeout(() => setGot(false), 1600);
        }}
        title={`${EMAIL}, copied when clicked`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="3.5" width="12" height="9" rx="2" />
          <path d="M2.5 4.5 8 9l5.5-4.5" />
        </svg>
        <span>{got ? "Copied" : "Email"}</span>
      </a>
      <a className="fh-ghost" href="/jawad-jalal-cv.pdf" download>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 2.5v7.5M4.8 7 8 10.2 11.2 7M3 13h10" />
        </svg>
        <span>CV</span>
      </a>
    </span>
  );
}

export function AboutLink({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => dispatchEvent(new Event("fh-about"))}>
      {children}
    </button>
  );
}
