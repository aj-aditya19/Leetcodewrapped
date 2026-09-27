import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // API routes are Cloudflare Pages functions; run `npm run start` alongside
    // `npm run dev` so they're served on 8788.
    proxy: {
      '/api': 'http://localhost:8788'
    }
  }
})

