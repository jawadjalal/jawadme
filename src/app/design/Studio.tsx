"use client";

// The studio page: what it is, what it costs, and a form that sends a brief.
//
// It replaces jawadOS — a 700vh scroll-driven CRT with five windows, a fake
// cursor and about four thousand lines of generated scene markup. The offer,
// the prices and the brief all survived; the desk did not. This is the same
// column the homepage is, because they are the same person.
//
// Two things here are interactive and both are worth their weight: the
// estimator, which turns a tier and some add-ons into a real range, and the
// brief form, which is the actual call to action.

import { useEffect, useMemo, useState } from "react";
import {
  ADDONS,
  BANDS,
  ERRORS,
  money,
  PLACEHOLDERS,
  QUOTE,
  SCOPES,
  slack,
  SPEEDS,
  STACK,
  STUDIO,
  TIERS,
  WORK,
} from "@/lib/studio";
import { submitBrief } from "./useBrief";

function Estimator() {
  const [tier, setTier] = useState<"single" | "edition" | null>(null);
  const [picks, setPicks] = useState<string[]>([]);

  const toggle = (key: string) =>
    setPicks((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));

  const chosen = TIERS.find((t) => t.key === tier);
  const extras = ADDONS.filter((a) => picks.includes(a.key));

  const { range, timeline } = useMemo(() => {
    if (!chosen) {
      // Nothing picked: show the honest full spread rather than a single number
      // that would have to be walked back on a call.
      const lo = TIERS[0].price;
      const hi = TIERS[1].price + ADDONS.reduce((n, a) => n + a.price, 0);
      const dLo = TIERS[0].days;
      const dHi = TIERS[1].days + ADDONS.reduce((n, a) => n + a.days, 0);
      return { range: `${money(lo)} to ${money(hi)}`, timeline: `${dLo} to ${dHi} days` };
    }
    const base = chosen.price + extras.reduce((n, a) => n + a.price, 0);
    const days = chosen.days + extras.reduce((n, a) => n + a.days, 0);
    const top = Math.round((base * (1 + slack(extras.length))) / 100) * 100;
    return {
      range: `${money(base)} to ${money(top)}`,
      timeline: `${days} to ${Math.round(days * 1.4)} days`,
    };
  }, [chosen, extras]);

  return (
    <div className="st-est">
      <div className="st-tiers">
        {TIERS.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={tier === t.key}
            onClick={() => setTier(tier === t.key ? null : t.key)}
            className={`st-tier ${tier === t.key ? "is-on" : ""}`}
          >
            <span className="st-tier-head">
              <strong>{t.label}</strong>
              <span>{money(t.price)}</span>
            </span>
            <span className="st-tier-note">{t.note}</span>
            <span className="st-tier-note">live in {t.days} days</span>
          </button>
        ))}
      </div>

      <div className="st-addons">
        {ADDONS.map((a) => (
          <button
            key={a.key}
            type="button"
            aria-pressed={picks.includes(a.key)}
            onClick={() => toggle(a.key)}
            className={`st-chip ${picks.includes(a.key) ? "is-on" : ""}`}
          >
            {a.label} <span>+{money(a.price)}</span>
          </button>
        ))}
      </div>

      <dl className="st-readout">
        <div>
          <dt>estimate</dt>
          <dd>{range}</dd>
        </div>
        <div>
          <dt>timeline</dt>
          <dd>{timeline}</dd>
        </div>
      </dl>

      <p className="st-quiet">
        {extras.length >= 3
          ? "about as tight as it gets before we talk."
          : "add-ons narrow it further. nothing here is padded."}
      </p>
    </div>
  );
}

function Brief() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");
  const [scope, setScope] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [band, setBand] = useState(1);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ph, setPh] = useState(0);

  // The prompt rotates while the field is empty, the way it did on the old
  // page. It stops the moment there is something to read.
  useEffect(() => {
    if (message) return;
    const t = window.setInterval(() => setPh((n) => (n + 1) % PLACEHOLDERS.length), 4200);
    return () => clearInterval(t);
  }, [message]);

  const estimate = Math.round((SCOPES[scope].base * SPEEDS[speed].m) / 100) * 100;
  const overBand = estimate > BANDS[band].ceil;
  const words = message.trim() ? message.trim().split(/\s+/).length : 0;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError(ERRORS.name);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError(ERRORS.email);
    if (words < 3) return setError(ERRORS.message);

    setError("");
    setBusy(true);
    const res = await submitBrief({
      name,
      email,
      link: link || undefined,
      message,
      scope: SCOPES[scope].label,
      speed: SPEEDS[speed].label,
      band: BANDS[band].range,
      estimate,
      variant: "desktop",
    });
    setBusy(false);
    if (res.ok) setSent(true);
    else setError(res.error || ERRORS.failed);
  }

  if (sent) {
    return (
      <p className="st-sent">
        got it. i read all of them, and you will hear back from{" "}
        <span className="st-nowrap">{email}</span>&apos;s inbox soon.
      </p>
    );
  }

  return (
    <form className="st-form" onSubmit={send} noValidate>
      <div className="st-fields">
        <label>
          <span>from</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </label>
        <label>
          <span>email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
      </div>

      <label className="st-full">
        <span>link (optional)</span>
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="a site, a deck, anything" />
      </label>

      <label className="st-full">
        <span>the idea</span>
        <textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={PLACEHOLDERS[ph]}
        />
      </label>

      <p className="st-quiet st-count">
        {words === 0 ? "" : words < 8 ? "keep going" : `${words} words, i will read all of it`}
      </p>

      <div className="st-picker">
        <span className="st-picker-label">shape of it</span>
        <div className="st-chips">
          {SCOPES.map((s, i) => (
            <button
              key={s.label}
              type="button"
              aria-pressed={scope === i}
              onClick={() => setScope(i)}
              className={`st-chip ${scope === i ? "is-on" : ""}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="st-picker">
        <span className="st-picker-label">when</span>
        <div className="st-chips">
          {SPEEDS.map((s, i) => (
            <button
              key={s.label}
              type="button"
              aria-pressed={speed === i}
              onClick={() => setSpeed(i)}
              className={`st-chip ${speed === i ? "is-on" : ""}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="st-picker">
        <span className="st-picker-label">budget</span>
        <div className="st-chips">
          {BANDS.map((b, i) => (
            <button
              key={b.range}
              type="button"
              aria-pressed={band === i}
              onClick={() => setBand(i)}
              className={`st-chip ${band === i ? "is-on" : ""}`}
            >
              {b.range}
            </button>
          ))}
        </div>
      </div>

      <p className="st-quiet">
        roughly {money(estimate)}
        {overBand ? " — over your band. we can cut pages, not corners." : "."}
      </p>

      {error ? (
        <p className="st-error" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="st-send" disabled={busy}>
        {busy ? "sending…" : "send brief"}
      </button>
    </form>
  );
}

export default function Studio() {
  return (
    <main className="hm-main">
      <p className="st-back">
        <a href="/" className="hm-link">
          jawad jalal
        </a>
      </p>

      <h1 className="hm-name st-title">{STUDIO.title}</h1>
      <p className="hm-role">{STUDIO.lede}</p>
      <p className="st-avail">{STUDIO.availability}</p>

      <p className="hm-mt-10">{STUDIO.pitch}</p>
      <p className="hm-mt-4 st-quiet">{STUDIO.pitchNote}</p>

      <p className="hm-mt-8">
        <a className="st-cta" href={STUDIO.call} target="_blank" rel="noreferrer">
          book a call
        </a>
        <span className="st-quiet st-cta-note">{STUDIO.callNote}</span>
      </p>

      <h2 className="st-h2">what i work with</h2>
      <dl className="st-stack">
        {STACK.map((s) => (
          <div key={s.label}>
            <dt>{s.label}</dt>
            <dd>{s.tools}</dd>
          </div>
        ))}
      </dl>

      <h2 className="st-h2">selected work</h2>
      <ul className="hm-list st-work">
        {WORK.map((w) => (
          <li key={w.name}>
            <a href={w.href} target="_blank" rel="noreferrer" className="hm-link">
              {w.name}
            </a>
            <span className="st-kind">{w.kind}</span>
            <span className="hm-list-note">{w.note}</span>
          </li>
        ))}
      </ul>

      <h2 className="st-h2">prices</h2>
      <p className="st-quiet st-terms">{STUDIO.terms}</p>
      <Estimator />
      <p className="st-quiet hm-mt-4">{STUDIO.noRetainers}</p>

      <figure className="st-quote">
        <blockquote>{QUOTE.text}</blockquote>
        <figcaption>
          {QUOTE.name} —{" "}
          <a href={QUOTE.href} target="_blank" rel="noreferrer" className="hm-link">
            {QUOTE.role}
          </a>
        </figcaption>
      </figure>

      <h2 className="st-h2">tell me the idea</h2>
      <p className="st-quiet">fifteen minutes beats a long email, but this works too.</p>
      <Brief />
    </main>
  );
}
