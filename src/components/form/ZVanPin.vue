<template>
  <van-field readonly v-bind="$attrs" :label="label" is-link inset @click="showPopup = true" :model-value="walkStore.deviceIdToName(modelValue)" />
  <van-action-sheet v-model:show="showPopup" title="选择引脚" :teleport="teleport_new">
    <van-cell-group>
      <van-cell clickable @click="onItem(item)" v-for="item in pins" :label="item.from">
        <template #title>
          {{ item.name }}
          <van-tag type="success" style="margin-left: 7px" v-if="item.id === modelValue">当前</van-tag>
        </template>
        <template #value>
          <van-tag type="success" v-if="item.used_label">{{ item.used_label }}</van-tag>
        </template>
      </van-cell>
    </van-cell-group>
    <ZFieldBtn v-if="modelValue" sticky :btns="[{ text: '取消选择', color: 'cancel', click: () => onItem({ id: '' }) }]" />
  </van-action-sheet>
</template>
<script setup lang="ts">
import { PinFuncType, useStoreWalk } from '@/store/control/walk.ts'
import { getPopupParentEl } from '@/utils/ui/element.ts'

const props = defineProps<{
  label: string
  func?: PinFuncType[] | PinFuncType
  teleport?: string
}>()

const walkStore = useStoreWalk()
const modelValue = defineModel<string>()

const showPopup = ref(false)

const pins = computed(() => {
  return walkStore.pins_use.filter(pin => {
    if (props.func && Array.isArray(props.func)) {
      return props.func.some(f => pin.func.includes(f))
    }
    if (props.func) {
      return pin.func.includes(props.func)
    }
    return true
  })
})

function onItem(item: { id: string }) {
  modelValue.value = item.id
  showPopup.value = false
}

const teleport_new = ref(null as any)

onMounted(() => {
  teleport_new.value = props.teleport || getPopupParentEl()
})
</script>
<style lang="scss" scoped></style>
