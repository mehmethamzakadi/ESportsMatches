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
    ],
  },
};

module.exports = nextConfig; 