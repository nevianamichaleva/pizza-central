/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dostavka.pizza-central.bg',
        pathname: '/**',
      },
    ]
  }
};

export default nextConfig;
