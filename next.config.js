/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // This allows Mongoose to be treated as an external package in Server Components.
    serverComponentsExternalPackages: ['mongoose'],
  },
  webpack: (config) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
};

module.exports = nextConfig;
