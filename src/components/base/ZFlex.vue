<template>
  <div
    class="z-flex"
    :style="{
      flexDirection: vertical ? 'column' : 'row',
      justifyContent: justify,
      alignItems: align,
      flexWrap: wrap ? 'wrap' : 'nowrap',
      gap: typeof gap !== 'undefined' ? (typeof gap === 'number' ? `${gap}px` : gap) : '10px'
    }">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  vertical?: boolean
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around'
  align?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'
  wrap?: boolean
  gap?: number | string
}>()
</script>

<style scoped lang="scss">
.z-flex {
  display: flex;
}
</style>
