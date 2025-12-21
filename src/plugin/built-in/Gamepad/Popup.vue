<template>
  <div style="width: 300px">
    <van-cell-group>
      <van-cell title="状态">
        <template #value>
          <van-tag type="success" size="large" v-if="GamepadIsLink">已连接</van-tag>
          <van-tag type="warning" size="large" v-else>未连接</van-tag>
        </template>
      </van-cell>
      <template v-if="GamepadIsLink">
        <van-cell title="手柄 ID" :label="GamepadCurrent.id" />
        <van-cell title="按键数量" :value="GamepadCurrent.buttons?.length" />
        <van-cell title="轴数量" :value="GamepadCurrent.axes?.length" />
        <van-cell title="映射" :value="mapping[GamepadCurrent.mapping || 'unknown'] || '未知的,我们可能不支持这个手柄'" />
        <van-cell title="实时数据" title-style="flex: 0.5;" :value="text" />
      </template>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { GamepadCurrent, GamepadIsLink } from '@/utils/device/gamepad.ts'
import $bus from '@/utils/bus.ts'

const mapping = {
  standard: '标准',
}

const text = ref('')
$bus.on('gamepad:button', res => {
  text.value = res.label + '：' + (res.value ? '按下' : '松开')
})
$bus.on('gamepad:axes', res => {
  text.value = res.label + '：' + res.value
})
</script>

<style scoped lang="scss"></style>
