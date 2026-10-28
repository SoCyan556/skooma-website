<template>
  <main class="page download-page">
    <div class="page-backdrop" style="--art: url('/img/brazier-ritual.webp')"></div>
    <section class="download-hero">
      <div class="download-status" v-reveal>
        <div class="download-icon" :class="state"><LoaderCircle v-if="state === 'loading'" :size="30" class="spin" /><AlertTriangle v-else-if="state === 'error'" :size="30" /><Check v-else :size="30" /></div>
        <h1>{{ state === 'error' ? 'Download unavailable' : state === 'loading' ? 'Preparing download' : 'Your download has started' }}</h1>
        <p v-if="state === 'started'">{{ installer.name }} · {{ formatSize(installer.size) }} · Version {{ release.version }}</p>
        <p v-else-if="state === 'error'">The download couldn't be found. Try again in a moment.</p>
        <div class="download-actions">
          <a v-if="installer" :href="installer.url" class="button button-primary" @click="started = true"><Download :size="17" />{{ started ? 'Download again' : 'Download' }}</a>
          <button v-else-if="state === 'error'" class="button button-primary" @click="load"><RotateCcw :size="17" />Try again</button>
          <RouterLink to="/guide/setup" class="button button-ghost"><BookOpen :size="17" />Setup guide</RouterLink>
        </div>
      </div>
    </section>

    <section class="download-body">
      <div class="steps" v-reveal>
        <h2>Installing</h2>
        <ol>
          <li v-for="(step, i) in steps" :key="i" v-reveal="i"><span class="step-number">{{ i + 1 }}</span><div><h3>{{ step.title }}</h3><p>{{ step.text }}</p></div></li>
        </ol>
      </div>

      <div class="requirements" v-reveal="1">
        <h2>System requirements</h2>
        <div class="spec-table">
          <div class="spec-head"><span></span><span>Minimum</span><span>Recommended</span></div>
          <div class="spec-row" v-for="row in specs" :key="row.label">
            <span class="spec-label"><component :is="row.icon" :size="17" />{{ row.label }}</span><span>{{ row.min }}</span><span>{{ row.rec }}</span>
          </div>
        </div>
        <ul class="needs">
          <li><Gamepad2 :size="17" />Skyrim Special Edition on Steam</li>
          <li><DiscordIcon :size="17" />A Discord account in the Skooma server</li>
        </ul>
      </div>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { AlertTriangle, BookOpen, Check, Cpu, Download, Gamepad2, HardDrive, LoaderCircle, MemoryStick, Monitor, RotateCcw } from 'lucide-vue-next';
import DiscordIcon from '../components/DiscordIcon.vue';
import { formatSize, loadReleases } from '../lib/releases.js';

const state = ref('loading'), release = ref(null), installer = ref(null), started = ref(false);
const steps = [
  { title: 'Run the installer', text: 'It installs the Skooma launcher and opens it when finished.' },
  { title: 'Sign in with Discord', text: 'Your Discord account becomes your permanent character.' },
  { title: 'Install & play', text: 'The launcher checks your game, installs SKSE and the required mods, then starts Skyrim.' },
];
// Skyrim Special Edition's published PC requirements; the launcher itself is light.
const specs = [
  { label: 'OS', icon: Monitor, min: 'Windows 10 64-bit', rec: 'Windows 11 64-bit' },
  { label: 'Processor', icon: Cpu, min: 'Intel i5-750 / AMD Phenom II X4-945', rec: 'Intel i5-2400 / AMD FX-8320' },
  { label: 'Memory', icon: MemoryStick, min: '8 GB RAM', rec: '8 GB RAM' },
  { label: 'Graphics', icon: Gamepad2, min: 'GTX 470 1 GB / HD 7870 2 GB', rec: 'GTX 780 3 GB / R9 290 4 GB' },
  { label: 'Storage', icon: HardDrive, min: '12 GB free', rec: '12 GB free on an SSD' },
];

async function load() {
  state.value = 'loading';
  try {
    const list = await loadReleases();
    release.value = list.find(r => r.installer) ?? null;
    installer.value = release.value?.installer ?? null;
    if (!installer.value) throw new Error('No installer');
    state.value = 'started';
    // GitHub serves the installer as an attachment, so this downloads without leaving the page.
    const link = Object.assign(document.createElement('a'), { href: installer.value.url, rel: 'noopener' });
    document.body.append(link); link.click(); link.remove(); started.value = true;
  } catch { state.value = 'error'; }
}
onMounted(load);
</script>
