<template>
  <van-popup
    v-bind="$attrs"
    :beforeClose="beforeClose"
    v-model:show="show"
    position="right"
    close-on-popstate
    teleport="body"
    class="setup-popup z-popup">
    <van-nav-bar
      @mousedown="appWindow.startDragging"
      :title="title"
      left-text="返回"
      left-arrow
      @click-left="close"
      :right-text="reset ? '重置' : undefined"
      @click-right="reset"
      placeholder />
    <div class="box" :class="{ 'no-scroll': noScroll }" :id="boxId">
      <van-loading size="24px" vertical v-if="loading">加载中...</van-loading>
      <slot v-if="typeof loading === 'boolean' ? !loading : true"></slot>
    </div>
    <slot name="overlay"></slot>
  </van-popup>
</template>
<script setup lang="ts">
const show = defineModel<boolean>('show')
const props = defineProps(['reset', 'title', 'boxId', 'loading', 'noScroll', 'beforeClose'])
import { getCurrentWindow } from '@tauri-apps/api/window'

const appWindow = getCurrentWindow()

async function close() {
  if (!props.beforeClose) {
    show.value = false
    return
  }
  let res = props.beforeClose?.()
  if (res instanceof Promise) {
    res = await res.then()
  }
  if (typeof res === 'undefined' || res) {
    show.value = false
  }
}
</script>

<style scoped lang="scss">
.box {
  box-sizing: border-box;
  height: calc(100%);
  padding-top: var(--van-nav-bar-height);
  width: 100%;
  padding-bottom: 10px;
  overflow-y: auto;
  position: relative;

  &.no-scroll {
    overflow-y: hidden;
    padding-bottom: 0;
  }
}

.setup-popup {
  width: 40%;
  height: 100vh;
  min-width: 450px;
  max-width: 550px;
  overflow: hidden;
  display: block;

  .van-tabs__nav.van-tabs__nav--card {
    overflow: hidden;
    border-radius: 10px;
    box-sizing: border-box;
  }
}

.no-overlay {
  opacity: 0 !important;
}
</style>
