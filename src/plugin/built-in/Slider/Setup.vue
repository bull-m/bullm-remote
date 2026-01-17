<template>
  <div>
    <van-cell-group inset title="排列方向">
      <van-radio-group v-model="config.direction">
        <van-cell title="横向" clickable @click="config.direction = 'horizontal'">
          <template #right-icon>
            <van-radio name="horizontal" />
          </template>
        </van-cell>
        <van-cell title="竖向" clickable @click="config.direction = 'vertical'">
          <template #right-icon>
            <van-radio name="vertical" />
          </template>
        </van-cell>
      </van-radio-group>
    </van-cell-group>
    <van-cell-group inset title="">
      <template #title>
        <ZFlex align="center" style="margin-bottom: -10px" :gap="5">
          滑块
          <van-button type="primary" size="mini" style="padding: 0 10px; margin-left: auto" @click="onForm(def, -1)">添加</van-button>
        </ZFlex>
      </template>

      <Draggable v-model="config.list" :animation="200" handle=".sort-btn" ghost-class="ghost" item-key="label">
        <template #item="{ element: item, index: i }">
          <van-cell :title="item.label" is-link inset @click="onForm(item, i)" style="padding: 0 16px 0 0; align-items: center">
            <template #icon>
              <div class="sort-btn">
                <IconSvgSort />
              </div>
            </template>
          </van-cell>
        </template>
      </Draggable>
      <Components.NullCell v-if="config.list.length === 0" >还没有滑块，添加一个玩玩呗</Components.NullCell>
    </van-cell-group>
    <van-action-sheet v-model:show="showAction" :title="editMode != -1 ? '编辑滑块' : '新增滑块'">
      <van-form ref="formRef" @submit="onSubmit" :submit-on-enter="false">
        <van-field
          required
          colon
          :maxlength="10"
          v-model.trim="form.label"
          name="picker"
          label="名称"
          placeholder="滑块名称(最多10个字符，中文建议两个字符)"
          :rules="[{ required: true, message: '请输入滑块名称' }]" />
        <Components.FromDevice @change="onChangeDevice" label="选择设备" v-model="form.device" select-pwm select-servo select-digital select-group />
        <van-notice-bar v-if="isDigital(form.device)" mode="closeable">电平输出只有两种状态，建议使用开关插件控制</van-notice-bar>
        <Components.FromNumber
          v-if="form.device"
          label="最小值"
          v-model="form.min"
          :min="minmax[0]"
          :max="minmax[1]"
          :step="1"
          :disabled="isDigital(form.device)"
          :placeholder="`最小值(${minmax[0]})，留空则使用设备的设置`" />
        <Components.FromNumber
          v-if="form.device"
          label="最大值"
          v-model="form.max"
          :min="minmax[0]"
          :max="minmax[1]"
          :step="1"
          :disabled="isDigital(form.device)"
          :placeholder="`最大值(${minmax[1]})，留空则使用设备的设置`" />
        <Components.FromNumber
          v-if="form.device"
          label="步进"
          v-model="form.step"
          :min="1"
          :max="100"
          :step="1"
          :disabled="isDigital(form.device)"
          :placeholder="`留空则使用为1`" />
        <Components.FromSwitch label="反转滑块" v-model="form.reverse" />
        <Components.FromSwitch label="只读" v-model="form.readonly" />
        <Components.FromSwitch v-if="isGroup(form.device)" label="松手自动停止" v-model="form.autostop" />

        <van-notice-bar v-if="(form.min ?? minmax[0]) > (form.max ?? minmax[1])" color="var(--van-warning-color)">
          最大值应该大于最小值
        </van-notice-bar>
        <ZFieldBtn
          sticky
          :btns="[
            { text: '删除', type: 'danger', click: () => onDelect(editMode), show: editMode != -1 },
            {
              text: editMode != -1 ? '修改' : '添加',
              color: 'submit',
              click: () => formRef?.submit(),
            },
          ]" />
      </van-form>
    </van-action-sheet>
  </div>
</template>

<script setup lang="ts">
import { ConfigType, ItemType } from './index.ts'
import type { FormInstance } from 'vant'
import { Components, isDigital, isGroup, isPwm, isServo, useConfig, useDigitalInfo, useGeneralOutput } from '@/plugin/export.ts'
import ZFlex from '@/components/base/ZFlex.vue'
import Draggable from 'vuedraggable'

const config = useConfig<ConfigType>()

const formRef = ref<FormInstance>()

const showAction = ref(false)
const editMode = ref(-1)

const def: ItemType = {
  label: '',
  device: '',
}
const form = ref<ItemType>({ ...def })

const minmax = computed(() => {
  const id = form.value.device
  const info = useGeneralOutput(id)
  if (info) {
    return [info.min, info.max]
  }
  return [0, 0]
})

function onForm(item: ItemType, i: number) {
  showAction.value = true
  editMode.value = i
  form.value = { ...item }
}

function onChangeDevice(){
  if (isDigital(form.value.device)) {
    form.value.step = undefined
    form.value.min = undefined
    form.value.max = undefined
  }
  if (typeof form.value.max != 'undefined' && form.value.max > minmax.value[1]) {
    form.value.max = undefined
  }
  if (typeof form.value.min != 'undefined' && form.value.min < minmax.value[0]) {
    form.value.min = undefined
  }
  form.value.autostop = !!isGroup(form.value.device);
}

function onSubmit() {
  if (editMode.value == -1) {
    config.list.push({ ...form.value })
  } else {
    config.list[editMode.value] = { ...form.value }
  }
  showAction.value = false
}

function onDelect(i: number) {
  showConfirmDialog({
    teleport: '#SetupPlugin',
    title: '真的吗？',
    message: '真的要删除这个滑块吗？',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  }).then(() => {
    config.list.splice(i, 1)
    showAction.value = false
  })
}
</script>

<style scoped lang="scss">
.sort-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;

  .icon {
    font-size: 20px;
    opacity: 0.5;
    padding: 0 5px 0 0;
    display: block;
    box-sizing: content-box;
    color: var(--text);
  }
}
</style>
