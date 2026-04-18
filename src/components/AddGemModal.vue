<template>
  <div class="overlay" :class="{ open }" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-drag-bar"></div>
      <div class="modal-header">
        <span class="modal-title">{{ editingGem ? 'Edit gem' : 'New gem' }}</span>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="field">
          <label>Name</label>
          <input type="text" v-model="name" placeholder="What's this place called?" />
        </div>
        <div class="field">
          <label>Note</label>
          <textarea v-model="note" placeholder="What makes it special?"></textarea>
        </div>
        <div class="field">
          <label>Icon</label>
          <div class="emoji-picker-wrap">
            <div class="emoji-grid">
              <button
                v-for="(e, i) in EMOJIS"
                :key="i"
                class="emoji-opt"
                :class="{ active: e === selectedEmoji }"
                @click="selectedEmoji = e"
              >{{ e }}</button>
            </div>
          </div>
        </div>

        <!-- Existing photos (edit mode) -->
        <div v-if="existingPhotos.length" class="photo-previews">
          <div v-for="(photo, i) in existingPhotos" :key="photo.photo_url" style="position:relative;display:inline-block">
            <img :src="photo.signedUrl" />
            <button class="remove-photo-btn" @click="removeExistingPhoto(i)">×</button>
          </div>
        </div>

        <!-- New photo previews -->
        <div v-if="newPhotoPreviews.length" class="photo-previews">
          <div v-for="(p, i) in newPhotoPreviews" :key="i" style="position:relative;display:inline-block">
            <img :src="p" />
            <button class="remove-photo-btn" @click="removeNewPhoto(i)">×</button>
          </div>
        </div>

        <div class="field">
          <label>Photos <span class="label-opt">— optional, multiple allowed</span></label>
          <div class="photo-zone" @click="photoInput.click()">
            <span class="icon">📷</span>
            <span class="upload-label">Tap to add photos</span>
            <input ref="photoInput" type="file" accept="image/*" multiple style="display:none" @change="onPhotoChange" />
          </div>
        </div>

        <button class="save-btn" :disabled="saving" @click="submit">
          {{ saving ? 'Saving…' : (editingGem ? 'Update gem' : 'Save gem') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { EMOJIS } from '../emojis.js'
import { db, toSignedUrl } from '../supabase.js'

const props = defineProps({
  open: { type: Boolean, default: false },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
  editingGem: { type: Object, default: null }
})

const emit = defineEmits(['close', 'save'])

const name = ref('')
const note = ref('')
const selectedEmoji = ref('🌿')
const saving = ref(false)

const existingPhotos = ref([])
const photosToDelete = ref([])
const selectedFiles = ref([])
const newPhotoPreviews = ref([])
const photoInput = ref(null)

watch(() => props.open, async (val) => {
  if (!val) return
  saving.value = false
  photosToDelete.value = []
  selectedFiles.value = []
  newPhotoPreviews.value = []

  if (props.editingGem) {
    name.value = props.editingGem.name || ''
    note.value = props.editingGem.note || ''
    selectedEmoji.value = props.editingGem.emoji || '🌿'

    const { data: photos } = await db.from('gem_photos')
      .select('*').eq('gem_id', props.editingGem.id).order('sort_order')
    const toShow = photos && photos.length
      ? photos
      : (props.editingGem.photo_url ? [{ id: null, photo_url: props.editingGem.photo_url }] : [])

    const resolved = []
    for (const photo of toShow) {
      const signedUrl = await toSignedUrl(photo.photo_url)
      if (signedUrl) resolved.push({ ...photo, signedUrl })
    }
    existingPhotos.value = resolved
  } else {
    name.value = ''
    note.value = ''
    selectedEmoji.value = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
    existingPhotos.value = []
  }
})

function removeExistingPhoto(i) {
  const photo = existingPhotos.value[i]
  photosToDelete.value.push(photo.photo_url)
  existingPhotos.value.splice(i, 1)
}

function removeNewPhoto(i) {
  selectedFiles.value[i] = null
  newPhotoPreviews.value.splice(i, 1)
}

function onPhotoChange(e) {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    const idx = selectedFiles.value.length
    selectedFiles.value.push(file)
    const reader = new FileReader()
    reader.onload = ev => { newPhotoPreviews.value.push(ev.target.result) }
    reader.readAsDataURL(file)
  })
  e.target.value = ''
}

function submit() {
  if (!name.value.trim()) { alert('Please enter a name'); return }
  emit('save', {
    name: name.value.trim(),
    note: note.value.trim(),
    emoji: selectedEmoji.value,
    lat: props.lat,
    lng: props.lng,
    files: selectedFiles.value,
    photosToDelete: photosToDelete.value,
    existingPhotos: existingPhotos.value
  })
}
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

.modal-body { padding: 16px 18px 4px; }

.field { margin-bottom: 16px; }
.field label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 7px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}
.label-opt { font-weight: 400; text-transform: none; letter-spacing: 0; color: var(--muted-light); }
.field input, .field textarea {
  width: 100%;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 11px 13px;
  font-size: 15px;
  font-family: var(--sans);
  background: var(--cream);
  color: var(--ink);
  outline: none;
  -webkit-appearance: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field input:focus, .field textarea:focus {
  border-color: var(--focus-blue);
  box-shadow: 0 0 0 3px rgba(56,152,236,0.12);
  background: white;
}
.field textarea { height: 84px; resize: none; }

.emoji-picker-wrap {
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--cream);
  overflow: hidden;
}
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
  max-height: 132px;
  overflow-y: auto;
  padding: 6px;
  -webkit-overflow-scrolling: touch;
}
.emoji-opt {
  aspect-ratio: 1;
  border: none;
  background: none;
  font-size: 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 100%;
  transition: background 0.1s;
}
.emoji-opt:active { background: var(--warm-sand); }
.emoji-opt.active {
  background: var(--warm-sand);
  box-shadow: 0 0 0 2px var(--terracotta);
}

.photo-previews {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.photo-previews img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}
.remove-photo-btn {
  position: absolute;
  top: -4px; right: -4px;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 18px; height: 18px;
  font-size: 12px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  display: flex; align-items: center; justify-content: center;
}

.photo-zone {
  border: 1.5px dashed #d1d5db;
  border-radius: var(--radius-sm);
  padding: 22px 20px;
  text-align: center;
  cursor: pointer;
  color: var(--muted);
  font-size: 13px;
  transition: border-color 0.15s, background 0.15s;
}
.photo-zone:hover { border-color: var(--terracotta); background: var(--ivory); }
.photo-zone .icon { font-size: 26px; display: block; margin-bottom: 5px; }
.upload-label { font-weight: 500; color: var(--terracotta); }

.save-btn {
  width: 100%;
  padding: 15px;
  background: var(--terracotta);
  color: var(--ivory);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-family: var(--sans);
  font-weight: 500;
  cursor: pointer;
  margin-top: 4px;
  transition: opacity 0.15s, transform 0.12s;
  letter-spacing: 0.01em;
  box-shadow: var(--terracotta) 0px 0px 0px 0px, var(--terracotta-dark) 0px 0px 0px 1px;
}
.save-btn:disabled { opacity: 0.45; box-shadow: none; }
.save-btn:active { transform: scale(0.99); opacity: 0.9; }
</style>
