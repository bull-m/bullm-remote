<template>
  <div class="video">
    <div v-if="!show" style="display: flex; justify-content: center; align-items: center; height: 100%; font-size: 18px; color: #fff">
      等待视频流...
    </div>
    <canvas
      :style="{ opacity: show ? 1 : 0, transform: show ? '' : 'scale(1)' }"
      ref="canvas"
      style="width: 100%; height: 100%; transition: all 0.5s ease-in-out; pointer-events: none"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useCamera, useConfig } from '@/plugin/export.ts'
import { ConfigType } from '@/plugin/built-in/Live/index.ts'
import { useStoreUi } from '@/store/ui.ts'
const config = useConfig<ConfigType>()

const camera = useCamera()

const canvas = ref<HTMLCanvasElement>()

// 第一帧来的时候才显示
const show = ref(false)

let ctx: CanvasRenderingContext2D | null = null
onMounted(() => {
  let dpr = window.devicePixelRatio || 1
  let rect = canvas.value!.getBoundingClientRect()
  canvas.value!.width = rect.width * dpr
  canvas.value!.height = rect.height * dpr
  ctx = canvas.value!.getContext('2d')!
  camera.addListener(videoEvent)
})

onUnmounted(() => {
  camera.removeListener(videoEvent)
})

function videoEvent(img: any) {
  if (!canvas.value || !ctx) return
  // 调整滤镜
  ctx.filter = `saturate(${config.saturate}%) brightness(${config.brightness}%) contrast(${config.contrast}%)`
  drawImage({
    ctx,
    img,
    type: config.object_fit,
    vertical: config.vertical,
    horizontal: config.horizontal,
  })
  show.value = true
}

function drawImage({ ctx, img, type, horizontal, vertical }) {
  const canvasWidth = canvas.value!.width
  const canvasHeight = canvas.value!.height
  ctx.save()
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  if (type === 'fill') {
    ctx.translate(horizontal ? canvasWidth : 0, vertical ? canvasHeight : 0)
    ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1)
    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight) // 在canvas上绘制图片
  } else {
    const scaleW = canvasWidth / img.width
    const scaleH = canvasHeight / img.height
    const scale = Math[type === 'contain' ? 'min' : 'max'](scaleW, scaleH) // 取小值
    const w = img.width * scale // 图片缩放后的宽度
    const h = img.height * scale // 图片缩放后的高度
    const x = (canvasWidth - w) / 2 // 图片缩放后在画布上的位置
    const y = (canvasHeight - h) / 2

    ctx.translate(horizontal ? canvasWidth / 2 : 0, vertical ? canvasHeight / 2 : 0)
    ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1)
    ctx.drawImage(img, horizontal ? -w / 2 : x, vertical ? -h / 2 : y, w, h)
  }
  ctx.restore()
}
</script>

<style lang="scss" scoped>
.video {
  position: absolute;
  inset: 0;

  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
