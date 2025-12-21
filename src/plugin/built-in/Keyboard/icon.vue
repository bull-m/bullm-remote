<template></template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import $bus from '@/utils/bus.ts'
import { ConfigType } from '.'
import { useChassis, useConfig, useKeyboard, usePZT, useUi } from '@/plugin/export.ts'

const chassis = useChassis()
const pzt = usePZT()
const ui = useUi()

const keyboard = useKeyboard()

const config = useConfig<ConfigType>()

onMounted(() => {
  $bus.on('keyboard:mousewheel', mousewheel)
})
onUnmounted(() => {
  $bus.off('keyboard:mousewheel', mousewheel)
})

function mousewheel(e) {
  if (!ui.isControl) return
  if (!config.mousewheel) return
  if (typeof e.isUp === 'undefined') return
  pzt.walkRelative(e.isUp ? -5 : 5, 'pitch')
}

let timer = null as any
watch(
  () => keyboard.keys,
  () => {
    timer && clearTimeout(timer)
    if (!ui.isControl) return
    const k = keyboard.keys
    let speed = config.def_speed
    if (config.slow_shift_key && keyboard.keys.Shift) {
      speed = config.slow_speed
    }
    if (config.tall_ctrl_key && keyboard.keys.Ctrl) {
      speed = config.tall_speed
    }

    let axes_x = 0
    let axes_y = 0
    let axes_z = 0
    if (k[config.back_key]) {
      axes_y -= speed
    }
    if (k[config.forward_key]) axes_y += speed
    if (k[config.left_key]) axes_x -= speed
    if (k[config.right_key]) axes_x += speed
    if (k[config.hy_left_key]) axes_z -= speed
    if (k[config.hy_right_key]) axes_z += speed

    if (chassis.mode === 'tank') {
      chassis.auto(axes_y, axes_x)
    }
    if (chassis.mode === 'mecanum') {
      chassis.auto(axes_y, axes_z, axes_x)
    }
    // 云台
    let add = 0
    if (k[config.ptz_up_key]) add -= 2
    if (k[config.ptz_down_key]) add += 2
    if (add == 0) return
    pzt.walkRelative(add, 'pitch')
    timer = setInterval(() => {
      pzt.walkRelative(add, 'pitch')
    }, 30)
  },
  { deep: true }
)
</script>
