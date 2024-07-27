import process from 'node:process'
import { resolve } from 'node:path'
import { promises as fs } from 'node:fs'

import type { Plugin } from 'vite'
import { createFilter } from 'vite'
import { MagicString } from 'vue/compiler-sfc'

import { findNode, loadPagesJson, parseSFC } from './utils'

async function registerKuApp(code: string) {
  const ms = new MagicString(code)

  const importCode = 'import KuAppRoot from "./App.ku.vue";\n'

  const vueUseComponentCode = `app.component("uni-ku-root", KuAppRoot);\n`

  ms.append(importCode)
  ms.replace(
    /(createApp[\s\S]*?)(return\s\{\s*app)/,
    `$1${vueUseComponentCode}$2`,
  )

  return ms.toString()
}

async function rebuildKuApp(path: string) {
  const rootTagNameRE = /\b(?:KuRootView|ku-root-view)\b/

  const code = await fs.readFile(path, 'utf-8')
  const ms = new MagicString(code).replace(rootTagNameRE, 'slot')

  return ms.toString()
}

async function transformPage(code: string) {
  const sfc = await parseSFC(code)
  const ms = new MagicString(code)

  const start = sfc.template?.loc.start.offset
  const end = sfc.template?.loc.end.offset

  let pageMetaSource = ''
  const pageMetaNode = findNode(sfc, 'PageMeta')

  if (pageMetaNode) {
    pageMetaSource = pageMetaNode.loc.source
    const { start: metaStart, end: metaEnd } = pageMetaNode.loc

    ms.remove(metaStart.offset, metaEnd.offset)
  }

  if (start && end) {
    ms.appendLeft(start, `\n${pageMetaSource}<uni-ku-root>`)
    ms.appendRight(end, `</uni-ku-root>\n`)
  }

  return ms.toString()
}

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
