import { promises as fs } from 'node:fs'

import { MagicString } from 'vue/compiler-sfc'

export async function registerKuApp(code: string) {
  const ms = new MagicString(code)

  const importCode = `import KuAppRoot from "./App.ku.vue";`

  const vueUseComponentCode = `app.component("uni-ku-root", KuAppRoot);`

  ms.prepend(`${importCode}\n`)
  ms.replace(
    /(createApp[\s\S]*?)(return\s\{\s*app)/,
    `$1${vueUseComponentCode}\n$2`,
  )

  return ms.toString()
}

export async function rebuildKuApp(path: string) {
  const rootTagNameRE = /\b(?:KuRootView|ku-root-view)\b/

  const code = await fs.readFile(path, 'utf-8')
  const ms = new MagicString(code).replace(rootTagNameRE, 'slot')

  return ms.toString()
}
