import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { parse as jsonParse } from 'jsonc-parser'

import type { SFCDescriptor } from '@vue/compiler-sfc'
import { parse as VueParser } from '@vue/compiler-sfc'

import { normalizePath } from 'vite'

export async function parseSFC(code: string): Promise<SFCDescriptor> {
  try {
    return VueParser(code, { pad: 'space' }).descriptor || (VueParser as any)({ source: code })
  }
  catch {
    throw new Error(
      '[vite-plugin-uni-root] Vue3\'s "@vue/compiler-sfc" is required.',
    )
  }
}

export function formatPagePath(root: string, path: string) {
  return normalizePath(`${join(root, path)}.vue`)
}

export function loadPagesJson(path: string, rootPath: string) {
  const pagesJsonRaw = readFileSync(path, 'utf-8')

  const { pages = [], subPackages = [] } = jsonParse(pagesJsonRaw)

  return [
    ...pages
      .map((page: any) => formatPagePath(rootPath, page.path)),
    ...subPackages
      .map(({ pages = {}, root = '' }: any) => {
        return pages.map((page: any) => formatPagePath(join(rootPath, root), page.path))
      })
      .flat(),
  ]
}
