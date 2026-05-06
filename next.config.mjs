/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // ESLint is run separately in CI; don't block cloud builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type errors are checked locally; don't block cloud builds
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
