import { fileURLToPath, URL } from 'node:url'

import Uni from '@dcloudio/vite-plugin-uni'
import UniPlatform from '@uni-helper/vite-plugin-uni-platform'
import UniKuRoot from '@uni-ku/root'

import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    UniPlatform(),
    UniKuRoot({
      enabledVirtualHost: false,
      rootFileName: 'KuRoot',
      excludePages: '/pages/excluded.vue',
    }),
    Uni(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
