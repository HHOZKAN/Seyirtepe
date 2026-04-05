import type { NextConfig } from 'next'
import path from 'path'

const securityHeaders = [
  // Empêche le chargement en iframe (clickjacking)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Empêche le MIME sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Référant minimal
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Désactive caméra/micro/géo
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // HTTPS forcé 1 an (activer uniquement en production HTTPS)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // Empêche le DNS prefetch
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
]

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },

  // Désactive les infos serveur dans les réponses
  poweredByHeader: false,

  // Compression gzip
  compress: true,
}

export default nextConfig
