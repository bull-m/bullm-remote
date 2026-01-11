<template>
  <ZPopupSetup :reset="() => walkStore.reset()" title="基础输出" box-id="SetupWalk">
    <van-tabs style="z-index: 999; position: sticky; top: calc(var(--nav-bar-height) * -1)" v-model:active="active">
      <van-tab v-for="item in list" :key="item.label" :title="item.label" :name="item.label" />
    </van-tabs>
    <Component :is="component" :key="active" />
  </ZPopupSetup>
</template>

<script setup lang="ts">
import { useStoreWalk } from '@/store/control/walk.ts'
import SetupPinGroups from './SetupPinGroups.vue'
import SetupPinServos from './SetupPinServos.vue'
import SetupPinExtend from './SetupPinExtend.vue'
import SetupPinPwms from './SetupPinPwms.vue'
import SetupPinDigitals from './SetupPinDigitals.vue'
import ZPopupSetup from '@/components/base/ZPopupSetup.vue'

const walkStore = useStoreWalk()

const list = [
  {
    label: '扩展',
    component: SetupPinExtend,
  },
  {
    label: 'PWM',
    component: SetupPinPwms,
  },
  {
    label: '电平',
    component: SetupPinDigitals,
  },
  {
    label: '舵机',
    component: SetupPinServos,
  },
  {
    label: '电机驱动',
    component: SetupPinGroups,
  },
]
const active = ref(list[0].label)
const component = computed(() => {
  return list.find(item => item.label === active.value)?.component
})
</script>
<style lang="scss" scoped>
//.van-tabs{
//  :deep(.van-tabs__wrap){
//    position: sticky;
//    top: calc(var(--van-tabs-line-height) * -1 - 1px);
//    z-index: 99;
//  }
//}
</style>
