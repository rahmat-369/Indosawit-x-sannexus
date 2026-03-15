import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'IndoSawit.news x SanexusAI',
        short_name: 'IndoSawit',
        description: 'Portal Berita & AI Assistant IndoSawit',
        theme_color: '#050705',
        background_color: '#050705',
        display: 'standalone',
        icons: [
          {
            src: 'https://res.cloudinary.com/dwiozm4vz/image/upload/v1773542073/yrlbtq88qtowjt7slyzd.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'https://res.cloudinary.com/dwiozm4vz/image/upload/v1773542073/yrlbtq88qtowjt7slyzd.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
