import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          appwrite: ['appwrite'],
          ui: ['lucide-react', 'clsx', 'tailwind-merge']
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'appwrite',
      'axios',
      'clsx',
      'tailwind-merge',
      'lucide-react'
    ],
    exclude: [
      'pdfjs-dist',
      'pdfjs-dist/build/pdf.worker.js',
      'pdfjs-dist/build/pdf.worker.mjs'
    ]
  },
  server: {
    port: 3000,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
})