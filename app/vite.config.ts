import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/aplicativo_tarefas_lala/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-ulala.webp'],
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
            src: 'logo-ulala.webp',
            sizes: '1254x1254',
            type: 'image/webp',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
