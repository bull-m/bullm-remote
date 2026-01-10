<template>
  <ZPopup v-model:show="show" title="更新检查">
    <div class="update-dialog" style="width: 500px">
      <van-tabs v-model:active="active" animated>
        <!-- 版本标签页 -->
        <van-tab v-for="(version, index) in versionTabs" :key="version.type" :title="version.title">
          <!-- 通知栏 -->
          <van-notice-bar v-if="version.notice" :style="{ marginTop: '10px' }" :color="version.notice.color">
            {{ version.notice.text }}
          </van-notice-bar>

          <!-- 内容区域 -->
          <div class="item-content">
            <div v-html="version.content"></div>
            <z-null-cell v-if="version.type === 'no-update'">当前版本已经是最新版本了</z-null-cell>
            <ZFlex align="center" class="item-bottom">
              <div v-if="version.data?.version" class="version">v{{ version.data?.version }}</div>
              <div v-if="version.data?.date">{{ version.data?.date }}</div>
              <!--              <van-checkbox-->
              <!--                  v-if="version.type !== 'no-update'"-->
              <!--                  v-model="noTip"-->
              <!--                  shape="square"-->
              <!--                  icons-size="15px"-->
              <!--                  style="font-size: 13px;display:flex;align-items: center;margin-left: auto;"-->
              <!--              >-->
              <!--                不再提示-->
              <!--              </van-checkbox>-->
            </ZFlex>
          </div>

          <!-- 按钮区域 -->
          <ZFlex style="margin-top: 10px">
            <van-button v-if="version.button.primary" type="primary" class="w-full" @click="version.button.primary.action">
              {{ version.button.primary.text }}
            </van-button>
            <van-button class="w-full" @click="show = false">
              {{ version.button.secondary.text }}
            </van-button>
          </ZFlex>
        </van-tab>

        <!-- 其他版本标签页 -->
        <van-tab :title="'其他版本'">
          <z-null-cell>
            其他版本可以到我们的开源仓库中进行下载
            <br />
            <a @click.stop="openUrl('https://github.com/bull-m/bullm-remote')">https://github.com/bull-m/bullm-remote</a>
          </z-null-cell>
          <ZFlex style="margin-top: 10px">
            <van-button type="primary" class="w-full" @click="openLink('https://github.com/bull-m/bullm-remote')">前往下载</van-button>
            <van-button class="w-full" @click="show = false">知道了</van-button>
          </ZFlex>
        </van-tab>
      </van-tabs>
    </div>
  </ZPopup>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { openUrl } from '@/utils'
import axios from 'axios'
import { getAppVersion } from '@/utils/system/os.ts'

const show = defineModel<boolean>('show')
const isUpdate = defineModel<boolean>('isUpdate')
const active = ref(0)

type Version = {
  link: string
  content: string
  id: string
  is_force: boolean
  title: string
  version: string
  date: string
}

const data = ref({
  compatible: undefined as Version | undefined,
  latest: undefined as Version | undefined,
  has_compatible: false,
  has_update: false,
})

async function init() {
  data.value = await axios.get(`https://car.bullm.cn/public-api/version/check?version=${getAppVersion()}`).then(res => {
    return res.data.data
  })
  if (data.value.has_compatible || data.value.has_update) {
    isUpdate.value = true
  }
}

onMounted(() => {
  init()
})

const openLink = (url: string) => {
  openUrl(url)
}

// 计算属性：整合版本标签页数据
const versionTabs = computed(() => {
  return [
    // 兼容版本
    ...(data.value.compatible
      ? [
          {
            type: 'compatible',
            title: `兼容版本 v${data.value.compatible.version}`,
            data: data.value.compatible,
            content: data.value.compatible.content,
            notice: {
              text: '你可以安全的升级到最新的兼容版本',
              color: undefined,
            },
            button: {
              primary: data.value.compatible.link
                ? {
                    text: '前往下载',
                    action: () => openLink(data.value.compatible?.link || ''),
                  }
                : null,
              secondary: {
                text: '知道了',
              },
            },
          },
        ]
      : []),
    //  最新版本
    ...(data.value.latest
      ? [
          {
            type: 'latest',
            title: `最新版本 v${data.value.latest.version}`,
            data: data.value.latest,
            content: data.value.latest.content,
            notice: data.value.compatible
              ? {
                  text: '最新版本可能和你现在的版本存在兼容问题，升级前请先导出您的小车配置',
                  color: 'var(--van-warning-color)',
                }
              : null,
            button: {
              primary: data.value.latest.link
                ? {
                    text: '前往下载',
                    action: () => openLink(data.value.latest?.link || ''),
                  }
                : null,
              secondary: {
                text: '知道了',
              },
            },
          },
        ]
      : []),
    // 添加无更新标签
    ...(!data.value.has_update && !data.value.has_compatible
      ? [
          {
            type: 'no-update',
            title: '最新版本',
            notice: null,
            button: {
              primary: null,
              secondary: {
                text: '知道了',
              },
            },
          },
        ]
      : []),
  ]
})
</script>

<style scoped lang="scss">
.update-dialog {
  .item-content {
    padding: 16px;
    flex: 1;
    overflow-y: auto;
    line-height: 1.4;
    white-space: pre-wrap;
    max-height: 50vh;
    font-size: 16px;

    .item-bottom {
      margin-top: 10px;
      font-size: 12px;
      color: #999;

      .version {
        font-size: 16px;
        color: var(--text);
        font-weight: bold;
      }
    }
  }
}
</style>
