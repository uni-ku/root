<script setup lang="ts">
import { ref } from 'vue'
import GlobalToast from './components/GlobalToast.vue'

const HelloVueRef = ref('Hello app.Ku.vue')

const exposeRef = ref('this is form app.Ku.vue')

defineExpose({
  exposeRef,
})
</script>

<template>
  <div>Hello AppKuVue</div>
  <KuRootView />
  <div>{{ HelloVueRef }}</div>
  <GlobalToast />
</template>
