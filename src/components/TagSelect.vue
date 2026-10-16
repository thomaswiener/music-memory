<script setup>
import { computed, useId } from 'vue'
import { useDropdown } from '../composables/useDropdown'

const props = defineProps({
  options: { type: Array, required: true },
  placeholder: { type: String, default: 'Select tags' },
  /** tags selected in the *other* filter, shown disabled to avoid contradictions */
  disabledOptions: { type: Array, default: () => [] },
})
const model = defineModel({ type: Array, default: () => [] })

// Unique per instance — v1 generated identical ids for both tag menus.
const uid = useId()
const { open, root, toggle } = useDropdown()

const label = computed(() => (model.value.length ? model.value.join(', ') : props.placeholder))

function setTag(tag, checked) {
  model.value = checked ? [...model.value, tag].sort() : model.value.filter((t) => t !== tag)
}
</script>

<template>
  <div ref="root" class="tag-select">
    <button
      type="button"
      class="field toggle"
      :class="{ empty: !model.length }"
      :aria-expanded="open"
      :aria-controls="`${uid}-menu`"
      @click="toggle"
    >
      <span class="label">{{ label }}</span>
      <i class="bi" :class="open ? 'bi-chevron-up' : 'bi-chevron-down'" />
    </button>
    <ul v-show="open" :id="`${uid}-menu`" class="menu">
      <li v-for="tag in options" :key="tag">
        <label :for="`${uid}-${tag}`" :class="{ disabled: disabledOptions.includes(tag) }">
          <input
            :id="`${uid}-${tag}`"
            type="checkbox"
            :checked="model.includes(tag)"
            :disabled="disabledOptions.includes(tag)"
            @change="setTag(tag, $event.target.checked)"
          />
          {{ tag }}
        </label>
      </li>
      <li v-if="model.length" class="sep" />
      <li v-if="model.length">
        <button type="button" class="clear" @click="model = []">Clear selection</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.tag-select {
  position: relative;
}
.toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  text-align: left;
  cursor: pointer;
}
.toggle.empty {
  color: var(--muted);
}
.label {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.menu {
  position: absolute;
  inset-inline: 0;
  z-index: 10;
  margin: 4px 0 0;
  padding: 4px 0;
  max-height: 280px;
  overflow-y: auto;
  list-style: none;
  background: var(--surface);
  border: 1px solid var(--line-strong);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
  columns: 2;
  column-gap: 0;
}
.menu li {
  break-inside: avoid;
}
.menu label,
.clear {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  font-size: 15px;
  cursor: pointer;
}
.menu label:hover,
.clear:hover {
  background: var(--hover);
}
.menu label.disabled {
  color: var(--muted);
  cursor: not-allowed;
}
.sep {
  column-span: all;
  border-top: 1px solid var(--line);
  margin: 4px 0;
}
.clear {
  column-span: all;
  width: 100%;
  border: 0;
  background: none;
  color: var(--danger);
  font: inherit;
  font-size: 14px;
}
</style>
