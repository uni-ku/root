import { URL, fileURLToPath } from 'node:url'

import { defineConfig } from 'vite'
import Uni from '@dcloudio/vite-plugin-uni'

import UniKuRoot from '@uni-ku/root'

export default defineConfig({
  plugins: [
    UniKuRoot(),
    Uni(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
