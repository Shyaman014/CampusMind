import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'axios'],
          ui: ['lucide-react', 'framer-motion', 'socket.io-client'],
          markdown: ['react-markdown', 'remark-gfm', 'react-syntax-highlighter'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
