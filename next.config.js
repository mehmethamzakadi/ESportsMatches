/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.pandascore.co',
      },
      {
        protocol: 'https',
        hostname: 'api.pandascore.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      tls: false,
      fs: false,
      http: false,
      https: false,
      zlib: false,
      child_process: false,
      stream: false,
      buffer: false,
      path: false,
      crypto: false,
      os: false,
      util: false
    };
    return config;
  },
};

module.exports = nextConfig; 