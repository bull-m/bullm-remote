<template>
  <div v-html="svg" class="z-icon"></div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { icons } from '@iconify-json/mdi'

const props = defineProps<{
  icon: string
}>()

const svg = ref<any>('')

watchEffect(() => {
  const icon = icons.icons[props.icon] as any
  if (icon?.body) {
    svg.value = icon.body
  } else if (icons.aliases?.[props.icon]) {
    const icon = icons.aliases[props.icon]
    svg.value = icons.icons[icon.parent]?.body
  }
  svg.value = `<svg class="icon" viewBox="0 0 ${icons.height} ${icons.width}" width="1.2em" height="1.2em">${svg.value}</svg>`
})
</script>

<style scoped lang="scss"></style>
