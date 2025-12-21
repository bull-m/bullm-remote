<template>
  <Components.IconView :name="camera.fps + 'fps'" :name-color="camera.fps < 8 ? 'red' : undefined">
    <IconSvgSignal
      :style="{
        color: link.isLink ? (link.connect?.strength < -50 ? '#f39c12' : 'var(--van-success-color)') : 'red',
      }" />
  </Components.IconView>
</template>

<script setup lang="ts">
import { Components } from '@/plugin/export.ts'
import { useStoreLink } from '@/store/link'
import { useStoreCamera } from '@/store/modules/camera.ts'

const link = useStoreLink()
const camera = useStoreCamera()
</script>

<style lang="scss" scoped></style>
