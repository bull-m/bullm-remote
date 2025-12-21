<template>
  <div style="width: 190px">
    <van-cell-group>
      <van-cell title="剩余电量" clickable @click="refresh">
        <template #value>
          <van-loading type="spinner" color="#1989fa" v-if="loading" size="24" />
          <van-tag type="success" size="large" v-else-if="batteryPercent > 30">
            {{ batteryPercent + '%' }}
          </van-tag>
          <van-tag type="warning" size="large" v-else-if="batteryPercent > 15">
            {{ batteryPercent + '%' }}
          </van-tag>
          <van-tag type="danger" size="large" v-else>{{ batteryPercent + '%' }}</van-tag>
        </template>
      </van-cell>
      <van-cell title="实时电压" :value="battery.voltage + 'V'" />
      <van-cell title="电池类型" :value="type" />
      <van-cell>
        <template #title>
          <van-tag size="large" type="default">注意：电量精度为3%</van-tag>
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { useBattery } from '@/plugin/export.ts'

const battery = useBattery()

const voltageMapping = {
  '2S': [7.2, 8.4],
  '3S': [10.8, 12.6],
}
const type = computed(() => {
  if (battery.voltage < 6 || battery.voltage > 13) {
    return 'unknown'
  }
  return battery.voltage > 8.6 ? '3S' : '2S'
})

const batteryPercent = computed(() => {
  if (type.value === 'unknown') {
    return -1
  }
  let [low, high] = voltageMapping[type.value]
  if (battery.voltage > high) {
    return 100
  }
  if (battery.voltage < low) {
    return 0
  }
  return Math.round((((battery.voltage - low) / (high - low)) * 100) / 3) * 3
})

const loading = ref(false)

function refresh() {
  if (loading.value) {
    showToast('正在获取，不要急 ^_^')
    return
  }
  loading.value = true
  battery
    .getBattery()
    .then(res => {
      showToast('获取电压成功')
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<style scoped lang="scss"></style>
