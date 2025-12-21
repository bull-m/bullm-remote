<template>
  <ZCollapse title="主控信息" @open="init()">
    <div style="padding: 0 10px">
      <van-cell clickable title="主控芯片">{{ info.chipModel }}</van-cell>
      <van-cell clickable title="SDK版本">{{ info.sdkVersion }}</van-cell>
      <van-cell clickable title="Flash大小">{{ bytesToMb(info.flashSize) }}</van-cell>
      <van-cell clickable title="程序大小">{{ bytesToKb(info.sketchSize) }}</van-cell>
      <van-cell clickable title="主程序分区剩余空间">{{ bytesToKb(info.sketchFree) }}</van-cell>
      <van-cell clickable title="PSRAM大小/已用">
        {{ bytesToKb(info.psramSize) + '/' + bytesToKb(info.psramSize - info.psramFree) }}
      </van-cell>
      <van-cell clickable title="堆大小/已用">
        {{ bytesToKb(info.heapSize) + '/' + bytesToKb(info.heapSize - info.heapFree) }}
      </van-cell>
      <ZFieldBtn :btns="[{ text: '刷新', type: 'primary', click: init, loading: loading }]"></ZFieldBtn>
    </div>
  </ZCollapse>
</template>

<script setup lang="ts">
import { WsSendFuncMode } from '@/utils/car/message.ts'

const loading = ref(false)

const info = ref({
  chipModel: '',
  sdkVersion: '',

  psramSize: 0, // 外部 PSRAM 大小
  psramFree: 0, // 外部 PSRAM 剩余空间
  flashSize: 0, // 内部 Flash 大小
  heapSize: 0, // 堆大小
  heapFree: 0, // 堆剩余空间
  sketchSize: 0, // 程序大小
  sketchFree: 0, // 程序剩余空间
})

function bytesToKb(bytes: number) {
  return Math.round(bytes / 1024) + 'KB'
}

function bytesToMb(bytes: number) {
  return Math.round(bytes / 1024 / 1024) + 'MB'
}

function init(tip = false) {
  loading.value = true
  WsSendFuncMode('info', 'get')
    .then(res => {
      info.value = { ...info.value, ...res }
    })
    .then(() => {
      tip && showToast('刷新成功')
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<style scoped lang="scss"></style>
