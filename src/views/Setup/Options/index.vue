<template>
  <ZPopupSetup :reset="() => chassisStore.reset()" title="配置导入导出">
    <van-cell-group inset title="当前小车">
      <van-cell title="插件配置" is-link inset @click="onPlugins()" />
    </van-cell-group>
    <van-cell-group inset title="其他配置">
      <van-cell title="全部的小车插件配置" is-link inset @click="onPlugins(true)" />
      <van-cell title="连接配置" is-link inset @click="onLink" />
    </van-cell-group>
  </ZPopupSetup>
</template>

<script setup lang="ts">
import { useStoreChassis } from '@/store/modules/chassis.ts'
import { Store } from '@tauri-apps/plugin-store'
import { useStoreLink } from '@/store/link'
import { getVersion } from '@tauri-apps/api/app'
import { save } from '@tauri-apps/plugin-dialog'
import { writeTextFile } from '@tauri-apps/plugin-fs'

const chassisStore = useStoreChassis()
const link = useStoreLink()

async function getRoot() {
  return {
    version: await getVersion(),
    data: {},
  }
}

async function onPlugins(isAll = false) {
  const root = await getRoot()
  const store = await Store.load('plugins.bin')
  if (isAll) {
    const keys = await store.keys()
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      root.data[key] = await store.get(key)
    }
  } else {
    let key = `plugins_${link.connectMac}`
    const op = await store.get(key)
    if (!op) {
      showToast('你的插件好像没有任何变动，无需导出')
      return
    }
    root.data[key] = op
  }
  const path = await onExport()
  if (!path) return
  await writeTextFile(path, JSON.stringify(root))
}

async function onLink() {
  const root = await getRoot()
  const op = localStorage.getItem('store_link')
  if (!op) {
    showToast('没有需要导出的数据')
    return
  }
  root.data['store_link'] = op
  console.log(root)
  const path = await onExport()
  if (!path) return
  await writeTextFile(path, JSON.stringify(root))
}

async function onExport() {
  return await save({
    title: '选择保存位置',
    defaultPath: '导出配置',
    filters: [
      {
        name: '配置文件',
        extensions: ['nmjson'],
      },
    ],
  })
}
</script>
<style lang="scss" scoped></style>
