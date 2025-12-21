<template>
  <ZFlex style="padding: 10px" :class="{ sticky }">
    <van-button
      v-for="btn in btns.filter(btn => btn.show ?? true)"
      style="border-radius: 10px; flex: 1"
      size="small"
      square
      :type="btn.type"
      @click="btn.click"
      :loading="btn.loading"
      :color="color(btn.color)">
      {{ btn.text }}
    </van-button>
  </ZFlex>
</template>

<script setup lang="ts">
import ZFlex from '@/components/base/ZFlex.vue'
import { ButtonType } from 'vant'

const props = defineProps<{
  btns: {
    text: string
    click?: () => void
    color?: 'cancel' | 'submit' | 'delete' | string
    type?: ButtonType
    loading?: boolean
    show?: boolean
  }[]
  sticky?: boolean
}>()

function color(color?: 'cancel' | 'submit' | string) {
  if (!color) return
  return (
    {
      delete: 'var(--van-warning-color)',
      cancel: 'var(--van-warning-color)',
      submit: 'var(--van-primary-color)',
    }[color] || color
  )
}
</script>

<style scoped lang="scss">
.sticky {
  position: sticky;
  bottom: 0;
}
</style>
