<template>
  <van-cell-group title="test" inset>
    <ZSelectIcon v-model="config.icon" label="选择图标" />
  </van-cell-group>
</template>

<script setup lang="ts">
import { useConfig } from '@/plugin/export.ts'

const config = useConfig<any>()
</script>

<style scoped lang="scss"></style>
