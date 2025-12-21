<template>
  <ZPopupSetup v-model:show="show" title="屏幕设置" box-id="SetupScreen" :loading="loading">
    <ZVanSwitch v-model="option.enable" label="启用屏幕" />

    <van-cell-group inset title="基础">
      <ZVanI2C v-model="option.address" label="地址" placeholder="设备I2C地址" show-right />
      <van-uploader :before-read="beforeLogo" style="width: 100%">
        <van-cell title="自定义logo" center is-link style="width: 100%">
          <template #value>
            <canvas id="logo" style="width: 50px; height: 50px"></canvas>
          </template>
        </van-cell>
      </van-uploader>
      <van-cell title="操作" center clickable>
        <template #value>
          <van-button size="mini" @click="reverseBinary">反转logo颜色</van-button>
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset>
      <template #title>
        <ZFlex align="center" style="margin-bottom: -10px" :gap="5">
          组件
          <van-button type="primary" size="mini" style="padding: 0 10px; margin-left: auto" @click="onForm(def, -1)">添加</van-button>
        </ZFlex>
      </template>
      <ZNullCell v-if="option.module.length == 0">没有组件</ZNullCell>

      <z-swipe-cell v-for="(model, index) in option.module">
        <van-cell
          :title="modules.find(x => x.type === model.type)?.name || model.type"
          is-link
          :value="'例： ' + model.prefix + modules.find(x => x.type === model.type)?.example || ''" />
        <template #left>
          <van-button square type="danger" text="删除" style="height: 100%" @click="option.module.splice(index, 1)" />
          <van-button square type="primary" text="编辑" style="height: 100%" @click="onForm(model, index)" />
          <van-button
            square
            type="success"
            text="上移"
            style="height: 100%"
            @click="option.module.splice(index - 1, 0, option.module.splice(index, 1)[0])" />
          <van-button
            square
            type="success"
            text="下移"
            style="height: 100%"
            @click="option.module.splice(index + 1, 0, option.module.splice(index, 1)[0])" />
        </template>
      </z-swipe-cell>
    </van-cell-group>
    <van-action-sheet v-model:show="showAction" title="新增组件">
      <van-form ref="formRef" @submit="onSubmit" :submit-on-enter="false">
        <van-field
          :model-value="modules.find(x => x.type === form.type)?.name"
          is-link
          readonly
          name="picker"
          label="类型"
          placeholder="选择类型"
          @click="selectType" />
        <van-field label="前缀" placeholder="自定义前缀（最多6个字符，只支持英文字母）" v-model.trim="form.prefix" :maxlength="13" />
        <z-van-number v-model.number="form.size" label="占用行数" :min="1" :max="3" :step="1" name="line" placeholder="占用行数 1 ~ 3 （默认1）" />
        <z-van-number
          v-model.number="form.delay"
          label="数据刷新间隔"
          :min="100"
          :max="60000"
          :step="1"
          name="line"
          placeholder="最低值受fps限制（默认1000ms）"
          right-label="ms" />
        <van-cell title="示例">
          <template #value>
            {{ form.prefix + modules.find(x => x.type === form.type)?.example || '' }}
          </template>
        </van-cell>
        <div style="display: flex; position: sticky; bottom: 0">
          <van-button class="w-full" size="small" square type="warning" @click="showAction = false">取消</van-button>
          <van-button class="w-full" size="small" square color="linear-gradient(135deg,#42e695,#3bb2b8)" native-type="submit">添加</van-button>
        </div>
      </van-form>
    </van-action-sheet>
  </ZPopupSetup>
</template>

<script setup lang="ts">
import ZPopupSetup from '@/components/base/ZPopupSetup.vue'
import ZVanNumber from '@/components/form/ZVanNumber.vue'
import { fieldsFilter, fieldsFilterHigh, toHexStr } from '@/utils'
import ZFlex from '@/components/base/ZFlex.vue'
import { showActionSheet } from '@/utils/ui/dialog.ts'
import ZSwipeCell from '@/components/base/ZSwipeCell.vue'
import { useStoreScreen } from '@/store/modules/screen.ts'

const show = defineModel<boolean>('show')
const showAction = ref(false)

const { option } = useStoreScreen()

const TYPE = {
  WIFI: 0,
  RSSI: 1,
  LOCAL: 2,
  LINK: 3,
  TEXT: 4,
}

const modules = ref([
  { type: TYPE.WIFI, name: '当前连接wifi名称', size: 1, prefix: 'wifi: ', example: 'YYZNM' },
  { type: TYPE.RSSI, name: 'wifi质量', size: 1, prefix: 'rssi: ', example: '-32db' },
  { type: TYPE.LOCAL, name: '本地ip', size: 1, prefix: 'ip: ', example: '10.0.0.12' },
  { type: TYPE.LINK, name: '连接的ip', size: 1, prefix: 'link: ', example: '10.0.0.12' },
  { type: TYPE.TEXT, name: '自定义文本', size: 1, prefix: '', example: '' },
])

const editIndex = ref(-1)

const def = {
  type: TYPE.WIFI,
  size: undefined as number | undefined,
  prefix: '',
  delay: undefined as number | undefined,
}
const form = ref({ ...def })

function onForm(item, index: number) {
  showAction.value = true
  form.value = { ...item }
  editIndex.value = index
}

function selectType() {
  showActionSheet<{
    type: number
  }>({
    actions: modules.value,
    teleport: '#SetupScreen',
    cancelText: '取消',
    closeOnClickAction: true,
    onSelect: (action, index) => {
      form.value.type = action.type
      form.value.prefix = action.prefix
    },
  })
}

function onSubmit() {
  let new_data = fieldsFilter(form.value, 'type', 'prefix', 'delay', 'size')
  if (editIndex.value !== -1) {
    option.module[editIndex.value] = new_data
  } else {
    option.module.push(new_data)
  }
  showAction.value = false
}

let canvas: HTMLCanvasElement | null = null
let ctx: CanvasRenderingContext2D | null = null

let watchHandles: any
const loading = ref(false)
onMounted(async () => {
  try {
    setTimeout(async () => {
      canvas = document.getElementById('logo') as HTMLCanvasElement
      canvas.width = 32 // 画布实际宽度（像素）
      canvas.height = 32 // 画布实际高度（像素）
      ctx = canvas.getContext('2d')!
      // 禁用抗锯齿
      ctx.imageSmoothingEnabled = false
      bytesToBinary(option.logo, canvas!)
    }, 1)
  } catch (e) {
    show.value = false
    loading.value = false
  }
})
onUnmounted(() => {
  watchHandles && watchHandles()
})

function beforeLogo(file: File | File[]) {
  if (Array.isArray(file)) file = file[0]
  // 检查文件类型是否为图像
  if (!file.type.match('image.*')) {
    alert('请选择图片文件！')
    return false
  }
  const reader = new FileReader()
  reader.onload = function (event) {
    const img = new Image()
    img.onload = function () {
      ctx!.fillStyle = 'black'
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)
      ctx!.globalCompositeOperation = 'copy'
      ctx!.filter = `contrast(${10000}%)`
      ctx!.drawImage(img, 0, 0, 32, 32)
      toBinary(canvas!)
      option.logo = getBytes(canvas!)
    }
    img.src = event.target?.result as string
  }
  // 读取文件为Data URL
  reader.readAsDataURL(file)
  return false
}

function getBytes(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  let byteString = ''
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] + data[i + 1] + data[i + 2] + data[i + 3] === 255 * 4) {
      byteString += '1'
    } else {
      byteString += '0'
    }
  }
  const bytes = [] as any[]
  for (let i = 0; i < byteString.length; i += 8) {
    bytes.push(parseInt(byteString.substring(i, i + 8), 2))
  }
  return bytes
}

// 转换为黑白二值图片
function toBinary(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const threshold = 128
  for (let i = 0; i < data.length; i += 4) {
    // 计算灰度值（使用亮度公式）
    const alpha = data[i + 3] / 255
    const gray = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) * alpha
    // 根据阈值转换为黑白
    const bw = gray >= threshold ? 255 : 0
    // 设置RGB值（Alpha保持不变）
    data[i] = data[i + 1] = data[i + 2] = bw
    data[i + 3] = 255
  }
  ctx.putImageData(imageData, 0, 0)
  return data
}

// 黑白反转
function reverseBinary() {
  const imageData = ctx!.getImageData(0, 0, canvas!.width, canvas!.height)
  const _data = imageData.data
  for (let i = 0; i < _data.length; i += 4) {
    if (_data[i] === 255) {
      _data[i] = _data[i + 1] = _data[i + 2] = 0
    } else {
      _data[i] = _data[i + 1] = _data[i + 2] = 255
    }
  }
  ctx!.putImageData(imageData, 0, 0)
  option.logo = getBytes(canvas!)
}

// 字节数组转二进制图片
function bytesToBinary(bytes: number[], canvas?: HTMLCanvasElement) {
  let data = [] as number[]
  for (let i = 0; i < bytes.length; i++) {
    let byte = bytes[i]
    let binary = byte.toString(2)
    while (binary.length < 8) {
      binary = '0' + binary
    }
    for (let j = 0; j < binary.length; j++) {
      if (binary[j] === '1') {
        data.push(255, 255, 255, 255)
      } else {
        data.push(0, 0, 0, 255)
      }
    }
  }
  if (canvas) {
    const ctx = canvas.getContext('2d')!
    ctx.putImageData(new ImageData(Uint8ClampedArray.from(data), 32, 32), 0, 0)
  }

  return data
}
</script>
<style lang="scss" scoped>
.van-uploader {
  :deep(.van-uploader__input-wrapper) {
    width: 100%;
  }
}
</style>
