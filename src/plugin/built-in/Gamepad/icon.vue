<template>
  <Components.IconView v-if="show" name="手柄" icon-color="#2ecc71" />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useChassis, useConfig, useGamepad, usePlugin, usePZT, useUi } from '@/plugin/export.ts'
import { Components } from '@/plugin/export.ts'
import { ConfigType } from './index.ts'

const chassis = useChassis()
const plugin = usePlugin()
const gamepad = useGamepad()
const pzt = usePZT()
const show = ref(false)
watch(
  [() => gamepad.isLink, () => plugin],
  ([val]) => {
    plugin && (show.value = val)
  },
  { immediate: true, deep: true }
)

const config = useConfig<ConfigType>()

watch(
  () => gamepad.axes,
  axess => {
    const data = {
      l_x: Math.round(axess[0] * 255),
      l_y: Math.round(-axess[1] * 255),
      r_x: Math.round(axess[2] * 255),
      r_y: Math.round(-axess[3] * 255),
    }

    //坦克底盘，坦克遥感模式
    if (chassis.mode === 'tank' && config.control_mode === 'tank') {
      chassis.tank(data.l_y, data.r_y)
      return
    }
    if (chassis.mode === 'tank') {
      chassis.auto(data.l_y, config.control_mode == 'left' ? data.l_x : data.r_x)
    }
    if (chassis.mode === 'mecanum') {
      chassis.auto(data.l_y, data.r_x, data.l_x)
    }
  },
  {
    deep: true,
  }
)

let timer
watch(
  () => gamepad.buttons,
  buttons => {
    // 云台
    timer && clearTimeout(timer)
    let add = 0
    if (buttons[config.xUpKey]) add -= 3
    if (buttons[config.xDownKey]) add += 3
    if (add == 0) return
    pzt.walkRelative(add, 'pitch')
    timer = setInterval(() => {
      pzt.walkRelative(add, 'pitch')
    }, 30)
  },
  {
    deep: true,
  }
)
</script>
