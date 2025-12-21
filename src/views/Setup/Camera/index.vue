<template>
  <ZPopupSetup @open="init" @close="ui.setup.noOverlay = false" :reset="resetVideo" title="实时画面配置" overlay-class="no-overlay">
    <van-cell-group inset title="信息">
      <van-cell title="摄像头名称" :value="video.info_name" />
      <van-cell title="摄像头PID" :value="video.info_pid" />
      <van-cell title="最大分辨率" :value="framesizeType.find(({ value }) => value == video.info_max_size)?.text" />
    </van-cell-group>

    <van-cell-group inset>
      <template #title>
        <ZFlex align="center" justify="space-between" style="margin-bottom: -10px" :gap="5">
          相机配置
          <van-button type="warning" size="mini" style="padding: 0 10px">重置</van-button>
        </ZFlex>
      </template>
      <ZVanSlider label="时钟" v-model="video.xclk" :max="60" :min="1" @change="updateConfig('xclk', $event)" />
      <van-field
        :model-value="framesizeType.find(({ value }) => value == video.framesize)?.text"
        is-link
        readonly
        label="分辨率"
        placeholder="选择分辨率"
        @click="showPopupFramesize = true" />
      <ZVanSlider label="质量" v-model="video.quality" :min="4" :max="63" @change="updateConfig('quality', $event)" />
      <ZVanSlider label="亮度" v-model="video.brightness" :min="-2" :max="2" @change="updateConfig('brightness', $event)" />
      <ZVanSlider label="对比度" v-model="video.contrast" :min="-2" :max="2" @change="updateConfig('contrast', $event)" />
      <ZVanSlider label="饱和度" v-model="video.saturation" :min="-2" :max="2" @change="updateConfig('saturation', $event)" />
      <!--        <ZVanSlider label="锐度" v-model="video.sharpness" :min="-2" :max="2"-->
      <!--                    @change="updateConfig('sharpness', $event)"/> -->
      <van-field
        :model-value="special_effectType.find(({ value }) => value == video.special_effect)?.text"
        is-link
        readonly
        label="特殊效果"
        placeholder="选择特殊效果"
        @click="showPopupSpecialEffect = true" />
      <VanNoticeBar>调整下面这些设置可能会出现奇奇怪怪的问题 😀</VanNoticeBar>
      <ZVanSwitch label="白平衡(AWB)" v-model="video.awb" @change="updateConfig('awb', $event)" />
      <ZVanSwitch label="自动白平衡增益" v-model="video.awb_gain" @change="updateConfig('awb_gain', $event)" />
      <van-field
        v-show="video.awb_gain"
        :model-value="wb_modeType.find(({ value }) => value == video.wb_mode)?.text"
        is-link
        readonly
        label="白平衡模式"
        placeholder="选择白平衡模式"
        @click="showPopupWBMode = true" />
      <ZVanSwitch label="曝光控制" v-model="video.aec" @change="updateConfig('aec', $event)" />
      <ZVanSwitch label="自动曝光校准 影响帧率" v-model="video.aec2" @change="updateConfig('aec2', $event)" />
      <ZVanSlider label="曝光级别" v-model="video.ae_level" :min="-2" :max="2" @change="updateConfig('ae_level', $event)" />
      <ZVanSlider v-show="!video.aec" label="曝光实际值" v-model="video.aec_value" :min="0" :max="1200" @change="updateConfig('aec_value', $event)" />
      <ZVanSwitch label="增益控制" v-model="video.agc" @change="updateConfig('agc', $event)" />
      <ZVanSlider label="自动增益" v-show="!video.agc" v-model="video.agc_gain" :min="0" :max="30" @change="updateConfig('agc_gain', $event)" />
      <ZVanSlider label="增益上限" v-show="video.agc" v-model="video.gainceiling" :min="0" :max="6" @change="updateConfig('gainceiling', $event)" />
      <ZVanSwitch label="黑像点校正" v-model="video.bpc" @change="updateConfig('bpc', $event)" />
      <ZVanSwitch label="白像素校正" v-model="video.wpc" @change="updateConfig('wpc', $event)" />
      <ZVanSwitch label="原始图像 Gamma 校正" v-model="video.raw_gma" @change="updateConfig('raw_gma', $event)" />
      <ZVanSwitch label="镜头失真校正" v-model="video.lenc" @change="updateConfig('lenc', $event)" />
      <ZVanSwitch label="动态裁剪白平衡" v-model="video.dcw" @change="updateConfig('dcw', $event)" />
      <ZVanSwitch label="颜色条" v-model="video.colorbar" @change="updateConfig('colorbar', $event)" />
    </van-cell-group>
    <!-- <div class="sticky bottom-0 flex gap-10px p-10px">
        <van-button round block type="primary" size="small" @click="op.resetVideo()">重置</van-button>
        <van-button round block plain type="primary" size="small" @click="show = false">返回</van-button>
    </div> -->
    <!-- 选择分辨率 -->
    <van-popup v-model:show="showPopupFramesize" round position="bottom">
      <van-picker
        title="太高会卡死的哦"
        :columns="framesizeType.slice(0, video.info_max_size + 1)"
        @cancel="showPopupFramesize = false"
        :model-value="[video.framesize]"
        @confirm="
          x => {
            showPopupFramesize = false
            video.framesize = x.selectedValues[0]
            updateConfig('framesize', x.selectedValues[0])
          }
        " />
    </van-popup>
    <!-- 选择特殊效果 -->
    <van-popup v-model:show="showPopupSpecialEffect" round position="bottom">
      <van-picker
        :columns="special_effectType"
        @cancel="showPopupSpecialEffect = false"
        :model-value="[video.special_effect]"
        @confirm="
          x => {
            showPopupSpecialEffect = false
            video.special_effect = x.selectedValues[0]
            updateConfig('special_effect', x.selectedValues[0])
          }
        " />
    </van-popup>
    <!-- 选择白平衡模式 -->
    <van-popup v-model:show="showPopupWBMode" round position="bottom">
      <van-picker
        :columns="wb_modeType"
        @cancel="showPopupWBMode = false"
        :model-value="[video.wb_mode]"
        @confirm="
          x => {
            showPopupWBMode = false
            video.wb_mode = x.selectedValues[0]
            updateConfig('wb_mode', x.selectedValues[0])
          }
        " />
    </van-popup>
  </ZPopupSetup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ZVanSlider from '@/components/form/ZVanSlider.vue'
import ZVanSwitch from '@/components/form/ZVanSwitch.vue'
import { WsSendFuncMode } from '@/utils/car/message.ts'
import ZFlex from '@/components/base/ZFlex.vue'
import { useStoreUi } from '@/store/ui.ts'

const ui = useStoreUi()
const showPopupFramesize = ref(false)
const showPopupSpecialEffect = ref(false)
const showPopupWBMode = ref(false)

function init() {
  ui.setup.noOverlay = true
  WsSendFuncMode('camera', 'get')
    .then(data => {
      Object.keys(video.value).forEach(key => {
        if (typeof video.value[key] == 'boolean') {
          video.value[key] = !!data[key]
        } else {
          video.value[key] = data[key]
        }
        if (key === 'xclk') {
          video.value[key] = data[key] / 1000000
        }
      })
    })
    .catch(err => {
      showToast('获取设置失败')
    })
}

const video = ref({
  xclk: 20,
  framesize: 0, // 分辨率
  quality: 10, // 质量
  brightness: 0, // 亮度
  contrast: 0, // 对比度
  saturation: 0, // 饱和度
  sharpness: 0, // 锐度
  special_effect: 0, // 特殊效果
  awb: true, // 自动白平衡(AWB)
  awb_gain: true, // 自动白平衡增益(AWB GAIN)
  wb_mode: 0, // 白平衡模式
  aec: true, // 自动曝光(AEC SENSOR)
  aec2: true, // 自动曝光(AEC DSP)
  ae_level: 0, // 自动曝光水平(AE Level)
  aec_value: 0, // 曝光(Exposure)
  agc: true, // 自动增益(AGC)
  agc_gain: 0, // 增益(Gain)
  gainceiling: 0, // 增益上限(Gain Ceiling)
  bpc: false, // (BPC)
  wpc: false, // (WPC)
  raw_gma: false, // (Raw GMA)
  lenc: false, // (Lens Correction)
  hmirror: false, // (H-Mirror)
  vflip: false, // (V-Flip)
  dcw: false, // (DCW (Downsize EN))
  colorbar: false, // (Color Bar)

  info_name: '',
  info_max_size: 21,
  info_model: 0,
  info_pid: 0,
  info_support_jpeg: false,
})

const framesizeType = [
  { value: 0, text: '96x96' },
  { value: 1, text: 'QQVGA(160x120)' },
  { value: 2, text: 'QCIF(176x144)' },
  { value: 3, text: 'HQVGA(240x176)' },
  { value: 4, text: '240x240' },
  { value: 5, text: 'QVGA(320x240)' },
  { value: 6, text: 'CIF(400x296)' },
  { value: 7, text: 'HVGA(480x320)' },
  { value: 8, text: 'VGA(640x480)' },
  { value: 9, text: 'SVGA(800x600)' },
  { value: 10, text: 'XGA(1024x768)' },
  { value: 11, text: 'HD(1280x720)' },
  { value: 12, text: 'SXGA(1280x1024)' },
  { value: 13, text: 'UXGA(1600x1200)' },
  { value: 14, text: 'FHD(1920x1080)' },
  { value: 15, text: 'P_HD(720x1280)' },
  { value: 16, text: 'P_3MP(864x1536)' },
  { value: 17, text: 'QXGA(2048x1536)' },
  { value: 18, text: 'QHD(2560x1440)' },
  { value: 19, text: 'WQXGA(2560x1600)' },
  { value: 20, text: 'P_FHD(1080x1920)' },
  { value: 21, text: 'QSXGA(2560x1920)' },
]
const special_effectType = [
  { value: 0, text: '无效果' },
  { value: 1, text: '负片' },
  { value: 2, text: '灰度' },
  { value: 3, text: '红色色调' },
  { value: 4, text: '绿色色调' },
  { value: 5, text: '蓝色色调' },
  { value: 6, text: '棕褐色' },
]
const wb_modeType = [
  { value: 0, text: '自动(Auto)' },
  { value: 1, text: 'Sunny' },
  { value: 2, text: '阴天(Cloudy)' },
  { value: 3, text: 'Office' },
  { value: 4, text: 'Home' },
]

function updateConfig(id, value: any) {
  if (typeof value == 'boolean') {
    value = value ? 1 : 0
  }
  if (typeof value == 'undefined') {
    value = ''
  }
  return WsSendFuncMode('camera', `set`, {
    name: id,
    value: String(value),
  })
    .then(data => {
      if (id === 'agc' && !video.value.agc) {
        updateConfig('agc_gain', video.value.agc_gain)
      }
      if (id === 'awb_gain' && video.value.awb_gain) {
        updateConfig('wb_mode', video.value.wb_mode)
      }
    })
    .catch(err => {
      showToast('设置失败')
    })
}

function resetVideo() {
  showConfirmDialog({
    title: '确定重置到默认设置吗？',
  }).then(() => {
    updateConfig('reset', 0).then(() => {
      init()
      showToast('重置成功')
    })
  })
}
</script>
<style lang="scss"></style>
<style lang="scss" scoped></style>
