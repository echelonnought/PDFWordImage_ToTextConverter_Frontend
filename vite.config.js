import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Frontend runs on 3001
    proxy: {
      '/upload': {
        target: 'https://pdf-word-image-to-texts-converter-backend.vercel.app', // Backend URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
});