<template>
  <div class="overlay" :class="{ open }" @click.self="$emit('close')">
    <div class="modal">
      <Carousel v-if="open" :photos="photoUrls" :alt="gem?.name" :emoji="gem?.emoji" />
      <div class="modal-drag-bar"></div>
      <div class="modal-header" style="margin-top:10px;">
        <span class="modal-title">{{ gem?.name }}</span>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="detail-body">
        <div class="detail-coords">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="5" r="2.5" stroke="#6b7280" stroke-width="1.2"/>
            <path d="M6 1C3.79 1 2 2.79 2 5c0 3 4 7 4 7s4-4 4-7c0-2.21-1.79-4-4-4z" stroke="#6b7280" stroke-width="1.2" fill="none"/>
          </svg>
          {{ coordsText }}
        </div>
        <div class="detail-note" v-html="noteHtml"></div>
        <div v-if="dateText" class="detail-date">Added {{ dateText }}</div>
        <div class="detail-actions">
          <button class="edit-btn" @click="$emit('edit', gem.id)">Edit gem</button>
          <button class="delete-btn" @click="$emit('delete', gem.id)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { db, toSignedUrl } from '../supabase.js'
import Carousel from './Carousel.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  gem: { type: Object, default: null }
})

defineEmits(['close', 'edit', 'delete'])

const photoUrls = ref([])

watch(() => [props.open, props.gem], async ([open, gem]) => {
  if (!open || !gem) { photoUrls.value = []; return }
  const { data: photos } = await db.from('gem_photos')
    .select('photo_url').eq('gem_id', gem.id).order('sort_order')
  const paths = photos && photos.length
    ? photos.map(p => p.photo_url)
    : (gem.photo_url ? [gem.photo_url] : [])
  const urls = await Promise.all(paths.map(toSignedUrl))
  photoUrls.value = urls.filter(Boolean)
})

const coordsText = computed(() => {
  if (!props.gem?.lat || !props.gem?.lng) return 'No coordinates'
  return `${parseFloat(props.gem.lat).toFixed(5)}, ${parseFloat(props.gem.lng).toFixed(5)}`
})

const noteHtml = computed(() => {
  if (!props.gem?.note) return '<em style="color:var(--muted-light)">No notes added</em>'
  return props.gem.note
})

const dateText = computed(() => {
  if (!props.gem?.created_at) return ''
  return new Date(props.gem.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
})
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(17,24,39,0.5);
  backdrop-filter: blur(2px);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.22s;
}
.overlay.open { opacity: 1; pointer-events: all; }

.modal {
  background: var(--card);
  border-radius: var(--radius) var(--radius) 0 0;
  width: 100%;
  max-height: 90dvh;
  overflow-y: auto;
  padding: 0 0 env(safe-area-inset-bottom, 20px);
  transform: translateY(48px);
  transition: transform 0.28s cubic-bezier(0.34,1.4,0.64,1);
  -webkit-overflow-scrolling: touch;
  box-shadow: 0 -8px 40px rgba(0,0,0,0.18);
}
.overlay.open .modal { transform: translateY(0); }

.modal-drag-bar {
  width: 32px; height: 3.5px;
  background: var(--border-warm);
  border-radius: 2px;
  margin: 10px auto 0;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px 0;
}
.modal-title { font-family: var(--serif); font-size: 19px; font-weight: 500; color: var(--ink); }
.modal-close {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: var(--cream);
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: var(--muted);
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.modal-close:active { background: #e5e7eb; }

.detail-body { padding: 18px 18px 4px; }
.detail-coords {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: var(--muted);
  margin-bottom: 14px;
  font-weight: 400;
  letter-spacing: 0.02em;
  background: var(--cream);
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid var(--border);
}
.detail-note { font-size: 15px; color: var(--ink); line-height: 1.7; }
.detail-date {
  font-size: 11px;
  color: var(--muted-light);
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}
.detail-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
.edit-btn {
  width: 100%;
  padding: 13px;
  background: var(--warm-sand);
  color: var(--ink);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: var(--sans);
  cursor: pointer;
  transition: background 0.15s;
  box-shadow: 0 0 0 1px var(--ring);
}
.edit-btn:active { background: var(--border-warm); }
.delete-btn {
  width: 100%;
  padding: 13px;
  background: none;
  color: var(--error);
  border: 1.5px solid rgba(181,51,51,0.2);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: var(--sans);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.delete-btn:active { background: #fdf4f4; border-color: rgba(181,51,51,0.4); }
</style>
