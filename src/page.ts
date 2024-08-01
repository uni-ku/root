import { MagicString } from 'vue/compiler-sfc'

import { findNode, parseSFC } from './utils'

export async function transformPage(code: string) {
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

  if (pageTempStart && pageTempEnd) {
    ms.appendLeft(pageTempStart, `\n${pageMetaSource}\n<uni-ku-root>`)
    ms.appendRight(pageTempEnd, `</uni-ku-root>\n`)
  }

  return ms.toString()
}
