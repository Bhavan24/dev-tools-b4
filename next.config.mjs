/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist', 'pdfkit', '@napi-rs/canvas'],
  async redirects() {
    return [
      { source: '/tools/json-beautifier', destination: '/tools/json-formatter', permanent: true },
      { source: '/tools/html-beautifier', destination: '/tools/html-formatter', permanent: true },
      { source: '/tools/base64-encoder', destination: '/tools/base64-encoder-decoder', permanent: true },
      { source: '/tools/base64-decoder', destination: '/tools/base64-encoder-decoder', permanent: true },
      { source: '/tools/rgb-to-hex', destination: '/tools/color-code-picker', permanent: true },
      { source: '/tools/hex-to-rgb', destination: '/tools/color-code-picker', permanent: true },
      { source: '/tools/ini-to-json', destination: '/tools/ini-converter', permanent: true },
      { source: '/tools/ini-to-xml', destination: '/tools/ini-converter', permanent: true },
      { source: '/tools/ini-to-yaml', destination: '/tools/ini-converter', permanent: true },
      { source: '/tools/csv-to-json', destination: '/tools/csv-converter', permanent: true },
      { source: '/tools/csv-to-xml', destination: '/tools/csv-converter', permanent: true },
      { source: '/tools/csv-to-yaml', destination: '/tools/csv-converter', permanent: true },
      { source: '/tools/csv-to-sql', destination: '/tools/csv-converter', permanent: true },
    ]
  },
}

export default nextConfig
