<template>
  <div class="dynamics-jt-4">
    <div class="item top" v-if="pitch">
      <img class="img-1" src="./assets/jt.svg" alt="" />
      <img class="img-2" src="./assets/jt.svg" alt="" />
    </div>
    <div class="item left" v-if="roll">
      <img class="img-1" src="./assets/jt.svg" alt="" />
      <img class="img-2" src="./assets/jt.svg" alt="" />
    </div>
    <div class="item right" v-if="roll">
      <img class="img-1" src="./assets/jt.svg" alt="" />
      <img class="img-2" src="./assets/jt.svg" alt="" />
    </div>
    <div class="item bottom" v-if="pitch">
      <img class="img-1" src="./assets/jt.svg" alt="" />
      <img class="img-2" src="./assets/jt.svg" alt="" />
    </div>
    <div class="item text">
      移动
      <br />
      云台
    </div>
  </div>
</template>

<style scoped lang="scss">
.dynamics-jt-4 {
  position: relative;

  .item {
    position: absolute;
    transform: translate(-50%, -50%);
    display: flex;

    img {
      height: 40px;
      opacity: 0;
    }

    .img-1 {
      animation:
        jt-move 2s infinite 0.1s,
        jt-move-o 2s infinite;
    }

    .img-2 {
      margin-left: -20px;
      animation:
        jt-move 2s infinite,
        jt-move-o 2s infinite;
    }

    //  左右运动的往复动画
    @keyframes jt-move-o {
      0% {
        opacity: 0;
      }
      50% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
    //  左右运动的往复动画
    @keyframes jt-move {
      0% {
        transform: translateX(0);
      }
      50% {
        transform: translateX(15px);
      }
      100% {
        transform: translateX(0);
      }
    }
  }

  .text {
    top: 50%;
    left: 50%;
    color: #ffffffdd;
    line-height: 1.1;
    animation: text-move 2s infinite;
    //  左右运动的往复动画
    //@keyframes text-move {
    //  0% {
    //    opacity: 0.1;
    //  }
    //  50% {
    //    opacity: 1;
    //  }
    //  100% {
    //    opacity: 0.1;
    //  }
    //}
  }
  .top {
    top: 35%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-90deg);
  }

  .left {
    top: 50%;
    left: 35%;
    transform: translate(-50%, -50%) rotate(180deg);
  }

  .right {
    top: 50%;
    left: 65%;
    transform: translate(-50%, -50%) rotate(0deg);
  }

  .bottom {
    top: 65%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(90deg);
  }
}
</style>
<script setup lang="ts">
defineProps<{
  pitch?: boolean
  roll?: boolean
}>()
</script>
