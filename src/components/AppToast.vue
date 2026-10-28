<script setup>
import { notice, dismissNotice } from '../store'
import { t } from '../i18n'
</script>

<template>
  <Transition name="toast">
    <div v-if="notice.message" :key="notice.id" class="toast" :class="notice.kind" role="status" aria-live="polite">
      <i class="bi" :class="notice.kind === 'error' ? 'bi-exclamation-circle' : 'bi-info-circle'" />
      <span>{{ notice.message }}</span>
      <button type="button" :aria-label="t('common.dismiss')" @click="dismissNotice"><i class="bi bi-x-lg" /></button>
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  z-index: 1100;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  width: max-content;
  max-width: calc(100vw - 32px);
  padding: 10px 12px 10px 16px;
  background: var(--toast-bg);
  color: var(--toast-ink);
  border-radius: 8px;
  box-shadow: var(--shadow);
  font-size: 13px;
  line-height: 1.4;
}
.toast.error .bi:first-child {
  color: var(--toast-error);
}
button {
  border: 0;
  background: none;
  color: inherit;
  opacity: 0.6;
  cursor: pointer;
  padding: 4px;
}
button:hover {
  opacity: 1;
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}
</style>
