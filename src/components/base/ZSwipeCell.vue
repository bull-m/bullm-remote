<template>
  <van-swipe-cell ref="swipeCell" @click="onClick" @open="isOpen = true" @close="isOpen = false" :before-close="beforeClose">
    <slot :open="open"></slot>
    <template #left>
      <slot name="left" />
    </template>
  </van-swipe-cell>
</template>

<script setup lang="ts">
const swipeCell = ref<any>(null)

function open(p: 'left' | 'right') {
  swipeCell.value.open(p)
}
const isOpen = ref(false)

function beforeClose(e: any): any {
  if (e.position === 'cell') {
    return false
  }
  // if (e.position !== 'outside'){
  //   return new Promise(resolve => setTimeout(()=>resolve(true), 500))
  // }
  return true
}
function onClick(e) {
  if (e === 'cell') {
    if (isOpen.value) {
      swipeCell.value.close()
    } else {
      swipeCell.value.open('left')
    }
  }
}
</script>

<style scoped lang="scss"></style>
