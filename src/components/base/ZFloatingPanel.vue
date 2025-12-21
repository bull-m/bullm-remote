<template>
  <van-floating-panel :safe-area-inset-bottom="false" :anchors="anchors" v-model:height="height">
    <transition name="van-fade">
      <div class="no-show" v-show="!show" @click="show = true">
        <slot name="no-show"></slot>
      </div>
    </transition>
    <slot></slot>
  </van-floating-panel>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const show = defineModel('modelValue')

const height = ref(100)

const mousedown = ref(false)

watch(show, value => {
  if (value && height.value === anchors[0]) {
    height.value = anchors[1]
  } else if (!value && height.value === anchors[1]) {
    height.value = anchors[0]
  }
})

watch(height, value => {
  show.value = value > anchors[0]
})

const anchors = [100, Math.round(0.7 * window.innerHeight)]
</script>

<style scoped lang="scss">
.no-show {
  height: 70px;
  display: flex;
  background-color: #ffffff;
  position: absolute;
  width: 100%;
  z-index: 2;
  color: #000;
  align-items: center;
  justify-content: center;
}
</style>
