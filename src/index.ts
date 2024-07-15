import process from 'node:process'
import { resolve } from 'node:path'

import type { Plugin } from 'vite'

import { transformCenter } from './transformer'
import { loadPagesJson } from './utils'

export default function UniKuRoot(): Plugin {
  const rootPath = process.env.UNI_INPUT_DIR || (`${process.env.INIT_CWD}\\src`)
  const pagesPath = resolve(rootPath, 'pages.json')
  const pagesJson = loadPagesJson(pagesPath, rootPath)

  let transformers: ReturnType<typeof transformCenter>

  return {
    name: 'vite-plugin-uni-root',
    enforce: 'pre',
    configResolved() {
      transformers = transformCenter({ pagesJson })
    },
    transform(code, id) {
      return transformers(code, id)
    },
  }
}
