<template>
  <component
    v-model:config="plugin.options.config"
    :plugin="plugin"
    :is="is"
    v-if="is && plugin"
    :position="plugin.options.position"
    class="plugin-component"></component>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useStorePlugin } from '@/store/plugin.ts'

const pluginStore = useStorePlugin()

const props = defineProps<{
  pluginId: string
  type: 'popup' | 'icon' | 'template' | 'setup'
}>()

const plugin = computed(() => pluginStore.list.find(item => item.id === props.pluginId))
provide('plugin', plugin.value)
provide('config', plugin.value?.options.config)
provide('options', plugin.value?.options)

const is = shallowRef('' as string | object)
watch(
  plugin,
  plugin => {
    if (plugin && plugin?.[props.type]) {
      is.value = plugin?.[props.type]?.()
    }
  },
  { immediate: true }
)
</script>
