<template>
  <div class="sheet">
    <div class="sheet-handle"></div>
    <div class="sheet-title">{{ titleText }}</div>
    <div class="gem-list">
      <div v-if="gems.length === 0" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="24,4 42,14 42,34 24,44 6,34 6,14" stroke="#2d6a4f" stroke-width="2" fill="none"/>
          <polygon points="24,4 42,14 24,24" fill="#2d6a4f" opacity="0.3"/>
          <polygon points="24,4 6,14 24,24" fill="#2d6a4f" opacity="0.15"/>
          <polygon points="6,14 24,24 6,34" fill="#2d6a4f" opacity="0.12"/>
          <polygon points="42,14 24,24 42,34" fill="#2d6a4f" opacity="0.22"/>
          <polygon points="24,24 6,34 24,44" fill="#2d6a4f" opacity="0.1"/>
          <polygon points="24,24 42,34 24,44" fill="#2d6a4f" opacity="0.18"/>
          <circle cx="24" cy="24" r="3" fill="#2d6a4f" opacity="0.5"/>
        </svg>
        <div class="empty-state-title">No gems yet</div>
        <div class="empty-state-sub">Tap + to drop your first hidden gem on the map</div>
      </div>
      <GemCard
        v-for="gem in gems"
        :key="gem.id"
        :gem="gem"
        :selected="gem.id === selectedId"
        @click="$emit('select', gem.id)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import GemCard from './GemCard.vue'

const props = defineProps({
  gems: { type: Array, default: () => [] },
  selectedId: { type: String, default: null }
})

defineEmits(['select'])

const titleText = computed(() => {
  if (props.gems.length === 1) return '1 gem'
  return `${props.gems.length} gems`
})
</script>

<style scoped>
.sheet {
  background: var(--card);
  border-radius: var(--radius) var(--radius) 0 0;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.1);
  flex-shrink: 0;
  max-height: 38vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 5;
}
.sheet-handle {
  width: 32px;
  height: 3.5px;
  background: var(--border-warm);
  border-radius: 2px;
  margin: 10px auto 8px;
  flex-shrink: 0;
}
.sheet-title {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--muted-light);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0 16px 10px;
  flex-shrink: 0;
}
.gem-list {
  overflow-y: auto;
  padding: 0 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  -webkit-overflow-scrolling: touch;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 20px 16px;
  color: var(--muted);
}
.empty-state svg { margin-bottom: 10px; opacity: 0.35; }
.empty-state-title { font-size: 13px; font-weight: 500; color: var(--ink); margin-bottom: 3px; }
.empty-state-sub { font-size: 12px; color: var(--muted); text-align: center; line-height: 1.5; }
</style>
