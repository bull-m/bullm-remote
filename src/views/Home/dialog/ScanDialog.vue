<template>
  <ZPopup style="width: 400px" v-model:show="show" title="扫描小车">
    <van-field label-width="3em" :disabled="loading" autocomplete="off" v-model="ip" label="IP前缀" placeholder="例：192.168.1" />
    <van-button type="primary" class="w-full" style="height: 38px; border-radius: 10px; margin-top: 20px" square @click="onSubmit" :loading="loading">
      扫描
    </van-button>
  </ZPopup>
</template>

<script setup lang="ts">
import ZPopup from '@/components/base/ZPopup.vue'
import Http from '@/utils/car/http.ts'

const show = defineModel<boolean>('show', { default: false })
const ip = ref('')
const loading = ref(false)
function onSubmit() {
  loading.value = true
  const proms = [] as Promise<any>[]
  for (let i = 0; i < 255; i++) {
    if (ip.value.endsWith('.')) {
      ip.value = ip.value.slice(0, -1)
    }
    const url = `http://${ip.value}.${i}/ping`
    proms.push(
      Http.get(url, {})
        .then(res => {
          if (res === 'BULLM-REMOTE') {
            return `${ip.value}.${i}`
          }
        })
        .catch(err => Promise.resolve(''))
    )
  }
  Promise.all(proms)
    .then(res => {
      const ips = res.filter(i => i)
      if (!ips.length) {
        showToast('未扫描到任何小车')
        return
      }
      console.log(ips)
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<style scoped lang="scss"></style>
