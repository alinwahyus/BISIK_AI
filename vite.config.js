import { defineConfig } from 'vite'

export default defineConfig({
  base: '/BISIK_AI/',
  server: {
    port: 5173,
    host: true,
    cors: true,
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['three', 'gsap']
  },
  define: {
    global: 'globalThis'
  }
})