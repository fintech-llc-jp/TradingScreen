import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/news': {
        target: 'https://news-server-953974838707.asia-northeast1.run.app/',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/news/, '/api/news'),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
         package.json   if (process.env.NODE_ENV !== 'production') {
              console.log('🔄 News API Proxy Request:', req.method, req.url);
              console.log('📨 News API Headers:', req.headers);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            if (process.env.NODE_ENV !== 'production') {
              console.log('📡 News API Proxy Response:', proxyRes.statusCode, req.url);
            }
          });
        }
      },
      '/api': {
        target: 'https://exch-sim-953974838707.asia-northeast1.run.app/',
        //target: 'http://localhost:8080',
        changeOrigin: true,
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (process.env.NODE_ENV !== 'production') {
              console.log('🔄 Main API Proxy Request:', req.method, req.url);
              console.log('📨 Main API Headers:', req.headers);
              console.log('🎯 Target:', options.target);
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            if (process.env.NODE_ENV !== 'production') {
              console.log('📡 Main API Proxy Response:', proxyRes.statusCode, req.url);
            }
            if (proxyRes.statusCode >= 400) {
              console.error('❌ Proxy Error Response:', {
                status: proxyRes.statusCode,
                url: req.url,
                headers: proxyRes.headers
              });
            }
          });
          proxy.on('error', (err, req, res) => {
            console.error('💥 Proxy Error:', err.message, req.url);
          });
        }
      }
    }
  }
})
