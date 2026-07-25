import type { SFCDescriptor } from '@vue/compiler-sfc'

import { existsSync, readFileSync } from 'node:fs'
import { dirname, extname, join, relative } from 'node:path'
import process from 'node:process'

import { parse as VueParser } from '@vue/compiler-sfc'
import { parse as jsonParse } from 'jsonc-parser'
import { normalizePath } from 'vite'

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

const PAGE_FILE_EXTS = ['.vue', '.nvue']

export function formatPagePaths(root: string, path: string): string[] {
  const joinedPath = join(root, path)
  const pathExt = extname(joinedPath)

  if (pathExt) {
    return [normalizePath(joinedPath)]
  }

  const pageFilePaths = PAGE_FILE_EXTS
    .map(fileExt => `${joinedPath}${fileExt}`)
    .filter(filePath => existsSync(filePath))

  if (pageFilePaths.length) {
    return pageFilePaths.map(filePath => normalizePath(filePath))
  }

  return [normalizePath(`${joinedPath}.vue`)]
}

export function formatPagePath(root: string, path: string) {
  return formatPagePaths(root, path)[0]
}

export function loadPagePaths(path: string, rootPath: string): string[] {
  const pagesJsonRaw = readFileSync(path, 'utf-8')

  const pagesJson = jsonParse(pagesJsonRaw)
  const { pages = [] } = pagesJson
  const subPackages = pagesJson.subPackages ?? pagesJson.subpackages ?? []

  return [
    ...pages
      .flatMap((page: any) => formatPagePaths(rootPath, page.path)),
    ...subPackages
      .map(({ pages = [], root = '' }: any) => {
        return pages.flatMap((page: any) => formatPagePaths(join(rootPath, root), page.path))
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
    source: string;
    start: {
      offset: number;
    };
    end: {
      offset: number;
    };
  };
}

export function findNode(sfc: SFCDescriptor, rawTagName: string): TagNode | undefined {
  const templateSource = sfc.template?.content

  if (!templateSource) {
    return
  }

  let tagName = ''

  if (templateSource.includes(`<${toKebabCase(rawTagName)}`)) {
    tagName = toKebabCase(rawTagName)
  }
  else if (templateSource.includes(`<${toPascalCase(rawTagName)}`)) {
    tagName = toPascalCase(rawTagName)
  }

  if (!tagName) {
    return
  }

  const nodeAst = sfc.template?.ast

  if (!nodeAst) {
    return
  }

  // 递归遍历AST节点
  const traverse = (nodes: any) => {
    for (const node of nodes) {
      if (node.type === 1) { // ElementNode
        // 检查标签是否匹配任一可能格式
        if (node.tag === tagName) {
          return node
        }
        // 递归搜索子节点
        if (node.children?.length) {
          const found = traverse(node.children) as TagNode
          if (found) {
            return found
          }
        }
      }
    }
    return undefined
  }

  return traverse(nodeAst.children)
}

const platform = process.env.UNI_PLATFORM

export function normalizePlatformPath(id: string) {
  const idExt = extname(id)

  if (idExt !== '.vue') {
    return id
  }

  if (!id.includes(`.${platform}.`)) {
    return id
  }

  return id.replace(`.${platform}.`, '.')
}

export function toArray<T>(value: T | T[]): T[] {
  if (!value) {
    return []
  }

  return Array.isArray(value) ? value : [value]
}

export function getRelativePath(fromFile: string, toFile: string) {
  const importPath = normalizePath(relative(dirname(fromFile), toFile))
  return importPath.startsWith('.') ? importPath : `./${importPath}`
}
