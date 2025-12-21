<!--
版权所有 © 2025 牛明工作室 / yy祝。保留所有权利。
SPDX-License-Identifier: MIT
根据 MIT 许可证（MIT License）授权。
-->
<template>
  <div class="control" data-me="U2FsdGVkX18KdVjj8xJmajBuZSFc1WXU7HjTZnnjJtYY7bPDufe0wj2u3ohbXvd+cweo3EXASw==">
    <!-- 设置主入口 -->
    <SetupIndex v-model:show="ui.showSetup" />
    <div class="top-list" @mousedown="appWindow.startDragging">
      <div class="top-plugin-list">
        <div @mousedown.stop class="plugin-btn-text top" @click="onBack()">
          <IconSvgHome class="icon-shadow" />
        </div>
        <PluginIcon
          @mousedown.stop
          :plugin-id="item.id"
          :key="item.id"
          v-for="item in pluginStore.list.filter(x => x.options.position === 'top' && x.icon)" />
      </div>
      <!-- 设置和退出按钮 -->
      <div class="top-right-plugin-list" @mousedown.stop>
        <Titlebar :close="onClose" />
        <div
          class="plugin-btn-text top"
          style="font-size: 21px; width: var(--top-height); padding: 0; justify-content: center"
          @click="ui.showSetup = true">
          <IconSvgSetup class="icon-shadow" />
        </div>
      </div>
    </div>

    <!-- 左侧插件 -->
    <div class="left-plugin-list">
      <PluginIcon :plugin-id="item.id" :key="item.id" v-for="item in pluginStore.list.filter(x => x.options.position === 'left' && x.icon)" />
    </div>
    <!-- 右侧插件 -->
    <div class="right-plugin-list">
      <PluginIcon :plugin-id="item.id" :key="item.id" v-for="item in pluginStore.list.filter(x => x.options.position === 'right' && x.icon)" />
    </div>

    <!--  全屏  -->
    <div style="width: 100%; height: 100%; position: relative; z-index: 10">
      <PluginComponent
        :plugin-id="item.id"
        :key="item.id"
        type="template"
        v-for="item in pluginStore.list.filter(x => x.info.type === 'fullscreen').reverse()" />
    </div>

    <!--  无ui组件，需要后台运行  -->
    <div style="display: none">
      <PluginComponent :plugin-id="item.id" :key="item.id" type="icon" v-for="item in pluginStore.list.filter(x => x.info.type === 'no-ui')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStoreLink } from '@/store/link'
import SetupIndex from '@/views/Setup/index.vue'
import { useStorePlugin } from '@/store/plugin.ts'
import PluginComponent from '@/plugin/component/PluginComponent.vue'
import PluginIcon from '@/plugin/component/PluginIcon.vue'
import { useStoreUi } from '@/store/ui.ts'
import { KeyboardClear, KeyboardInit } from '@/utils/device/keyboard.ts'
import { debugAutoOpenSetup } from '@/views/debug.ts'
import { getCurrentWindow } from '@tauri-apps/api/window'

const appWindow = getCurrentWindow()

const link = useStoreLink()
const pluginStore = useStorePlugin()
const ui = useStoreUi()

function onBack() {
  link.close()
  showToast('主动断开连接 ψ(｀∇´)ψ')
}

function onClose() {
  link.close()
  showToast('已断开连接')
  setTimeout(() => {
    appWindow.close()
  }, 500)
}

onMounted(() => {
  KeyboardInit()
})
onUnmounted(() => {
  KeyboardClear()
})

if (debugAutoOpenSetup) {
  ui.showSetup = true
}
</script>
<style lang="scss" scoped>
.control {
  width: 100%;
  height: 100%;
  background-color: #000;
  position: absolute;
  top: 0;
  left: 0;
}

.plugin-list {
  position: absolute;
  display: flex;
  align-items: center;
  z-index: 20;
}

.top-list {
  width: 100%;
  top: 0;
  right: 0;
  display: flex;
  height: var(--top-height);
  gap: var(--top-height);
  @extend .plugin-list;
  //-webkit-app-region: drag; /* 标记为可拖拽区域 */

  .top-right-plugin-list {
    height: var(--top-height);
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
    flex-shrink: 0;
  }

  .top-plugin-list {
    height: var(--top-height);
    flex: 1;
    overflow-x: auto;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    flex-basis: 0;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}

.left-plugin-list {
  @extend .plugin-list;
  top: calc(var(--top-height) + 10px);
  left: 10px;
  max-height: calc(100% - (var(--top-height) * 2) - 20px);
  width: var(--side-width);
  flex-direction: column;
  gap: 10px;
  //background: rgba(0, 0, 0, 0.7);
  //border-radius: 0 10px 10px 0;
  //border: 1px solid rgba(255, 255, 255, 0.5);
  border-left: none;
  //padding: 5px 0;
  overflow-y: auto;
}

.right-plugin-list {
  @extend .left-plugin-list;
  left: auto;
  right: 10px;
  border-radius: 10px 0 0 10px;
}
</style>
