<template>
  <van-cell-group inset title="电机驱动">
    <template #title>
      <ZFlex align="center" style="margin-bottom: -10px" :gap="5">
        电机驱动（组合）
        <van-button type="primary" size="mini" style="padding: 0 10px; margin-left: auto" @click="onForm(def)">添加</van-button>
        <van-button type="warning" size="mini" style="padding: 0 10px" @click="walkStore.reset(OPTIONS.WALK_GROUPS)">重置</van-button>
      </ZFlex>
    </template>

    <ZNullCell v-if="walkStore.groups_show.length == 0">没有电机驱动</ZNullCell>

    <van-cell
      v-for="(item, i) in walkStore.groups_show"
      @click="onForm(item)"
      class="group-cell"
      inset
      center
      :label="item.type_label"
      :value="item.builtIn ? item.from : item.pin_label"
      clickable>
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

    <!--    <ZCollapse v-if="walkStore.groups_show.filter(x=> x.builtIn).length > 0">-->
    <!--      <template #title>-->
    <!--        固定组合-->
    <!--        <van-icons @click.stop="onTip" name="question-o" color="#3498db"/>-->
    <!--      </template>-->
    <!--      <van-cell class="group-cell" v-for="(item,i) in walkStore.groups_show.filter(x=> x.builtIn)" clickable inset-->
    <!--                center :label="item.type_label" @click="onForm(item)" :value="(item as any).form">-->
    <!--        &lt;!&ndash;:value="item.pin_label"&ndash;&gt;-->
    <!--        <template #title>-->
    <!--          <div style="display:flex;align-items: center;">-->
    <!--            {{ item.name }}-->
    <!--            <van-tag type="primary" style="margin-left: 5px;" color="#8395a7">板载</van-tag>-->
    <!--            <van-tag type="success" style="margin-left: 5px;" v-if="item.used_label">{{ item.used_label }}</van-tag>-->
    <!--          </div>-->
    <!--        </template>-->
    <!--      </van-cell>-->
    <!--    </ZCollapse>-->
  </van-cell-group>
  <van-action-sheet v-model:show="showAction" :title="isEdit ? '编辑电机驱动' : '新增电机驱动'">
    <van-form ref="formRef" @submit="onSubmit" :submit-on-enter="false">
      <van-notice-bar v-if="form.builtIn">该电机驱动来自扩展模块或是内置的，部分参数不允许修改</van-notice-bar>
      <van-field
        :maxlength="10"
        v-model.trim="form.name"
        required
        name="picker"
        label="名称"
        placeholder="电机驱动名称(最多10个字符)"
        :rules="[{ required: true, message: '请输入电机驱动名称' }]" />
      <ZVanSelect
        :disabled="form.builtIn"
        v-model="form.type"
        :columns="
          Object.entries(WalkGroupTypeName).map(([key, text]) => ({
            value: key,
            text: text,
          }))
        "
        label="类型"
        required
        placeholder="选择类型" />
      <ZVanSwitch v-if="['2D1Pwm', '2En2Pwm', '2Pwm'].includes(form.type)" label="是否自动刹车" v-model="form.auto_brake" />
      <ZVanSwitch label="是否反转" v-model="form.reversal" />
      <template v-if="form.type == '2D1Pwm'">
        <z-van-device :disabled="form.builtIn" select-pwm select-digital label="正转方向引脚" v-model="form.forward" />
        <z-van-device :disabled="form.builtIn" select-pwm select-digital label="反转方向引脚" v-model="form.back" />
        <z-van-device :disabled="form.builtIn" select-pwm label="调速引脚" v-model="form.pwm" />
      </template>
      <template v-if="form.type == '2En2Pwm'">
        <z-van-device :disabled="form.builtIn" select-pwm select-digital label="正转使能引脚" v-model="form.forward" />
        <z-van-device :disabled="form.builtIn" select-pwm label="正转调速引脚" v-model="form.forward_pwm" />
        <z-van-device :disabled="form.builtIn" select-pwm select-digital label="反转使能引脚" v-model="form.back" />
        <z-van-device :disabled="form.builtIn" select-pwm label="反转调速引脚" v-model="form.back_pwm" />
      </template>
      <template v-else-if="form.type == '2Pwm'">
        <z-van-device :disabled="form.builtIn" select-pwm label="正转调速引脚" v-model="form.forward" />
        <z-van-device :disabled="form.builtIn" select-pwm label="反转调速引脚" v-model="form.back" />
      </template>
      <template v-else-if="form.type == '1Pwm'">
        <z-van-device :disabled="form.builtIn" select-pwm label="PWM引脚" v-model="form.pwm" />
      </template>
      <ZFieldBtn
        sticky
        :btns="[
          {
            text: '删除',
            type: 'danger',
            click: () => onDelect(form.id),
            show: !form.builtIn && isEdit,
          },
          { text: isEdit ? '修改' : '添加', color: 'submit', click: () => formRef?.submit() },
        ]" />
    </van-form>
  </van-action-sheet>
</template>

<script setup lang="ts">
import { DeviceId, GroupType, useStoreWalk, WalkGroupType, WalkGroupTypeName } from '@/store/control/walk.ts'
import { OPTIONS, PREFIX } from '@/constants'
import ZFlex from '@/components/base/ZFlex.vue'
import { generateRandomId } from '@/utils'
import ZSwipeCell from '@/components/base/ZSwipeCell.vue'
import type { FormInstance } from 'vant'
import ZVanPin from '@/components/form/ZVanPin.vue'

const walkStore = useStoreWalk()

const formRef = ref<FormInstance>()

const showAction = ref(false)

const def: GroupType = {
  id: '',
  name: '',
  type: '2D1Pwm' as const,
  pwm: '',
  forward: '',
  back: '',
}
const form = ref<GroupType & { describe?: string }>({ ...def })

// 编辑的下标
const isEdit = computed(() => {
  return !!form.value.id
})

function onForm(item) {
  showAction.value = true
  form.value = { ...item }
  formRef.value?.resetValidation()
}

function onDelect(id: string) {
  showConfirmDialog({
    teleport: '#SetupWalk',
    title: '真的吗？',
    message: '真的要删除这个电机驱动吗？',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  }).then(() => {
    showAction.value = false
    const i = walkStore.groups.findIndex(item => item.id === id)
    if (i == -1) {
      showToast('出错了，丢失修改的数据')
      return
    }
    walkStore.groups.splice(i, 1)
  })
}

function onSubmit() {
  showAction.value = false
  if (!isEdit.value) {
    // 新增
    let id = DeviceId.group(
      generateRandomId(
        5,
        walkStore.groups.map(item => item.id)
      )
    )
    walkStore.groups.push({ ...form.value, id })
    return
  }
  const index = walkStore.groups.findIndex(item => item.id === form.value.id)
  if (index != -1) {
    // 是普通的电机驱动
    walkStore.groups[index] = { ...form.value }
    return
  }
  // 寻找扩展版中的电机驱动
  const isExtend = walkStore.extend.some(item => {
    if (!item.groups) return
    const index = item.groups.findIndex((_, index) => DeviceId.extendGroup(item.id, index) === form.value.id) ?? -1
    if (index != -1) {
      item.groups[index] = { ...form.value, id: undefined } as any // 扩展版内的组合不需要定义id
      return true
    }
  })
  if (!isExtend) {
    showToast('出错了，丢失修改的数据')
  }
}

function onTip() {
  showDialog({ title: '这是什么？', message: '这是由扩展板自动生成的电机驱动' })
}
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
