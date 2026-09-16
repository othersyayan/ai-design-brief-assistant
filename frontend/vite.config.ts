import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
  plugins: [
    TanStackRouterVite(), // Otomatis mengelola file-based routing
    react(),
    tailwindcss(), // Engine Tailwind CSS v4
  ],
});
