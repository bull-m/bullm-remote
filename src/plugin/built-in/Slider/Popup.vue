<template>
  <div class="slider" :class="{ vertical: config.direction === 'vertical' }">
    <div v-for="(item, index) in slider" :key="index" :style="{ '--color': item?.color || 'var(--van-primary-color)' }" class="item">
      <van-slider
        :vertical="config.direction !== 'vertical'"
        :model-value="getValue(item)"
        @update:model-value="onSlider(item, $event)"
        @change="change(item)"
        :color="item.color"
        active-color="var(--color)"
        bar-height="6px"
        :min="item.min ?? 0"
        :max="item.max ?? 255"
        :step="item.step ?? 1"
        :readonly="item.readonly"
        :reverse="config.direction !== 'vertical' ? !item.reverse : item.reverse">
        <template #button>
          <div class="custom-button">{{ getCustom(item) }}</div>
        </template>
      </van-slider>
      <div @click="onLabel(item)" class="label" style="">{{ item.label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  isGroup,
  isServo,
  useConfig,
  useGeneralOutput,
  usePlugin,
  useWalk,
} from '@/plugin/export.ts'
import { ConfigType } from './index.ts'
import $bus from '@/utils/bus.ts'

const { auto } = useWalk()

const config = useConfig<ConfigType>()

function getValue(item: any) {
  if (isServo(item.device)) {
    if (item.state === 255) return 0 // 舵机的255值表示伺服停止
  }
  return item.state
}

function getCustom(item: any) {
  if (isServo(item.device)) {
    if (item.state === 255) return '关' // 舵机的255值表示伺服停止
  }
  return item.state
}

const slider = computed(() => {
  return config.list.map(item => {
    const info = useGeneralOutput(item.device)
    return { state: 0, ...info, ...item }
  })
})

function onSlider(item: any, value) {
  auto(item.device, value)
}

function onLabel(item: any) {
  if (isServo(item.device)) {
    auto(item.device, 255) // 关闭舵机
  }
}

function change(item: any) {
  // 组合需要归零
  if (isGroup(item.device) && item.autostop) {
    auto(item.device, 0) // 停止
  }
}

function autostop() {
  slider.value.forEach(item => {
    if (isGroup(item.device) && item.autostop && item.state != 0) {
      auto(item.device, 0) // 停止
    }
  })
}

$bus.on('window:blur', autostop)

onUnmounted(() => {
  $bus.off('window:blur', autostop)
  autostop()
})
</script>

<style scoped lang="scss">
.custom-button {
  width: 26px;
  color: #fff;
  font-size: 10px;
  line-height: 18px;
  text-align: center;
  background-color: var(--color);
  border-radius: 100px;
}

.slider {
  height: 150px;
  padding: 10px 10px;
  display: flex;
  max-width: 80vh;
  overflow: auto;

  .item {
    min-width: 50px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 10px;
    user-select: none;

    .label {
      margin-top: 10px;
      font-size: 13px;
    }
  }

  &.vertical {
    flex-direction: column;
    height: auto;
    max-height: 80vh;
    width: 230px;
    padding: 10px 20px 10px 10px;

    .item {
      width: 100%;
      flex-direction: row-reverse;
      padding: 10px 0;

      .label {
        margin-top: 0;
        margin-right: 20px;
        width: 42px;
        white-space: wrap;
        word-break: break-all;
        flex-shrink: 0;
        text-align: center;
        line-height: 1.2;
      }
    }
  }
}
</style>
