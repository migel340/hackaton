import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
      '@layouts': '/src/layouts',
      '@components': '/src/components',
      '@api': '/src/api',
      '@router': '/src/router',
      '@utils': '/src/utils',
      '@hooks': '/src/hooks',
      '@styles': '/src/styles',
      '@pages': '/src/pages',
    },
  }
})
