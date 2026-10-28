<template>
  <main class="page news-page">
    <div class="news-backdrop" aria-hidden="true"></div>
    <div class="news-inner">
      <header class="page-heading" v-reveal><h1>News</h1></header>

      <div v-if="!releases.length && !error" class="news-list">
        <div v-for="n in 3" :key="n" class="update-card skeleton"></div>
      </div>
      <div v-else-if="error" class="update-card empty" v-reveal>
        <p>News couldn't be loaded.</p><button class="button button-ghost" @click="load"><RotateCcw :size="16" />Try again</button>
      </div>

      <div v-else class="news-list">
        <article v-for="(release, i) in releases" :key="release.tag" class="update-card" :class="{ latest: i === 0 }" v-reveal="Math.min(i, 3)">
          <header class="update-header">
            <div>
              <span v-if="i === 0" class="tag">Latest</span>
              <h2>Update {{ release.version }}</h2>
              <time :datetime="release.date">{{ formatDate(release.date) }}</time>
            </div>
            <a :href="release.url" target="_blank" rel="noopener" class="icon-button small" aria-label="View on GitHub" data-tip="Release page"><ExternalLink :size="16" /></a>
          </header>
          <p class="update-intro">{{ release.intro }}</p>
          <ul v-if="release.changes.length" class="change-list">
            <li v-for="change in release.changes" :key="change">{{ change }}</li>
          </ul>
        </article>
      </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { ExternalLink, RotateCcw } from 'lucide-vue-next';
import { formatDate, loadReleases } from '../lib/releases.js';

const releases = ref([]), error = ref(false);
function load() { error.value = false; loadReleases().then(list => { releases.value = list; }).catch(() => { error.value = true; }); }
onMounted(load);
</script>
