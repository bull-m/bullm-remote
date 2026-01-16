<template>
  <div class="warning-box">
    <div class="item" :class="item.type" v-for="item in warning.list">
      <div style="font-weight: bold; margin-right: 3px" v-if="item.prefix">{{ item.prefix }}</div>
      <div>{{ item.text }}</div>
      <div style="margin-left: 7px" v-if="item.count > 1">x{{ item.count }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStoreWarning } from '@/store/warning.ts'

const warning = useStoreWarning()


</script>

<style scoped lang="scss">
.warning-box {
  position: absolute;
  top: 50px;
  left: 10px;
  display: flex;
  flex-direction: column;
  z-index: 100;
  max-height: 70vh;
  overflow-y: auto;
  @include row-gap(7px);

  .item {
    background: #f00;
    display: flex;
    align-items: center;
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 15px;
    color: #fff;
    max-width: 50vw;

    // 一个从下往上出现的动画
    animation: slide-up 0.2s ease-in-out;
    @keyframes slide-up {
      0% {
        opacity: 0;
        transform: translateY(25px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    &.error {
      background: #e74c3c;
    }

    &.warning {
      background: #f39c12;
    }

    &.info {
      background: #0f0;
    }
  }
}
</style>
