import { MagicString } from 'vue/compiler-sfc'

import { findNode, parseSFC } from './utils'

export async function transformPage(code: string, enabledGlobalRef = false) {
  const sfc = await parseSFC(code)
  const ms = new MagicString(code)

  const pageTempStart = sfc.template?.loc.start.offset
  const pageTempEnd = sfc.template?.loc.end.offset

  let pageMetaSource = ''
  const pageMetaNode = findNode(sfc, 'PageMeta')

  if (pageMetaNode) {
    pageMetaSource = pageMetaNode.loc.source

    const metaTempStart = pageMetaNode.loc.start.offset
    const metaTempEnd = pageMetaNode.loc.end.offset

    ms.remove(metaTempStart, metaTempEnd)
  }

  const pageTempAttrs = sfc.template?.attrs

  let pageRootRefSource = enabledGlobalRef ? 'ref="uniKuRoot"' : ''

  if (pageTempAttrs && pageTempAttrs.root) {
    pageRootRefSource = `ref="${pageTempAttrs.root as string}"`
  }

  if (pageTempStart && pageTempEnd) {
    ms.appendLeft(pageTempStart, `\n${pageMetaSource}\n<uni-ku-app-root ${pageRootRefSource}>`)
    ms.appendRight(pageTempEnd, `</uni-ku-app-root>\n`)
  }

  return ms
}
