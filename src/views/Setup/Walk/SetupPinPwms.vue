<template>
  <van-cell-group inset>
    <template #title>
      <ZFlex align="center" style="margin-bottom: -10px" :gap="5">
        PWM输出
        <van-button type="primary" size="mini" style="padding: 0 10px; margin-left: auto" @click="onForm(def)">添加</van-button>
        <van-button type="warning" size="mini" style="padding: 0 10px" @click="walkStore.reset(OPTIONS.WALK_PWMS)">重置</van-button>
      </ZFlex>
    </template>
    <ZNullCell v-if="list.length == 0">没有PWM输出</ZNullCell>
    <van-cell
      v-for="(item, i) in list.filter(x => !x.builtIn && !x.hide)"
      @click="onForm(item)"
      class="group-cell"
      inset
      center
      clickable
      :label="`当前状态：${walkStore.device_state[item.id]?.value}`"
      :value="item.pin_label">
      <template #title>
        <div style="display: flex; align-items: center">
          {{ item.name }}
          <ZFlex vertical :gap="3" align="flex-start" style="margin-left: 3px">
            <van-tag v-for="item2 in item.used" type="success" style="margin-left: 5px">
              {{ item2.label }}
            </van-tag>
          </ZFlex>
        </div>
      </template>
    </van-cell>
    <ZCollapse v-if="list.filter(x => x.builtIn && !x.hide).length > 0">
      <template #title>
        其他
        <van-icon @click.stop="onTip" name="question-o" color="#3498db" />
      </template>
      <van-cell class="group-cell" clickable v-for="(item, i) in list.filter(x => x.builtIn)" inset center :value="item.from">
        <template #title>
          <div style="display: flex; align-items: center">
            {{ item.name }}
            <van-tag type="success" style="margin-left: 5px" v-if="item.used_label">
              {{ item.used_label }}
            </van-tag>
          </div>
        </template>
      </van-cell>
    </ZCollapse>
  </van-cell-group>
  <van-action-sheet v-model:show="showAction" :title="index != -1 ? '编辑PWM输出' : '新增PWM输出'">
    <van-form ref="formRef" @submit="onSubmit" :submit-on-enter="false">
      <van-notice-bar v-if="form.builtIn">该PWM输出来自扩展模块或是内置的，部分参数不允许修改</van-notice-bar>
      <van-field
        label="名称"
        placeholder="PWM输出名称(最多10个字符)"
        v-model.trim="form.name"
        :rules="[{ required: true, message: '请输入PWM输出名称' }]"
        required
        :maxlength="10" />
      <!--   选择有pwm功能的引脚   -->
      <z-van-pin
        label="输出引脚"
        placeholder="选择引脚"
        v-model="form.pin"
        :rules="[{ required: true, message: '请选择引脚' }]"
        required
        func="pwm" />
      <ZVanNumber
        label="默认占空比"
        :placeholder="`启动时默认占空比 (留空则为${min})`"
        v-model="form.def"
        colon
        :min="min"
        :max="max"
        :right-label="`${min}~${max}`"
        :rules="[
          {
            validator: () =>
              typeof form.def === 'undefined' || (form.def >= min && form.def <= max) ? true : '范围应该在最小占空比和最大占空比之间',
          },
        ]" />
      <ZVanNumber
        label="最小占空比"
        :placeholder="`默认 ${PWM_MIN}`"
        v-model.number="form.min"
        colon
        :min="PWM_MIN"
        :max="max"
        :right-label="`${PWM_MIN}~${max}`" />
      <ZVanNumber
        label="最大占空比"
        :placeholder="`默认 ${PWM_MAX}`"
        v-model.number="form.max"
        colon
        :min="min"
        :max="PWM_MAX"
        :right-label="`${min}~${PWM_MAX}`" />
      <ZVanSwitch label="重连时回到默认占空比" v-model="form.reset" />
      <ZVanNumber
        :disabled="isExtendPwm"
        label="频率"
        placeholder="40 ~ 35000 （默认1000Hz）"
        @update:model-value="!isExtendPwm && (form.hz = $event)"
        :model-value="hz"
        colon
        :min="40"
        :max="35000"
        :right-label="isExtendPwm ? '（扩展版频率,不可更改）Hz' : 'Hz'" />

      <ZFieldBtn
        sticky
        :btns="[
          {
            text: '删除',
            type: 'danger',
            click: () => onDelect(index),
            show: !form.builtIn && index != -1,
          },
          { text: index != -1 ? '修改' : '添加', color: 'submit', click: () => formRef?.submit() },
        ]" />
    </van-form>
  </van-action-sheet>
</template>

<script setup lang="ts">
import { DeviceId, PwmType, ServoType, useStoreWalk } from '@/store/control/walk.ts'
import ZVanPin from '@/components/form/ZVanPin.vue'
import { OPTIONS, PREFIX, PWM_MAX, PWM_MIN } from '@/constants'
import ZFlex from '@/components/base/ZFlex.vue'
import { generateRandomId } from '@/utils'
import type { FormInstance } from 'vant'
import ZVanNumber from '@/components/form/ZVanNumber.vue'
import ZSwipeCell from '@/components/base/ZSwipeCell.vue'

const walkStore = useStoreWalk()

const list = computed(() => {
  return walkStore.pwms_show.filter(x => !x.hide)
})

const formRef = ref<FormInstance>()

const showAction = ref(false)

const def: PwmType = {
  id: '',
  name: '',
  pin: '',
}

const form = ref<PwmType>({ ...def })
const min = computed(() => form.value.min ?? PWM_MIN)
const max = computed(() => form.value.max ?? PWM_MAX)

// 编辑的下标
const index = computed(() => {
  return walkStore.pwms.findIndex(item => item.id === form.value.id)
})

const pin = computed(() => {
  return walkStore.pins_obj[form.value.pin]
})
// 是否是扩展版
const isExtendPwm = computed(() => {
  return Boolean(form.value.pin && pin.value?.type === 'extend-pwm')
})
// 频率
const hz = computed(() => {
  if (isExtendPwm.value && pin.value?.type === 'extend-pwm') {
    return pin.value?.hz
  }
  return form.value.hz
})

function onForm(item: ServoType) {
  showAction.value = true
  form.value = { ...item }
  formRef.value?.resetValidation()
}

function onDelect(i: number) {
  showConfirmDialog({
    teleport: '#SetupWalk',
    title: '真的吗？',
    message: '真的要删除这个PWM输出吗？',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  }).then(() => {
    walkStore.pwms.splice(i, 1)
    showAction.value = false
  })
}

function onSubmit() {
  if (isExtendPwm.value) {
    delete form.value.hz // 扩展版舵机不能设置频率
  }
  if (index.value === -1) {
    // 新增
    // 生成id
    let id = DeviceId.pwm(
      generateRandomId(
        5,
        walkStore.pwms.map(item => item.id)
      )
    )
    walkStore.pwms.push({ ...form.value, id })
  } else {
    walkStore.pwms[index.value] = { ...form.value }
  }
  showAction.value = false
}

function onTip() {
  showDialog({
    title: '这是什么？',
    message: '这是由扩展板自动生成一些可直接用于PWM输出的的引脚；如果引脚已经被使用，则不会显示',
  })
}
</script>
<style lang="scss" scoped>
.group-cell {
  --van-cell-value-font-size: 12px;
  --van-cell-label-margin-top: 0px;
}
</style>
