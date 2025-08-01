import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // tailwindcss()
  ],
  server: {
    host: "0.0.0.0",
    proxy: {
      // '/api': 'http://localhost:8080',
      '/api': 'http://34.133.238.121:8080',
      // '/api': 'https://courtmate-backend.purespeak.in',
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
