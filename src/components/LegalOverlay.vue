<script setup>
import { computed, ref, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import LegalText from './LegalText.vue'
import { legalContent } from '../legal/content'
import { OPERATOR, LEGAL_UPDATED } from '../legal/operator'
import { t, i18n } from '../i18n'

const props = defineProps({
  open: Boolean,
  /** 'imprint' | 'privacy' */
  section: { type: String, default: 'imprint' },
})
const emit = defineEmits(['close', 'update:section'])

// German is binding; everyone else gets the English translation by default
// and can switch to the German original.
const textLang = ref('de')
watch(
  () => [props.open, i18n.locale],
  ([open]) => {
    if (open) textLang.value = i18n.locale === 'de' ? 'de' : 'en'
  },
  { immediate: true },
)

const content = computed(() => legalContent(textLang.value, OPERATOR, LEGAL_UPDATED))
const blocks = computed(() => content.value[props.section] ?? content.value.imprint)
const tabs = ['imprint', 'privacy']
</script>

<template>
  <BaseModal :open="open" :title="t('legal.title')" @close="emit('close')">
    <div class="tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :id="`legal-tab-${tab}`"
        :key="tab"
        type="button"
        role="tab"
        :aria-selected="section === tab"
        aria-controls="legal-panel"
        :class="{ active: section === tab }"
        @click="emit('update:section', tab)"
      >
        {{ t(`legal.${tab}`) }}
      </button>
    </div>

    <p v-if="i18n.locale !== 'de'" class="lang-note">
      <span v-if="textLang === 'en'">{{ t('legal.translationNote') }}</span>
      <button type="button" class="link" @click="textLang = textLang === 'de' ? 'en' : 'de'">
        {{ textLang === 'de' ? t('legal.showTranslation') : t('legal.showGerman') }}
      </button>
    </p>

    <article id="legal-panel" class="legal" role="tabpanel" :aria-labelledby="`legal-tab-${section}`" :lang="textLang">
      <template v-for="(block, i) in blocks" :key="`${section}-${i}`">
        <h3 v-if="block.h">{{ block.h }}</h3>
        <p v-else-if="block.p"><LegalText :text="block.p" /></p>
        <p v-else-if="block.lines" class="lines">
          <template v-for="(line, j) in block.lines" :key="j">
            <LegalText :text="line" /><br v-if="j < block.lines.length - 1" />
          </template>
        </p>
        <ul v-else-if="block.ul">
          <li v-for="(item, j) in block.ul" :key="j"><LegalText :text="item" /></li>
        </ul>
      </template>
    </article>
  </BaseModal>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid var(--line);
}
.tabs button {
  margin-bottom: -1px;
  padding: 8px 14px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: none;
  color: var(--muted);
  font-size: 15px;
  cursor: pointer;
}
.tabs button:hover {
  color: var(--ink);
}
.tabs button.active {
  border-bottom-color: var(--ink);
  color: var(--ink);
  font-weight: 500;
}
.lang-note {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin: -0.25rem 0 1.25rem;
  font-size: 13px;
  color: var(--muted);
}
.legal {
  max-width: 68ch;
  font-size: 14px;
  line-height: 1.65;
}
.legal h3 {
  margin: 1.5rem 0 0.4rem;
  font-size: 15px;
  font-weight: 600;
}
.legal h3:first-child {
  margin-top: 0;
}
.legal p {
  margin: 0 0 0.75rem;
}
.legal ul {
  margin: 0 0 0.75rem;
  padding-left: 1.25rem;
}
.legal li {
  margin-bottom: 0.25rem;
}
</style>
