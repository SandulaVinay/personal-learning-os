import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/personal-learning-os/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Personal Learning OS',
        short_name: 'LearningOS',
        description: 'Track your learning, notes, and jobs entirely offline capable.',
        theme_color: '#0f172a',
        background_color: '#f8fafc',
        display: 'standalone'
      }
    })
  ]
});
