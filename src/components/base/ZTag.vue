<template>
  <div class="z-tag" :class="type + ' ' + size">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  type?: 'success' | 'info' | 'warn' | 'error'
  size?: 'small' | 'medium' | 'large'
}>()
</script>

<style scoped lang="scss">
.z-tag {
  font-size: 14px;
  background-color: #2e8b57;
  padding: 5px 8px;
  border-radius: 5px;
  color: #fff;
  display: block;
  line-height: 1;

  &.success {
    background-color: #2e8b57;
  }
  &.info {
    background-color: #3498db;
  }

  &.warn {
    background-color: #e67e22;
  }

  &.error {
    background-color: #e84118;
  }
  &.small {
    font-size: 12px;
    padding: 3px 6px;
  }
  &.large {
    font-size: 16px;
    padding: 7px 12px;
  }
}
</style>
