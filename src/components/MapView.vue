<template>
  <div class="map-wrap">
    <div ref="mapEl" class="map-el"></div>
    <div class="map-crosshair" :class="{ active: showCrosshair }">
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="22" y1="2" x2="22" y2="18" stroke="#2d6a4f" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="22" y1="26" x2="22" y2="42" stroke="#2d6a4f" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="2" y1="22" x2="18" y2="22" stroke="#2d6a4f" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="26" y1="22" x2="42" y2="22" stroke="#2d6a4f" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="22" cy="22" r="4" fill="#2d6a4f"/>
        <circle cx="22" cy="22" r="7" stroke="#2d6a4f" stroke-width="1.5" fill="none" opacity="0.4"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'

const props = defineProps({
  gems: { type: Array, default: () => [] },
  showCrosshair: { type: Boolean, default: false }
})

const emit = defineEmits(['markerClick'])

const mapEl = ref(null)
let map = null
const markers = new Map()

onMounted(() => {
  map = L.map(mapEl.value, { zoomControl: false }).setView([55.676, 12.568], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(map)
  L.control.zoom({ position: 'topright' }).addTo(map)
  syncMarkers(props.gems)
})

watch(() => props.gems, syncMarkers, { deep: true })

function markerIcon(emoji) {
  return L.divIcon({
    className: '',
    html: `<div class="gem-marker-wrap"><div class="gem-marker-bubble">${emoji || '🌿'}</div><div class="gem-marker-stem"></div></div>`,
    iconSize: [42, 52],
    iconAnchor: [21, 52],
    popupAnchor: [0, -54]
  })
}

function syncMarkers(gems) {
  if (!map) return
  const ids = new Set(gems.map(g => g.id))
  // remove stale
  for (const [id, m] of markers) {
    if (!ids.has(id)) { m.remove(); markers.delete(id) }
  }
  // add/update
  for (const gem of gems) {
    if (!gem.lat || !gem.lng) continue
    if (markers.has(gem.id)) {
      markers.get(gem.id).setIcon(markerIcon(gem.emoji))
    } else {
      const m = L.marker([gem.lat, gem.lng], { icon: markerIcon(gem.emoji) }).addTo(map)
      m.on('click', () => emit('markerClick', gem))
      markers.set(gem.id, m)
    }
  }
}

defineExpose({
  flyTo(lat, lng, zoom = 16) { map?.flyTo([lat, lng], zoom, { duration: 0.8 }) },
  fitBounds(bounds) { map?.fitBounds(bounds, { padding: [40, 40] }) },
  getCenter() { return map?.getCenter() },
  onMove(cb) { map?.on('move', cb) },
  offMove(cb) { map?.off('move', cb) }
})
</script>

<style scoped>
.map-wrap {
  flex: 1;
  position: relative;
  overflow: hidden;
  z-index: 1;
}
.map-el {
  position: absolute;
  inset: 0;
}
.map-crosshair {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  pointer-events: none;
  display: none;
}
.map-crosshair.active { display: block; }
</style>
