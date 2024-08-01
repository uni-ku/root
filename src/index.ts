import process from 'node:process'
import { resolve } from 'node:path'

import type { Plugin } from 'vite'
import { createFilter } from 'vite'

import { loadPagesJson } from './utils'
import { rebuildKuApp, registerKuApp } from './root'
import { transformPage } from './page'

export default function UniKuRoot(): Plugin {
  const rootPath = process.env.UNI_INPUT_DIR || (`${process.env.INIT_CWD}\\src`)
  const appKuPath = resolve(rootPath, 'App.ku.vue')
  const pagesPath = resolve(rootPath, 'pages.json')
  const pagesJson = loadPagesJson(pagesPath, rootPath)

  return {
    name: 'vite-plugin-uni-root',
    enforce: 'pre',
    async transform(code, id) {
      const filterMain = createFilter(['src/main.(ts|js)', 'main.(ts|js)'])
      if (filterMain(id))
        return registerKuApp(code)

      const filterKuRoot = createFilter(['src/App.ku.vue'])
      if (filterKuRoot(id))
        return await rebuildKuApp(appKuPath)

      const filterPage = createFilter(pagesJson)
      if (filterPage(id)) {
        return await transformPage(code)
      }
    },
  }
}
