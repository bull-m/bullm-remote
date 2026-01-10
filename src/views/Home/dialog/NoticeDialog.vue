<template>
  <ZPopup v-model:show="show" title="公告">
    <div class="notice-dialog">
      <div class="list">
        <ZFlex class="item" v-for="(item, i) in data" :class="{ read: isRead(item.id) }">
          <ZFlex vertical class="content">
            <div class="title" v-if="item.title">{{ i + 1 }}. {{ item.title }}</div>
            <div v-html="item.content"></div>
          </ZFlex>
          <ZFlex align="flex-end" justify="center" vertical class="right" :gap="10">
            <ZFlex align="center">
              <van-button v-if="!isRead(item.id)" type="default" size="small" style="white-space: nowrap" @click="markAsRead(item.id)">
                标记已读
              </van-button>
              <van-button v-if="item.link" type="primary" size="small" style="white-space: nowrap" @click="openUrl(item.link)">查看详情</van-button>
            </ZFlex>
            <div v-if="item.start_time" class="time">
              {{ item.start_time }}
            </div>
          </ZFlex>
        </ZFlex>
      </div>

      <!-- 底部操作按钮 -->
      <div class="bottom-actions">
        <van-button v-if="data.length > 0 && data.some(item => !isRead(item.id))" type="primary" @click="markAllAsRead">全部已读</van-button>
      </div>
    </div>
  </ZPopup>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { openUrl } from '@/utils'
import { StorageSetItem, StorageGetItem } from '@/utils/system/storage.ts'
import axios from 'axios'
import { getAppVersion } from '@/utils/system/os.ts'

const show = defineModel<boolean>('show')
const noticeNum = defineModel<number>('noticeNum')

// 已读通知ID列表
const readNoticeIds = ref<string[]>(StorageGetItem<string[]>('read_notice_ids') ?? [])

const data = ref(
  [] as {
    id: string
    title: string
    content: string
    start_time: string
    end_time: string
    link: string
  }[]
)

// 标记通知为已读
function markAsRead(id: string) {
  if (!readNoticeIds.value.includes(id)) {
    readNoticeIds.value.push(id)
    StorageSetItem('read_notice_ids', readNoticeIds.value)
    updateNoticeNum()
  }
}

// 检查通知是否已读
function isRead(id: string): boolean {
  return readNoticeIds.value.includes(id)
}

// 更新未读通知数量
function updateNoticeNum() {
  if (data.value.length == 0) {
    noticeNum.value = -1
  } else {
    noticeNum.value = data.value.filter(item => !isRead(item.id)).length
  }
}

async function init() {
  // 获取通知数据
  data.value = await axios.get(`https://car.bullm.cn/public-api/notice/latest?version=${getAppVersion()}`).then(res => {
    return res.data.data
  })
  // 清楚已经不存在的id
  readNoticeIds.value = readNoticeIds.value.filter(x => data.value.some(({ id }) => id == x))
  // 更新未读数量
  updateNoticeNum()
}

// 标记所有通知为已读
function markAllAsRead() {
  readNoticeIds.value = data.value.map(x => x.id)
  StorageSetItem('read_notice_ids', readNoticeIds.value)
  updateNoticeNum()
}

onMounted(() => {
  init()
})
</script>

<style scoped lang="scss">
.notice-dialog {
  width: 666px;
  max-width: 90vw;

  .list {
    padding: 16px;
    flex: 1;
    overflow-y: auto;
    line-height: 1.4;
    white-space: pre-wrap;
    max-height: 50vh;

    .item {
      width: 100%;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 20px 0;
      transition: all 0.3s ease;

      &:last-child {
        border-bottom: none;
      }

      // 已读状态样式
      &.read {
        .content {
          .title {
            color: #999;
          }
        }
      }

      .content {
        color: #fff;
        flex: 1;
        margin-right: 15px;
        flex-shrink: 0;

        .title {
          font-size: 16px;
          color: var(--van-primary-color);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;

          .unread-tag {
            margin-left: auto;
          }
        }
      }

      .right {
        flex-shrink: 0;

        .time {
          font-size: 13px;
          color: #999;
        }
      }
    }
  }

  // 底部操作按钮
  .bottom-actions {
    padding: 10px 10px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: flex-end;
  }
}
</style>
