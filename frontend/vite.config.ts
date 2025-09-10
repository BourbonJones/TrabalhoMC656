import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

// Configuração Vite
export default defineConfig({
  assetsInclude: ['**/*.html'],
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom'
  },
  server: {
    port: 5173,
    proxy: { //chave proxy
      '/auth': 'http://localhost:3000',
      '/fases': 'http://localhost:3000',
      '/user': 'http://localhost:3000'
    }
  }
})
