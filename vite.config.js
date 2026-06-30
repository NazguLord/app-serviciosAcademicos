import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/*
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const sapProxyTarget = env.VITE_SAP_PROXY_TARGET;
  const sapProxy = sapProxyTarget
    ? {
        "/sv/sap-api": {
          target: sapProxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/sv\/sap-api/, ""),
        },
      }
    : undefined;

  return {
    base: '/sv/' ,
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      origin: 'https://registro.cp.unicah.net',
      allowedHosts: ['registro.cp.unicah.net'],
      proxy: sapProxy,
      hmr: {
        host: 'registro.cp.unicah.net',
        protocol: 'ws'
      }
    },
    preview: {
      host: true,
      port: 5173,
      proxy: sapProxy,
    },
  };
});

//Producción

/*
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

*/
// Desarollo


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const sapProxyTarget = env.VITE_SAP_PROXY_TARGET;
  const sapProxy = sapProxyTarget
    ? {
        "/sv/sap-api": {
          target: sapProxyTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/sv\/sap-api/, ""),
        },
      }
    : undefined;

  return {
    base: '/sv/' ,
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      origin: 'http://unicahdev.registro.cp.unicah.edu',
      allowedHosts: ['unicahdev.registro.cp.unicah.edu'],
      proxy: sapProxy,
      hmr: {
        host: 'unicahdev.registro.cp.unicah.edu',
        protocol: 'ws'
      }
    },
    preview: {
      host: true,
      port: 5173,
      proxy: sapProxy,
    },
  };
});
// */