import type { SFCDescriptor } from 'vue/compiler-sfc'
import { readFileSync } from 'node:fs'

import { join } from 'node:path'

import { parse as jsonParse } from 'jsonc-parser'
import { normalizePath } from 'vite'
import { parse as VueParser } from 'vue/compiler-sfc'

export async function parseSFC(code: string): Promise<SFCDescriptor> {
  try {
    return VueParser(code, { pad: 'space' }).descriptor || (VueParser as any)({ source: code })
  }
  catch {
    throw new Error(
      '[@uni-ku/root] Vue\'s version must be 3.2.13 or higher.',
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

export function toKebabCase(str: string) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
}

export function toPascalCase(str: string) {
  return str
    .replace(/(^\w|-+\w)/g, match => match.toUpperCase().replace(/-/g, ''))
}

interface TagNode {
  loc: {
    source: string
    start: {
      offset: number
    }
    end: {
      offset: number
    }
  }
}

export function findNode(sfc: SFCDescriptor, rawTagName: string): TagNode | undefined {
  const templateSource = sfc.template?.content

  if (!templateSource)
    return

  let tagName = ''

  if (templateSource.includes(`<${toKebabCase(rawTagName)}`)) {
    tagName = toKebabCase(rawTagName)
  }
  else if (templateSource.includes(`<${toPascalCase(rawTagName)}`)) {
    tagName = toPascalCase(rawTagName)
  }

  if (!tagName)
    return

  const nodeAst = sfc.template?.ast

  if (!nodeAst)
    return

  return nodeAst.children.find(node => node.type === 1 && node.tag === tagName)
}
