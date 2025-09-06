import type { MagicString } from '@vue/compiler-sfc'
import type { FSWatcher } from 'chokidar'
import type { Plugin } from 'vite'

import { resolve } from 'node:path'
import process from 'node:process'

import chokidar from 'chokidar'
import { createFilter } from 'vite'

import { transformPage } from './page'
import { rebuildKuApp, registerKuApp } from './root'
import { loadPagesJson, normalizePlatformPath } from './utils'

interface UniKuRootOptions {
  /**
   * 是否启用虚拟节点
   * @default false
   */
  enabledVirtualHost?: boolean
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
  /**
   * 页面过滤钩子
   */
  filterPage?: (pagePaths: string[]) => string[]
}

export default function UniKuRoot(options: UniKuRootOptions = {
  rootFileName: 'App.ku',
}): Plugin {
  const rootPath = process.env.UNI_INPUT_DIR || (`${process.env.INIT_CWD}\\src`)
  const appKuPath = resolve(rootPath, `${options.rootFileName}.vue`)
  const pagesPath = resolve(rootPath, 'pages.json')

  let rawPagesJson = loadPagesJson(pagesPath, rootPath)
  let pagesJson = options.filterPage ? options.filterPage(rawPagesJson) : rawPagesJson

  let watcher: FSWatcher | null = null

  let hasPlatformPlugin = false

  return {
    name: 'vite-plugin-uni-root',
    enforce: 'pre',
    configResolved({ plugins }) {
      hasPlatformPlugin = plugins.some(v => v.name === 'vite-plugin-uni-platform')
    },
    buildStart() {
      watcher = chokidar.watch(pagesPath).on('all', (event) => {
        if (['add', 'change'].includes(event)) {
          rawPagesJson = loadPagesJson(pagesPath, rootPath)
          pagesJson = options.filterPage ? options.filterPage(rawPagesJson) : rawPagesJson
        }
      })
    },
    async transform(code, id) {
      let ms: MagicString | null = null

      const filterMain = createFilter(`${rootPath}/main.(ts|js)`)
      if (filterMain(id)) {
        ms = await registerKuApp(code, options.rootFileName)
      }

      const filterKuRoot = createFilter(appKuPath)
      if (filterKuRoot(id)) {
        ms = await rebuildKuApp(code, options.enabledVirtualHost)
      }

      const pageId = hasPlatformPlugin ? normalizePlatformPath(id) : id

      const filterPage = createFilter(pagesJson)
      if (filterPage(pageId)) {
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
