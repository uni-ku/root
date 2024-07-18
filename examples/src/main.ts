import { createSSRApp } from 'vue'
import App from './App.vue'

import GlobalToast from './components/GlobalToast.vue'

export function createApp() {
  const app = createSSRApp(App)

  app.component('GlobalToast', GlobalToast)

  return {
    app,
  }
}
