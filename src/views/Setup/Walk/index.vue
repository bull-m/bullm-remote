<template>
  <ZPopupSetup :reset="() => walkStore.reset()" title="基础设置" box-id="SetupWalk">
    <!--          <van-notice-bar mode="closeable" color="#1989fa" background="#ecf9ff" style="margin-top: 20px;margin-bottom: -5px;">-->
    <!--            需要定义PWM输出、组合、舵机才能在插件中使用，插件中不能直接选择引脚-->
    <!--          </van-notice-bar>-->
    <van-tabs sticky scrollspy style="z-index: 999">
      <van-tab title="扩展">
        <SetupPinExtend />
      </van-tab>
      <van-tab title="PWM">
        <SetupPinPwms />
      </van-tab>
      <van-tab title="输出">
        <SetupPinDigitals />
      </van-tab>
      <van-tab title="舵机">
        <SetupPinServos />
      </van-tab>
      <van-tab title="驱动组合">
        <SetupPinGroups />
        <div style="height: 40vh"></div>
      </van-tab>
    </van-tabs>
  </ZPopupSetup>
</template>

<script setup lang="ts">
import { useStoreWalk } from '@/store/control/walk.ts'
import SetupPinGroups from './SetupPinGroups.vue'
import SetupPinServos from './SetupPinServos.vue'
import SetupPinExtend from './SetupPinExtend.vue'
import SetupPinPwms from './SetupPinPwms.vue'
import SetupPinDigitals from './SetupPinDigitals.vue'
import ZPopupSetup from '@/components/base/ZPopupSetup.vue'

const walkStore = useStoreWalk()

function closed() {
  closeDialog()
}
</script>
<style lang="scss" scoped></style>
