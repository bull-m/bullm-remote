<template>
  <template v-for="(item, index) in dialogs" :key="item.id">
    <component v-if="!item.teleport" :is="item.component" v-bind="item.props" v-model:show="item.show" />
    <teleport v-else :to="item.teleport">
      <component :is="item.component" v-bind="item.props" v-model:show="item.show" />
    </teleport>
  </template>
</template>

<script setup lang="ts">
import { dialogs } from '@/utils/ui/dialog.ts'
</script>

<style scoped></style>
