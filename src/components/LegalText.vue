<script setup>
// Renders a legal text block: URLs and emails become links,
// [[placeholder]] (missing operator detail) is highlighted.
import { computed } from 'vue'

const props = defineProps({ text: { type: String, required: true } })

const TOKEN = /(\[\[[^\]]+\]\]|https?:\/\/[^\s]*[^\s.,;:)]|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g

const parts = computed(() =>
  props.text.split(TOKEN).filter(Boolean).map((part) => {
    if (part.startsWith('[[')) return { kind: 'missing', text: part.slice(2, -2) }
    if (/^https?:\/\//.test(part)) return { kind: 'link', text: part, href: part }
    if (/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(part)) return { kind: 'link', text: part, href: `mailto:${part}` }
    return { kind: 'text', text: part }
  }),
)
</script>

<template>
  <template v-for="(part, i) in parts" :key="i">
    <mark v-if="part.kind === 'missing'" class="missing">{{ part.text }}</mark>
    <a v-else-if="part.kind === 'link'" :href="part.href" target="_blank" rel="noopener">{{ part.text }}</a>
    <template v-else>{{ part.text }}</template>
  </template>
</template>

<style scoped>
.missing {
  padding: 0 4px;
  border-radius: 3px;
  background: #fff3bf;
  color: #8a6100;
  font-style: italic;
}
a {
  overflow-wrap: anywhere;
}
</style>
