<template>
  <van-field :label="label" v-bind="$attrs">
    <template #input>
      <van-slider
        bar-height="6"
        @drag-start="$emit('drag-start', $event)"
        @drag-end="$emit('drag-end', $event)"
        v-model="modelValue"
        :min="min"
        :max="max"
        @change="$emit('change', $event)"></van-slider>
    </template>
    <template #right-icon>
      <span style="width: 40px; display: inline-block">
        {{ rightLabel ? rightLabel(modelValue) : modelValue }}
      </span>
    </template>
  </van-field>
</template>
<script setup lang="ts">
defineEmits(['change', 'drag-start', 'drag-end'])
defineProps<{
  min?: number
  max?: number
  label?: string
  rightLabel?: (v: number | undefined) => string | number
}>()
const modelValue = defineModel<number>('modelValue')
</script>
