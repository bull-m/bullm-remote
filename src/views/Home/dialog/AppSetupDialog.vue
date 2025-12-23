<template>
  <ZPopupSetup>
    <van-cell-group title="页面" inset>
      <van-cell title="页面缩放">
        <ZFlex justify="flex-end" align="center" :gap="8">
          {{ ui.zoom.toFixed(1) }}
          <van-button type="primary" size="small" @click="ui.zoom += 0.1">放大</van-button>
          <van-button type="primary" size="small" @click="ui.zoom -= 0.1">缩小</van-button>
        </ZFlex>
      </van-cell>
    </van-cell-group>
  </ZPopupSetup>
</template>

<script setup lang="ts">
import { useStoreUi } from '@/store/ui.ts'

const ui = useStoreUi()
</script>

<style scoped lang="scss"></style>
