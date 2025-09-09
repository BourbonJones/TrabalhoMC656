import { defineConfig } from 'vite'

// Configuração Vite
export default defineConfig({
  assetsInclude: ['**/*.html'],
  server: {
    port: 5173 // ou qualquer porta que quiser
  }
})
