<script setup>
import { computed } from 'vue'
import { useDropdown } from '../composables/useDropdown'
import { t, i18n, LANGUAGES } from '../i18n'

const { open, root, toggle, close } = useDropdown()

const current = computed(() => LANGUAGES.find((l) => l.code === i18n.locale))

function choose(code) {
  i18n.locale = code
  close()
}
</script>

<template>
  <div ref="root" class="dropdown">
    <button
      type="button"
      class="icon-btn"
      :aria-expanded="open"
      aria-haspopup="menu"
      :aria-label="`${t('settings.language')}: ${current?.label}`"
      :title="`${t('settings.language')}: ${current?.label}`"
      @click="toggle"
    >
      <i class="bi bi-globe" />
    </button>
    <ul v-show="open" class="dropdown-menu" role="menu">
      <li class="heading">{{ t('settings.language') }}</li>
      <li v-for="lang in LANGUAGES" :key="lang.code">
        <a
          href="#"
          role="menuitemradio"
          :lang="lang.code"
          :aria-checked="lang.code === i18n.locale"
          @click.prevent="choose(lang.code)"
        >
          <span>{{ lang.label }}</span>
          <small class="code">{{ lang.code.toUpperCase() }}</small>
          <i v-if="lang.code === i18n.locale" class="bi bi-check-lg" />
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.dropdown-menu {
  min-width: 180px;
}
.dropdown-menu a {
  display: flex;
  align-items: center;
  gap: 8px;
}
.code {
  color: var(--muted);
  font-size: 12px;
}
.bi-check-lg {
  margin-left: auto;
}
.heading {
  padding: 6px 16px;
  font-size: 13px;
  color: var(--muted);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
</style>
