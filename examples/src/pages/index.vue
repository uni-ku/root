<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { globalToastState, showToast, hideToast } = useToast()

function handleClick() {
  return globalToastState.value ? hideToast() : showToast()
}
</script>

<template>
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
