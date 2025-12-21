<template>
  <van-cell-group style="width: 220px">
    <van-cell title="当前状态" :label="link.connect.info?.name || link.connect.info?.mac" style="--van-cell-label-margin-top: 0">
      <template #value>
        <!--               connectCar(op)-->
        <span :style="{ color: lintState[link.connect.state].color }">
          {{ lintState[link.connect.state].text }}
        </span>
      </template>
    </van-cell>
    <!--          <van-cell v-if="link.isLink" title="小车信号强度">-->
    <!--            <template #value>-->
    <!--              <span :style="{ color: link.connect.strength > -50 ? 'var(&#45;&#45;van-primary-color)' : 'red' }">-->
    <!--                {{ link.connect.strength + 'db' }}-->
    <!--              </span>-->
    <!--            </template>-->
    <!--          </van-cell>-->
    <van-cell v-if="link.isLink" title="丢包率 / 延迟">
      <template #value>
        <span :style="{ color: ValidPackage < 10 ? 'var(--van-primary-color)' : 'red' }">
          {{ ValidPackage + '%' }}
        </span>
        /
        <span :style="{ color: camera.delay < 100 ? 'var(--van-primary-color)' : 'red' }">{{ camera.delay }}ms</span>
      </template>
    </van-cell>
    <van-cell is-link @click="onLink(item)" v-for="item in onlink" :title="item.name" :value="'在线'">
      <template #value>
        {{ isSameLinkOption(item, link.connect.linkOption) ? '当前' : '在线' }}
      </template>
      <template #right-icon>
        <div style="vertical-align: middle; display: flex; align-items: center">
          <icon-mdi-signal-variant style="margin-left: 2px; color: var(--van-primary-color); font-size: 17px" />
        </div>
      </template>
    </van-cell>
    <van-button
      style="height: 38px; width: 100%; margin-bottom: -1px"
      :loading="scanLoading"
      square
      color="var(--van-primary-color)"
      @click="onScanCar">
      扫描连接通道
    </van-button>
  </van-cell-group>
</template>

<script setup lang="ts">
import { LinkOption, useStoreLink } from '@/store/link'
import { useStoreCamera } from '@/store/modules/camera.ts'
import { isSameLinkOption } from '@/utils/link'
import { ValidPackage } from '@/utils/car/udp.ts'

const link = useStoreLink()
const camera = useStoreCamera()

const lintState = {
  success: { text: '已连接', color: 'var(--van-primary-color)' },
  error: { text: '连接错误', color: 'red' },
  loading: { text: '连接中', color: '#3498db' },
  ununited: { text: '未连接', color: '#3498db' },
}

const onlink = ref<LinkOption[]>([])

const scanLoading = ref(false)

function onScanCar() {
  scanLoading.value = true
  link
    .scan()
    .then(res => {
      const car = res.cars.find(car => car.mac === link.connectMac)
      if (car) {
        onlink.value = car.links
      } else {
        onlink.value = []
      }
    })
    .finally(() => {
      scanLoading.value = false
    })
}

onMounted(() => {
  onScanCar()
})

function onLink(item: LinkOption) {
  if (isSameLinkOption(item, link.connect.linkOption)) {
    showToast('当前连接')
    return
  }
  link
    .connectCar(link.connectMac, item)
    .then(res => {
      showToast({ type: 'success', message: '连接成功' })
    })
    .catch(e => {
      showToast('连接失败了：' + e.message)
    })
}
</script>

<style scoped lang="scss"></style>
