import { fileURLToPath, URL } from 'node:url'

import Uni from '@dcloudio/vite-plugin-uni'
import UniKuRoot from '@uni-ku/root'

import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    UniKuRoot({
      enabledVirtualHost: false,
      rootFileName: 'KuRoot',
    }),
    Uni(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
