import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { normalizePath } from 'vite'
import { describe, expect, it } from 'vitest'

import { transformNvuePage } from '../src/page'
import { getRelativePath, loadPagePaths } from '../src/utils'

const testDirectory = dirname(fileURLToPath(import.meta.url))
const examplesSourceRoot = resolve(testDirectory, '../examples/src')
const pagesJsonPath = join(examplesSourceRoot, 'pages.json')
const appKuPath = join(examplesSourceRoot, 'KuRoot.vue')

describe('examples nvue pages', () => {
  it('resolves nvue demo pages from examples pages.json', () => {
    const pagePaths = loadPagePaths(pagesJsonPath, examplesSourceRoot)

    expect(pagePaths).toContain(normalizePath(join(examplesSourceRoot, 'pages/nvue-demo.nvue')))
    expect(pagePaths).toContain(normalizePath(join(examplesSourceRoot, 'pages/nvue-options.nvue')))
  })

  it('wraps examples/src/pages/nvue-demo.nvue with a local GlobalKuRoot import', async () => {
    const pagePath = join(examplesSourceRoot, 'pages/nvue-demo.nvue')
    const sourceCode = readFileSync(pagePath, 'utf-8')
    const rootImportPath = getRelativePath(pagePath, appKuPath)

    const result = (await transformNvuePage(sourceCode, rootImportPath)).toString()

    expect(rootImportPath).toBe('../KuRoot.vue')
    expect(result).toContain(`import GlobalKuRoot from '${rootImportPath}'`)
    expect(result).toContain('<GlobalKuRoot ref="uniKuRoot">')
    expect(result).toContain('</GlobalKuRoot>')
  })

  it('registers GlobalKuRoot for examples/src/pages/nvue-options.nvue', async () => {
    const pagePath = join(examplesSourceRoot, 'pages/nvue-options.nvue')
    const sourceCode = readFileSync(pagePath, 'utf-8')
    const rootImportPath = getRelativePath(pagePath, appKuPath)

    const result = (await transformNvuePage(sourceCode, rootImportPath)).toString()

    expect(result).toContain(`import GlobalKuRoot from '${rootImportPath}'`)
    expect(result).toContain('components: { GlobalKuRoot },')
    expect(result).toContain('<GlobalKuRoot ref="kuRoot">')
    expect(result).toContain('</GlobalKuRoot>')
  })
})
