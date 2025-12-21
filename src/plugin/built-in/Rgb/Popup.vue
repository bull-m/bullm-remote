<template>
  <div style="width: 220px; min-height: 233px">
    <van-dropdown-menu>
      <van-dropdown-item v-model="effect" :options="effects" />
    </van-dropdown-menu>
    <van-cell-group>
      <van-field v-model="color" label="颜色" placeholder="FF00FF" />
      <van-cell title="亮度">
        <template #label>
          <VanSlider
            style="margin: 10px 0"
            bar-height="6"
            :button-size="19"
            v-model="brightness"
            :max="255"
            :min="0"
            :step="1"
            @change="rgb_brightness" />
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { WsSendFunc } from '@/utils/car/message.ts'

const effect = ref('off')
const color = ref('FF00FF')
const brightness = ref(50)

watch([effect, color], newVal => {
  if (!newVal[0] || !newVal[1]) return
  WsSendFunc('rgb', { effect: effect.value, color: parseInt(color.value, 16) })
})

const effects = [
  { text: '关闭', value: 'off' },
  { text: '单色循环', value: 'loop_one' },
  { text: '单色', value: 'color_all' },
  { text: '彩虹循环', value: 'rainbow' },
]

function rgb_brightness(value) {
  WsSendFunc('rgb', { effect: 'brightness', value: value })
}
</script>

<style scoped lang="scss"></style>
