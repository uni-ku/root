import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { normalizePath } from 'vite'
import { afterEach, describe, expect, it } from 'vitest'

import { transformNvuePage, transformPage } from '../src/page'
import { loadPagePaths } from '../src/utils'

const tempDirs: string[] = []

afterEach(() => {
  while (tempDirs.length) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true })
  }
})

function createTempRoot() {
  const rootPath = mkdtempSync(join(tmpdir(), 'uni-ku-root-'))
  tempDirs.push(rootPath)
  return rootPath
}

describe('page transforms', () => {
  it('wraps vue pages and keeps page-meta above the root component', async () => {
    const code = `<template root="rootRef">
  <page-meta><navigation-bar title="Home" /></page-meta>
  <view>Home</view>
</template>
`

    const result = (await transformPage(code, true)).toString()

    expect(result).toContain('<page-meta><navigation-bar title="Home" /></page-meta>\n<global-ku-root ref="rootRef">')
    expect(result).toContain('\n</global-ku-root>\n</template>')
    expect(result.match(/<page-meta>/g)).toHaveLength(1)
  })

  it('locally imports the root component for nvue script setup pages', async () => {
    const code = `<template>
  <view>NVUE</view>
</template>

<script setup lang="ts">
const label = 'NVUE'
</script>
`

    const result = (await transformNvuePage(code, '../App.ku.vue', true)).toString()

    expect(result).toContain('<GlobalKuRoot ref="uniKuRoot">')
    expect(result).toContain('\n</GlobalKuRoot>\n</template>')
    expect(result).toContain('import GlobalKuRoot from \'../App.ku.vue\'\n\nconst label')
  })

  it('registers the local root component for nvue options api pages', async () => {
    const code = `<template root="kuRoot">
  <view>NVUE</view>
</template>

<script>
export default {
  components: { LocalThing },
  data() {
    return { label: 'NVUE' }
  },
}
</script>
`

    const result = (await transformNvuePage(code, '../../App.ku.vue')).toString()

    expect(result).toContain('import GlobalKuRoot from \'../../App.ku.vue\'')
    expect(result).toContain('components: { GlobalKuRoot, LocalThing }')
    expect(result).toContain('<GlobalKuRoot ref="kuRoot">')
  })

  it('adds an options api script when an nvue page has no script block', async () => {
    const code = `<template>
  <view>NVUE</view>
</template>
`

    const result = (await transformNvuePage(code, './App.ku.vue')).toString()

    expect(result).toContain('<GlobalKuRoot>')
    expect(result).toContain('<script>\nimport GlobalKuRoot from \'./App.ku.vue\'')
    expect(result).toContain('components: { GlobalKuRoot }')
  })
})

describe('pages.json loading', () => {
  it.each(['subPackages', 'subpackages'])('loads pages from %s', (subPackagesKey) => {
    const rootPath = createTempRoot()
    const pagesJsonPath = join(rootPath, 'pages.json')

    writeFileSync(pagesJsonPath, JSON.stringify({
      pages: [{ path: 'pages/index' }],
      [subPackagesKey]: [{
        root: 'packages/example',
        pages: [{ path: 'pages/detail' }],
      }],
    }))

    expect(loadPagePaths(pagesJsonPath, '/project/src')).toEqual([
      '/project/src/pages/index.vue',
      '/project/src/packages/example/pages/detail.vue',
    ])
  })

  it('matches existing vue and nvue files for extensionless page paths', () => {
    const rootPath = createTempRoot()
    mkdirSync(join(rootPath, 'pages'), { recursive: true })
    mkdirSync(join(rootPath, 'pkg', 'sub'), { recursive: true })
    writeFileSync(join(rootPath, 'pages', 'index.vue'), '')
    writeFileSync(join(rootPath, 'pages', 'index.nvue'), '')
    writeFileSync(join(rootPath, 'pkg', 'sub', 'profile.nvue'), '')
    writeFileSync(join(rootPath, 'pages.json'), `{
      "pages": [
        { "path": "pages/index" },
        { "path": "pages/about" }
      ],
      "subPackages": [
        {
          "root": "pkg",
          "pages": [
            { "path": "sub/profile" }
          ]
        }
      ]
    }`)

    const pages = loadPagePaths(join(rootPath, 'pages.json'), rootPath)

    expect(pages).toEqual([
      normalizePath(join(rootPath, 'pages', 'index.vue')),
      normalizePath(join(rootPath, 'pages', 'index.nvue')),
      normalizePath(join(rootPath, 'pages', 'about.vue')),
      normalizePath(join(rootPath, 'pkg', 'sub', 'profile.nvue')),
    ])
  })
})
