import type { MagicString } from '@vue/compiler-sfc'
import type { FSWatcher } from 'chokidar'
import type { Plugin } from 'vite'

import { resolve } from 'node:path'
import process from 'node:process'

import chokidar from 'chokidar'
import { createFilter, normalizePath } from 'vite'

import { transformNvuePage, transformPage } from './page'
import { rebuildKuApp, registerKuApp } from './root'
import { getRelativePath, loadPagePaths, normalizePlatformPath, toArray } from './utils'

interface UniKuRootOptions {
  /**
   * 是否启用虚拟节点
   * @default false
   */
  enabledVirtualHost?: boolean;
  /**
   * 是否启用全局ref
   * @default false
   */
  enabledGlobalRef?: boolean;
  /**
   * 根文件名，注意不要携带 .vue
   * @default 'App.ku'
   */
  rootFileName?: string;
  /**
   * 需要排除根组件的页面，支持 glob 匹配
   * @example
   * ```
   * ['pages/some.vue', 'pages/exclude/*.vue']
   * ```
   */
  excludePages?: string | string[];
}

export default function UniKuRoot(options?: UniKuRootOptions): Plugin {
  options = {
    enabledVirtualHost: false,
    enabledGlobalRef: false,
    rootFileName: 'App.ku',
    ...options,
  }

  const rootPath = normalizePath(process.env.UNI_INPUT_DIR || resolve(process.env.INIT_CWD || process.cwd(), 'src'))
  const appKuPath = normalizePath(resolve(rootPath, `${options.rootFileName}.vue`))
  const pagesPath = normalizePath(resolve(rootPath, 'pages.json'))
  const excludedPaths = toArray(options.excludePages).filter(Boolean).map(path => normalizePath(resolve(rootPath, path!)))
  const mainFiles = [
    normalizePath(resolve(rootPath, 'main.ts')),
    normalizePath(resolve(rootPath, 'main.js')),
  ]

  let pagePaths = loadPagePaths(pagesPath, rootPath)

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
          pagePaths = loadPagePaths(pagesPath, rootPath)
        }
      })
    },
    async transform(code, id) {
      let ms: MagicString | null = null

      const filterMain = createFilter(mainFiles)
      if (filterMain(id)) {
        ms = await registerKuApp(code, options.rootFileName)
      }

      const filterKuRoot = createFilter(appKuPath)
      if (filterKuRoot(id)) {
        ms = await rebuildKuApp(code, options.enabledVirtualHost)
      }

      const pageId = hasPlatformPlugin ? normalizePlatformPath(id) : id

      const filterPage = createFilter(pagePaths, excludedPaths)
      if (filterPage(pageId)) {
        ms = id.endsWith('.nvue')
          ? await transformNvuePage(code, getRelativePath(id, appKuPath), options.enabledGlobalRef)
          : await transformPage(code, options.enabledGlobalRef)
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
