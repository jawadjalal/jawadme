/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // The jawadOS scene is the homepage now; /design is retired.
      { source: "/design", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
