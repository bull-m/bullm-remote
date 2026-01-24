<template>
  <ZPopup style="width: 400px" v-model:show="show" title="扫描局域网小车">
    <div style="max-height: 50vh; overflow-y: auto">
      <van-cell is-link @click="onItem(item)" :title="item.ip" :value="item.mac" v-for="item in existList" :key="item.mac">
        <template #label>
          <ZTag v-if="item.exist" type="info" size="small" style="display: inline">已存在</ZTag>
          <ZTag v-else type="success" size="small" style="display: inline">未添加</ZTag>
        </template>
      </van-cell>
    </div>
    <ZNullCell v-if="existList.length === 0" >持续扫描中，请确保您和小车在同一局域网内</ZNullCell>
    <van-button type="primary" class="w-full" style="height: 38px; border-radius: 10px; margin-top: 20px" square @click="onScan" :loading="loading">
      扫描
    </van-button>
  </ZPopup>
</template>

<script setup lang="ts">
import ZPopup from '@/components/base/ZPopup.vue'
import { UdpSendByIp } from '@/utils/car/message.ts'
import bus from '@/utils/bus.ts'
import { useStoreLink } from '@/store/link'
import { openDialog } from '@/utils/ui/dialog.ts'

const link = useStoreLink()
const show = defineModel<boolean>('show', { default: false })
const emit = defineEmits(['submit'])
const loading = ref(false)

function onScan() {
  loading.value = true
  UdpSendByIp('255.255.255.255:80', [0xf1]).catch(e => {
    console.log(e)
    showToast(e)
  })
  loading.value = false
}

const list = ref<{ ip: string; mac: string }[]>([])
const existList = computed(() => {
  return list.value.map(x => ({
    ...x,
    exist: link.linkOptions.some(y => y.type === 'ws' && y.ip === x.ip),
  }))
})

let timer: any = null
const udpHandle = data => {
  console.log(data, data.slice(0, 4), data.slice(4, 10))
  const ip = data
    .slice(0, 4)
    .map(x => x.toString())
    .join('.')
  const mac = Array.from<number>(data.slice(4, 10))
    .map(x => x.toString(16).padStart(2, '0'))
    .join(':')
    .toLocaleUpperCase()
  console.log(`发现小车：${ip} ${mac}`)
  if (list.value.find(x => x.mac === mac)) {
    return
  }
  list.value.push({ ip, mac })
}
onMounted(() => {
  bus.on(`udp:array:${0xf1}`, udpHandle)
  timer = setInterval(onScan, 1000)
})
onUnmounted(() => {
  bus.off(`udp:array:${0xf1}`, udpHandle)
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})

function onItem(item: { ip: string; mac: string; exist: boolean }) {
  if (item.exist) {
    showToast('该连接通道已存在')
    return
  }
  openDialog(() => import('@/views/Home/dialog/LinkDialog.vue'), {
    link: { ip: item.ip, token: '', type: 'ws', name: '' },
    onSubmit: () => {
      emit('submit')
      show.value = false
    }
  }).then(() => {
    showToast('为您填充了IP')
  })
}
</script>

<style scoped lang="scss"></style>
