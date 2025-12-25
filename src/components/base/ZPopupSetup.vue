<template>
  <van-popup
    v-bind="$attrs"
    :beforeClose="beforeClose"
    v-model:show="show"
    position="right"
    close-on-popstate
    teleport="body"
    class="setup-popup z-popup">
    <div class="nav-bar" @mousedown="appWindow.startDragging()">
      <div class="left" @click="close" @mousedown.stop>
        <van-icon name="arrow-left" />
        返回
      </div>
      <div class="title">
        {{ title }}
      </div>
      <div class="right" v-if="reset" @click="reset" @mousedown.stop>
        重置
      </div>
    </div>
<!--    <van-nav-bar-->
<!--      :title="title"-->
<!--      left-text="返回"-->
<!--      left-arrow-->
<!--      @click-left="close"-->
<!--      :right-text="reset ? '重置' : undefined"-->
<!--      @click-right="reset"-->
<!--      placeholder />-->
    <div class="box" :class="{ 'no-scroll': noScroll }" :id="boxId">
      <van-loading size="24px" vertical v-if="loading">加载中...</van-loading>
      <slot v-if="typeof loading === 'boolean' ? !loading : true"></slot>
    </div>
    <slot name="overlay"></slot>
  </van-popup>
</template>
<script setup lang="ts">
import { useStoreUi } from '@/store/ui.ts'

const show = defineModel<boolean>('show')
const props = defineProps(['reset', 'title', 'boxId', 'loading', 'noScroll', 'beforeClose'])
import { getCurrentWindow } from '@tauri-apps/api/window'

const appWindow = getCurrentWindow()

const ui = useStoreUi()

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

watch(show, val => {
  val ? ui.addRoute(close) : ui.removeRoute(close)
}, {immediate: true})
</script>

<style scoped lang="scss">
.setup-popup {
  width: 40%;
  height: 100%;
  min-width: 450px;
  max-width: 550px;
  overflow: hidden;
  display: block;
  --nav-bar-height: 46px;

  .van-tabs__nav.van-tabs__nav--card {
    overflow: hidden;
    border-radius: 10px;
    box-sizing: border-box;
  }
}
.box {
  box-sizing: border-box;
  height: calc(100%);
  padding-top: var(--nav-bar-height);
  width: 100%;
  padding-bottom: 10px;
  overflow-y: auto;
  position: relative;

  &.no-scroll {
    overflow-y: hidden;
    padding-bottom: 0;
  }
}

.no-overlay {
  opacity: 0 !important;
}

.nav-bar {
  height: var(--nav-bar-height);
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  background: var(--popup-nav-bar-background);
  backdrop-filter: var(--popup-nav-bar-filter);
  z-index: 1;
  display: flex;
  align-items: center;
  &:after {
    position: absolute;
    box-sizing: border-box;
    content: ' ';
    pointer-events: none;
    top: -50%;
    right: -50%;
    bottom: -50%;
    left: -50%;
    border-bottom: 1px solid var(--van-border-color);
    transform: scale(0.5);
  }
  .title{
    max-width: 60%;
    margin: 0 auto;
    color: #f5f5f5;
    font-weight: 600;
    font-size: var(--van-font-size-lg);
  }
  .left {
    left: 0;
  }
  .right {
    right: 0;
  }
  .left,
  .right {
    position: absolute;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    padding: 0 var(--van-padding-md);
    font-size: var(--van-font-size-md);
    color: var(--van-primary-color);;
    cursor: pointer;
    &:active {
      opacity: var(--van-active-opacity);
    }
  }
}
</style>
