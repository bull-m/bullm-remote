<template>
  <van-cell-group inset title="外网控制（Beta 暂不可用）">
    <van-field v-model.trim="network.ip" label="IP" placeholder="服务器IP或域名" label-width="50px" :disabled="loading" autocomplete="off" />
    <van-field
      v-model.trim="network.token"
      label="Token"
      placeholder="服务器的Token或密码"
      label-width="50px"
      :disabled="loading"
      autocomplete="off" />
    <ZFieldBtn :btns="[{ text: '推送到小车，并重启小车', color: 'submit', click: onCarNetworkSetup }]" />
  </van-cell-group>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { OPTIONS } from '@/constants'
import { CarSetOption } from '@/utils/car/options.ts'
import { validatorIp } from '@/utils'
import { LinkOption, useStoreLink } from '@/store/link'
import { isSameLinkOption } from '@/utils/link'

const loading = ref<boolean>(false)
const link = useStoreLink()

const network = reactive({
  ip: '',
  token: '',
})

// 外网控制小车设置
function onCarNetworkSetup() {
  if (!network.ip || !network.token) {
    showToast('请输入服务器IP和Token')
    return
  }
  if (!validatorIp(network.ip)) {
    showToast('请输入正确IP或域名')
    return
  }
  showConfirmDialog({
    title: '重要',
    message:
      '要使用外网控制小车时，小车也需要主动连接服务端，点击确定时将推送外网设置到小车；' +
      '\n如果你的本地客户端没有该服务端的信息，也将会主动添加。' +
      '\nip: ' +
      network.ip +
      '\ntoken: ' +
      network.token,
    theme: 'round-button',
  })
    .then(() => {
      return CarSetOption(OPTIONS.NETWORK, {
        ip: network.ip,
        token: network.token,
      })
    })
    .then(() => {
      let op = {
        type: 'network',
        ip: network.ip,
        token: network.token,
        name: network.ip,
      } as LinkOption
      const index = link.linkOptions.findIndex(x => isSameLinkOption(x, op))
      if (index === -1) {
        link.linkOptions.push({
          type: 'network',
          ip: network.ip,
          token: network.token,
          name: network.ip,
        })
      } else {
        link.linkOptions[index] = {
          type: 'network',
          ip: network.ip,
          token: network.token,
          name: network.ip,
        }
      }
      link.close()
      showToast('已经推送设置，请等待小车主动连接服务端，如长时间未连接成功，请检查设置或重启小车')
    })
}
</script>
