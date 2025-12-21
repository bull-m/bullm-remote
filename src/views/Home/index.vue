<!--
版权所有 © 2025 牛明工作室 / yy祝。保留所有权利。
SPDX-License-Identifier: MIT
根据 MIT 许可证（MIT License）授权。
-->
<template>
  <div class="bj-box" data-me="U2FsdGVkX18KdVjj8xJmajBuZSFc1WXU7HjTZnnjJtYY7bPDufe0wj2u3ohbXvd+cweo3EXASw==">
    <div class="app-region" v-if="!isMobile()" @mousedown="appWindow.startDragging">
      <div class="logo">
        <IconSvgLogo />
        <span class="title">牛明 - 远控</span>
        <ZTag @mousedown.stop style="margin-left: 15px; cursor: pointer" @click="showUpdate = true">
          {{ isUpdate ? '有新版本' : '已经是最新版本' }}
        </ZTag>
        <van-badge @mousedown.stop :content="noticeNum > 0 ? noticeNum : undefined" v-if="noticeNum >= 0">
          <ZTag style="margin-left: 15px; cursor: pointer" @click="showNotice = true">
            {{ noticeNum == 0 ? '公告' : `有未读公告` }}
          </ZTag>
        </van-badge>
      </div>
      <Titlebar />
    </div>
    <div class="main" v-if="!isDetails" :class="{ mobile: isMobile() }">
      <div class="content">
        <div class="list">
          <template v-for="(car, i) in [...car_star, ...car_order]" :key="i">
            <div class="item" :class="{ 'view-transition': car.mac === selectedCar?.mac }" @click="onCarClick(car)">
              <div class="icon">
                <img :src="getCarIcon(car)" alt="" />
              </div>
              <van-text-ellipsis class="name" :content="car.name || car.mac"></van-text-ellipsis>
              <div class="info">
                <ZPopover @click.stop placement="right">
                  <ZFlex align="center" :gap="5">
                    <ZTag v-if="car.links?.length > 0">在线:{{ car.links?.length }}</ZTag>
                    <ZTag v-else type="warn">离线</ZTag>
                    <van-loading size="19px" v-if="scanLoading" type="spinner" />
                  </ZFlex>
                  <template #popup>
                    <van-cell-group style="width: 200px">
                      <template v-if="car.links?.length > 0">
                        <!--  连接指定的通道  -->
                        <van-cell v-for="line in car.links" clickable :title="line.name" value="在线"></van-cell>
                      </template>
                      <ZNullCell v-else>没有能连上这辆小车的通道</ZNullCell>
                    </van-cell-group>
                  </template>
                </ZPopover>

                <ZTag v-if="car.esp_reset_reason != 1 && car.links?.length > 0" type="error" @click.stop="onShowError(car.esp_reset_reason)">
                  警告
                </ZTag>
                <IconSvgSetup v-if="i < car_star.length" @click.stop="setupCar(car)" />
                <div v-else class="tag add">未收藏</div>
              </div>
            </div>
            <div
              v-if="i === car_star.length - 1 && car_order.length > 0 && car_star.length > 0"
              style="height: 200px; width: 2px; background-color: #99999930; flex-shrink: 0"></div>
          </template>
          <div v-if="car_star.length + car_order.length === 0" style="width: 100%; display: flex; justify-content: center">
            <van-empty
              image="network"
              description="没有在线的小车，也没有收藏的小车哦~"
              style="--van-empty-description-color: #eee"
              image-size="90" />
          </div>
        </div>
        <div class="links">
          <div style="margin-bottom: 5px; display: flex; align-items: center; gap: 10px; color: #fff">连接通道</div>
          <div class="link" v-for="(link, i) in links" :key="i" @click="onLinkClick(link.linkOption)">
            <div class="host">{{ link.linkOption.name }}</div>
            <van-loading size="17px" style="margin-right: 10px" class="icon" v-if="scanLoading" type="spinner" color="#FFFFFF" />
            <ZTag v-else-if="link.state == 'success'">在线:{{ link.cars.length }}</ZTag>
            <ZTag v-else-if="link.state == 'error-token'" type="warn">鉴权失败</ZTag>
            <ZTag v-else type="warn">离线</ZTag>
          </div>
        </div>
      </div>
      <div class="bottom">
        <div class="btns">
          <div class="btn" @click="onScanCar">
            <van-loading class="icon" v-if="scanLoading" type="spinner" color="#FFFFFF" />
            <IconSvgRefresh v-else />
            <div class="name">刷新</div>
          </div>
          <div class="btn" @click="onAddLink">
            <IconSvgAdd2 />
            <div class="name">添加链接</div>
          </div>
          <div class="btn" @click="showScan = true">
            <IconSvgScan />
            <div class="name">扫描</div>
          </div>
          <div class="btn" @click="showSetup = true">
            <IconSvgSetup />
            <div class="name">设置</div>
          </div>
        </div>
      </div>
      <!--   是的，我们根据MIT许可证许可，我们允许你进行商用，但是我们希望您在商用或者修改我们软件的时候不要删除我们的名字，谢谢❤️   -->
      <div class="copyright" title="版权所有 © 2025 牛明工作室 / yy祝。保留所有权利。">© 2025 牛明工作室 / yy祝</div>
      <AppInfoDialog v-model:show="showSetup" />
    </div>
    <CarDetails class="main" v-else :car="selectedCar!" @setup="setupCar(selectedCar!)" :scan="scan" @back="backDetails" />

    <ScanDialog v-model:show="showScan" />
    <NoticeDialog v-model:show="showNotice" v-model:notice-num="noticeNum" />
    <UpdateDialog v-model:show="showUpdate" v-model:is-update="isUpdate" />
  </div>
</template>
<script setup lang="ts">
import { PromiseType } from '@/typings'
import { ref } from 'vue'
import { LinkOption, useStoreLink } from '@/store/link'
import { openDialog } from '@/utils/ui/dialog.ts'
import AppInfoDialog from '@/views/Home/dialog/AppInfoDialog.vue'
import CarDetails from '@/views/Home/CarDetails.vue'
import { getCarIcon } from '@/views/Home/utils.ts'
import ScanDialog from '@/views/Home/dialog/ScanDialog.vue'
import UpdateDialog from '@/views/Home/dialog/UpdateDialog.vue'
import NoticeDialog from '@/views/Home/dialog/NoticeDialog.vue'
import { isMobile } from '@/utils/system/os.ts'
import { getCurrentWindow } from '@tauri-apps/api/window'
import Titlebar from '@/components/business/Titlebar.vue'

const appWindow = getCurrentWindow()

const link = useStoreLink()

const showSetup = ref(false)
const showScan = ref(false)
const showNotice = ref(false)
const noticeNum = ref(-1) // 通知数量
const showUpdate = ref(false)
const isUpdate = ref(false) // 是否有更新

type LinkType = PromiseType<ReturnType<typeof link.scan>>
type CarType = LinkType['cars'][0]
const links = ref<LinkType['links']>([])
const car_all = ref<CarType[]>([]) // 全部在线的车

const car_star = computed<CarType[]>(() => {
  return link.star_car.map(s => {
    return {
      ...s,
      ...(car_all.value.find(c => s.mac === c.mac) || {}),
      name: s.name || s.mac,
    } as CarType
  })
})
const car_order = computed(() => {
  return car_all.value.filter(car => !link.star_car.some(s => s.mac === car.mac))
})

const scanLoading = ref(false)
let scanProm: Promise<void> | null
// 后台扫描
function scan() {
  if (scanProm) return scanProm
  return (scanProm = link
    .scan()
    .then(res => {
      console.log(res)
      links.value = res.links
      car_all.value = res.cars
    })
    .finally(() => {
      scanProm = null
      scanLoading.value = false
    }))
}

function onScanCar() {
  scanLoading.value = true
  return scan()
}

let scanInterval: any
onMounted(() => {
  links.value = link.linkOptions.map(x => ({
    linkOption: x,
    cars: [],
    state: 'error',
  }))
  onScanCar()
  // 轮询扫描
  scanInterval = setInterval(scan, 5000)
})
onUnmounted(() => {
  scanInterval && clearInterval(scanInterval)
})

const isDetails = ref(false)
const selectMac = ref('')
const selectedCar = computed(() => {
  const car = car_all.value.find(x => x.mac === selectMac.value)
  const star = car_star.value.find(x => x.mac === selectMac.value)
  if (star) {
    return {
      ...star,
      ...car,
      name: star.name || car!.mac,
    }
  }
  return car
})

function backDetails() {
  document.startViewTransition(() => {
    isDetails.value = false
  })
}

function onCarClick(car: CarType, line?: LinkOption) {
  selectMac.value = car.mac
  nextTick(() => {
    document.startViewTransition(() => {
      isDetails.value = true
    })
  })
}

function onAddLink() {
  onLinkClick()
}

function setupCar(car: CarType) {
  openDialog(() => import('@/views/Home/dialog/SetupCarDialog.vue'), {
    mac: car.mac,
    name: car.name,
    onSubmit: (new_name: string) => {
      const car2 = link.star_car.find(s => s.mac === car.mac)
      if (car2) {
        car2.name = new_name
      } else {
        showToast('这个车没有被收藏，无法设置名称')
      }
    },
    onDelect: () => {
      const index = link.star_car.findIndex(s => s.mac === car.mac)
      if (index !== -1) {
        link.star_car.splice(index, 1)
      } else {
        showToast('这个车没有被收藏，无法删除')
      }
    },
  })
}

function onLinkClick(link?: LinkOption) {
  if (link?.type === 'hotspot') {
    showToast('特殊连接，不可操作')
    return
  }
  openDialog(() => import('@/views/Home/dialog/LinkDialog.vue'), {
    link: link,
    onSubmit: () => {
      onScanCar()
    },
  })
}

function onShowError(reason: number = -1) {
  const errs = [
    '原因无法确定',
    '电源上电复位',
    '外部复位(复位引脚)',
    '软件复位(esp_restart)',
    '异常/看门狗复位',
    '中断看门狗复位',
    '任务看门狗复位',
    '其他看门狗复位',
    '从深度睡眠唤醒',
    '欠压复位(Brownout)',
    'SDIO复位',
  ]
  showConfirmDialog({
    title: '异常重启',
    message: `原因：${errs[reason] ?? '未知原因'}`,
    confirmButtonText: '我知道了',
    showCancelButton: false,
  })
}

if (link.default_mac) {
  const car = car_star.value.find(x => x.mac === link.default_mac)
  if (car) {
    selectMac.value = car.mac
    isDetails.value = true
  }
}
</script>

<style scoped lang="scss">
.bj-box {
  height: 100%;
  width: 100%;
  position: relative;
  background: linear-gradient(135deg, #001200 0%, #001a00 10%, #002b00 35%, #001a00 75%, #000000 100%);
  display: flex;
  // 重置参考
  transform: scale(1);
}

.logo {
  font-size: 23px;
  display: flex;
  align-items: center;
  opacity: 0.8;
  margin-left: 15px;

  .icon {
    display: block;
  }

  .title {
    font-size: 17px;
    margin-left: 8px;
    font-weight: bold;
    line-height: 1;
    margin-right: 10px;
  }
}

.app-region {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--top-height);
  z-index: 2;
  display: flex;
  justify-content: space-between;
}

.main {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
  font-family: 'SmileySans-Oblique', serif;
  max-width: 1060px;
  max-height: 600px;
  margin: auto;
  padding-top: var(--top-height);

  &.mobile {
    padding-top: 0;
  }

  .bottom {
    width: 100%;
    height: 25%;
    min-height: 70px;
    position: relative;
    //border-top: 1px solid #ffffff60;
  }

  .content {
    width: 100%;
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    overflow: hidden;
  }
}

.list {
  display: flex;
  gap: 20px;
  padding: 20px;
  position: relative;
  height: 100%;
  align-items: center;
  overflow-y: auto;
  width: calc(100% - 230px);
  mask: linear-gradient(90deg, #fff 96%, #ffffff00 100%);

  &::-webkit-scrollbar {
    display: none;
  }

  .item {
    border-radius: 20px;
    padding: 20px;
    //height: 100%;
    position: relative;
    display: flex;
    align-items: self-start;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    cursor: pointer;
    user-select: none;
    width: 220px;
    max-height: 320px;
    height: 100%;
    flex-shrink: 0;
    box-shadow: 0 0 12px 2px #00000022;
    transition: all 0.2s ease;
    background-color: #00000050;
    backdrop-filter: blur(10px);

    &:hover {
      background-color: #00000070;
    }

    &:active {
      background-color: #00000090;
      box-shadow: 0 0 0 0 #00000000;
    }

    &.view-transition {
      .icon > img {
        view-transition-name: detail-img;
      }

      .name {
        view-transition-name: detail-name;
      }
    }

    .icon {
      flex: 1;
      width: 100%;
      position: relative;
      margin-bottom: auto;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      > img {
        border-radius: 20px;
        max-width: 100%;
        max-height: 100%;
        display: block;
        object-fit: contain;
      }
    }

    .name {
      font-size: 20px;
      font-weight: bold;
      color: #fff;
      text-align: left;
    }

    .info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;

      > svg {
        background-color: #bbbbbbcc;
        padding: 5px;
        height: 30px;
        width: 30px;
        border-radius: 50%;
        cursor: pointer;
        flex: none;

        &:active {
          background-color: #999999cc;
        }
      }
    }
  }
}

.links {
  width: 230px;
  height: 100%;
  padding: 20px 10px;
  overflow: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  .link {
    padding: 6px 10px;
    font-size: 19px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 10px;
    cursor: pointer;
    margin-bottom: 10px;
    transition: all 0.2s ease;
    font-weight: bold;
    color: #fff;
    background-color: #00000050;
    backdrop-filter: blur(10px);
    box-shadow: 0 0 8px 5px #00000008;

    &:hover {
      background-color: #00000070;
    }

    &:active {
      background-color: #00000090;
      box-shadow: 0 0 0 0 #00000000;
    }
  }
}

.btns {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 10px;

  .btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px;
    cursor: pointer;
    gap: 6px;

    &:hover .icon {
      background-color: #88888870;

      [theme='dark'] & {
        background-color: #ffffff22;
      }
    }

    &:active .icon {
      background-color: #88888860;

      [theme='dark'] & {
        background-color: #ffffff11;
      }
    }

    .icon {
      width: 40px;
      height: 40px;
      padding: 10px;
      border-radius: 10px;
      transition: all 0.2s ease;
      background-color: #cccccc33;
      backdrop-filter: blur(10px);
    }

    .name {
      font-size: 13px;
      color: #fff;
      margin-top: 3px;
    }
  }
}

.copyright {
  position: absolute;
  bottom: 10px;
  left: 10px;
  font-size: 12px;
  color: #ffffffaa;
  font-family: 'SmileySans-Oblique', serif;
}
</style>
