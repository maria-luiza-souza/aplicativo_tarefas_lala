import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/aplicativo_tarefas_lala/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['brand/ulala-mark.svg'],
      manifest: {
        name: 'ULALÁ',
        short_name: 'ULALÁ',
        description: 'Organizador pessoal de tarefas, projetos, notas e rotina de trabalho.',
        theme_color: '#4F46E5',
        background_color: '#f9fafb',
        display: 'standalone',
        start_url: '/aplicativo_tarefas_lala/',
        icons: [
          {
            src: 'brand/ulala-mark.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
