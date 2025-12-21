<template>
  <ZPopup v-model:show="show" style="width: 300px" :title="props.link ? '编辑连接' : '添加一个连接'">
    <van-tabs style="--van-tabs-nav-background: #00000000" v-model:active="option.type" :before-change="beforeChange">
      <van-tab title="WebSocket" name="ws">
        <template v-if="option.type === 'ws'">
          <van-field
            autocomplete="off"
            :disabled="loading || !!props.link"
            label-width="2.5em"
            v-model="option.ip"
            label="IP"
            placeholder="IP或域名"
            style="margin-top: 5px"
            :error-message="validatorIp(option.ip) ? '' : '请输入正确IP或域名'" />
          <van-field
            autocomplete="off"
            type="password"
            :disabled="loading"
            label-width="2.5em"
            v-model="option.token"
            label="鉴权"
            placeholder="TOKEN 或 密码" />
        </template>
      </van-tab>
      <!--      <van-tab title="USB" name="usb">-->
      <!--        <ZNullCell>usb无线模块自动连接，无需配置</ZNullCell>-->
      <!--      </van-tab>-->
      <van-tab title="测试" name="test">
        <ZNullCell>测试通道仅供测试，多数功能不可用</ZNullCell>
      </van-tab>
    </van-tabs>
    <ZFlex style="margin-top: 12px" v-if="option.type != 'usb'">
      <van-button v-if="!!props.link" type="danger" class="w-full" style="border-radius: 10px; height: 38px" square @click="onDelect()">
        删除
      </van-button>
      <van-button
        v-if="!props.link && option.type === 'test'"
        class="w-full"
        style="border-radius: 10px; height: 38px"
        square
        type="primary"
        @click="onSubmit">
        添加
      </van-button>
      <van-button
        v-else-if="option.type !== 'test'"
        class="w-full"
        style="border-radius: 10px; height: 38px"
        square
        type="primary"
        @click="onSubmit"
        :loading="loading">
        测试连通并{{ props.link ? '修改' : '添加' }}
      </van-button>
    </ZFlex>
  </ZPopup>
</template>

<script setup lang="ts">
import Http from '@/utils/car/http.ts'
import { LinkOption, useStoreLink } from '@/store/link'
import { validatorIp } from '@/utils'
import { AP_MODE_IP } from '@/constants'
import WsLink from '@/utils/link/method/WsLink.ts'
import { isSameLinkOption } from '@/utils/link'

const link = useStoreLink()

const show = defineModel<boolean>('show')

const props = defineProps<{
  link?: LinkOption
}>()
const emit = defineEmits(['submit'])

const option = ref<LinkOption>(props.link ? { ...props.link } : { ip: '', token: '', type: 'ws', name: '' })

function beforeChange() {
  return !props.link
}

const loading = ref(false)
const onSubmit = () => {
  console.log(option.value)
  // 是否已经存在
  if (!props.link && findIndex(option.value) != -1) {
    showToast('已存在, 请勿重复添加')
    return
  }
  if (option.value.type === 'test') {
    if (findIndex(option.value) != -1) {
      show.value = false
      return
    }
    link.linkOptions.push({ type: 'test', name: '测试通道' })
    showToast('添加成功')
    emit('submit')
    show.value = false
    return
  }
  if (option.value.type === 'ws') {
    const { token, ip } = option.value
    if (!ip) {
      showToast('请输入IP或域名')
      return
    }
    if (!validatorIp(ip)) {
      showToast('请输入正确IP或域名')
      return
    }
    if (ip === AP_MODE_IP) {
      showToast('此IP为AP模式下的IP，无需添加')
      return
    }
    loading.value = true
    WsLink.getCarList(option.value)
      .then(res => {
        if (props.link && props.link.type === 'ws' && props.link.ip) {
          // 修改
          const item = link.linkOptions.find(item => item.type === 'ws' && item.ip === ip)
          if (item && item.type === 'ws') {
            item.token = token
            showToast('修改成功')
          } else {
            showToast('修改失败，参数异常，请重试')
          }
        } else {
          link.linkOptions.push({ ...option.value, name: ip })
          showToast('添加成功')
        }
        emit('submit')
        show.value = false
      })
      .catch(res => {
        if (res.status === 401) {
          showToast('鉴权失败，请检查')
        } else {
          showToast('连接失败，请检查')
        }
      })
      .finally(() => {
        loading.value = false
      })
  }
}

function onDelect() {
  const index = findIndex(props.link)
  if (index !== -1) {
    link.linkOptions.splice(index, 1)
    show.value = false
    emit('submit')
  }
}

function findIndex(op?: LinkOption) {
  if (!op) return -1
  return link.linkOptions.findIndex(item => isSameLinkOption(item, op))
}
</script>

<style scoped lang="scss"></style>
