<template>
  <van-cell v-if="showRight" v-bind="$attrs" :title="label" is-link :value="modelValue ? toHexStr(modelValue) : placeholder" @click="onShow" />
  <van-field
    v-else
    :disabled="disabled"
    readonly
    v-bind="$attrs"
    :label="label"
    is-link
    inset
    :placeholder="placeholder"
    @click="onShow"
    :model-value="modelValue ? toHexStr(modelValue) : undefined">
    <template #right-icon>
      <slot name="right-icon" />
    </template>
  </van-field>
  <van-action-sheet @open="init()" v-model:show="showPopup" title="选择I2C地址" :teleport="teleport_new">
    <van-cell-group>
      <van-cell clickable @click="onItem(item)" v-for="item in i2c.list">
        <template #title>
          {{ item.name }}
          <van-tag type="success" style="margin-left: 7px" v-if="item.value === modelValue">当前</van-tag>
        </template>
        <template #value>
          <van-tag type="default" v-if="item.used_label">{{ item.used_label }}</van-tag>
        </template>
      </van-cell>
    </van-cell-group>
    <van-notice-bar mode="closeable">右侧已使用的标记可能不全，就注意地址是否真实使用 ！</van-notice-bar>
    <ZFieldBtn v-if="modelValue" :btns="[{ text: '取消选择', color: 'cancel', click: () => onItem() }]" />
  </van-action-sheet>
</template>
<script setup lang="ts">
import { toHexStr } from '@/utils'
import { useStoreI2C } from '@/store/modules/i2c.ts'
import { getPopupParentEl } from '@/utils/ui/element.ts'

const props = defineProps<{
  label: string
  placeholder?: string
  teleport?: string
  disabled?: boolean
  showRight?: boolean
}>()

const i2c = useStoreI2C()
const modelValue = defineModel<number>()

const showPopup = ref(false)

onMounted(() => {
  init()
})

function onShow() {
  if (props.disabled) return
  showPopup.value = true
}

function init() {
  i2c.refresh().catch(err => {
    showToast('获取I2C地址列表失败了')
    showPopup.value = false
    console.error(err)
  })
}

function onItem(item?: { value?: number }) {
  modelValue.value = item?.value
  showPopup.value = false
}

const teleport_new = ref(null as any)

onMounted(() => {
  teleport_new.value = props.teleport || getPopupParentEl()
})
</script>
<style lang="scss" scoped>
.van-cell-group {
  height: 50vh;
  overflow-y: auto;
}
</style>
