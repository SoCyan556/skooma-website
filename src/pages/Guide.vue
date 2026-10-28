<template>
  <main class="page guide-page">
    <aside class="guide-nav" aria-label="Guide">
      <div class="guide-search">
        <Search :size="16" />
        <input v-model="query" type="search" placeholder="Search the guide" aria-label="Search the guide" />
      </div>
      <nav>
        <div v-for="section in visibleSections" :key="section.id" class="guide-section">
          <RouterLink :to="`/guide/${section.id}`" class="guide-section-title" :class="{ current: section.id === current.section.id }">
            <component :is="section.icon" :size="17" />{{ section.title }}
          </RouterLink>
          <ul>
            <li v-for="article in section.articles" :key="article.id">
              <RouterLink :to="`/guide/${section.id}/${article.id}`" :class="{ active: section.id === current.section.id && article.id === current.article.id }">{{ article.title }}</RouterLink>
            </li>
          </ul>
        </div>
        <p v-if="!visibleSections.length" class="guide-empty">No matches.</p>
      </nav>
    </aside>

    <article class="guide-article">
      <nav class="breadcrumbs" aria-label="Breadcrumb"><RouterLink to="/guide">Guide</RouterLink><ChevronRight :size="14" /><RouterLink :to="`/guide/${current.section.id}`">{{ current.section.title }}</RouterLink></nav>
      <Transition name="article" mode="out-in">
        <div :key="current.section.id + current.article.id">
          <h1>{{ current.article.title }}</h1>
          <p v-if="current.article.draft" class="guide-draft">This page hasn't been written yet.</p>
          <template v-for="(block, i) in current.article.blocks" :key="i">
            <p v-if="block.type === 'p'">{{ block.text }}</p>
            <ol v-else-if="block.type === 'steps'" class="guide-steps"><li v-for="(item, n) in block.items" :key="n"><span>{{ n + 1 }}</span>{{ item }}</li></ol>
            <ul v-else-if="block.type === 'list'" class="guide-list"><li v-for="item in block.items" :key="item">{{ item }}</li></ul>
            <dl v-else-if="block.type === 'keys'" class="guide-keys"><div v-for="[key, text] in block.items" :key="key"><dt><kbd>{{ key }}</kbd></dt><dd>{{ text }}</dd></div></dl>
            <aside v-else-if="block.type === 'note'" class="guide-note"><Info :size="18" /><span>{{ block.text }}</span></aside>
          </template>
        </div>
      </Transition>
      <footer class="guide-pager">
        <RouterLink v-if="previous" :to="previous.to" class="pager-link prev"><ArrowLeft :size="16" /><span><small>Previous</small>{{ previous.title }}</span></RouterLink>
        <RouterLink v-if="next" :to="next.to" class="pager-link next"><span><small>Next</small>{{ next.title }}</span><ArrowRight :size="16" /></RouterLink>
      </footer>
    </article>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft, ArrowRight, ChevronRight, Info, Search } from 'lucide-vue-next';
import { guide } from '../content/guide.js';

const route = useRoute();
const query = ref('');
const flat = guide.flatMap(section => section.articles.map(article => ({ section, article, to: `/guide/${section.id}/${article.id}`, title: article.title })));
const current = computed(() => {
  const section = guide.find(s => s.id === route.params.section) ?? guide[0];
  return { section, article: section.articles.find(a => a.id === route.params.article) ?? section.articles[0] };
});
const index = computed(() => flat.findIndex(item => item.article === current.value.article));
const previous = computed(() => flat[index.value - 1]);
const next = computed(() => flat[index.value + 1]);

const text = article => [article.title, ...article.blocks.flatMap(b => b.text ? [b.text] : (b.items ?? []).flat())].join(' ').toLowerCase();
const visibleSections = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return guide;
  return guide.map(section => ({ ...section, articles: section.articles.filter(a => text(a).includes(q) || section.title.toLowerCase().includes(q)) })).filter(s => s.articles.length);
});
</script>
