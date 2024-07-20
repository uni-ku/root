import { createFilter } from 'vite'

import type { SFCDescriptor } from 'vue/compiler-sfc'
import { MagicString } from 'vue/compiler-sfc'

import { parseSFC } from './utils'

function findKuRootNode(sfc: SFCDescriptor) {
  const appTemplateSource = sfc.template?.content

  if (!appTemplateSource)
    return

  let kuRootTagName = ''

  if (appTemplateSource.includes('<KuRoot')) {
    kuRootTagName = 'KuRoot'
  }
  else if (appTemplateSource.includes('<ku-root')) {
    kuRootTagName = 'ku-root'
  }

  const appAst = sfc.template?.ast

  if (!appAst)
    return

  type tagNode = (typeof appAst)['children'][number]

  const findTagNode = (rawNode: any): tagNode | undefined => {
    for (const node of rawNode.children) {
      if (node.type !== 1) {
        continue
      }

      if (node.tag === kuRootTagName) {
        return node
      }

      const found = findTagNode(node)
      if (found) {
        return found
      }
    }
  }

  return findTagNode(appAst)
}

interface ContextOptions {
  pagesJson: string[]
}

export function transformCenter(ctx: ContextOptions) {
  let _sfc: SFCDescriptor
  let _ms: MagicString
  let _appSource: string | undefined
  let _kuRootNode: ReturnType<typeof findKuRootNode>

  // 清除 AppTemplate
  const transformAppTemplate = async () => {
    const appNodeLoc = _sfc.template?.loc

    if (appNodeLoc) {
      const start = appNodeLoc.start.offset - ('<template>').length
      const end = appNodeLoc.end.offset + ('</template>').length

      _ms.remove(start, end)
    }

    return _ms.toString()
  }

  const transformPageTemplate = async () => {
    const pageNodeLoc = _sfc.template?.loc
    const kuRootSource = _kuRootNode?.loc.source

    if (!_appSource || !pageNodeLoc) {
      return _ms.toString()
    }

    let parsePageSource = ''

    const start = pageNodeLoc.start.offset
    const end = pageNodeLoc.end.offset

    if (kuRootSource) {
      parsePageSource = _appSource.replace(kuRootSource, pageNodeLoc.source)
    }
    else {
      parsePageSource = pageNodeLoc.source + _appSource
    }

    _ms.overwrite(start, end, parsePageSource)

    return _ms.toString()
  }

  return async (code: string, id: string) => {
    const filterAppId = createFilter(['src/App.vue'])

    if (filterAppId(id)) {
      _sfc = await parseSFC(code)
      _ms = new MagicString(code)

      _appSource = _sfc.template?.content
      _kuRootNode = findKuRootNode(_sfc)

      return await transformAppTemplate()
    }

    const filterPage = createFilter(ctx.pagesJson)

    if (filterPage(id)) {
      _sfc = await parseSFC(code)
      _ms = new MagicString(code)

      return transformPageTemplate()
    }

    return code
  }
}
