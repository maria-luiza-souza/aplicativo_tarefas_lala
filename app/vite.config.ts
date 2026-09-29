import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/aplicativo_tarefas_lala/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['brand/ulala-icon.webp', 'brand/ulala-logo-full.webp'],
      manifest: {
        name: 'ULALÁ',
        short_name: 'ULALÁ',
        description: 'Organizador pessoal de tarefas, projetos, notas e rotina de trabalho.',
        theme_color: '#294359',
        background_color: '#f8f6f3',
        display: 'standalone',
        start_url: '/aplicativo_tarefas_lala/',
        icons: [
          {
            src: 'brand/ulala-icon.webp',
            sizes: '180x180',
            type: 'image/webp',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
