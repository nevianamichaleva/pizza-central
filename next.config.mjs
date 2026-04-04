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
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'pizza-central.bg',
          },
        ],
        destination: 'https://www.pizza-central.bg/:path*',
        permanent: true, // 301
      },
      // Пренасочване на всичко от mozzarella.bg към pizza-central.bg
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'mozzarella.bg',
          },
        ],
        destination: 'https://www.pizza-central.bg/:path*',
        permanent: true,
      },
      // Пренасочване на всичко от www.mozzarella.bg към pizza-central.bg
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.mozzarella.bg',
          },
        ],
        destination: 'https://www.pizza-central.bg/:path*',
        permanent: true,
      },
      // Пренасочване на /shop към /for-home
      {
        source: '/shop',
        destination: '/for-home',
        permanent: true,
      },
      // Пренасочване на /category към /for-home
      {
        source: '/category',
        destination: '/for-home',
        permanent: true,
      },
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
      // Старо меню URL → ресторантско меню
      {
        source: '/our-menu',
        destination: '/central-menu',
        permanent: true,
      },
      {
        source: '/our-menu/:path*',
        destination: '/central-menu',
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
        destination: '/for-home',
        permanent: true,
      },
      {
        source: '/my-account',
        destination: '/profile',
        permanent: true,
      },
      {
        source: '/category/:path*',
        destination: '/for-home',
        permanent: true,
      },
      {
        source: '/sitemap_index.xml',
        destination: '/sitemap.xml',
        permanent: true,
      },
      {
        source: '/new-dishes/-OeHhaNi-i94LBSUhan4',
        destination: '/new-dishes/novo-torta-medovik',
        permanent: true,
      },
      {
        source: '/new-dishes/-OgXoXETuO8M3iPGYktY',
        destination: '/new-dishes/novo-pizza-s-burata',
        permanent: true,
      },
      {
        source: '/blog/central-dostavka',
        destination: '/for-home',
        permanent: true,
      },
      // Пренасочване на грешен URL с многоточие към статията за пица каперси
      {
        source: '/%E2%80%A6/pizza-kapersi-cheri-domati%E2%80%A6',
        destination: '/blog/pizza-kapersi-cheri-domati-rucola',
        permanent: true,
      },
      {
        source: '/\u2026/pizza-kapersi-cheri-domati\u2026',
        destination: '/blog/pizza-kapersi-cheri-domati-rucola',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
