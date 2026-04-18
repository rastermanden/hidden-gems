<template>
  <div class="carousel">
    <template v-if="photos.length">
      <button v-if="photos.length > 1" class="carousel-btn prev" @click="go(index - 1)">&#8249;</button>
      <button v-if="photos.length > 1" class="carousel-btn next" @click="go(index + 1)">&#8250;</button>
      <div class="carousel-slides" :style="{ transform: `translateX(-${index * 100}%)` }">
        <img v-for="(url, i) in photos" :key="i" :src="url" :alt="alt" />
      </div>
      <div v-if="photos.length > 1" class="carousel-dots">
        <span
          v-for="(_, i) in photos"
          :key="i"
          :class="{ active: i === index }"
          @click="go(i)"
        ></span>
      </div>
    </template>
    <div v-else class="detail-emoji-header">{{ emoji || '🌿' }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  photos: { type: Array, default: () => [] },
  alt: { type: String, default: '' },
  emoji: { type: String, default: '🌿' }
})

const index = ref(0)

function go(i) {
  const len = props.photos.length
  index.value = ((i % len) + len) % len
}
</script>

<style scoped>
.carousel {
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
  border-radius: var(--radius) var(--radius) 0 0;
  background: #111;
}
.carousel-slides {
  display: flex;
  height: 100%;
  transition: transform 0.3s ease;
}
.carousel-slides img {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.45);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 34px; height: 34px;
  font-size: 18px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  z-index: 2;
  line-height: 1;
}
.carousel-btn.prev { left: 10px; }
.carousel-btn.next { right: 10px; }
.carousel-dots {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 2;
}
.carousel-dots span {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: background 0.2s;
}
.carousel-dots span.active { background: #fff; }

.detail-emoji-header {
  width: 100%;
  height: 140px;
  background: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52px;
  border-radius: var(--radius) var(--radius) 0 0;
  position: relative;
  overflow: hidden;
}
</style>
