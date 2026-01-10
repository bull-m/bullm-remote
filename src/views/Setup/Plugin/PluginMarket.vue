<template>
  <van-popup v-model:show="show" position="left" class="plugin-market" :overlay="false">
    <div class="head">
      <div class="title">在线插件中心</div>
      <!--      <div class="text-btn" @click="opWeb">-->
      <!--        使用浏览器管理插件-->
      <!--        <icons-mdi-open-in-new/>-->
      <!--      </div>-->
      <div class="btn" @click="show = false">
        <icon-mdi-close />
      </div>
    </div>
    <iframe @error="onError" v-if="showIframe" :style="{ opacity: iframeLoaded ? 1 : 0 }" :src="url" @load="loadIframe" ref="iframe" />
  </van-popup>
</template>

<script setup lang="ts">
import { openUrl } from '@/utils'
import { useStoreLink } from '@/store/link'
import { BuiltInPlugin } from '@/plugin'
import { useStorePlugin } from '@/store/plugin.ts'

const show = defineModel<boolean>('show', { required: true })
const emit = defineEmits<{
  (e: 'error'): void
}>()
const showIframe = ref(false)
const iframeLoaded = ref(false)
watch(
  show,
  val => {
    if (val) showIframe.value = true
  },
  { immediate: true }
)

function onError() {
  console.log('iframe error')
  if (show.value) {
    emit('error')
  }
}

const url = 'http://localhost:5173'
const link = useStoreLink()

function opWeb() {
  openUrl(url + `?mac=${link.connectMac}&client=${'10.0.0.1'}`)
}

const plugin = useStorePlugin()

const iframe = useTemplateRef<HTMLIFrameElement>('iframe')

function loadIframe(e) {
  console.log(iframe.value)
  iframeLoaded.value = true
  iframe.value?.contentWindow?.postMessage(
    {
      type: 'built-in',
      list: toRaw(BuiltInPlugin.value),
    },
    url
  )
  updateInstalled()
}

function updateInstalled() {
  iframe.value?.contentWindow?.postMessage(
    {
      type: 'installed',
      list: plugin.list.map(item => ({
        id: item.info.id,
        version: item.info.version,
      })),
    },
    url
  )
}

watch(() => plugin.list, updateInstalled, { immediate: true })

window.addEventListener('message', receiveMessage, false)

async function receiveMessage(event) {
  console.log('Received message form iframe:', event.data) // 处理接收到的消息
  // 安装插件
  if (event.data?.type === 'installPlugin') {
    await plugin.addPlugin(event.data.plugin)
    updateInstalled()
    iframe.value?.contentWindow?.postMessage(
      {
        type: 'msg',
        text: '安装插件成功',
      },
      url
    )
  }
}

onUnmounted(() => {
  window.removeEventListener('message', receiveMessage)
})
</script>

<style scoped lang="scss">
.plugin-market {
  //position: absolute;
  //left: 0;
  //top: 0;
  height: 100%;
  background-color: #000000bb;
  z-index: 10000;
  width: 60%;
  min-width: calc(100% - 550px);
  max-width: calc(100% - 450px);

  .head {
    height: 50px;
    position: absolute;
    left: 0;
    top: -1px;
    width: 100%;
    background: rgba(15, 18, 22, 0.7);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(0, 191, 255, 0.1);
    display: flex;
    align-items: center;
    z-index: 2;

    .title {
      padding-left: 30px;
      font-size: 19px;
      font-weight: 700;
      background: linear-gradient(90deg, #00bfff, #7b68ee);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-fill-color: transparent;
      text-shadow: 0 0 10px rgba(0, 191, 255, 0.3);
      letter-spacing: 1px;
    }

    .text-btn {
      margin-left: 20px;
      color: var(--van-primary-color);
      display: flex;
      align-items: center;
      cursor: pointer;
      .icon{
        margin-left: 3px;
      }
    }

    .btn {
      height: 50px;
      width: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #fff;
      margin-left: auto;
      font-size: 21px;

      &:hover {
        color: #00bfff;
      }
    }
  }

  iframe {
    display: block;
    width: 100%;
    height: 100%;
    border: none;
    box-sizing: border-box;
    overflow: hidden;
    background: rgba(15, 18, 22, 0.3);
    backdrop-filter: blur(10px);
    transition: all 0.3s;
    //  隐藏滚动条
    &::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>
