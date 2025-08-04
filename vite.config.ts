import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        //target: 'https://exch-sim-953974838707.asia-northeast1.run.app/',
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
