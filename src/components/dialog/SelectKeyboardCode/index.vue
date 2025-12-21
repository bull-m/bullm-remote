<template>
  <van-dialog title="按下您键盘按键" width="500px" show-cancel-button @confirm="confirm">
    <div style="color: var(--text); text-align: center; font-size: 50px; padding: 20px; font-weight: bold">
      {{ code }}
    </div>
  </van-dialog>
</template>

<script setup lang="ts">
import $bus from '@/utils/bus.ts'

const emit = defineEmits(['select'])
const props = defineProps({
  code: {
    type: String,
    default: '',
  },
})
const code = ref(props.code)

function onKey(data: { key: string; str: string }) {
  code.value = data.str
}

function confirm() {
  if (code.value) {
    emit('select', code.value)
  }
}

onMounted(() => {
  $bus.on('keyboard:down', onKey)
})
onUnmounted(() => {
  $bus.off('keyboard:down', onKey)
})
</script>

<style scoped lang="scss"></style>
