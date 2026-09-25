import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Fixed port so the app is always at http://localhost:5180 (5173 is often taken by other
    // projects). If it's busy, the app is probably already running.
    port: 5180,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  test: {
    environment: 'jsdom',
    // Tests always use the mock API, even when .env.local points the dev server at Flask.
    env: { VITE_USE_MOCKS: 'true' },
    globals: true,
    setupFiles: './src/setupTests.js',
  },
});
