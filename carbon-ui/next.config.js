/** @type {import('next').NextConfig} */
// TechXChange Lab 1127 — Spyre toggle configuration
//
// Environment variables read by /api/chat:
//   LLAMA_URL   local llama.cpp server  (default: http://localhost:8080)
//   SPYRE_URL   IBM Spyre endpoint       (default: http://9.8.70.146:8080)
//
// Set these before starting Next.js, e.g. in pm2 ecosystem.config.js or:
//   SPYRE_URL=http://9.8.70.146:8080 pm2 start yarn --name nextjs -- start

module.exports = {
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'newsroom.ibm.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.ibm.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}