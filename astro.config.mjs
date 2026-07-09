import { defineConfig } from 'astro/config';

// format:'file' => src/pages/kontakt.astro wird zu dist/kontakt.html
// damit bleiben alle internen Links (kontakt.html, impressum.html …) 1:1 erhalten.
export default defineConfig({
  build: { format: 'file' },
  devToolbar: { enabled: false },
  vite: {
    server: {
      proxy: {
        '/admin':  { target: 'http://localhost:3000', changeOrigin: true },
        '/_next':  { target: 'http://localhost:3000', changeOrigin: true },
        '/login':  { target: 'http://localhost:3000', changeOrigin: true },
        '/api':    { target: 'http://localhost:3000', changeOrigin: true },
      }
    }
  }
});
