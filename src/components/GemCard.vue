<template>
  <div class="gem-card" :class="{ selected }" @click="$emit('click')">
    <img v-if="thumbUrl" class="gem-photo-thumb" :src="thumbUrl" alt="" />
    <div v-else class="gem-emoji">{{ gem.emoji || '🌿' }}</div>
    <div class="gem-info">
      <div class="gem-name">{{ gem.name }}</div>
      <div class="gem-note">{{ gem.note || 'No notes' }}</div>
    </div>
    <span class="gem-chevron">›</span>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { toSignedUrl } from '../supabase.js'

const props = defineProps({
  gem: { type: Object, required: true },
  selected: { type: Boolean, default: false }
})

defineEmits(['click'])

const thumbUrl = ref(null)

onMounted(async () => {
  if (props.gem.photo_url) {
    thumbUrl.value = await toSignedUrl(props.gem.photo_url)
  }
})
</script>

<style scoped>
.gem-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--cream);
  border-radius: var(--radius-sm);
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  border-left: 3px solid transparent;
}
.gem-card:active { background: var(--warm-sand); }
.gem-card.selected {
  border-color: var(--border-warm);
  border-left-color: var(--terracotta);
  background: var(--ivory);
  box-shadow: var(--shadow-sm);
}
.gem-emoji {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--warm-sand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px var(--border-warm);
}
.gem-photo-thumb {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}
.gem-info { flex: 1; min-width: 0; }
.gem-name { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--ink); }
.gem-note { font-size: 12px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }
.gem-chevron { color: var(--muted-light); font-size: 14px; flex-shrink: 0; opacity: 0.5; }
</style>
