import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const rootDir = dirname(fileURLToPath(new URL('.', import.meta.url)))
  const env = loadEnv(mode, rootDir, 'VITE_')
  const apiTarget = (env.VITE_API_BASE_URL || 'http://localhost:8080').trim()

  const apiProxy = {
    '/api': {
      target: apiTarget,
      changeOrigin: true,
      secure: false,
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq) => {
          proxyReq.removeHeader('origin')
        })
        proxy.on('proxyRes', (proxyRes) => {
          if (!proxyRes?.headers) return
          delete proxyRes.headers['www-authenticate']
          delete proxyRes.headers['WWW-Authenticate']
        })
      },
    },
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
      strictPort: true,
      proxy: apiProxy,
    },
    preview: {
      proxy: apiProxy,
    },
  }
})
