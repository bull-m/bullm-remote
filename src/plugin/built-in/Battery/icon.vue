<template>
  <Components.IconView :name="battery.voltage + 'V'" />
</template>

<script setup lang="ts">
import { Components, useBattery } from '@/plugin/export.ts'

const battery = useBattery()
</script>

<style lang="scss" scoped></style>
