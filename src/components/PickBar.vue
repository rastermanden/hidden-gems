<template>
  <div class="pick-bar">
    <div class="pick-hint">📍 Pan the map to your gem</div>
    <div class="pick-coords-display">{{ coordsDisplay }}</div>
    <div class="pick-actions">
      <button class="pick-cancel" @click="$emit('cancel')">Cancel</button>
      <button class="pick-confirm" @click="$emit('confirm')">Set location →</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  coordsDisplay: { type: String, default: '—' }
})
defineEmits(['cancel', 'confirm'])
</script>

<style scoped>
.pick-bar {
  background: var(--card);
  border-radius: var(--radius) var(--radius) 0 0;
  box-shadow: 0 -4px 24px rgba(0,0,0,0.12);
  padding: 16px 18px 18px;
  flex-shrink: 0;
  z-index: 5;
}
.pick-hint {
  font-size: 12px;
  color: var(--muted);
  text-align: center;
  margin-bottom: 7px;
  font-weight: 500;
  letter-spacing: 0.01em;
}
.pick-coords-display {
  font-size: 13px;
  color: var(--muted);
  text-align: center;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
  margin-bottom: 14px;
  font-weight: 500;
  background: var(--ivory);
  border-radius: 8px;
  padding: 6px 12px;
  border: 1px solid var(--border-warm);
}
.pick-actions { display: grid; grid-template-columns: 1fr 2fr; gap: 10px; }
.pick-cancel {
  padding: 13px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: none;
  font-size: 14px;
  font-family: var(--sans);
  color: var(--muted);
  cursor: pointer;
  font-weight: 500;
}
.pick-confirm {
  padding: 13px;
  background: var(--terracotta);
  color: var(--ivory);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: var(--sans);
  font-weight: 500;
  cursor: pointer;
  box-shadow: var(--terracotta) 0px 0px 0px 0px, var(--terracotta-dark) 0px 0px 0px 1px;
  letter-spacing: 0.01em;
}
</style>
