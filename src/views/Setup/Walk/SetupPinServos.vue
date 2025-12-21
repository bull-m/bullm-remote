<template>
  <van-cell-group inset title="舵机">
    <template #title>
      <ZFlex align="center" style="margin-bottom: -10px" :gap="5">
        舵机
        <van-button type="primary" size="mini" style="padding: 0 10px; margin-left: auto" @click="onForm(def)">添加</van-button>
        <van-button type="warning" size="mini" style="padding: 0 10px" @click="walkStore.reset(OPTIONS.WALK_SERVOS)">重置</van-button>
      </ZFlex>
    </template>
    <ZNullCell v-if="walkStore.servos_show.filter(x => !x.hide).length == 0">没有舵机</ZNullCell>

    <van-cell
      v-for="(item, i) in walkStore.servos_show.filter(x => !x.hide)"
      @click="onForm(item)"
      class="group-cell"
      inset
      center
      clickable
      :label="`当前状态：${item.state === 255 ? '关闭' : `${item.state}°`}`"
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
  </van-cell-group>
  <van-action-sheet v-model:show="showAction" :title="index != -1 ? '编辑舵机' : '新增舵机'">
    <van-form ref="formRef" @submit="onSubmit" :submit-on-enter="false">
      <van-notice-bar v-if="form.builtIn">该舵机来自扩展模块或是内置的，部分参数不允许修改</van-notice-bar>
      <van-field
        label="名称"
        placeholder="舵机名称(最多10个字符)"
        v-model.trim="form.name"
        :rules="[{ required: true, message: '请输入舵机名称' }]"
        required
        :maxlength="10" />
      <!--   选择有舵机功能的引脚   -->
      <z-van-pin
        label="输出引脚"
        placeholder="选择引脚"
        v-model="form.pin"
        :rules="[{ required: true, message: '请选择引脚' }]"
        required
        func="servo" />
      <van-notice-bar v-if="isExtendPwm && hz && hz > 300" mode="closeable" color="var(--van-warning-color)">
        你选择这个扩展版的引脚的PWM频率已经超过300Hz，大部分舵机都无法稳定工作，请谨慎选择。建议50Hz，如需修改请修改扩展版的频率。
      </van-notice-bar>
      <ZVanNumber
        label="默认角度"
        :placeholder="`启动时默认角度 ${min} ~ ${max} (留空则默认不启用)`"
        v-model.number="form.def"
        colon
        :min="min"
        :max="max"
        right-label="°"
        :rules="[
          {
            validator: () => (typeof form.def === 'undefined' || (form.def >= min && form.def <= max) ? true : '范围应该在最小角度和最大角度之间'),
          },
        ]" />
      <ZVanNumber
        label="最小角度"
        :placeholder="`${SERVO_MIN} ~ ${max} （默认${SERVO_MIN}）`"
        v-model.number="form.min"
        colon
        :min="SERVO_MIN"
        :max="max"
        right-label="°" />
      <ZVanNumber
        label="最大角度"
        :placeholder="`${min} ~ ${SERVO_MAX} （默认${SERVO_MAX}）`"
        v-model.number="form.max"
        colon
        :min="min"
        :max="SERVO_MAX"
        right-label="°" />
      <ZVanSwitch label="重连时回到默认角度" v-model="form.reset" />
      <ZVanNumber
        :disabled="isExtendPwm"
        label="频率"
        :placeholder="`${SERVO_hz_LOW} ~ ${SERVO_hz_HIGH} （默认${SERVO_hz_DEFAULT}Hz）`"
        @update:model-value="!isExtendPwm && (form.hz = $event)"
        :model-value="hz"
        colon
        :min="SERVO_hz_LOW"
        :max="SERVO_hz_HIGH"
        :right-label="isExtendPwm ? '（扩展版频率,不可更改）Hz' : 'Hz'" />
      <ZVanNumber
        label="脉宽最小值"
        :placeholder="`${SERVO_uS_LOW} ~ ${SERVO_uS_HIGH} （默认${SERVO_uS_LOW_DEFAULT}μs）`"
        v-model.number="form.pulse_min"
        colon
        :min="SERVO_uS_LOW"
        :max="SERVO_uS_HIGH"
        right-label="μs" />
      <ZVanNumber
        label="脉宽最大值"
        :placeholder="`${SERVO_uS_LOW} ~ ${SERVO_uS_HIGH} （默认${SERVO_uS_HIGH_DEFAULT}μs）`"
        v-model.number="form.pulse_max"
        colon
        :min="SERVO_uS_LOW"
        :max="SERVO_uS_HIGH"
        right-label="μs"
        :rules="[
          {
            validator: () =>
              (form.pulse_min ?? SERVO_uS_LOW_DEFAULT) <= (form.pulse_max ?? SERVO_uS_HIGH_DEFAULT) ? true : '脉宽最小值不能大于脉宽最大值',
          },
        ]" />
      <ZFieldBtn
        sticky
        :btns="[
          { text: '删除', type: 'danger', click: () => onDelect(index), show: index != -1 },
          { text: index != -1 ? '修改' : '添加', color: 'submit', click: () => formRef?.submit() },
        ]" />
    </van-form>
  </van-action-sheet>
</template>

<script setup lang="ts">
import { DeviceId, ServoType, useStoreWalk } from '@/store/control/walk.ts'
import { showActionSheet } from '@/utils/ui/dialog.ts'
import ZVanPin from '@/components/form/ZVanPin.vue'
import {
  OPTIONS,
  PREFIX,
  SERVO_MAX,
  SERVO_MIN,
  SERVO_uS_LOW_DEFAULT,
  SERVO_uS_HIGH_DEFAULT,
  SERVO_hz_LOW,
  SERVO_hz_HIGH,
  SERVO_hz_DEFAULT,
  SERVO_uS_HIGH,
  SERVO_uS_LOW,
} from '@/constants'
import ZFlex from '@/components/base/ZFlex.vue'
import { generateRandomId } from '@/utils'
import type { FormInstance } from 'vant'
import ZVanNumber from '@/components/form/ZVanNumber.vue'

const walkStore = useStoreWalk()

const formRef = ref<FormInstance>()

const showAction = ref(false)

const def: ServoType = {
  id: '',
  name: '',
  // type: '180',
  pin: '',
  // def: -1,
  // hz: 50,
  // pulse_min: SERVO_uS_LOW,
  // pulse_max: 2500,
  // reset: false,
}
const form = ref<ServoType>({ ...def })
const min = computed(() => form.value.min ?? SERVO_MIN)
const max = computed(() => form.value.max ?? SERVO_MAX)
// 编辑的下标
const index = computed(() => {
  return walkStore.servos.findIndex(item => item.id === form.value.id)
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
    message: '真的要删除这个舵机吗？',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  }).then(() => {
    walkStore.servos.splice(i, 1)
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
    let id = DeviceId.servo(
      generateRandomId(
        5,
        walkStore.servos.map(item => item.id)
      )
    )
    walkStore.servos.push({ ...form.value, id })
  } else {
    walkStore.servos[index.value] = { ...form.value }
  }
  showAction.value = false
}
</script>
<style lang="scss" scoped>
.group-cell {
  --van-cell-value-font-size: 12px;
  --van-cell-label-margin-top: 0px;
}
</style>
