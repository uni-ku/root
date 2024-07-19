import { createFilter } from 'vite'

import { MagicString } from 'vue/compiler-sfc'

import { parseSFC } from './utils'

export async function transformAppTemplate(code: string) {
  const sfc = await parseSFC(code)
  const ms = new MagicString(code)

  let template = ''

  if (sfc.template?.loc.start.offset && sfc.template?.loc.end.offset) {
    template = sfc.template.content

    ms.remove(
      sfc.template.loc.start.offset - '<template>'.length,
      sfc.template.loc.end.offset + '</template>'.length,
    )
  }

  return {
    newCode: ms.toString(),
    template,
  }
}

export async function transformPageTemplate(code: string, rootTemplate: string) {
  const sfc = await parseSFC(code)
  const ms = new MagicString(code)

  const templateCode = sfc.template?.loc.source

  if (templateCode) {
    const start = sfc.template?.loc.start.offset
    const end = sfc.template?.loc.end.offset

    if (start && end) {
      ms.overwrite(
        start,
        end,
        templateCode + rootTemplate,
      )
    }
  }

  return ms.toString()
}

interface ContextOptions {
  pagesJson: string[]
}

export function transformCenter(ctx: ContextOptions) {
  let rootTemplate = ''

  return async (code: string, id: string) => {
    const filterAppId = createFilter(['src/App.vue'])

    if (filterAppId(id)) {
      const { newCode, template } = await transformAppTemplate(code)
      rootTemplate = template

      return newCode
    }

    const filterPage = createFilter(ctx.pagesJson)

    if (filterPage(id)) {
      return transformPageTemplate(code, rootTemplate)
    }

    return code
  }
}
