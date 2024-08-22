<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from '@/composables/useToast'

const { globalToastState, showToast, hideToast } = useToast()

function handleClick() {
  return globalToastState.value ? hideToast() : showToast()
}

const uniKuRoot = ref()

onMounted(() => {
  // eslint-disable-next-line no-console
  console.log(uniKuRoot.value?.exposeRef)
})
</script>

<template root="uniKuRoot">
  <!-- 这行代码仅小程序可见，完全支持 PageMeta -->
  <page-meta>
    <navigation-bar>Hi, Page Index</navigation-bar>
  </page-meta>
  <view>
    Hello KuRoot
  </view>
  <button @click="handleClick">
    展示Toast
  </button>
</template>
