/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // /capy asks the optimizer for 256 and 640 wide copies of its pictures; keep them a week
    minimumCacheTTL: 604800,
    qualities: [75, 86, 90],
    remotePatterns: [
      { protocol: "https", hostname: "www.google.com" },
      { protocol: "https", hostname: "icons.duckduckgo.com" },
    ],
  },
  // the Jobbie hero pitch is a static folder in public/jobbie; its pages resolve assets through <base href="/jobbie/">
  // /magnitude is the Magnitude game (repo jawadjalal/game), served under the same base path on its own deployment
  // the page moved to /derelictdepths when the game was renamed; every old link must keep working
  async redirects() {
    return [
      { source: "/minelight", destination: "/derelictdepths", permanent: true },
      { source: "/minelight/:path*", destination: "/derelictdepths/:path*", permanent: true },
      { source: "/mine-for-light", destination: "/derelictdepths", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/jobbie", destination: "/jobbie/journey.html" },
      // the Derelict Depths book is one self-contained HTML file in public/reading; serve it at its folder URL
      { source: "/reading/derelict-depths-book", destination: "/reading/derelict-depths-book/index.html" },
      { source: "/magnitude", destination: "https://magnitude-game.vercel.app/magnitude" },
      { source: "/magnitude/:path*", destination: "https://magnitude-game.vercel.app/magnitude/:path*" },
    ];
  },
};
export default nextConfig;
