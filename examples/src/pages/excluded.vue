<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from '@/composables/useToast'
import LayoutDefault from '@/layouts/default.vue'

const { globalToastState, showToast, hideToast } = useToast()

function handleClick() {
  return globalToastState.value ? hideToast() : showToast()
}

const uniKuRoot = ref()

onMounted(() => {
  // eslint-disable-next-line no-console
  console.log(uniKuRoot.value?.exposeRef)
})

const color = 'red'
</script>

<template root="uniKuRoot">
  <LayoutDefault>
    <!-- 这行代码仅小程序可见，完全支持 PageMeta -->

    <view>
      Hello KuRoot
    </view>
    <view class="text">
      Hello v-bind css
    </view>
    <button @click="handleClick">
      展示Toast
    </button>
  </LayoutDefault>
</template>

<style scoped>
.text {
  color: v-bind(color)
}
</style>
