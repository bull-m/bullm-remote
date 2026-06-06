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
      <van-cell title="实时电压" :value="voltage + 'V'" />
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
import { useSensor } from '@/plugin/export.ts'

const sensor = useSensor('power')

const voltage = computed(() => (sensor.values?.[0]?.value || 0) / 1000)

const voltageMapping = {
  '2S': [7.2, 8.4],
  '3S': [10.8, 12.6],
}
const type = computed(() => {
  if (voltage.value < 6 || voltage.value > 13) {
    return 'unknown'
  }
  return voltage.value > 8.6 ? '3S' : '2S'
})

const batteryPercent = computed(() => {
  if (type.value === 'unknown') {
    return -1
  }
  let [low, high] = voltageMapping[type.value]
  if (voltage.value > high) {
    return 100
  }
  if (voltage.value < low) {
    return 0
  }
  return Math.round((((voltage.value - low) / (high - low)) * 100) / 3) * 3
})

const loading = ref(false)

function refresh() {
  if (loading.value) {
    showToast('正在获取，不要急 ^_^')
    return
  }
  loading.value = true
  sensor
    .refresh()
    .then(res => {
      showToast('更新电压成功')
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<style scoped lang="scss"></style>
