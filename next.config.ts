import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Allow both localhost and public URL for Server Actions in dev
  experimental: {
    serverActions: {
      allowedOrigins: [
        'http://localhost:9002',
        'https://super-duper-waddle-74wg7gqvjrwhx5pw-9002.app.github.dev',
      ],
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
