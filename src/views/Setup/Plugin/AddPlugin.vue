<template>
  <van-action-sheet v-model:show="show" title="添加插件" style="--van-action-sheet-max-height: 100vh">
    <van-tabs animated type="card" offset-top="0" duration="0.5">
      <van-tab title="内置插件">
        <van-cell-group style="padding: 0 0 10px">
          <van-cell
            v-for="item in BuiltInPlugin"
            :key="item.source"
            :label="item.description"
            :value="item.type"
            is-link
            centered
            :title="item.name"
            @click="onSelect(item)">
            <template #value>
              <van-tag type="success" v-if="item.type === 'fullscreen'">全屏插件</van-tag>
              <van-tag v-else-if="item.type === 'no-ui'">无UI插件</van-tag>
              <van-tag type="primary" v-else>普通</van-tag>
            </template>
          </van-cell>
          <!--          <van-card v-for="item in BuiltInPlugin"-->
          <!--                    :key="item.source"-->
          <!--                    style="padding: 0 20px;"-->
          <!--                    centered :title="item.name" @click="onSelect(item)">-->
          <!--            <template #desc>-->
          <!--              <span style="font-size: 13px">{{ item.description }}</span>-->
          <!--            </template>-->
          <!--&lt;!&ndash;            <template #thumb>&ndash;&gt;-->
          <!--&lt;!&ndash;              <img :src="item.preview" alt="" style="object-fit: contain;width: 100%;height: 100%;">&ndash;&gt;-->
          <!--&lt;!&ndash;            </template>&ndash;&gt;-->
          <!--          </van-card>-->
        </van-cell-group>
      </van-tab>
      <van-tab title="自定义插件">
        <ZFlex vertical align="center" justify="center" style="height: 100%" :gap="16">
          <svg
            t="1752303470917"
            class="icon"
            style="width: 50px; height: 50px"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="9850"
            width="200"
            height="200">
            <path
              d="M512 1024c-80.457143 0-146.285714-65.828571-146.285714-146.285714s65.828571-146.285714 146.285714-146.285715 146.285714 65.828571 146.285714 146.285715-65.828571 146.285714-146.285714 146.285714z m0-219.428571c-43.885714 0-73.142857 29.257143-73.142857 73.142857s29.257143 73.142857 73.142857 73.142857 73.142857-29.257143 73.142857-73.142857-29.257143-73.142857-73.142857-73.142857zM512 365.714286C431.542857 365.714286 365.714286 285.257143 365.714286 182.857143S431.542857 0 512 0s146.285714 80.457143 146.285714 182.857143S592.457143 365.714286 512 365.714286z m0-292.571429c-36.571429 0-73.142857 51.2-73.142857 109.714286S475.428571 292.571429 512 292.571429s73.142857-51.2 73.142857-109.714286S548.571429 73.142857 512 73.142857z"
              fill="#788190"
              p-id="9851"></path>
            <path
              d="M877.714286 694.857143h-43.885715l-36.571428-292.571429C782.628571 256 658.285714 146.285714 512 146.285714S241.371429 256 219.428571 402.285714l-36.571428 292.571429H146.285714c-43.885714 0-73.142857 29.257143-73.142857 73.142857s29.257143 73.142857 73.142857 73.142857h731.428572c43.885714 0 73.142857-29.257143 73.142857-73.142857s-29.257143-73.142857-73.142857-73.142857z"
              fill="#ADB8C4"
              p-id="9852"></path>
            <path
              d="M877.714286 877.714286H146.285714c-65.828571 0-109.714286-43.885714-109.714285-109.714286S80.457143 658.285714 146.285714 658.285714h7.314286l29.257143-263.314285C204.8 234.057143 351.085714 109.714286 512 109.714286c168.228571 0 307.2 124.342857 321.828571 292.571428l29.257143 256h14.628572c65.828571 0 109.714286 43.885714 109.714285 109.714286S943.542857 877.714286 877.714286 877.714286zM146.285714 731.428571c-21.942857 0-36.571429 14.628571-36.571428 36.571429s14.628571 36.571429 36.571428 36.571429h731.428572c21.942857 0 36.571429-14.628571 36.571428-36.571429s-14.628571-36.571429-36.571428-36.571429h-73.142857l-43.885715-321.828571C746.057143 277.942857 643.657143 182.857143 512 182.857143c-124.342857 0-234.057143 95.085714-256 226.742857L212.114286 731.428571H146.285714z"
              fill="#788190"
              p-id="9853"></path>
          </svg>
          <div style="opacity: 0.5; font-size: 14px">即将上线，敬请期待</div>
        </ZFlex>
      </van-tab>
    </van-tabs>
  </van-action-sheet>
</template>

<script setup lang="ts">
import { BuiltInPlugin } from '@/plugin'
import { PluginInfoType, PluginRunType, useStorePlugin } from '@/store/plugin.ts'

const { addPlugin } = useStorePlugin()
const show = defineModel<boolean>('show')
const emit = defineEmits({
  submit: (plugin: PluginRunType) => true,
})

function onSelect(item: PluginInfoType) {
  addPlugin(item)
    .then(plugin => {
      emit('submit', plugin)
      show.value = false
      showToast('添加插件成功')
    })
    .catch(err => {
      console.error(err)
      showToast('加载插件时失败了')
    })
}
</script>

<style scoped lang="scss">
.van-card {
  cursor: pointer;
  --van-card-font-size: 17px;
  --van-card-title-line-height: 1.5;
  --van-card-background: var(--background);
  --van-card-thumb-size: 70px;
  --van-padding-xs: 0px;
  --van-card-padding: 10px 0;
  border-bottom: 1px solid var(--van-cell-border-color);

  &:active {
    --van-card-background: var(--background-active);
  }
}

:deep(.van-tab__panel) {
  height: 70vh;
  overflow: auto;
  margin-top: 10px;
}

:deep(.van-card__thumb) {
  width: 106px;
  height: 70px;
  margin-right: 10px;
}
</style>
