import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { loadPagesJson } from '../src/utils'

const tempDirectories: string[] = []

afterEach(() => {
  tempDirectories.splice(0).forEach(directory => rmSync(directory, { recursive: true, force: true }))
})

describe('loadPagesJson', () => {
  it.each(['subPackages', 'subpackages'])('loads pages from %s', (subPackagesKey) => {
    const directory = mkdtempSync(join(tmpdir(), 'uni-ku-root-'))
    const pagesJsonPath = join(directory, 'pages.json')
    tempDirectories.push(directory)

    writeFileSync(pagesJsonPath, JSON.stringify({
      pages: [{ path: 'pages/index' }],
      [subPackagesKey]: [{
        root: 'packages/example',
        pages: [{ path: 'pages/detail' }],
      }],
    }))

    expect(loadPagesJson(pagesJsonPath, '/project/src')).toEqual([
      '/project/src/pages/index.vue',
      '/project/src/packages/example/pages/detail.vue',
    ])
  })
})
