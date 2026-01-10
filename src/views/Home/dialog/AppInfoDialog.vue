<template>
  <ZPopupSetup @open="open">
    <van-cell-group title="版本信息" inset>
      <van-cell title="App版本" :value="info.appVersion" />
      <van-cell title="运行环境" :value="env" />
      <van-cell v-if="info.isTauri" title="Tauri版本" :value="info.tauriVersion" />
    </van-cell-group>

    <van-cell-group title="开源信息" inset>
      <van-cell title="版权所有" value="© 2025 牛明工作室 / yy祝"></van-cell>
      <van-cell title="开源地址" is-link @click="openUrl('https://github.com/bull-m/bullm-remote')" label="https://github.com/bull-m/bullm-remote" />
      <van-cell title="开源许可" label="我们只希望您在修改我们的时候不要删除我们的名字，至少曾经我们来过 ƪ(˘⌣˘)ʃ">
        <template #value>
          <van-tag type="primary" size="large">MIT License</van-tag>
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group title="感谢他们" inset>
      <van-notice-bar>客户端部分使用了这些框架或者库，感谢他们 (按名称排序)</van-notice-bar>
      <van-cell v-for="item in all_lib" :title="item[0]" :value="item[1]" />
    </van-cell-group>
  </ZPopupSetup>
</template>

<script setup lang="ts">
import { getTauriVersion } from '@tauri-apps/api/app'
import { isTauri } from '@tauri-apps/api/core'
import packageJson from '../../../../package.json'
import { openUrl } from '@/utils'
import { getAppVersion } from '@/utils/system/os.ts' // 确保你的 Vite 配置允许直接导入 JSON

const info = ref({
  appVersion: '',
  tauriVersion: '',
  isTauri: false,
})
// 运行环境
const env = computed(() => {
  return isTauri() ? 'Tauri' : 'Web'
})

// 转数组并排序，@开头的排后面
const all_lib = computed(() => {
  return Object.entries({
    tauri: info.value.tauriVersion,
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  }).sort((a, b) => {
    if (a[0].startsWith('@') && !b[0].startsWith('@')) {
      return 1
    }
    if (!a[0].startsWith('@') && b[0].startsWith('@')) {
      return -1
    }
    return a[0].localeCompare(b[0])
  })
})

async function open() {
  info.value.appVersion = getAppVersion()
  info.value.tauriVersion = await getTauriVersion()
  info.value.isTauri = isTauri()
}
</script>

<style scoped lang="scss"></style>
