<script setup>
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

const props = defineProps({
  open: Boolean,
  title: { type: String, default: '' },
  variant: { type: String, default: 'sheet' }, // 'sheet' slides from top, 'dialog' is centred
})
const emit = defineEmits(['close'])

const titleId = useId()
const panel = ref(null)
let returnFocus = null

const onKey = (e) => {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      returnFocus = document.activeElement
      document.addEventListener('keydown', onKey)
      await nextTick()
      panel.value?.focus()
    } else {
      document.removeEventListener('keydown', onKey)
      returnFocus?.focus?.()
    }
  },
)
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="overlay" :class="variant" @pointerdown.self="emit('close')">
        <section
          ref="panel"
          class="panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          tabindex="-1"
        >
          <button v-if="variant === 'sheet'" class="close" type="button" aria-label="Close" @click="emit('close')">
            <i class="bi bi-x-lg" />
          </button>
          <h2 v-if="title" :id="titleId" class="title">{{ title }}</h2>
          <slot />
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  background: rgb(0 0 0 / 0.3);
  overflow-y: auto;
}
.overlay.sheet {
  align-items: flex-start;
}
.overlay.dialog {
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgb(0 0 0 / 0.6);
}
.panel {
  position: relative;
  background: var(--surface);
  box-shadow: var(--shadow);
  outline: none;
}
.sheet .panel {
  width: 100%;
  padding: 1.5rem max(16px, calc((100vw - 720px) / 2));
}
.dialog .panel {
  max-width: 400px;
  width: 100%;
  padding: 2rem 2.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 10px 40px rgb(0 0 0 / 0.3);
}
.title {
  margin: 0 0 1.25rem;
  font-size: calc(0.9rem + 2px);
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.dialog .title {
  font-size: 1.25rem;
  letter-spacing: 0.04em;
  text-transform: none;
}
.close {
  position: absolute;
  top: 10px;
  right: max(16px, calc((100vw - 720px) / 2 - 24px));
  border: 0;
  background: none;
  color: var(--muted);
  font-size: 18px;
  padding: 6px;
  cursor: pointer;
}
.close:hover {
  color: var(--ink);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .panel,
.modal-leave-active .panel {
  transition: transform 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.sheet.modal-enter-from .panel,
.sheet.modal-leave-to .panel {
  transform: translateY(-20px);
}
.dialog.modal-enter-from .panel,
.dialog.modal-leave-to .panel {
  transform: scale(0.9);
}
</style>
