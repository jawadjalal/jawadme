import localFont from "next/font/local";
import { GeistMono } from "geist/font/mono";

// 100% local, zero-network-flake industrial typography:
// - Cabinet Grotesk (700/800): tight geometric industrial display
// - Geist Variable: crisp Swiss body & UI
// - Geist Mono: sharp technical monospace for telemetry, nav & indices

export const geist = localFont({
  src: [{ path: "../fonts/Geist-var.woff2", weight: "100 900", style: "normal" }],
  variable: "--f-geist",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const display = localFont({
  src: [
    { path: "../fonts/CabinetGrotesk-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/CabinetGrotesk-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--f-display",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

export const fontVars = `${geist.variable} ${display.variable} ${GeistMono.variable}`;
