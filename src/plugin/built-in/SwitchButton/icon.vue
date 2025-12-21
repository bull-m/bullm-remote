<template>
  <Components.IconView @click="onIcon" :name="options?.name" :icon="is ? config.icon_on : config.icon_off"></Components.IconView>
</template>

<script setup lang="ts">
import { Components, useConfig, useGeneralOutput, useOptions, useWalk } from '../../export'
import { ConfigType } from '.'

const { auto } = useWalk()
const options = useOptions()
const config = useConfig<ConfigType>()

const is = computed(() => {
  const device = useGeneralOutput(config.device)
  if (!device) return false
  const middle = (config.state_on + config.state_off) / 2
  if (config.state_on > config.state_off) {
    return device.state > middle
  }
  return device.state < middle
})
function onIcon() {
  if (!config.device) return
  auto(config.device, is.value ? config.state_off : config.state_on)
}
</script>

<style lang="scss" scoped></style>
