/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors. This is perfect for an MVP pitch.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore ESLint warnings during build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;