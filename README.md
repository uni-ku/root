## Root

借助 Vite 模拟出虚拟的全局组件，解决 uniapp 无根组件导致无法使用全局共享组件问题

### 📦 安装

```bash
pnpm add -D @uni-ku/root
```

### 🚀 使用

1. 在 vite.config.* 中引入 `@uni-ku/root`

```javascript
import { defineConfig } from 'vite'
import UniKuRoot from '@uni-ku/root'

export default defineConfig({
  plugins: [
    // 如果有插件更改 pages.json 的请把 UniKuRoot 放其后面
    UniKuRoot()
  ]
})
```

2. 注册全局组件

> 建议配合 `@uni-helper/vite-plugin-uni-components` 使用，可以省略以下全局注册组件

```javascript
// main.*
import LoginModal from '@/components/LoginModal'

export function createApp() {
  const app = createSSRApp(App)

  app.component('LoginModal', LoginModal)
}
```

3. 在项目入口 `App.vue` 内，并往 `template` 中添加所需全局组件或代码

> 注意：组件或变量都需要在全局中引入，否则无法正常渲染

```javascript
// App.vue
<template>
  <LoginModal />
</template>
```

### 📝 待办

- [ ] 热更新
- [ ] 补全单元测试
- [ ] 更灵活的使用方式

### 💖 赞助

如果我的工作帮助到了您，可以请我吃包辣条，能够使我能量满满 ⚡

- [点这里请吃辣条](https://github.com/Skiyee/sponsors) 👈

<p align="center">
  <a href="https://github.com/Skiyee/sponsors">
    <img alt="sponsors" src="https://cdn.jsdelivr.net/gh/Skiyee/Skiyee/sponsors.svg"/>
  </a>
</p>
