/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    // In MahaSetu, Next.js App Router serverless functions in app/api handle all requests directly
    // both locally and on Vercel. Only rewrite to an external backend if USE_EXTERNAL_BACKEND is explicitly true.
    if (process.env.USE_EXTERNAL_BACKEND === 'true' && process.env.BACKEND_URL && !process.env.VERCEL) {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.BACKEND_URL}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
