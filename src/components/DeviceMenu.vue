<script setup>
import { computed } from 'vue'
import { useDropdown } from '../composables/useDropdown'
import { spotify, deviceActive, refreshDevices, selectDevice } from '../composables/useSpotify'
import { settings } from '../store'

const { open, root, toggle, close } = useDropdown()

const current = computed(() => spotify.devices.find((d) => d.id === settings.deviceId))

function onToggle() {
  toggle()
  if (open.value) refreshDevices()
}
function choose(id) {
  selectDevice(id)
  close()
}
</script>

<template>
  <div ref="root" class="dropdown">
    <button
      type="button"
      class="icon-btn"
      :class="deviceActive ? 'ok' : 'off'"
      :aria-expanded="open"
      :title="current ? `Playing on ${current.name}` : 'No playback device'"
      aria-label="Playback device"
      @click="onToggle"
    >
      <i class="bi bi-spotify" />
      <span class="status-dot" />
    </button>
    <ul v-show="open" class="dropdown-menu" role="menu">
      <li class="heading">Playback device</li>
      <li v-for="device in spotify.devices" :key="device.id">
        <a href="#" role="menuitemradio" :aria-checked="device.id === settings.deviceId" @click.prevent="choose(device.id)">
          <span>{{ device.name }}</span>
          <small class="type">{{ device.type }}</small>
          <i v-if="device.id === settings.deviceId" class="bi bi-check-lg" />
        </a>
      </li>
      <li v-if="!spotify.devices.length" class="empty">
        No device found. Open Spotify on your phone, desktop or speaker.
      </li>
      <li class="sep" />
      <li>
        <a href="#" @click.prevent="refreshDevices"><i class="bi bi-arrow-clockwise" /> Refresh</a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.icon-btn {
  position: relative;
}
.status-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--muted);
  box-shadow: 0 0 0 2px var(--surface);
}
.ok .status-dot {
  background: var(--success);
}
.dropdown-menu a {
  display: flex;
  align-items: center;
  gap: 8px;
}
.type {
  color: var(--muted);
  font-size: 10px;
}
.bi-check-lg {
  margin-left: auto;
}
.heading,
.empty {
  padding: 6px 16px;
  font-size: 11px;
  color: var(--muted);
  white-space: normal;
}
.heading {
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
</style>
