<template>
  <div class="toast" :class="{ show: visible }">{{ message }}</div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  message: { type: String, default: '' }
})

const visible = ref(false)
let timer = null

watch(() => props.message, (msg) => {
  if (!msg) return
  visible.value = true
  clearTimeout(timer)
  timer = setTimeout(() => { visible.value = false }, 2000)
})
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 50%;
  left: 50%;
  transform: translate(-50%, 50%);
  background: rgba(17,24,39,0.92);
  backdrop-filter: blur(8px);
  color: white;
  padding: 10px 20px;
  border-radius: 24px;
  font-size: 13px;
  font-weight: 500;
  z-index: 999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}
.toast.show { opacity: 1; }
</style>
