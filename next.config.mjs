/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.google.com" },
      { protocol: "https", hostname: "icons.duckduckgo.com" },
    ],
  },
  // the Jobbie hero pitch is a static folder in public/jobbie; its pages resolve assets through <base href="/jobbie/">
  // /magnitude is the Magnitude game (repo jawadjalal/game), served under the same base path on its own deployment
  async rewrites() {
    return [
      { source: "/jobbie", destination: "/jobbie/journey.html" },
      { source: "/magnitude", destination: "https://magnitude-game.vercel.app/magnitude" },
      { source: "/magnitude/:path*", destination: "https://magnitude-game.vercel.app/magnitude/:path*" },
    ];
  },
};
export default nextConfig;
