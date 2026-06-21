import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': { target: 'http://localhost:8000', changeOrigin: true },
      '/dashboard': { target: 'http://localhost:8000', changeOrigin: true },
      '/tasks': { target: 'http://localhost:8000', changeOrigin: true },
      '/exams': { target: 'http://localhost:8000', changeOrigin: true },
      '/planner': { target: 'http://localhost:8000', changeOrigin: true },
      '/study-sessions': { target: 'http://localhost:8000', changeOrigin: true },
      '/resume': { target: 'http://localhost:8000', changeOrigin: true },
      '/documents': { target: 'http://localhost:8000', changeOrigin: true },
      '/placement': { target: 'http://localhost:8000', changeOrigin: true },
      '/resources': { target: 'http://localhost:8000', changeOrigin: true },
      '/users': { target: 'http://localhost:8000', changeOrigin: true },
      '/notes': { target: 'http://localhost:8000', changeOrigin: true },
      '/learning': { target: 'http://localhost:8000', changeOrigin: true },
      '/career-coach': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
});
