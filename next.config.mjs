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
    // Only rewrite to an external backend if BACKEND_URL is explicitly configured (e.g., custom Render service)
    // On Vercel, Next.js App Router serverless functions in app/api handle requests directly
    if (process.env.BACKEND_URL && !process.env.VERCEL) {
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
