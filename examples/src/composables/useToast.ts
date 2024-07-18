import { ref } from 'vue'

const globalToastState = ref(false)

export function useToast() {
  function showToast() {
    globalToastState.value = true
  }

  function hideToast() {
    globalToastState.value = false
  }

  return {
    globalToastState,
    showToast,
    hideToast,
  }
}
