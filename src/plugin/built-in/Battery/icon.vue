<template>
  <Components.IconView :name="voltage.toFixed(1) + 'V'" />
</template>

<script setup lang="ts">
import { Components, useSensor } from '@/plugin/export.ts'

const sensor = useSensor('power')

const voltage = computed(() => (sensor.values?.[0]?.value || 0) / 1000)
</script>

<style lang="scss" scoped></style>
