/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["*.preview.same-app.com"],
  images: {
    unoptimized: true,
    // Eliminamos 'domains' porque está deprecado y ya usamos 'remotePatterns'
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ugc.same-assets.com",
        pathname: "/**",
      },
      // Añadimos el dominio de los GIFs de tus ejercicios
      {
        protocol: "https",
        hostname: "fitnessprogramer.com",
        pathname: "/**",
      }
    ],
  },
};

module.exports = nextConfig;