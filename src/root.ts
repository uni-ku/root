import { MagicString } from 'vue/compiler-sfc'
import { parseSFC } from './utils'

export async function registerKuApp(code: string, fileName: string = 'App.ku') {
  const ms = new MagicString(code)

  const importCode = `import GlobalKuRoot from "./${fileName}.vue";`

  const vueUseComponentCode = `app.component("global-ku-root", GlobalKuRoot);`

  ms.prepend(`${importCode}\n`).replace(
    /(createApp[\s\S]*?)(return\s\{\s*app)/,
    `$1${vueUseComponentCode}\n$2`,
  )

  return ms
}

export async function rebuildKuApp(code: string) {
  const ms = new MagicString(code)
  const rootTagNameRE = /<(KuRootView|ku-root-view)\s*\/>/

  ms.replace(rootTagNameRE, '<slot />')

  const sfc = await parseSFC(code)
  if (sfc.script) {
    return ms
  }

  const langType = sfc.scriptSetup?.lang

  ms.append(`<script ${langType ? `lang="${langType}"` : ''}>
  export default {
    options: {
      virtualHost: true,
    },
  }\n</script>`)

  return ms
}
