<template>
  <ZPopupSetup :reset="() => chassisStore.reset()" title="底盘设置">
    <van-cell-group inset title="底盘设置">
      <van-cell
        title="小车底盘样式"
        is-link
        inset
        @click="showCarList = true"
        :value="carModeList.find(item => item.value === chassisStore.mode)?.title" />
      <template v-if="chassisStore.mode == 'steering'">
        <ZVanDevice select-servo label="转弯舵机" v-model="chassisStore.steering.pin" />
        <ZVanSlider :min="30" :max="150" label="转弯范围" v-model="chassisStore.steering.range" />
        <ZVanSlider :min="20" :max="160" label="转弯中点" v-model="chassisStore.steering.center" />
      </template>
      <ZVanDevice select-group v-for="item in motor_list" :label="item.name" v-model="chassisStore.motor[item.key]" />
    </van-cell-group>
    <van-action-sheet v-model:show="showCarList" title="选择小车底盘样式" style="height: 80%">
      <van-card
        :tag="item.value == chassisStore.mode ? '当前' : ''"
        v-for="item in carModeList"
        style="cursor: pointer; --van-card-font-size: 17px; --van-card-title-line-height: 1.5"
        @click="selectCarMode(item)"
        centered
        :desc="item.desc"
        :title="item.title"
        :thumb="item.thumb"
        :disabled="item.disabled" />
    </van-action-sheet>
  </ZPopupSetup>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { CarModeType, useStoreChassis } from '@/store/modules/chassis.ts'

const chassisStore = useStoreChassis()

const showCarList = ref(false)

const carModeList = ref<
  {
    value: CarModeType
    desc: string
    title: string
    thumb: string
    disabled?: boolean
  }[]
>([
  {
    value: 'tank',
    desc: '通过两边的轮子的差速进行转弯',
    title: '4轮差速转弯',
    thumb: 'https://img.cdn.yyzhu.vip/2024/05/07/230958522.png',
  },
  {
    value: 'mecanum',
    desc: '可以实现全向的移动',
    title: '麦克纳姆轮',
    thumb: 'https://img.cdn.yyzhu.vip/2024/05/07/230819934.png',
  },
  {
    value: 'steering',
    desc: '使用舵机进行转向(开发中)',
    title: '舵机转向',
    thumb: 'https://img.cdn.yyzhu.vip/2024/05/07/230819934.png',
    disabled: true,
  },
])

function selectCarMode(row) {
  showCarList.value = false
  chassisStore.mode = row.value
}

const motor_list = computed(() => {
  if (chassisStore.mode === 'steering') {
    return [
      { name: '驱动轮', key: 'wheel' },
      { name: '驱动轮2', key: 'wheel2' },
    ]
  }
  return [
    { name: '左前轮', key: 'top-left' },
    { name: '右前轮', key: 'top-right' },
    { name: '左后轮', key: 'bottom-left' },
    { name: '右后轮', key: 'bottom-right' },
  ]
})
</script>
<style lang="scss" scoped></style>
