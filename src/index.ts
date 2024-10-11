import process from 'node:process'
import { resolve } from 'node:path'

import type { Plugin } from 'vite'
import { createFilter } from 'vite'

import type { MagicString } from 'vue/compiler-sfc'
import chokidar from 'chokidar'

import { loadPagesJson } from './utils'
import { rebuildKuApp, registerKuApp } from './root'
import { transformPage } from './page'

interface UniKuRootOptions {
  /**
   * 是否启用全局ref
   * @default false
   */
  enabledGlobalRef?: boolean
  /**
   * 根文件名
   * @default 'App.ku'
   */
  rootFileName?: string
}

export default function UniKuRoot(options: UniKuRootOptions = {
  rootFileName: 'App.ku',
}): Plugin {
  const rootPath = process.env.UNI_INPUT_DIR || (`${process.env.INIT_CWD}\\src`)
  const appKuPath = resolve(rootPath, `${options.rootFileName}.vue`)
  const pagesPath = resolve(rootPath, 'pages.json')

  let pagesJson = loadPagesJson(pagesPath, rootPath)

  let watcher: chokidar.FSWatcher | null = null

  return {
    name: 'vite-plugin-uni-root',
    enforce: 'pre',
    buildStart() {
      watcher = chokidar.watch(pagesPath).on('all', (event) => {
        if (['add', 'change'].includes(event)) {
          pagesJson = loadPagesJson(pagesPath, rootPath)
        }
      })
    },
    async transform(code, id) {
      let ms: MagicString | null = null

      const filterMain = createFilter(`${rootPath}/main.(ts|js)`)
      if (filterMain(id))
        ms = await registerKuApp(code, options.rootFileName)

      const filterKuRoot = createFilter(`${rootPath}/${options.rootFileName}.vue`)
      if (filterKuRoot(id))
        ms = await rebuildKuApp(appKuPath)

      const filterPage = createFilter(pagesJson)
      if (filterPage(id)) {
        ms = await transformPage(code, options.enabledGlobalRef)
      }

      if (ms) {
        return {
          code: ms.toString(),
          map: ms.generateMap({ hires: true }),
        }
      }
    },
    buildEnd() {
      if (watcher) {
        watcher.close()
      }
    },
  }
}
