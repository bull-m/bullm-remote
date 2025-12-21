<template>
  <div class="car-details">
    <div class="top">
      <div class="left">
        <div class="head select-btn" @click="emit('back')">< 返回</div>
        <div style="display: flex; gap: 10px">
          <div class="mode-btn select-btn" @click="isVideoMode = true" :class="{ is: isVideoMode }" style="flex: 1; height: 130px">
            <IconSvgLive />
            FPV模式
          </div>
          <div class="mode-btn select-btn" @click="onTip" :class="{ is: !isVideoMode }" style="flex: 1; height: 130px">
            <van-badge content="开发中" color="#1989fa">
              <IconSvgControl />
            </van-badge>
            纯控制模式
          </div>
        </div>
        <div class="links" v-if="car?.links?.length ?? 0 > 0">
          <div style="font-size: 13px">连接通道</div>
          <div class="link select-btn" :class="{ is: i === selectIndex }" @click="selectIndex = i" v-for="(line, i) in car?.links">
            {{ line.name }}
            <ZTag>在线</ZTag>
          </div>
        </div>
        <ZNullCell class="bj" v-else>没有能连上这辆小车的通道</ZNullCell>
      </div>
      <div class="right">
        <div class="icon">
          <img :src="getCarIcon(car)" alt="" />
        </div>

        <div class="name">
          <div>{{ car?.name || car?.mac }}</div>
        </div>
      </div>
    </div>
    <div class="bottom">
      <div class="options">
        <div class="option" v-if="!isStar" @click="onStarCar(car)">
          <IconMdiChristmasStarOutline />
          <div>收藏</div>
        </div>
        <div class="option" v-if="isStar" @click="onNoStarCar(car)">
          <IconMdiChristmasStar />
          <div>已收藏</div>
        </div>
        <div class="option" v-if="isStar" @click="setupCar(car)">
          <IconSvgSetup />
          <div>设置</div>
        </div>
        <div class="option" @click="scanCar()">
          <div v-if="scanLoading" style="width: 19.2px; height: 19.2px">
            <van-loading size="16" type="spinner" color="#FFFFFF" />
          </div>
          <IconMdiRefresh v-else />
          <div>刷新状态</div>
        </div>
      </div>
      <div class="btns">
        <div class="link" v-if="car?.links?.length ?? 0 > 0" @click="onLink">连接 <(￣︶￣)↗[GO!]</div>
        <div class="unlink" v-else>离线</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PromiseType } from '@/typings'
import { CarInfo, useStoreLink } from '@/store/link'
import { getCarIcon } from '@/views/Home/utils.ts'
import { debugAutoLink } from '@/views/debug.ts'

const link = useStoreLink()
type LinkType = PromiseType<ReturnType<typeof link.scan>>
type CarType = LinkType['cars'][0]
const props = defineProps<{
  car: CarType
  scan: () => Promise<any>
}>()
const emit = defineEmits<{
  (e: 'back'): void
  (e: 'setup'): void
}>()

const isVideoMode = ref(true)
const selectIndex = ref<number>(0)
const isStar = computed(() => {
  return link.star_car.find(x => x.mac === props.car.mac)
})

function setupCar(car: CarType) {
  emit('setup')
}

function onLink() {
  // 是否选中连接通道
  const selectLink = props.car.links[selectIndex.value]
  link
    .connectCar(props.car.mac, selectLink ? selectLink : undefined)
    .then(() => {
      showToast({ message: '连接成功 <(￣︶￣)↗[GO!]' })
    })
    .catch(e => {
      showToast('连接失败了：' + e.message)
    })
}

function onTip() {
  showDialog({ title: '敬请期待', message: '还在疯狂敲码中 (￣ε(#￣)' })
}

function onStarCar(car: CarInfo) {
  link.star_car.push({
    name: car.name,
    mac: car.mac,
    version: car.version,
    hardware_version: car.hardware_version,
    type: car.type,
  })
  showToast('收藏成功')
}

function onNoStarCar(car: CarInfo) {
  showConfirmDialog({
    title: '要取消收藏吗 ♪(´▽｀)',
    message: '取消收藏后如果没有通道能连接小车时将不会显示在首页',
  }).then(() => {
    link.star_car = link.star_car.filter(x => x.mac !== car.mac)
  })
}

const scanLoading = ref(false)
function scanCar() {
  scanLoading.value = true
  props.scan().finally(() => {
    scanLoading.value = false
  })
}

watch(
  () => props.car.links,
  () => {
    if (props.car.links.length) {
      // 调试自动连接
      if (debugAutoLink) {
        onLink()
      }
    }
  },
  { once: true }
)

onMounted(() => {
  scanCar()
})
</script>

<style scoped lang="scss">
.bj {
  background-color: #00000050;
  backdrop-filter: blur(10px);
  border-radius: 5px;
}

.select-btn {
  background-color: #00000050;
  backdrop-filter: blur(10px);
  border-radius: 5px;
  border: 2px solid transparent;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background-color: #11111150;
  }

  &:active {
    background-color: #00000050;
  }

  &.is {
    //background-color: #99999950;
    border: 2px solid #2e8b57;
    color: #2e8b57;
  }
}

.car-details {
  display: flex;
  position: relative;
  padding: 10px;

  .top {
    width: 100%;
    display: flex;
    flex: 1;
    overflow: hidden;
  }
}

.bottom {
  display: flex;
  position: relative;
  padding: 10px 20px 20px;

  .options {
    display: flex;
    gap: 25px;

    .option {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 16px;
      cursor: pointer;

      .icon {
        font-size: 20px;
      }
    }
  }

  .btns {
    margin-top: auto;
    display: flex;
    gap: 20px;
    width: 55%;
    margin-left: auto;

    div {
      height: 50px;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #ffffff20;
      backdrop-filter: blur(10px);
      border-radius: 5px;
      font-size: 18px;
      cursor: pointer;

      &.link {
        background-color: #27ae60;

        &:hover {
          background-color: #29bd67;
        }

        &:active {
          background-color: #209953;
        }
      }

      &.unlink {
        background-color: #e67e22;
      }
    }
  }
}

.left {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-right: 30px;
  gap: 10px;

  .head {
    height: 45px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    font-size: 17px;
  }

  .mode-btn {
    font-size: 16px;
    gap: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .icon {
      width: 60px;
      height: 60px;
      padding: 10px;
      //background-color: #ffffff15;
      border-radius: 50%;
    }
  }

  .links {
    margin-top: 2px;

    .link {
      padding: 0 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 45px;
      font-size: 18px;
    }
  }
}

.right {
  width: 55%;
  display: flex;
  flex-direction: column;
  //margin-bottom: 20px;

  .icon {
    flex: 1;
    width: 100%;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 45px;

    > img {
      display: block;
      object-fit: contain;
      max-width: 100%;
      max-height: 100%;
      view-transition-name: detail-img;
    }
  }

  .name {
    margin-left: 5px;
    //height: 60px;
    display: flex;
    align-items: center;
    color: #fff;

    div {
      font-size: 20px;
      view-transition-name: detail-name;
    }
  }
}
</style>
