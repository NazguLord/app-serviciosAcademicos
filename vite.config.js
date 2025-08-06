import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  base: '/sv/' ,
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    origin: 'http://unicahdev.registro.cp.unicah.edu',
    allowedHosts: ['unicahdev.registro.cp.unicah.edu'],
    hmr: {
      host: 'unicahdev.registro.cp.unicah.edu',
      protocol: 'ws'
    }
  }
}));