<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { globalToastState, hideToast } = useToast()
</script>

<template>
  <div v-if="globalToastState" class="toast-wrapper" @click="hideToast">
    <div class="toast-box">
      welcome to use @uni-ku/root
    </div>
  </div>
</template>

<style scoped>
.toast-wrapper{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-box{
  background: white;
  color: black;
}
</style>
