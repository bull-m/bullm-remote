<template>
  <ZPopupSetup :reset="() => battery.reset()" title="电压设置">
    <van-cell-group inset title="云台设置">
      <van-notice-bar>由于主控差异，获取电压可以会与实际不一致，你可以设置电压偏移，最终电压会加上这个偏移量</van-notice-bar>
      <ZVanNumber type="number" label="电压偏移" v-model="battery.options.offset" colon right-label="V" />
    </van-cell-group>
  </ZPopupSetup>
</template>

<script setup lang="ts">
import { useStoreBattery } from '@/store/modules/battery.ts'

const battery = useStoreBattery()
</script>
<style lang="scss" scoped></style>
