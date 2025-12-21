<template>
  <van-collapse v-model="activeNames" @change="change">
    <van-collapse-item name="1" v-bind="$attrs">
      <template #title>
        <slot name="title">{{ title }}</slot>
      </template>
      <template #value>
        <slot name="value">{{ value }}</slot>
      </template>
      <template #label>
        <slot name="label">{{ label }}</slot>
      </template>
      <slot></slot>
    </van-collapse-item>
  </van-collapse>
</template>

<script setup lang="ts">
const props = defineProps({
  title: {
    type: String,
    default: '标题',
  },
  value: {
    type: String,
  },
  label: {
    type: String,
  },
})
const emit = defineEmits(['open', 'close'])
const activeNames = ref([] as string[])
function change(names: string[]) {
  if (names.includes('1')) {
    emit('open')
  } else {
    emit('close')
  }
}
</script>

<style scoped lang="scss">
.van-collapse-item {
  :deep(.van-collapse-item__content) {
    padding: 0;
  }
}
</style>
