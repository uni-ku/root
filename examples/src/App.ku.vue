<script setup lang="ts">
import { ref } from 'vue'
import GlobalToast from './components/GlobalToast.vue'

const HelloVueRef = ref('test')
</script>

<template>
  <div>Hello AppKuVue</div>
  <KuRootView />
  <div>{{ HelloVueRef }}</div>
  <GlobalToast />
</template>
