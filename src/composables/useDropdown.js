import { onBeforeUnmount, onMounted, ref } from 'vue'

/** Open/close state for a dropdown that closes on outside click and Escape. */
export function useDropdown() {
  const open = ref(false)
  const root = ref(null)

  const onPointer = (e) => {
    if (open.value && root.value && !root.value.contains(e.target)) open.value = false
  }
  const onKey = (e) => {
    if (open.value && e.key === 'Escape') {
      open.value = false
      e.stopPropagation()
    }
  }

  onMounted(() => {
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey, true)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onPointer)
    document.removeEventListener('keydown', onKey, true)
  })

  return { open, root, toggle: () => (open.value = !open.value), close: () => (open.value = false) }
}
