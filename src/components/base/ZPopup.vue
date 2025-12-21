<template>
  <van-popup v-model:show="show" close-on-popstate teleport="#perspective-box" class="z-popup" transition="z-popup">
    <div v-if="title" style="font-weight: bold; font-size: 17px; color: #2e8b57; margin-bottom: 10px; text-align: center">
      {{ title }}
    </div>
    <slot></slot>
  </van-popup>
</template>
<script setup lang="ts">
const show = defineModel<boolean>('show', { default: false })
defineProps<{
  title?: string
}>()
</script>

<style scoped lang="scss">
.z-popup {
  border-radius: 10px;
  background-color: var(--background);
  padding: 12px;
  backdrop-filter: none;
}

// 动画，从下方放大弹出，退出反向
.z-popup-enter-active {
  transform-style: preserve-3d;
  animation: popupEnter 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

.z-popup-leave-active {
  transform-style: preserve-3d;
  animation: popupLeave 0.2s ease-in forwards;
}

@keyframes popupEnter {
  0% {
    transform-origin: top center;
    transform: translateY(-50%) rotateX(-90deg);
    opacity: 0.5;
  }
  100% {
    transform-origin: top center;
    transform: translateY(-50%);
    opacity: 1;
  }
}

@keyframes popupLeave {
  0% {
    transform-origin: bottom center;
    transform: translateY(-50%);
    opacity: 1;
  }
  100% {
    transform-origin: bottom center;
    transform: translateY(-50%) rotateX(90deg);
    opacity: 0.1;
  }
}
</style>
