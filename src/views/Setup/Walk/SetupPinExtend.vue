<template>
  <van-cell-group inset>
    <template #title>
      <ZFlex align="center" style="margin-bottom: -10px" :gap="5">
        扩展
        <van-button type="primary" size="mini" style="padding: 0 10px; margin-left: auto" @click="onForm(def, -1)">添加</van-button>
        <van-button type="warning" size="mini" style="padding: 0 10px" @click="walkStore.reset(OPTIONS.WALK_EXTENDS)">重置</van-button>
      </ZFlex>
    </template>

    <van-collapse v-model="activeNames" accordion>
      <van-collapse-item
        v-for="(item, i) in walkStore.extend_show"
        :name="i"
        title="扩展内容"
        :label="`频率：${item.hz}Hz`"
        inset
        center
        title-style="flex: 2;"
        clickable>
        <template #value>
          <div :style="{ color: !i2cStore.states[item.address] ? '#f00' : '' }">
            {{ `地址：${toHexStr(item.address)}${!i2cStore.states[item.address] ? '\n未连接' : ''}` }}
          </div>
        </template>
        <template #title>
          <div style="display: flex; align-items: center">
            {{ item.name }}
            <van-tag type="primary" style="margin-left: 5px" color="#8395a7">
              {{ type_name_map[item.type] }}
            </van-tag>
            <van-tag v-if="item.builtIn" type="primary" style="margin-left: 5px" color="#8395a7">板载</van-tag>
          </div>
        </template>
        <ZFieldBtn :btns="[{ text: '编辑当前扩展', color: 'submit', click: () => onForm(item as any, i) }]" />
        <!--    自定义引脚    -->
        <van-cell
          class="group-cell"
          clickable
          v-for="(item2, i) in item.pins?.filter(x => !x.hide)"
          inset
          center
          :title="item2.name"
          :label="'自定义: ' + item2.func.join(',')">
          <template #value>
            <ZFlex vertical :gap="3" align="flex-end">
              <van-tag v-for="item in walkStore.used_pins[item2.id]" type="success" style="margin-left: 5px">
                {{ item.label }}
              </van-tag>
            </ZFlex>
          </template>
        </van-cell>
        <!--    设备    -->
        <van-cell
          class="group-cell"
          clickable
          inset
          center
          v-for="(item2, i) in [
            ...item.pwms.map(x => ({ ...x, _label: 'PWM输出' })),
            ...item.digitals.map(x => ({ ...x, _label: '电平输出' })),
            ...item.servos.map(x => ({ ...x, _label: '舵机输出' })),
            ...item.groups.map(x => ({ ...x, _label: '电机驱动' })),
          ].filter(x => !x.hide)"
          :label="item2._label"
          :title="item2.name">
          <template #value>
            <ZFlex vertical :gap="3" align="flex-end">
              <van-tag v-for="item in walkStore.used_devices[item2.id]" type="success" style="margin-left: 5px">
                {{ item.label }}
              </van-tag>
            </ZFlex>
          </template>
        </van-cell>
      </van-collapse-item>
    </van-collapse>
  </van-cell-group>
  <van-action-sheet v-model:show="showAction" :title="editMode != -1 ? '编辑扩展' : '新增扩展'">
    <van-form ref="formRef" @submit="onSubmit" :submit-on-enter="false">
      <van-notice-bar v-if="form.builtIn">该扩展是内置的，部分参数不允许修改</van-notice-bar>
      <van-field
        required
        colon
        :disabled="form.builtIn"
        :maxlength="10"
        v-model.trim="form.name"
        name="name"
        label="名称"
        placeholder="扩展名称(最多10个字符)"
        :rules="[{ required: true, message: '请输入扩展名称' }]" />
      <van-field
        required
        :disabled="form.builtIn"
        :model-value="type_name_map[form.type]"
        :is-link="!form.builtIn"
        readonly
        name="type"
        label="类型"
        placeholder="选择类型"
        @click="showType" />
      <ZVanI2C
        required
        colon
        :disabled="form.builtIn"
        v-model="form.address"
        name="address"
        label="地址"
        placeholder="选择I2C地址"
        :rules="[{ required: true, message: '请选择设备I2C地址' }]">
      </ZVanI2C>
      <van-field
        v-if="form.chip == 'pca9685'"
        required
        colon
        type="digit"
        :min="1"
        :max="3500"
        v-model.trim="form.hz"
        name="picker"
        label="频率"
        placeholder="1 ~ 3500">
        <template #right-icon>Hz</template>
      </van-field>
      <ZFieldBtn
        sticky
        :btns="[
          {
            text: '删除',
            type: 'danger',
            click: () => onDelect(editMode),
            show: !form.builtIn && editMode != -1,
          },
          {
            text: editMode != -1 ? '修改' : '添加',
            color: 'submit',
            click: () => formRef?.submit(),
          },
        ]" />
    </van-form>
  </van-action-sheet>
</template>

<script setup lang="ts">
import { DeviceId, ExtendType, GroupType, useStoreWalk, WalkGroupType, WalkGroupTypeName } from '@/store/control/walk.ts'
import ZFlex from '@/components/base/ZFlex.vue'
import { OPTIONS, PREFIX } from '@/constants'
import ZSwipeCell from '@/components/base/ZSwipeCell.vue'
import type { FormInstance } from 'vant'
import { showActionSheet } from '@/utils/ui/dialog.ts'
import { generateRandomId, toHexStr } from '@/utils'
import { useStoreI2C } from '@/store/modules/i2c.ts'

const walkStore = useStoreWalk()
const i2cStore = useStoreI2C()

const formRef = ref<FormInstance>()

const showAction = ref(false)
const editMode = ref(-1)

const showBuiltIn = ref<Record<string, boolean>>({})

const activeNames = ref(undefined as string | undefined)
const type_name_map = {
  pwms: 'PWM扩展',
  motor: '8路电机驱动扩展板',
  'drive-power': '大功率4路电机扩展',
  '8relay': '8路继电器扩展板',
}
// 模板,提交时会覆盖
const type_extend_map = {
  pwms: {
    chip: 'pca9685' as const,
    // 16路引脚全部定义自定义的PIN
    pins: Array(16)
      .fill(1)
      .map((_, i) => ({
        pin: i,
        func: ['pwm', 'digital', 'servo'],
      })),
  },
  motor: {
    chip: 'pca9685' as const,
    // 16路引脚全部定义为PWM
    pwms: Array(16)
      .fill(1)
      .map((_, i) => ({
        pin: i,
        hide: true,
      })),
    groups: Array(8)
      .fill(1)
      .map((_, i) => ({
        name: `电机${i}`,
        type: '2Pwm',
        forward: DeviceId.extendPwm('&{id}', i * 2),
        back: DeviceId.extendPwm('&{id}', i * 2 + 1),
      })) as GroupType[],
  },
  'drive-power': {
    chip: 'pca9685' as const,
    // 16路引脚全部定义为PWM
    pwms: Array(16)
      .fill(1)
      .map((_, i) => ({
        pin: i,
        hide: true,
      })),
    /**
     * * 电机0：L_EN: 5, L_PWM: 4, R_EN: 2, R_PWM: 3
     * * 电机1：L_EN: 0, L_PWM: 1, R_EN: 7, R_PWM: 6
     * * 电机2：L_EN: 10, L_PWM: 8, R_EN: 14, R_PWM: 12
     * * 电机3：L_EN: 13, L_PWM: 15, R_EN: 9, R_PWM: 11
     */
    groups: [
      [5, 4, 2, 3],
      [0, 1, 7, 6],
      [10, 8, 14, 12],
      [13, 15, 9, 11],
    ].map(([L_EN, L_PWM, R_EN, R_PWM], i) => ({
      name: `电机${i}`,
      type: '2En2Pwm',
      forward: DeviceId.extendPwm('&{id}', L_EN),
      back: DeviceId.extendPwm('&{id}', R_EN),
      forward_pwm: DeviceId.extendPwm('&{id}', L_PWM),
      back_pwm: DeviceId.extendPwm('&{id}', R_PWM),
    })) as GroupType[],
  },
  '8relay': {
    chip: 'pca9555' as const,
    // 8路引脚全部定义为输出
    digitals: Array(8)
      .fill(1)
      .map((_, i) => ({
        pin: i,
        name: `继电器${i}`,
      })),
    // 8路引脚全部定义自定义的PIN
    pins: Array(8)
      .fill(1)
      .map((_, i) => ({
        pin: i + 8,
        name: `自定义引脚${i}`,
        func: ['input', 'digital'],
      })),
  },
}

const def: ExtendType = {
  type: 'pwms',
  address: 0,
  hz: 100,
  name: '',
  id: '',
  builtIn: false,
  chip: 'pca9685' as const,
}
const form = ref<ExtendType>({ ...def })

function showType() {
  showActionSheet<{
    value: keyof typeof type_name_map
  }>({
    actions: Object.keys(type_name_map).map(key => ({
      value: key,
      name: type_name_map[key],
    })) as any,
    teleport: '#SetupWalk',
    cancelText: '取消',
    closeOnClickAction: true,
    onSelect: (action, index) => {
      form.value.type = action.value
      form.value.chip = type_extend_map[action.value].chip
    },
  })
}

function onForm(item: ExtendType, i: number) {
  showAction.value = true
  editMode.value = i
  form.value = { ...walkStore.extend[i] }
}

function onDelect(i: number) {
  showConfirmDialog({
    teleport: '#SetupWalk',
    title: '真的吗？',
    message: '真的要删除这个扩展吗？',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  }).then(() => {
    walkStore.extend.splice(i, 1)
    showAction.value = false
  })
}

function onSubmit() {
  if (editMode.value == -1) {
    if (type_extend_map[form.value.type]) {
      form.value.id = `${generateRandomId(
        3,
        walkStore.extend.map(item => item.id)
      )}`
      let json = JSON.stringify(type_extend_map[form.value.type])
      json = json.replace(/&{(\w+)}/g, (match, key) => form.value[key])
      form.value = {
        ...form.value,
        ...JSON.parse(json),
      }
    }
    walkStore.extend.push({ ...form.value })
  } else {
    walkStore.extend[editMode.value] = { ...form.value }
  }
  showAction.value = false
}

onUnmounted(() => {
  showAction.value = false
})
</script>
<style lang="scss" scoped>
.group-cell {
  --van-cell-value-font-size: 12px;
  --van-cell-label-margin-top: 0px;

  :deep(.van-cell__value) {
    line-height: 1.5;
  }
}
</style>
