## Root

借助 Vite 模拟出虚拟的全局组件，解决 uniapp 无根组件导致无法使用全局共享组件问题

### 📦 安装

```bash
pnpm add -D @uni-ku/root
```

### 🚀 使用

1. 引入 `@uni-ku/root`

```javascript
// vite.config.*

import { defineConfig } from 'vite'
import UniKuRoot from '@uni-ku/root'

export default defineConfig({
  plugins: [
    // 若存在改变 pages.json 的插件，请将 UniKuRoot 放置其后
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

  return {
    app
  }
}
```

3. 添加全局所需组件或代码

> 注意：组件或变量都需要在**全局中共享**，否则无法正常渲染与使用

```javascript
// App.vue

<template>
  <LoginModal />
</template>
```
### 🦾 拓展

> 该功能与 VueRouter 中的 RouterView 实现类似

通过标签 `<KuRoot />` 或 `<ku-root />` 实现指定共享组件存放位置

```javascript
// App.vue

<template>
  <div>当前页面的顶部</div>
  <KuRoot />
  <LoginModal />
</template>
```

### ✨ 例子

全局Toast组件核心实现请关注:  `src/components` `src/composables`

- 🔗 [查看完整例子](https://github.com/uni-ku/root/tree/main/examples)

### 📝 待办

- [ ] 热更新
- [ ] 补全单元测试
- [ ] 使 App.vue 与正常 Vue文件一样 被使用

### 💖 赞助

如果我的工作帮助到了您，可以请我吃包辣条，能够使我能量满满 ⚡

- [点这里请吃辣条](https://github.com/Skiyee/sponsors) 👈

<p align="center">
  <a href="https://github.com/Skiyee/sponsors">
    <img alt="sponsors" src="https://cdn.jsdelivr.net/gh/Skiyee/Skiyee/sponsors.svg"/>
  </a>
</p>
