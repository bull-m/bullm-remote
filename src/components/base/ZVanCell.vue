<template>
  <van-cell @click="onClick" :clickable="!disabled" :style="{ opacity: disabled ? 0.5 : 1 }"></van-cell>
</template>

<script setup lang="ts">
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})
const emit = defineEmits(['click'])
function onClick() {
  if (props.disabled) {
    return
  }
  emit('click')
}
</script>

<style scoped lang="scss"></style>
