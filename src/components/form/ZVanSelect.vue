<template>
  <van-field
    :disabled="disabled"
    :model-value="columns.find(col => col.value === modelValue)?.text || modelValue"
    :is-link="!disabled"
    readonly
    v-bind="$attrs"
    @click="onClick" />
  <van-popup v-model:show="showPicker" destroy-on-close round position="bottom" :teleport="teleport_new">
    <van-picker :model-value="[modelValue]" :columns="columns" @cancel="showPicker = false" @confirm="onConfirm" />
  </van-popup>
</template>

<script setup lang="ts">
import { getPopupParentEl } from '@/utils/ui/element.ts'

const modelValue = defineModel<number | string>({ required: true })
const props = defineProps<{
  columns: {
    text: string
    value: string | number
  }[]
  disabled?: boolean
  teleport?: string
}>()

const showPicker = ref(false)

function onClick() {
  if (props.disabled) return
  showPicker.value = true
}

const onConfirm = ({ selectedValues }) => {
  modelValue.value = selectedValues[0]
  showPicker.value = false
}

const teleport_new = ref(null as any)

onMounted(() => {
  teleport_new.value = props.teleport || getPopupParentEl()
})
</script>

<style scoped lang="scss"></style>
