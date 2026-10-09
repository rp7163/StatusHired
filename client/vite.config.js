import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The React app talks to the Express API through relative URLs (/api, /socket.io).
// In development Vite proxies them to the backend so there are no CORS issues.
export default defineConfig(() => {
  const apiTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:5000';
  return {
    plugins: [react(), tailwindcss()],
    optimizeDeps: { include: ['recharts', 'react-is'] },
    resolve: { alias: { '@': path.resolve(__dirname, '.') } },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
        '/socket.io': { target: apiTarget, changeOrigin: true, ws: true },
      },
    },
    preview: { host: '0.0.0.0', port: 3000, allowedHosts: true },
  };
});
