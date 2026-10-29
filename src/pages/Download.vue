<template>
  <main class="page center-page">
    <div class="page-backdrop" style="--art: url('/img/brazier-ritual.webp')"></div>
    <section class="dl-page" v-reveal>
      <div class="dl-icon large"><Construction :size="34" /><span class="dl-ring"></span></div>
      <span class="dl-badge">In development</span>
      <h1>Downloads are disabled</h1>
      <p>Skooma is still in its development phase. The launcher isn't public yet - check back soon, we're almost there.</p>
      <RouterLink to="/" class="button button-ghost"><ArrowLeft :size="17" />Back home</RouterLink>
    </section>
  </main>
</template>

<script setup>
import { ArrowLeft, Construction } from 'lucide-vue-next';
</script>
