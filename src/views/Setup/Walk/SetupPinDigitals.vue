<template>
  <van-cell-group inset>
    <template #title>
      <ZFlex align="center" style="margin-bottom: -10px" :gap="5">
        电平输出
        <van-button type="primary" size="mini" style="padding: 0 10px; margin-left: auto" @click="onForm(def)">添加</van-button>
        <van-button type="warning" size="mini" style="padding: 0 10px" @click="walkStore.reset(OPTIONS.WALK_DIGITALS)">重置</van-button>
      </ZFlex>
    </template>
    <ZNullCell v-if="walkStore.digitals_show.filter(x => !x.hide).length == 0">没有电平输出</ZNullCell>
    <van-cell
      v-for="(item, i) in walkStore.digitals_show.filter(x => !x.builtIn && !x.hide)"
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
    <ZCollapse v-if="walkStore.digitals_show.filter(x => x.builtIn && !x.hide).length > 0">
      <template #title>
        其他
        <van-icon @click.stop="onTip" name="question-o" color="#3498db" />
      </template>
      <van-cell
        class="group-cell"
        clickable
        v-for="(item, i) in walkStore.digitals_show.filter(x => x.builtIn && !x.hide)"
        inset
        center
        :value="item.from">
        <template #title>
          <div style="display: flex; align-items: center">
            {{ item.name }}
            <van-tag type="primary" style="margin-left: 5px" color="#8395a7">板载</van-tag>
            <van-tag type="success" style="margin-left: 5px" v-if="item.used_label">
              {{ item.used_label }}
            </van-tag>
          </div>
        </template>
        <!--        <template #value>-->
        <!--          <van-tag type="default" v-if="item.used_label">{{ item.used_label }}</van-tag>-->
        <!--        </template>-->
      </van-cell>
    </ZCollapse>
  </van-cell-group>
  <van-action-sheet v-model:show="showAction" :title="index != -1 ? '编辑电平输出' : '新增电平输出'">
    <van-form ref="formRef" @submit="onSubmit" :submit-on-enter="false">
      <van-notice-bar v-if="form.builtIn">该输出来自扩展模块或是内置的，部分参数不允许修改</van-notice-bar>
      <van-field
        label="名称"
        placeholder="输出名称(最多10个字符)"
        v-model.trim="form.name"
        :rules="[{ required: true, message: '请输入输出名称' }]"
        required
        :maxlength="10" />
      <!--   选择有output功能的引脚   -->
      <z-van-pin
        label="输出引脚"
        placeholder="选择引脚"
        v-model="form.pin"
        :rules="[{ required: true, message: '请选择引脚' }]"
        required
        func="digital" />
      <ZVanSwitch :label="`默认状态 (${form.def ? '高电平' : '低电平'})`" v-model="form.def" colon />
      <ZVanSwitch label="重连时回到默认状态" v-model="form.reset" />

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
import { DeviceId, DigitalType, PwmType, ServoType, useStoreWalk } from '@/store/control/walk.ts'
import ZVanPin from '@/components/form/ZVanPin.vue'
import { OPTIONS, PREFIX } from '@/constants'
import ZFlex from '@/components/base/ZFlex.vue'
import { generateRandomId } from '@/utils'
import type { FormInstance } from 'vant'
import ZVanNumber from '@/components/form/ZVanNumber.vue'
import ZSwipeCell from '@/components/base/ZSwipeCell.vue'

const walkStore = useStoreWalk()

const formRef = ref<FormInstance>()

const showAction = ref(false)

const def: DigitalType = {
  id: '',
  name: '',
  pin: '',
}

const form = ref<DigitalType>({ ...def })

// 编辑的下标
const index = computed(() => {
  return walkStore.digitals.findIndex(item => item.id === form.value.id)
})

function onForm(item: DigitalType) {
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
    walkStore.digitals.splice(i, 1)
    showAction.value = false
  })
}

function onSubmit() {
  if (index.value === -1) {
    // 新增
    // 生成id
    let id = DeviceId.digital(
      generateRandomId(
        5,
        walkStore.digitals.map(item => item.id)
      )
    )
    walkStore.digitals.push({ ...form.value, id })
  } else {
    walkStore.digitals[index.value] = { ...form.value }
  }
  showAction.value = false
}

function onTip() {
  showDialog({
    title: '这是什么？',
    message: '这是由扩展板自动生成的用于输出的的引脚；',
  })
}
</script>
<style lang="scss" scoped>
.group-cell {
  --van-cell-value-font-size: 12px;
  --van-cell-label-margin-top: 0px;
}
</style>
