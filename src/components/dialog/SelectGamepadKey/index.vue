<template>
  <van-dialog title="按下您手柄按键" show-cancel-button @confirm="confirm">
    <div style="color: #fff; text-align: center; font-size: 50px; padding: 20px; font-weight: bold">
      {{ GamepadButtonIndexToLabel(index) }}
    </div>
  </van-dialog>
</template>

<script setup lang="ts">
import $bus from '@/utils/bus.ts'
import { GamepadButtonIndexToLabel } from '../../../utils/device/gamepad.ts'
const emit = defineEmits(['select'])
const props = defineProps({
  index: {
    type: Number,
    default: -1,
  },
})
const index = ref(props.index)
function onKey(data: { index: number; value: boolean; label: string }) {
  if (data.value) {
    index.value = data.index
  }
}
function confirm() {
  if (index.value >= 0) {
    emit('select', index.value)
  }
}

onMounted(() => {
  $bus.on('gamepad:button', onKey)
})
onUnmounted(() => {
  $bus.off('gamepad:button', onKey)
})
</script>

<style scoped lang="scss"></style>
