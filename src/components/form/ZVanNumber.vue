<template>
  <van-field
    autocomplete="off"
    v-model="value"
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

const value = computed<string | number | undefined>({
  get(){
    return modelValue.value
  },
  set(v){
    if (typeof v === 'number') {
      modelValue.value = v
    } else if (typeof v === 'string' && v.length > 0) {
      modelValue.value = Number(v)
    } else {
      modelValue.value = undefined
    }
  }
})
</script>
<style lang="scss" scoped>
.z-from-switch {
  :deep(.van-field__label) {
    display: flex;
    align-items: center;
  }
}
</style>
