<!--
版权所有 © 2025 牛明工作室 / yy祝。保留所有权利。
SPDX-License-Identifier: MIT
根据 MIT 许可证（MIT License）授权。
-->
<template>
  <ZPopupSetup
    v-model:show="show"
    title="设置"
    box-id="SetupIndex"
    @open="open"
    teleport="body"
    style="transition: all 0.5s"
    :overlay-class="ui.setup.noOverlay ? 'no-overlay' : ''">
    <van-cell-group inset title="连接与配置">
      <div v-if="onlink.length === 0" style="color: #999; font-size: 13px; text-align: center; padding: 12px 0">
        这个车没有任何通道能连接上哎 ( •̀ ω •́ )✧
      </div>
      <van-cell v-for="item in onlink" :title="item.name" clickable inset @click="onShowIpDetail(item)">
        <template #value>
          <van-tag type="primary" v-if="isSameLinkOption(item, link.connect.linkOption)">当前连接</van-tag>
          <van-tag type="success" v-else>在线</van-tag>
        </template>
      </van-cell>
      <z-van-cell title="连接配置" is-link inset @click="switchComponent('SetupLink')" />
      <MoreInfo />
    </van-cell-group>

    <van-cell-group inset title="运动与插件">
      <z-van-cell title="基础输出" is-link inset @click="switchComponent('SetupWalk')" />
      <z-van-cell title="插件设置" is-link inset @click="switchComponent('SetupPlugin')" />
    </van-cell-group>

    <van-cell-group inset title="模块">
      <z-van-cell title="底盘设置" is-link inset @click="switchComponent('SetupChassis')" />
      <z-van-cell title="云台设置" is-link inset @click="switchComponent('SetupPanTilt')" />
      <z-van-cell title="相机配置" is-link inset @click="switchComponent('SetupVideo')" />
      <z-van-cell title="屏幕设置" is-link inset @click="switchComponent('SetupScreen')" />
      <z-van-cell title="电池设置" is-link inset @click="switchComponent('SetupBattery')" />
    </van-cell-group>

    <van-cell-group inset title="其他">
      <z-van-cell title="配置导入导出" is-link inset @click="switchComponent('SetupOptions')" />
    </van-cell-group>
    <van-cell-group inset title="文档">
      <z-van-cell @click="openUrl('https://car.bullm.cn')" title="使用浏览器打开文档" is-link inset style="color: var(--van-primary-color)" />
    </van-cell-group>
  </ZPopupSetup>
  <component overlay-class="no-overlay" @closed="closed" :is="component" v-if="component" v-model:show="showComponent" />
</template>

<script setup lang="ts">
import { LinkOption, useStoreLink } from '@/store/link'
import ZPopupSetup from '@/components/base/ZPopupSetup.vue'
import MoreInfo from './MoreInfo.vue'
import { isSameLinkOption } from '@/utils/link'
import { openUrl } from '@/utils'
import { debugAutoOpenSetupModel } from '@/views/debug.ts'
import { useStoreUi } from '@/store/ui.ts'
import { useStoreWalk } from '@/store/control/walk.ts'
import { useStoreChassis } from '@/store/modules/chassis.ts'

const link = useStoreLink()
const ui = useStoreUi()

const show = defineModel<boolean>('show')

const chassis = useStoreChassis()

const components = {
  SetupLink: () => import('./Link/index.vue'),
  SetupPlugin: () => import('./Plugin/index.vue'),
  SetupWalk: () => import('./Walk/index.vue'),
  SetupVideo: () => import('./Camera/index.vue'),
  SetupScreen: () => import('./Screen/index.vue'),
  SetupChassis: () => import('./Chassis/index.vue'),
  SetupPanTilt: () => import('./PanTilt/index.vue'),
  SetupBattery: () => import('./Battery/index.vue'),
  SetupOptions: () => import('./Options/index.vue'),
}
const component = shallowRef<any>()
const showComponent = ref(false)
const componentName = ref('')

const closed = () => {
  component.value = null
}

// 显示组件
async function switchComponent(name: keyof typeof components) {
  component.value = null
  componentName.value = name
  showComponent.value = false
  component.value = await components[name]().then(m => m.default)
  setTimeout(() => {
    showComponent.value = true
  }, 0)
}

// 扫描链接
const onlink = ref<LinkOption[]>([])
const scanLoading = ref(false)

function open() {
  chassis.stop()
  scanLoading.value = true
  link
    .scan()
    .then(res => {
      const car = res.cars.find(car => car.mac === link.connectMac)
      onlink.value = car ? car.links : []
    })
    .finally(() => {
      scanLoading.value = false
    })
}

// 切换连接通道
function onShowIpDetail(item: LinkOption) {
  if (isSameLinkOption(item, link.connect.linkOption)) {
    showToast('当前连接')
    return
  }
  showConfirmDialog({
    title: '提示',
    message: `要切换到这个连接通道吗？`,
  }).then(() => {
    link.connectCar(link.connect.info!.mac, item)
  })
}

onMounted(() => {
  if (debugAutoOpenSetupModel) {
    switchComponent(debugAutoOpenSetupModel)
  }
})
</script>
