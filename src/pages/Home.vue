<template>
  <main class="home">
    <section class="hero" @pointermove="tilt" @pointerleave="resetTilt">
      <div class="hero-art" :style="{ transform: `translate3d(${pointer.x * -12}px, ${pointer.y * -8}px, 0) scale(1.06)` }"></div>
      <div class="hero-shade"></div>
      <div class="hero-content">
        <div class="hero-bottle-wrap" :style="{ transform: `rotateX(${pointer.y * -10}deg) rotateY(${pointer.x * 14}deg)` }">
          <img src="/img/bottle.webp" alt="" class="hero-bottle" width="190" height="190" />
        </div>
        <h1 class="hero-title" aria-label="Skooma"><span v-for="(letter, i) in 'SKOOMA'" :key="i" :style="{ '--i': i }" aria-hidden="true">{{ letter }}</span></h1>
        <div class="hero-divider" aria-hidden="true"><i></i><Diamond :size="12" :stroke-width="1.5" /><i></i></div>
        <p class="hero-tagline">A persistent Skyrim roleplay server</p>
        <RouterLink to="/download" class="button button-primary button-large hero-play"><Download :size="19" />Play now</RouterLink>
        <p class="hero-meta" v-if="latest">Version {{ latest.version }}</p>
      </div>
      <a href="#home-panels" class="scroll-cue" aria-label="Scroll down"><ChevronDown :size="22" /></a>
    </section>

    <section id="home-panels" class="home-panels">
      <article class="panel" v-reveal="0">
        <header class="panel-header"><h2>Latest news</h2><RouterLink to="/news" class="text-link">View all<ArrowRight :size="14" /></RouterLink></header>
        <RouterLink v-if="latest" to="/news" class="news-teaser">
          <div class="teaser-image"><img src="/img/standoff.webp" alt="" loading="lazy" /></div>
          <div class="teaser-copy">
            <h3>Update {{ latest.version }}</h3>
            <time :datetime="latest.date">{{ formatDate(latest.date) }}</time>
            <p>{{ latest.changes[0] || latest.intro }}</p>
          </div>
        </RouterLink>
        <div v-else class="teaser-placeholder" :class="{ failed: error }">{{ error ? 'News is unavailable right now.' : '' }}</div>
      </article>

      <RouterLink to="/guide/getting-started" class="panel panel-image" v-reveal="1">
        <img src="/img/forest-ruin.webp" alt="" loading="lazy" />
        <div class="panel-image-copy"><h2>New to Skooma?</h2><span class="text-link">Read the guide<ArrowRight :size="14" /></span></div>
      </RouterLink>

      <article class="panel" v-reveal="2">
        <header class="panel-header"><h2>Get started</h2></header>
        <ul class="link-list">
          <li><RouterLink to="/guide/setup"><BookOpen :size="19" /><span>Installation guide</span><ChevronRight :size="17" class="go" /></RouterLink></li>
          <li><RouterLink to="/guide/getting-started/voice-chat"><Mic :size="19" /><span>Voice chat</span><ChevronRight :size="17" class="go" /></RouterLink></li>
          <li><RouterLink to="/guide/troubleshooting"><LifeBuoy :size="19" /><span>Troubleshooting</span><ChevronRight :size="17" class="go" /></RouterLink></li>
        </ul>
      </article>
    </section>
  </main>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { ArrowRight, BookOpen, ChevronDown, ChevronRight, Diamond, Download, LifeBuoy, Mic } from 'lucide-vue-next';
import { formatDate, loadReleases } from '../lib/releases.js';

const latest = ref(null), error = ref(false);
onMounted(() => loadReleases().then(list => { latest.value = list[0] ?? null; }).catch(() => { error.value = true; }));

// Subtle depth: the art and bottle respond to the pointer (fine pointers only).
const pointer = reactive({ x: 0, y: 0 });
const fine = matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
function tilt(event) {
  if (!fine) return;
  const r = event.currentTarget.getBoundingClientRect();
  pointer.x = (event.clientX - r.left) / r.width - 0.5; pointer.y = (event.clientY - r.top) / r.height - 0.5;
}
function resetTilt() { pointer.x = 0; pointer.y = 0; }
</script>
