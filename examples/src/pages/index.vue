<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { globalToastState, showToast, hideToast } = useToast()

function handleClick() {
  return globalToastState.value ? hideToast() : showToast()
}
</script>

<template>
  <view>
    Hello KuRoot
  </view>
  <button @click="handleClick">
    展示Toast
  </button>
</template>
