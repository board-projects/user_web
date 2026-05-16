/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://back.dequizma.com/api/:path*',
      },
    ];
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
