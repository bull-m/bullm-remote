<template>
  <Components.IconView @click="onIcon" />
</template>

<script setup lang="ts">
import { Components, useConfig, useGeneralOutput, useOptions, useWalk } from '../../export'
import { ConfigType } from '.'

const { auto } = useWalk()
const options = useOptions()
const config = useConfig<ConfigType>()

function onIcon() {
  if (!config.device) return
  auto(config.device, config.state)
}
</script>

<style lang="scss" scoped></style>
