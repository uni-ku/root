import type { MagicString } from '@vue/compiler-sfc'
import type { FSWatcher } from 'chokidar'
import type { FilterPattern, Plugin } from 'vite'

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
   * 需要排除根组件的页面，支持 glob 匹配
   * @example
   * ```
   * ['src/pages/some.vue', 'src/exclude/*.vue']
   * ```
   */
  excludePages?: FilterPattern
}

export default function UniKuRoot(options: UniKuRootOptions): Plugin {
  options = {
    enabledVirtualHost: false,
    enabledGlobalRef: false,
    rootFileName: 'App.ku',
    ...options,
  }

  const rootPath = process.env.UNI_INPUT_DIR || (`${process.env.INIT_CWD}\\src`)
  const appKuPath = resolve(rootPath, `${options.rootFileName}.vue`)
  const pagesPath = resolve(rootPath, 'pages.json')

  let pagesJson = loadPagesJson(pagesPath, rootPath)

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
          pagesJson = loadPagesJson(pagesPath, rootPath)
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

      const filterPage = createFilter(pagesJson, options.excludePages)
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
