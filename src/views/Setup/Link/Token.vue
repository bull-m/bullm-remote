<template>
  <van-cell-group inset title="鉴权">
    <van-field
      v-model.trim="token"
      :maxlength="25"
      label="Token"
      placeholder="重置小车的Token，可以留空"
      label-width="50px"
      autocomplete="off"
      show-word-limit />
    <ZFieldBtn :btns="[{ text: '提交', color: 'submit', click: onCarTokenSetup }]" />
  </van-cell-group>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { OPTIONS } from '@/constants'
import { CarSetOption } from '@/utils/car/options.ts'
import { useStoreLink } from '@/store/link'

const link = useStoreLink()
const token = ref('')

function onCarTokenSetup() {
  showConfirmDialog({
    title: '重要',
    message:
      '1. 会用于局域网控制的鉴权；\n2. 不为空时也会作为AP模式的WiFi密码，不够8位会自动在后面补0' +
      '\n3. 设置成功后我们会主动断开本次连接，你需要修改连接信息后重新连接' +
      '\n4. 忘记将无法找回，请注意\n即将设置的Token: ' +
      (token.value || '空'),
    theme: 'round-button',
    messageAlign: 'left',
    width: '500px',
  })
    .then(() => {
      return CarSetOption(OPTIONS.TOKEN, token.value)
    })
    .then(() => {
      link.close()
      showToast('请修改连接信息后重新连接')
    })
}
</script>
<style lang="scss" scoped></style>
