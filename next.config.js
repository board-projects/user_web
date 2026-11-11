/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${(process.env.API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://back.dequizma.com').replace(/\/$/, '')}/:path*`,
      },
    ];
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
