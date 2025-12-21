<template>
  <Components.IconView @click="is = !is" :name="options?.name">
    <icon-mdi-lightbulb-on-10 v-show="!is" />
    <icon-mdi-lightbulb-on v-show="is" />
  </Components.IconView>
</template>

<script setup lang="ts">
import $bus from '@/utils/bus.ts'
import { Components, useConfig, useOptions, usePlugin } from '../../export'
import { useStoreWalk } from '@/store/control/walk.ts'

const { auto } = useStoreWalk()
const options = useOptions()
const config = useConfig()

const is = ref(false)

function onKey(data: { index: number; value: boolean; label: string }) {
  if (data.value && data.index === config.shortcutKey) {
    is.value = !is.value
  }
}

watch(is, val => {
  auto(config.io, val ? config.brightness : 0)
})

onMounted(() => {
  $bus.on('gamepad:button', onKey)
})
onUnmounted(() => {
  $bus.off('gamepad:button', onKey)
})
</script>

<style lang="scss" scoped></style>
