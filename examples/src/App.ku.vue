<script setup lang="ts">
import { ref } from 'vue'

const HelloVueRef = ref('test')
</script>

<template>
  <div>Hello AppKuVue</div>
  <KuRootView />
  <div>{{ HelloVueRef }}</div>
  <GlobalToast />
</template>
