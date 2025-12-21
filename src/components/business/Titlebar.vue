<template>
  <div class="titlebar" @mousedown.stop>
    <div class="btn icon-shadow" @click="appWindow.minimize">
      <IconMdiWindowMinimize />
    </div>
    <div class="btn icon-shadow" @click="appWindow.toggleMaximize">
      <IconMdiWindowMaximize />
    </div>
    <div class="btn icon-shadow close" @click="close">
      <IconMdiWindowClose />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window'

const appWindow = getCurrentWindow()

const props = defineProps<{
  close?: () => void
}>()

function close() {
  if (props.close) {
    props.close()
    return
  }
  appWindow.close()
}
</script>

<style scoped lang="scss">
.titlebar {
  height: var(--top-height);
  display: flex;
  .btn {
    width: var(--top-height);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 18px;
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      &.close {
        background: rgb(180, 0, 0);
      }
    }
    &:active {
      background: rgba(255, 255, 255, 0.2);
      &.close {
        background: rgba(255, 0, 0, 1);
      }
    }
  }
}
</style>
