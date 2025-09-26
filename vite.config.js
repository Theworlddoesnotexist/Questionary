import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: '/index.html',
      }
    }
  },
  server: {
    host: '0.0.0.0'
  }
});