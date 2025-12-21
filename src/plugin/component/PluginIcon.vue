<template>
  <ZPopover :placement="placement" v-if="plugin && plugin.icon" v-model:show="plugin.showPopup" :key="plugin.id">
    <PluginComponent class="item" :class="plugin.options.position" :plugin-id="plugin.id" type="icon" />
    <template #popup v-if="plugin.popup">
      <PluginComponent :plugin-id="plugin.id" type="popup" />
    </template>
  </ZPopover>
</template>

<script setup lang="ts">
import { PositionEnum, useStorePlugin } from '@/store/plugin.ts'
import PluginComponent from '@/plugin/component/PluginComponent.vue'

const pluginStore = useStorePlugin()

const props = defineProps<{
  pluginId: string
}>()

const plugin = computed(() => pluginStore.list.find(item => item.id === props.pluginId))

const placement = computed(() => {
  return {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  }[plugin.value?.options.position as PositionEnum]
})
</script>

<style scoped lang="scss">
.item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s;
  cursor: pointer;
  user-select: none;
  //border-radius: 5px;

  //&.top {
  //  height: var(--top-height);
  //  //margin-left: 10px;
  //}

  //&.right {
  //  width: calc(var(--side-size) * 0.9);
  //  margin-bottom: 10px;
  //}

  //&:active {
  //  background-color: rgba($color: #000000, $alpha: 0.1);
  //}
}
</style>
