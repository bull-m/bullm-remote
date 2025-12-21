<template>
  <van-config-provider :theme="ui.theme" class="app">
    <!--   各位可能发现我们首页和控制页面并没有使用路由进行区分。而是直接使用状态进行切换，这只是为了在小车状态变更时更方便的切换页面   -->
    <!--   Home页面常驻,控制页面覆盖在上层   -->
    <Home />
    <transition name="fade">
      <Control v-if="link.isLink" />
    </transition>
    <!--   错误提示   -->
    <Warning />
    <!--   弹窗   -->
    <ZDialogAll />
  </van-config-provider>
</template>

<script setup lang="ts">
import { useStoreLink } from '@/store/link'
import Home from '@/views/Home/index.vue'
import '@/utils/device/keyboard.ts'
import { useStoreUi } from '@/store/ui.ts'
import Warning from '@/components/business/Warning.vue'
import Titlebar from '@/components/business/Titlebar.vue'

const Control = defineAsyncComponent(() => import('@/views/Control/index.vue'))

const ui = useStoreUi()
const link = useStoreLink()
link.init()
onMounted(() => {
  // 删除加载中的动画
  document.getElementById('yyz-loading')?.remove()
})
</script>
<style>
.app {
  width: 100%;
  height: 100%;
  background-color: #000;
  display: flex;
  position: relative;
}

#app {
  position: relative;
  height: 100%;
  width: 100%;
}

#perspective-box {
  perspective: 900px;
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1000;

  > * {
    pointer-events: auto;
  }
}
</style>
<style lang="scss" scoped>
.fade-enter-active {
  animation: fadeIn 0.5s;
}

.fade-leave-active {
  animation: fadeOut 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(100%);
  }
}
</style>
