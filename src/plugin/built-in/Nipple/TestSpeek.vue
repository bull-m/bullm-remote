<template>
  <div class="list" style="">
    <div class="box">
      <div class="box-2">
        <div class="bar" :style="{ bottom: `${((lt + 255) / 510) * 100}%` }"></div>
      </div>
    </div>
    <div class="box">
      <div class="box-2">
        <div class="bar" :style="{ bottom: `${((rt + 255) / 510) * 100}%` }"></div>
      </div>
    </div>
    <div class="box">
      <div class="box-2">
        <div class="bar" :style="{ bottom: `${((lb + 255) / 510) * 100}%` }"></div>
      </div>
    </div>
    <div class="box">
      <div class="box-2">
        <div class="bar" :style="{ bottom: `${((rb + 255) / 510) * 100}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps(['lt', 'lb', 'rt', 'rb'])
</script>

<style scoped lang="scss">
.list {
  $size: 15px;
  $height: 66px;
  $width: 20px;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  pointer-events: none;
  display: flex;
  flex-wrap: wrap;
  width: calc($width * 2 + 3px);
  .box {
    width: $width + 2px;
    height: $height - $size;
    position: relative;
    border: 1px solid #ffffffbb;
    padding: calc($size / 2) 0;
    &:nth-child(2n) {
      border-left: none;
      width: $width + 1px;
    }
    &:nth-child(3),
    &:nth-child(4) {
      border-top: none;
      height: $height - $size - 1px;
    }

    .box-2 {
      width: 100%;
      height: 100%;
      position: relative;

      .bar {
        width: $size;
        height: $size;
        background-color: #f00;
        border-radius: 50%;
        position: absolute;
        left: 50%;
        bottom: 50%;
        transform: translate(-50%, 50%);
      }
    }
  }
}
</style>
