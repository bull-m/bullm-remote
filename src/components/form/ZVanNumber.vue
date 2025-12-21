<template>
  <van-field
    autocomplete="off"
    :model-value="value"
    @update:model-value="update"
    :label="label"
    v-bind="$attrs"
    :type="type ?? 'digit'"
    :disabled="disabled">
    <template #right-icon>{{ rightLabel }}</template>
  </van-field>
</template>
<script setup lang="ts">
defineEmits(['change'])
defineProps<{
  label?: string
  rightLabel?: string
  type?: 'number'
  disabled?: boolean
}>()
const modelValue = defineModel<number | undefined>('modelValue')

const value = ref<any>(undefined)

function update(_value: string | number) {
  value.value = _value
  if (typeof _value === 'number') {
    modelValue.value = _value
  } else if (_value.length > 0) {
    modelValue.value = Number(_value)
  } else {
    modelValue.value = undefined
  }
}
</script>
<style lang="scss" scoped>
.z-from-switch {
  :deep(.van-field__label) {
    display: flex;
    align-items: center;
  }
}
</style>
