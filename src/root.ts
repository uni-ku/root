import { promises as fs } from 'node:fs'

import { MagicString } from 'vue/compiler-sfc'

export async function registerKuApp(code: string) {
  const ms = new MagicString(code)

  const importCode = `import UniKuAppRoot from "./App.ku.vue";`

  const vueUseComponentCode = `app.component("uni-ku-app-root", UniKuAppRoot);`

  ms.prepend(`${importCode}\n`).replace(
    /(createApp[\s\S]*?)(return\s\{\s*app)/,
    `$1${vueUseComponentCode}\n$2`,
  )

  return ms
}

export async function rebuildKuApp(path: string) {
  const rootTagNameRE = /<(KuRootView|ku-root-view)\s*\/>/

  const code = await fs.readFile(path, 'utf-8')
  const ms = new MagicString(code).replace(rootTagNameRE, '<slot />')

  return ms
}
