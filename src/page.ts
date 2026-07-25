import type { SFCDescriptor, SFCScriptBlock } from '@vue/compiler-sfc'
import { MagicString } from '@vue/compiler-sfc'

import { findNode, parseSFC } from './utils'

export async function transformPage(code: string, enabledGlobalRef = false) {
  const sfc = await parseSFC(code)
  const ms = new MagicString(code)

  wrapTemplate(ms, sfc, 'global-ku-root', getPageRootRefSource(sfc, enabledGlobalRef))

  return ms
}

export async function transformNvuePage(code: string, componentImportPath: string, enabledGlobalRef = false) {
  const sfc = await parseSFC(code)
  const ms = new MagicString(code)

  wrapTemplate(ms, sfc, 'GlobalKuRoot', getPageRootRefSource(sfc, enabledGlobalRef))

  if (sfc.scriptSetup) {
    ms.appendLeft(sfc.scriptSetup.loc.start.offset, getNvueRootImport(componentImportPath))
  }
  else if (sfc.script) {
    ms.appendLeft(sfc.script.loc.start.offset, getNvueRootImport(componentImportPath))
    ensureNvueOptionsComponent(ms, sfc.script)
  }
  else {
    ms.append(
      `\n<script>\n${getNvueRootImport(componentImportPath)}export default {\n  components: { GlobalKuRoot },\n}\n</script>\n`,
    )
  }

  return ms
}

function getPageRootRefSource(sfc: SFCDescriptor, enabledGlobalRef = false) {
  const pageTempAttrs = sfc.template?.attrs
  if (pageTempAttrs && pageTempAttrs.root) {
    return `ref="${pageTempAttrs.root as string}"`
  }
  return enabledGlobalRef ? 'ref="uniKuRoot"' : ''
}

function wrapTemplate(ms: MagicString, sfc: SFCDescriptor, tagName: string, rootRefSource = '') {
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

  if (pageTempStart != null && pageTempEnd != null) {
    const refSource = rootRefSource ? ` ${rootRefSource}` : ''
    const pageMetaPrefix = pageMetaSource ? `\n${pageMetaSource}\n` : '\n'
    ms.appendLeft(pageTempStart, `${pageMetaPrefix}<${tagName}${refSource}>`)
    ms.appendRight(pageTempEnd, `\n</${tagName}>\n`)
  }
}

function getNvueRootImport(componentImportPath: string) {
  return `import GlobalKuRoot from '${componentImportPath}'\n`
}

function findExportDefaultObjectStart(scriptContent: string) {
  const exportDefaultIndex = scriptContent.indexOf('export default')
  if (exportDefaultIndex < 0) {
    return -1
  }

  const afterExportDefault = scriptContent.slice(exportDefaultIndex + 'export default'.length)
  const defineComponentMatch = afterExportDefault.match(/^\s*defineComponent\s*\(\s*\{/)
  if (defineComponentMatch) {
    return exportDefaultIndex + 'export default'.length + defineComponentMatch[0].length
  }

  const objectMatch = afterExportDefault.match(/^\s*\{/)
  if (objectMatch) {
    return exportDefaultIndex + 'export default'.length + objectMatch[0].length
  }

  return -1
}

function ensureNvueOptionsComponent(ms: MagicString, script: SFCScriptBlock) {
  const componentsMatch = script.content.match(/components\s*:\s*\{/)
  if (componentsMatch && componentsMatch.index != null) {
    ms.appendLeft(componentsMatch.index + componentsMatch[0].length, ' GlobalKuRoot,')
    return
  }

  const exportDefaultObjectStart = findExportDefaultObjectStart(script.content)
  if (exportDefaultObjectStart >= 0) {
    ms.appendLeft(
      exportDefaultObjectStart,
      '\n  components: { GlobalKuRoot },',
    )
    return
  }

  ms.appendLeft(script.loc.end.offset, '\nexport default {\n  components: { GlobalKuRoot },\n}\n')
}
