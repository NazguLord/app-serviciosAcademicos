import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  base: '/sv/' ,
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    origin: 'https://registro.cp.unicah.net',
    allowedHosts: ['registro.cp.unicah.net'],
    hmr: {
      host: 'registro.cp.unicah.net',
      protocol: 'ws'
    }
  }
}));