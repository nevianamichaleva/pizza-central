/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dostavka.pizza-central.bg',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ]
  },
  async redirects() {
    return [
      // Пренасочване на всичко от dostavka.pizza-central.bg към начална страница
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'dostavka.pizza-central.bg',
          },
        ],
        destination: '/',
        permanent: true,
      },
      // Стари URL-и пренасочени към нови
      {
        source: '/reservations',
        destination: '/reservation',
        permanent: true,
      },
      {
        source: '/delivery',
        destination: '/for-home',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/about-us',
        permanent: true,
      },
      {
        source: '/locations',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/checkout',
        destination: '/order',
        permanent: true,
      },
      {
        source: '/cart',
        destination: '/order',
        permanent: true,
      },
      {
        source: '/menu-2',
        destination: '/our-menu',
        permanent: true,
      },
      {
        source: '/my-account',
        destination: '/profile',
        permanent: true,
      },
      // Блог и категории - пренасочени към начална страница или меню
      {
        source: '/blog',
        destination: '/',
        permanent: true,
      },
      {
        source: '/blog/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/category/:path*',
        destination: '/our-menu',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
