<template>
  <ZPopupSetup :reset="() => pzt.reset()" title="云台设置">
    <van-cell-group inset title="云台设置">
      <ZVanDevice select-servo label="俯仰舵机" v-model="pzt.pitch_device" />
      <ZVanDevice select-servo label="横滚舵机" v-model="pzt.roll_device" />
      <van-notice-bar>目前还没有插件支持横滚功能</van-notice-bar>
    </van-cell-group>
    <van-cell-group inset title="提示">
      <van-notice-bar color="var(--van-warning-color)">"云台默认位置" 可以到对应舵机配置中设置</van-notice-bar>
      <van-notice-bar color="var(--van-warning-color)">"云台限位" 可以到对应舵机配置中设置</van-notice-bar>
    </van-cell-group>
  </ZPopupSetup>
</template>

<script setup lang="ts">
import { useStorePZT } from '@/store/modules/pzt.ts'

const pzt = useStorePZT()
</script>
<style lang="scss" scoped></style>
