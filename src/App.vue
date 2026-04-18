<template>
  <AuthScreen v-if="!currentUser" />
  <template v-else>
    <header>
      <div class="header-brand">
        <svg class="header-gem-icon" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="14,2 25,9 25,19 14,26 3,19 3,9" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>
          <polygon points="14,2 25,9 14,14" fill="rgba(255,255,255,0.22)"/>
          <polygon points="14,2 3,9 14,14" fill="rgba(255,255,255,0.12)"/>
          <polygon points="3,9 14,14 3,19" fill="rgba(255,255,255,0.1)"/>
          <polygon points="25,9 14,14 25,19" fill="rgba(255,255,255,0.18)"/>
          <polygon points="14,14 3,19 14,26" fill="rgba(255,255,255,0.08)"/>
          <polygon points="14,14 25,19 14,26" fill="rgba(255,255,255,0.15)"/>
          <circle cx="14" cy="14" r="2.5" fill="rgba(255,255,255,0.7)"/>
        </svg>
        <div class="header-text">
          <h1>Hidden Gems</h1>
          <p>{{ currentUser.email }}</p>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="logout-btn" @click="signOut">Sign out</button>
        <button class="add-fab" @click="openAdd" title="Add gem">+</button>
      </div>
    </header>

    <MapView
      ref="mapRef"
      :gems="gems"
      :show-crosshair="mode === 'pick'"
      @marker-click="onMarkerClick"
    />

    <PickBar
      v-if="mode === 'pick'"
      :coords-display="pickCoordsDisplay"
      @cancel="cancelPick"
      @confirm="confirmPick"
    />

    <GemList
      v-if="mode === 'list'"
      :gems="gems"
      :selected-id="selectedGemId"
      @select="selectGem"
    />

    <AddGemModal
      :open="addModalOpen"
      :lat="pendingLat"
      :lng="pendingLng"
      :editing-gem="editingGem"
      @close="closeAdd"
      @save="handleSave"
    />

    <DetailModal
      :open="detailOpen"
      :gem="detailGem"
      @close="detailOpen = false"
      @edit="openEdit"
      @delete="deleteGem"
    />

    <Toast :message="toastMsg" />
  </template>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from './supabase.js'
import { toSignedUrl } from './supabase.js'
import AuthScreen from './components/AuthScreen.vue'
import MapView from './components/MapView.vue'
import GemList from './components/GemList.vue'
import PickBar from './components/PickBar.vue'
import AddGemModal from './components/AddGemModal.vue'
import DetailModal from './components/DetailModal.vue'
import Toast from './components/Toast.vue'

const currentUser = ref(null)
const gems = ref([])
const selectedGemId = ref(null)
const toastMsg = ref('')
const mode = ref('list') // 'list' | 'pick'

const mapRef = ref(null)
const pickCoordsDisplay = ref('—')

const addModalOpen = ref(false)
const pendingLat = ref(null)
const pendingLng = ref(null)
const editingGem = ref(null)

const detailOpen = ref(false)
const detailGem = ref(null)

function showToast(msg) {
  toastMsg.value = msg
}

// ── Auth ──────────────────────────────────────────────────────────────────────

onMounted(() => {
  db.auth.onAuthStateChange((event, session) => {
    currentUser.value = session?.user ?? null
    if (currentUser.value) {
      loadGems()
    } else {
      gems.value = []
    }
  })
})

async function signOut() {
  await db.auth.signOut()
}

// ── Gems ──────────────────────────────────────────────────────────────────────

async function loadGems() {
  const { data, error } = await db.from('gems').select('*').order('created_at', { ascending: false })
  if (error) { showToast('Could not load gems'); return }
  gems.value = data || []
  if (gems.value.length > 0) {
    const bounded = gems.value.filter(g => g.lat)
    if (bounded.length === 1) mapRef.value?.flyTo(bounded[0].lat, bounded[0].lng, 14)
    else if (bounded.length > 1) mapRef.value?.fitBounds(bounded.map(g => [g.lat, g.lng]))
  }
}

// ── Map / pick flow ───────────────────────────────────────────────────────────

function updatePickCoords() {
  const c = mapRef.value?.getCenter()
  if (!c) return
  pickCoordsDisplay.value = c.lat.toFixed(5) + ', ' + c.lng.toFixed(5)
  pendingLat.value = parseFloat(c.lat.toFixed(6))
  pendingLng.value = parseFloat(c.lng.toFixed(6))
}

function openAdd() {
  mode.value = 'pick'
  editingGem.value = null
  updatePickCoords()
  mapRef.value?.onMove(updatePickCoords)
}

function cancelPick() {
  mode.value = 'list'
  mapRef.value?.offMove(updatePickCoords)
}

function confirmPick() {
  mapRef.value?.offMove(updatePickCoords)
  mode.value = 'list'
  addModalOpen.value = true
}

function closeAdd() {
  addModalOpen.value = false
  editingGem.value = null
  pendingLat.value = null
  pendingLng.value = null
}

function openEdit(gemId) {
  const gem = gems.value.find(g => g.id === gemId)
  if (!gem) return
  editingGem.value = gem
  pendingLat.value = gem.lat
  pendingLng.value = gem.lng
  detailOpen.value = false
  addModalOpen.value = true
}

// ── Save / Update ─────────────────────────────────────────────────────────────

async function handleSave(payload) {
  if (editingGem.value) {
    await updateGem(payload)
  } else {
    await saveGem(payload)
  }
}

async function saveGem({ name, note, emoji, lat, lng, files }) {
  const { data, error } = await db.from('gems').insert([{
    name, note,
    lat: lat ?? null,
    lng: lng ?? null,
    photo_url: null, emoji,
    user_id: currentUser.value.id
  }]).select().single()

  if (error) { showToast('Error: ' + error.message); return }

  const filesToUpload = files.filter(Boolean)
  if (filesToUpload.length) {
    const urls = []
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i]
      const ext = file.name.split('.').pop()
      const path = `${currentUser.value.id}/${data.id}_${i}_${Date.now()}.${ext}`
      const { error: upErr } = await db.storage.from('gem-photos').upload(path, file)
      if (upErr) continue
      urls.push(path)
    }
    if (urls.length) {
      await db.from('gems').update({ photo_url: urls[0] }).eq('id', data.id)
      data.photo_url = urls[0]
      await Promise.all(urls.map((p, i) =>
        db.from('gem_photos').insert({ gem_id: data.id, photo_url: p, sort_order: i })
      ))
    }
  }

  gems.value.unshift(data)
  closeAdd()
  showToast('Gem saved!')
  if (data.lat && data.lng) mapRef.value?.flyTo(data.lat, data.lng, 16)
}

async function updateGem({ name, note, emoji, files, photosToDelete, existingPhotos }) {
  const gemId = editingGem.value.id

  const { error } = await db.from('gems').update({ name, note, emoji }).eq('id', gemId)
  if (error) { showToast('Error: ' + error.message); return }

  for (const path of photosToDelete) {
    const marker = '/object/public/gem-photos/'
    const storagePath = path.includes(marker) ? path.split(marker)[1] : (path.startsWith('http') ? null : path)
    if (storagePath) await db.storage.from('gem-photos').remove([storagePath])
    await db.from('gem_photos').delete().eq('photo_url', path).eq('gem_id', gemId)
  }

  const filesToUpload = files.filter(Boolean)
  for (let i = 0; i < filesToUpload.length; i++) {
    const file = filesToUpload[i]
    const ext = file.name.split('.').pop()
    const path = `${currentUser.value.id}/${gemId}_${existingPhotos.length + i}_${Date.now()}.${ext}`
    const { error: upErr } = await db.storage.from('gem-photos').upload(path, file)
    if (!upErr) await db.from('gem_photos').insert({ gem_id: gemId, photo_url: path, sort_order: existingPhotos.length + i })
  }

  const { data: updated } = await db.from('gem_photos').select('photo_url').eq('gem_id', gemId).order('sort_order').limit(1)
  const newPhotoUrl = updated && updated.length ? updated[0].photo_url : null
  await db.from('gems').update({ photo_url: newPhotoUrl }).eq('id', gemId)

  const idx = gems.value.findIndex(g => g.id === gemId)
  if (idx !== -1) {
    gems.value[idx] = { ...gems.value[idx], name, note, emoji, photo_url: newPhotoUrl }
  }

  closeAdd()
  showToast('Gem updated!')
}

// ── Detail / Select ───────────────────────────────────────────────────────────

function onMarkerClick(gem) {
  showDetail(gem)
}

async function selectGem(id) {
  const gem = gems.value.find(g => g.id === id)
  if (!gem) return
  selectedGemId.value = id
  if (gem.lat && gem.lng) mapRef.value?.flyTo(gem.lat, gem.lng, 16)
  showDetail(gem)
}

function showDetail(gem) {
  detailGem.value = gem
  detailOpen.value = true
}

async function deleteGem(id) {
  if (!confirm('Delete this gem?')) return
  await db.from('gems').delete().eq('id', id)
  gems.value = gems.value.filter(g => g.id !== id)
  detailOpen.value = false
  showToast('Gem deleted')
}
</script>

<style scoped>
header {
  background: var(--ink);
  color: var(--ivory);
  padding: 14px 16px 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  box-shadow: 0 1px 0 var(--dark-surface);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 9px;
}

.header-gem-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  filter: drop-shadow(0 1px 3px rgba(0,0,0,0.25));
}

.header-text h1 {
  font-family: var(--serif);
  font-size: 19px;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1.2;
}

.header-text p {
  font-size: 10.5px;
  opacity: 0.6;
  margin-top: 1px;
  font-weight: 300;
  letter-spacing: 0.02em;
}

.add-fab {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--terracotta);
  color: var(--ivory);
  border: none;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 300;
  flex-shrink: 0;
  transition: background 0.15s, transform 0.15s;
  box-shadow: var(--terracotta) 0px 0px 0px 0px, var(--terracotta-dark) 0px 0px 0px 1px;
}
.add-fab:active { transform: scale(0.9); background: var(--terracotta-dark); }

.logout-btn {
  background: var(--dark-surface);
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--warm-silver);
  border-radius: 8px;
  padding: 5px 11px;
  font-size: 11.5px;
  font-family: var(--sans);
  cursor: pointer;
  transition: background 0.15s;
  letter-spacing: 0.01em;
}
.logout-btn:active { background: rgba(255,255,255,0.1); }
</style>
