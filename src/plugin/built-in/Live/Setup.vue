<template>
  <van-cell-group inset title="画面显示">
    <van-radio-group v-model="config.object_fit">
      <van-cell :title="song.text" clickable @click="config.object_fit = song.value" v-for="song in object_fits">
        <template #right-icon>
          <van-radio :name="song.value" />
        </template>
      </van-cell>
    </van-radio-group>
  </van-cell-group>
  <van-cell-group inset style="margin-top: 10px">
    <ZVanSwitch label="水平镜像" v-model="config.horizontal" />
    <ZVanSwitch label="垂直翻转" v-model="config.vertical" />
    <ZVanSlider label="饱和度" v-model="config.saturate" :min="0" :max="200" />
    <ZVanSlider label="对比度" v-model="config.contrast" :min="0" :max="200" />
    <ZVanSlider label="亮度" v-model="config.brightness" :min="0" :max="200" />
  </van-cell-group>
</template>

<script setup lang="ts">
import { useConfig, useUi } from '@/plugin/export.ts'
import { ConfigType } from '@/plugin/built-in/Live/index.ts'
import ZVanSlider from '@/components/form/ZVanSlider.vue'
import ZVanSwitch from '@/components/form/ZVanSwitch.vue'
import { onMounted, onUnmounted } from 'vue'

const config = useConfig<ConfigType>()
const ui = useUi()

onMounted(() => {
  ui.setup.noOverlay = true
})
onUnmounted(() => {
  ui.setup.noOverlay = false
})

const object_fits: {
  value: 'contain' | 'cover' | 'fill'
  text: string
}[] = [
  { text: '等比缩放,充满屏幕,部分不可见', value: 'cover' },
  { text: '等比缩放,完整显示,会出现空白', value: 'contain' },
  { text: '拉伸充满,比例会变', value: 'fill' },
]
</script>

<style scoped lang="scss"></style>
