/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.google.com" },
      { protocol: "https", hostname: "icons.duckduckgo.com" },
    ],
  },
  // the Jobbie hero pitch is a static folder in public/jobbie; its pages resolve assets through <base href="/jobbie/">
  async rewrites() {
    return [{ source: "/jobbie", destination: "/jobbie/journey.html" }];
  },
};
export default nextConfig;
