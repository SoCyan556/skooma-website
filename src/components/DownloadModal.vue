<template>
  <Teleport to="body">
    <Transition name="dl-modal">
      <div v-if="ui.downloadModal" class="dl-overlay" @click.self="close" @keydown.esc="close">
        <div class="dl-card" role="alertdialog" aria-labelledby="dl-title" aria-describedby="dl-desc">
          <button class="dl-close" aria-label="Close" @click="close"><X :size="18" /></button>
          <div class="dl-icon"><Construction :size="26" /><span class="dl-ring"></span></div>
          <span class="dl-badge">In development</span>
          <h2 id="dl-title">Downloads are disabled</h2>
          <p id="dl-desc">Skooma is still in its development phase. The launcher isn't public yet - check back soon, we're almost there.</p>
          <button class="button button-primary dl-ok" @click="close">Got it</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { X, Construction } from 'lucide-vue-next';
import { ui, closeDownloadModal } from '../lib/ui.js';

const close = closeDownloadModal;
const onKey = e => { if (e.key === 'Escape') close(); };
onMounted(() => addEventListener('keydown', onKey));
onUnmounted(() => removeEventListener('keydown', onKey));
// Lock background scroll while the popup is open.
watch(() => ui.downloadModal, open => { try { document.body.style.overflow = open ? 'hidden' : ''; } catch {} });
</script>
