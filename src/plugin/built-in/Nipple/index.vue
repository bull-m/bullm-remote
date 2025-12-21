<template>
  <div class="nipple-container">
    <!--    <TestSpeek :lt="leftTop" :rt="rightTop" :lb="leftBottom" :rb="rightBottom" />-->

    <div class="remote-root">
      <div class="left">
        <RemotePole :disable-x="disableLeftX" @joystick="joystickLeft" :is-dynamics="config.nipple_left_mode == 'dynamic'" :is-ptz="false" />
      </div>
      <div class="right" v-if="showRight">
        <RemotePole
          :is-ptz-pitch="!!pzt.pitch_device"
          :is-ptz-roll="!!pzt.roll_device"
          :disable-x="disableRightX"
          :disable-y="disableRightY"
          @joystick="joystickRight"
          @ptz="ptzRight"
          :is-dynamics="config.nipple_right_mode == 'dynamic'"
          :is-ptz="true" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { ConfigType } from '@/plugin/built-in/Nipple/index.ts'
import RemotePole from './RemotePole.vue'
import { useChassis, useConfig, usePZT } from '@/plugin/export.ts'

const chassis = useChassis()
const pzt = usePZT()
const config = useConfig<ConfigType>()

const showRight = computed(() => {
  if (chassis.mode === 'tank' && config.control_mode === 'left') {
    return false
  }
  return true
})

// 禁用左边摇杆左右方向
const disableLeftX = computed(() => {
  // 坦克底盘，坦克遥感模式
  if (chassis.mode === 'tank' && config.control_mode === 'tank') {
    return true
  }
  if (chassis.mode === 'tank' && config.control_mode === 'wheel') {
    return true
  }
  return false
})

// 禁用右边摇杆左右方向
const disableRightX = computed(() => {
  if (chassis.mode === 'tank' && config.control_mode === 'tank') {
    return true
  }
  return false
})

// 禁用右边摇杆上下方向
const disableRightY = computed(() => {
  if (chassis.mode === 'tank' && config.control_mode === 'wheel') {
    return true
  }
  if (chassis.mode === 'mecanum') {
    return true
  }
  if (chassis.mode === 'steering') {
    return true
  }
  return false
})

const data = reactive({
  l_x: 0,
  l_y: 0,
  r_x: 0,
  r_y: 0,
})

function joystickLeft({ x, y }: any) {
  data.l_x = x
  data.l_y = y
}
function joystickRight({ x, y }: any) {
  data.r_x = x
  data.r_y = y
}
function ptzRight(data: any) {
  if (data.x !== 0) {
    pzt.walkRelative(data.x, 'roll')
  }
  if (data.y !== 0) {
    pzt.walkRelative(data.y, 'pitch')
  }
}

watch(data, updata, { deep: true })

function updata() {
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
}

onMounted(() => {
  // init()
})
</script>

<style lang="scss" scoped>
.nipple-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.remote-root {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  .left,
  .right {
    width: 50%;
    height: 100%;
    position: relative;
  }
}
</style>
