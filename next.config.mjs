/** @type {import('next').NextConfig} */
const nextConfig = {
    compiler: {
      styledComponents: true
    },
    async redirects() {
      return [
        {
          source: '/tos',
          destination: '/termeni-si-conditii',
          permanent: true, // 301
        },
        {
          source: '/privacy',
          destination: '/politica-de-confidentialitate',
          permanent: true, // 301
        },
      ];
    },
};

export default nextConfig;
