/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  // metadata in the head for every reader, never streamed into the body: crawlers and audits read the head
  htmlLimitedBots: /.*/,
  images: {
    // AVIF first for every browser that takes it: the same picture at roughly half the bytes of WebP, which is most of
    // what a phone waits on before the first large paint
    formats: ["image/avif", "image/webp"],
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
  // the game page is /fracture; every older address for it (the earlier names, its book) lands there
  async redirects() {
    return [
      { source: "/call", destination: "/cal", permanent: true },
      { source: "/ads", destination: "/work", permanent: true },
      { source: "/work/okara", destination: "/", permanent: false },
      { source: "/work/menufit", destination: "/", permanent: false },
      { source: "/derelictdepths", destination: "/fracture", permanent: true },
      { source: "/derelictdepths/:path*", destination: "/fracture", permanent: true },
      { source: "/minelight", destination: "/fracture", permanent: true },
      { source: "/minelight/:path*", destination: "/fracture", permanent: true },
      { source: "/mine-for-light", destination: "/fracture", permanent: true },
      { source: "/reading/:path*", destination: "/fracture", permanent: true },
      { source: "/work/derelict-depths", destination: "/work/fracture", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/jobbie", destination: "/jobbie/journey.html" },
      { source: "/magnitude", destination: "https://magnitude-game.vercel.app/magnitude" },
      { source: "/magnitude/:path*", destination: "https://magnitude-game.vercel.app/magnitude/:path*" },
    ];
  },
};
export default nextConfig;
