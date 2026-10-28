// v-reveal: elements fade and rise into place the first time they scroll into view.
// v-reveal="index" staggers siblings by 70ms each.
const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add('revealed'); observer.unobserve(entry.target); }
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

export const reveal = {
  mounted(el, binding) {
    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', (Number(binding.value) || 0) * 70 + 'ms');
    if (observer) observer.observe(el); else el.classList.add('revealed');
  },
  unmounted(el) { observer?.unobserve(el); },
};
