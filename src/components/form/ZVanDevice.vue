<template>
  <z-van-cell
    readonly
    v-bind="$attrs"
    :title="label"
    is-link
    inset
    @click="showPopup = true"
    :value="walkStore.deviceIdToName(modelValue)"
    :disabled="disabled" />
  <van-popup v-model:show="showPopup" round position="bottom" :teleport="teleport_new">
    <van-tabs shrink v-model:active="active" animated swipeable style="max-height: 100%">
      <van-tab v-for="tab in tabs" :key="tab.key" :title="tab.title" style="max-height: 100%">
        <van-cell-group>
          <van-cell clickable center @click="onItem(item)" v-for="item in tab.items.filter(x => !x.hide)">
            <template #title>
              {{ item.name }}
              <van-tag type="success" style="margin-left: 7px" v-if="item.id === modelValue">当前</van-tag>
            </template>
            <template #value>
              <ZFlex vertical :gap="3" align="flex-end" style="margin-left: 3px">
                <van-tag v-for="item2 in item.used" type="default" style="margin-left: 5px">
                  {{ item2.label }}
                </van-tag>
              </ZFlex>
            </template>
          </van-cell>
        </van-cell-group>
      </van-tab>
    </van-tabs>
    <van-icon
      name="cross"
      style="padding: 10px; cursor: pointer; position: absolute; top: 0; right: 0; font-size: 18px; color: #999"
      @click="showPopup = false" />

    <ZFieldBtn v-if="modelValue" :btns="[{ text: '取消选择', color: 'cancel', click: () => onItem({ id: '' }) }]" />
  </van-popup>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStoreWalk } from '@/store/control/walk.ts'
import { getPopupParentEl } from '@/utils/ui/element.ts'

const props = defineProps<{
  selectPwm?: boolean
  selectGroup?: boolean
  selectServo?: boolean
  selectDigital?: boolean
  disabled?: boolean
  label: string
  teleport?: string
}>()

const emits = defineEmits<{
  (e: 'change', value: string): void
}>()

const walkStore = useStoreWalk()
const modelValue = defineModel<string>()
const active = ref(0)

const showPopup = ref(false)

// 将van-tab组合成computed属性
const tabs = computed(() => {
  const tabList: { key: string; title: string; items: any[] }[] = []

  if (props.selectGroup) {
    tabList.push({
      key: 'group',
      title: '选择组合',
      items: walkStore.groups_show,
    })
  }

  if (props.selectServo) {
    tabList.push({
      key: 'servo',
      title: '选择舵机',
      items: walkStore.servos_show,
    })
  }

  if (props.selectPwm) {
    tabList.push({
      key: 'pwm',
      title: '选择PWM输出',
      items: walkStore.pwms_show,
    })
  }

  if (props.selectDigital) {
    tabList.push({
      key: 'digital',
      title: '选择电平输出',
      items: walkStore.digitals_show,
    })
  }

  return tabList
})

function onItem(item: { id: string }) {
  modelValue.value = item.id
  showPopup.value = false
  emits('change', item.id)
}

const teleport_new = ref(null as any)

onMounted(() => {
  teleport_new.value = props.teleport || getPopupParentEl()
})
</script>
<style lang="scss" scoped>
.van-cell-group {
  height: 60vh;
  max-height: 100%;
  overflow-y: auto;
}
.van-tabs :deep(.van-tabs__nav) {
  padding-right: 44px;
}
</style>
