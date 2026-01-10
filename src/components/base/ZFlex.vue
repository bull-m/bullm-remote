<template>
  <div
    class="z-flex"
    :class="{ vertical, horizontal: !vertical }"
    :style="{
      flexDirection: vertical ? 'column' : 'row',
      justifyContent: justify,
      alignItems: align,
      '--gap': typeof gap !== 'undefined' ? (typeof gap === 'number' ? `${gap}px` : gap) : '10px',
    }">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  vertical?: boolean
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around'
  align?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'
  gap?: number | string
}>()
</script>

<style scoped lang="scss">
.z-flex {
  display: flex;
  &.horizontal {
    @include column-gap(var(--gap));
  }
  &.vertical {
    @include row-gap(var(--gap));
  }
}
</style>
