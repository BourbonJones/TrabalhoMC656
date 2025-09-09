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
    port: 5173 
  }
})
