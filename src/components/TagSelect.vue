<script setup>
import { computed, useId } from 'vue'
import { useDropdown } from '../composables/useDropdown'
import { t, tagLabel } from '../i18n'

const props = defineProps({
  options: { type: Array, required: true },
  placeholder: { type: String, default: '' },
  /** tags selected in the *other* filter, shown disabled to avoid contradictions */
  disabledOptions: { type: Array, default: () => [] },
})
const model = defineModel({ type: Array, default: () => [] })

// Unique per instance — v1 generated identical ids for both tag menus.
const uid = useId()
const { open, root, toggle } = useDropdown()

/** From this many selected tags on, the button shows "N selected" instead of the names. */
const COUNT_FROM = 3

const names = computed(() => model.value.map(tagLabel).join(', '))
const label = computed(() => {
  const n = model.value.length
  if (!n) return props.placeholder || t('tagSelect.placeholder')
  return n >= COUNT_FROM ? t('tagSelect.selected', { count: n }) : names.value
})

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
      :title="model.length ? names : undefined"
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
          {{ tagLabel(tag) }}
        </label>
      </li>
      <li v-if="model.length" class="sep" />
      <li v-if="model.length" class="full">
        <button type="button" class="clear" @click="model = []">{{ t('tagSelect.clear') }}</button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.tag-select {
  position: relative;
  min-width: 0;
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
  min-width: 0;
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
  overflow-x: hidden;
  overflow-y: auto;
  list-style: none;
  background: var(--surface);
  border: 1px solid var(--line-strong);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
  /* Grid, not CSS columns: multi-column with a max-height adds extra columns
     sideways (horizontal scroll) instead of scrolling down. */
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: start;
}
.menu li {
  min-width: 0;
}
.menu .full {
  grid-column: 1 / -1;
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
  grid-column: 1 / -1;
  border-top: 1px solid var(--line);
  margin: 4px 0;
}
.clear {
  width: 100%;
  border: 0;
  background: none;
  color: var(--danger);
  font: inherit;
  font-size: 14px;
}
</style>
