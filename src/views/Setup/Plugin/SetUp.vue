<template>
  <ZPopupSetup :reset="reset" box-id="SetupPlugin">
    <van-field autocomplete="off" v-if="plugin" v-model="plugin.options.name" label="插件名称" placeholder="请输入插件名称" />
    <ZVanSelect
      v-if="plugin && plugin.icon && plugin.info.type !== 'no-ui'"
      v-model="plugin.options.position!"
      label="插件位置"
      :columns="[
        { text: '顶部', value: 'top' },
        { text: '左侧', value: 'left' },
        { text: '右侧', value: 'right' },
      ]" />
    <ZSelectIcon v-if="plugin && plugin.info.btnIcon" label="图标" v-model="plugin.options.icon" />
    <template v-if="plugin && configView">
      <SetUpItem v-for="item in configView" :item="item" :option="plugin?.options.config" />
    </template>
    <PluginComponent :key="plugin.id" v-if="isSetupVue && plugin" :plugin-id="plugin.id" type="setup" />
    <van-empty v-if="(!configView && !isSetupVue) || !plugin" image="error" description="这个模块不需要任何配置" />
  </ZPopupSetup>
</template>

<script setup lang="ts">
import ZPopupSetup from '@/components/base/ZPopupSetup.vue'
import { computed, shallowRef, ref, watchEffect, watch } from 'vue'
import { useStorePlugin } from '@/store/plugin.ts'
import PluginComponent from '@/plugin/component/PluginComponent.vue'
import SetUpItem from './SetUpItem.vue'

const pluginStore = useStorePlugin()

const props = defineProps<{
  pluginId: string
}>()

const plugin = computed(() => {
  return pluginStore.list.find(o => o.id === props.pluginId)
})

const configView = computed(() => {
  return plugin.value?.configView
})

const isSetupVue = computed(() => {
  return !!plugin.value?.setup
})

function reset() {
  showConfirmDialog({
    title: '咩',
    message: '确认要重置咩？',
  }).then(() => {
    if (!plugin.value) return
    pluginStore.resetPluginById(plugin.value.id)
    showToast('重置成功')
  })
}
</script>

<style scoped lang="scss"></style>
