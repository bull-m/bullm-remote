<template>
  <van-cell-group inset>
    <template #title>
      <ZFlex align="center" style="margin-bottom: -10px" :gap="5">
        WiFi (手动重启后生效)
        <van-button type="primary" size="mini" style="padding: 0 10px; margin-left: auto" :disabled="loading" @click="onForm()">添加</van-button>
      </ZFlex>
    </template>
    <Draggable
      group="people"
      style="height: 100%; overflow: auto"
      v-model="wifi.list"
      :animation="200"
      item-key="order"
      ghost-class="ghost"
      @start="drag = true"
      @end="drag = false"
      :disabled="wifi.list.length <= 1 || loading">
      <template #item="{ element: item, index }">
        <van-cell
          clickable
          @click="onForm(item, index)"
          class="group-cell"
          inset
          center
          title-style="flex: 2;"
          :title="item.name"
          :value="`密码：***`" />
      </template>
    </Draggable>
    <van-notice-bar v-if="!drag && wifi.list.length > 1">拖动排序与删除，会按顺序进行连接</van-notice-bar>

    <Draggable class="delect-box" v-if="drag" style="width: 100%" group="people" :list="[]" item-key="order">
      <template #header>
        <van-notice-bar color="#f00" background="#ff000020">拖到这里删除</van-notice-bar>
      </template>
      <template #item>
        <div></div>
      </template>
    </Draggable>
    <ZNullCell v-if="wifi.list.length == 0">没有wifi信息，您的小车将会启用AP模式</ZNullCell>
  </van-cell-group>

  <van-action-sheet v-model:show="showWifiList" title="选择wifi" style="height: 80%">
    <van-pull-refresh @refresh="onScanWifi" v-model="scanLoadingPull" success-text="刷新成功" style="min-height: 100%">
      <van-list :loading="scanLoading" error-text="wifi列表为空" :error="!scanLoading && wifiList.length == 0" :finished="!scanLoading">
        <van-cell
          v-for="item in wifiList"
          :key="item.name"
          :title="item.name"
          clickable
          :value="item.db"
          @click="
            () => {
              form.name = item.name
              showWifiList = false
            }
          " />
      </van-list>
    </van-pull-refresh>
  </van-action-sheet>

  <van-action-sheet v-model:show="showForm" :title="editIndex == -1 ? '添加一个WIFI' : '修改WIFI信息'">
    <van-form ref="formRef" @submit="onSubmit" :submit-on-enter="false">
      <van-cell
        title="扫描wifi"
        is-link
        @click="
          () => {
            wifiList = []
            onScanWifi()
          }
        " />
      <van-field
        required
        colon
        :maxlength="255"
        autocomplete="off"
        v-model.trim="form.name"
        name="picker"
        label="名称"
        placeholder="wifi名称"
        :rules="[{ required: true, message: '请输入wifi名称' }]" />
      <van-field
        required
        colon
        :maxlength="255"
        autocomplete="off"
        v-model.trim="form.pass"
        name="picker"
        label="密码"
        placeholder="wifi密码"
        :rules="[{ required: true, message: '请输入wifi密码' }]" />
      <ZFieldBtn
        :btns="[
          { text: '取消', color: 'cancel', click: () => (showForm = false) },
          { text: editIndex == -1 ? '添加' : '保存', color: 'submit', click: formRef?.submit },
        ]" />
    </van-form>
  </van-action-sheet>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import axios from 'axios'
import { WsSendFuncMode, WsSendToCall } from '@/utils/car/message.ts'
import { OPTIONS } from '@/constants'
import ZFlex from '@/components/base/ZFlex.vue'
import type { FormInstance } from 'vant'
import { CarGetOptionToObj, CarSetOption } from '@/utils/car/options.ts'
import { fieldsFilter, validatorIp } from '@/utils'
import ZPopupSetup from '@/components/base/ZPopupSetup.vue'
import { useStoreLink } from '@/store/link'
import Draggable from 'vuedraggable'
import ZVanPin from '@/components/form/ZVanPin.vue'
import { useStoreCamera } from '@/store/modules/camera.ts'

const camera = useStoreCamera()

const loading = ref<boolean>(false)
const scanLoading = ref<boolean>(false)
const scanLoadingPull = ref<boolean>(false) // 下拉的刷新
const showWifiList = ref<boolean>(false)
const wifiList = ref<{ name: string; db: string }[]>([])
const emit = defineEmits(['error'])

const formRef = ref<FormInstance>()
const wifi = ref({
  list: [] as {
    name: string
    pass: string
  }[],
})
const drag = ref<boolean>(false)

const showForm = ref<boolean>(false)

const def = {
  name: '',
  pass: '',
}
const form = ref({ ...def })

const editIndex = ref(-1)

function onForm(item = def, index = -1) {
  if (index === -1 && wifi.value.list.length >= 10) {
    showToast('最多可添加10个WIFI，不能再多啦 ！！！')
    return
  }
  showForm.value = true
  editIndex.value = index
  form.value = { ...item }
  formRef.value?.resetValidation()
}

function onSubmit() {
  if (loading.value) return
  if (editIndex.value == -1) {
    wifi.value.list.push({
      name: form.value.name,
      pass: form.value.pass,
    })
  } else {
    wifi.value.list[editIndex.value] = { ...form.value }
  }
  showForm.value = false
}

let watchHandles: any
onMounted(async () => {
  camera.pause()
  try {
    loading.value = true
    wifi.value = (await CarGetOptionToObj(OPTIONS.WIFI)) ?? { list: [] }
    watchHandles = watch(
      wifi,
      val => {
        const new_val = fieldsFilter(val, 'list')
        CarSetOption(OPTIONS.WIFI, new_val).then(_ => showToast('保存成功'))
      },
      { deep: true }
    )
    loading.value = false
  } catch (e) {
    showToast('获取wifi信息失败了，请重新连接')
    emit('error', e)
    loading.value = false
  }
})
onUnmounted(() => {
  watchHandles && watchHandles()
  camera.start()
})

function onScanWifi() {
  showWifiList.value = true
  // 下拉的刷新没有启动则使用列表的刷新动画，这好像是vant-ui库的问题，van-pull-refresh组件首次启动刷新不生效
  if (!scanLoadingPull.value) {
    scanLoading.value = true
  }

  WsSendFuncMode('wifi', 'scan')
    .then(res => {
      if (res.loading || !res.data) {
        showToast('正在异步扫描WiFi，请稍后刷新')
        return
      }
      showToast('已刷新WiFi列表')
      wifiList.value = res.data.map(item => {
        return {
          name: item.ssid,
          db: item.rssi,
          ...item,
        }
      })
    })
    .finally(() => {
      scanLoading.value = false
      scanLoadingPull.value = false
    })
}
</script>
<style lang="scss" scoped>
.delect-box {
  .van-cell {
    color: #f00;
    background-color: #ff000020;
  }

  :deep(.van-cell__value) {
    color: #f00;
  }
}
</style>
