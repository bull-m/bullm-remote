<template>
  <van-field class="z-from-switch" :label="label" v-bind="$attrs" label-width="auto" input-align="right">
    <template #input>
      <van-switch v-model="modelValue" @change="$emit('change', $event)" />
    </template>
  </van-field>
</template>
<script setup lang="ts">
defineEmits(['change'])
defineProps<{
  label?: string
}>()
const modelValue = defineModel<boolean>('modelValue')
</script>
<style lang="scss" scoped>
.z-from-switch {
  :deep(.van-field__label) {
    display: flex;
    align-items: center;
  }
}
</style>
