<template>
  <ZPopupSetup :before-close="beforeClose" :reset="reset" title="插件设置" box-id="SetupPlugins">
    <van-notice-bar>配置关联小车保存在本地，小车间配置独立。拖拽进行排序删除</van-notice-bar>
    <van-tabs
      style="z-index: 999; position: sticky; top: calc(var(--van-nav-bar-height) * -1)"
      v-model:active="activeFilter"
      @change="handleTabChange">
      <van-tab v-for="filter in filters" :key="filter.value" :title="filter.label" :name="filter.value" />
    </van-tabs>
    <Draggable
      group="people"
      style="padding-bottom: 10px"
      v-model="pluginStore.list"
      :animation="200"
      handle=".sort-btn"
      ghost-class="ghost"
      item-key="id"
      @start="drag = true"
      @end="drag = false">
      <template #header></template>
      <template #item="{ element: item }: { element: PluginRunType }">
        <van-cell-group class="list-item" inset style="margin-top: 10px" v-if="activeFilter === 'all' || item.info.type === activeFilter">
          <van-cell
            :title="item.options.name"
            inset
            @click="openSetup(item.id, item.options.name)"
            is-link
            :label="(item.options.name !== item.options.info?.name ? item.options.info?.name + '-' : '') + item.options.info?.description">
            <template #icon>
              <div class="sort-btn">
                <IconSvgSort />
              </div>
            </template>
            <template #value>
              <van-tag type="success" v-if="item.info.type === 'fullscreen'">全屏插件</van-tag>
              <van-tag v-else-if="item.info.type === 'no-ui'">无UI插件</van-tag>
              <van-tag type="primary" v-else>{{ positionToLabel(item.options.position) }}</van-tag>
            </template>
          </van-cell>
        </van-cell-group>
      </template>
    </Draggable>
    <template #overlay>
      <div class="delect-box" v-if="drag">
        <Draggable class="draggable" group="people" :list="[]" item-key="id">
          <template #item>
            <div></div>
          </template>
        </Draggable>
        <IconSvgDelect />
        <div>拖到这删除</div>
      </div>
      <SetUp
        overlay-class="no-overlay"
        v-model:show="showSetUp"
        v-if="setup.id"
        @closed="setup.id = ''"
        :plugin-id="setup.id"
        :title="setup.name + '设置'" />
      <van-floating-bubble
        axis="y"
        icon="plus"
        magnetic="x"
        style="--van-floating-bubble-z-index: 9000; left: auto; top: auto"
        v-if="!showAdd && !showSetUp && !drag"
        @click="showAdd = true"
        v-model:offset="offset" />
      <add-plugin v-model:show="showAdd" @submit="openSetup($event.id, $event.options.name)" />
      <!--      <Teleport to="body">-->
      <!--        <PluginMarket @error="showAddLoad = true; showAdd = false" v-model:show="showAdd"/>-->
      <!--      </Teleport>-->
    </template>
  </ZPopupSetup>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ZPopupSetup from '@/components/base/ZPopupSetup.vue'
import SetUp from './SetUp.vue'
import { PluginRunType, PositionEnum, useStorePlugin } from '@/store/plugin.ts'
import AddPlugin from './AddPlugin.vue'
import Draggable from 'vuedraggable'
import PluginMarket from '@/views/Setup/Plugin/PluginMarket.vue'

const pluginStore = useStorePlugin()
const drag = ref(false)

// 筛选相关
const activeFilter = ref('all')
const filters = [
  { value: 'all', label: '全部' },
  { value: 'btn', label: '普通插件' },
  { value: 'fullscreen', label: '全屏插件' },
  { value: 'no-ui', label: '无UI插件' },
]

// 处理标签切换
function handleTabChange(value: string) {
  activeFilter.value = value
}

function positionToLabel(position?: PositionEnum) {
  return (
    {
      top: '顶部',
      bottom: '底部',
      left: '左侧',
      right: '右侧',
    }[position as PositionEnum] || '未知'
  )
}

const offset = ref({} as any)
const showAdd = ref(false)
const showAddLoad = ref(false) // 本地插件管理
const showSetUp = ref(false)
const setup = ref({
  id: '',
  name: '' as string | undefined,
})

function beforeClose() {
  console.log('beforeClose')
  showAdd.value = false
  return true
  // if (showAdd.value){
  //   showAdd.value = false
  //   return false
  // }
}

function openSetup(id: string, name?: string) {
  showAdd.value = false
  showAddLoad.value = false
  setup.value = { id, name }
  nextTick(() => (showSetUp.value = true))
}

function reset() {
  showConfirmDialog({
    title: '提示',
    message: '确认要重置为小车自带的设置吗？',
  }).then(() => {
    pluginStore.resetPlugin()
    showToast('重置成功')
  })
}
</script>
<style lang="scss" scoped>
.delect-box {
  height: 80px;
  width: 100px;
  position: absolute;
  right: 10px;
  bottom: 10px;
  background-color: #ff000099;
  border-radius: 10px;
  z-index: 99999;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;

  .list-item {
    width: calc(100% - 10px);
    height: calc(100% - 10px);
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    margin: 5px !important;
    padding-left: 10px;

    .sort-btn,
    :deep(.van-cell__right-icon),
    :deep(.van-cell__value) {
      display: none;
    }
  }

  .icon {
    width: 30px;
    height: 30px;
    opacity: 0.8;
  }

  .draggable {
    position: absolute;
    inset: 0;
    z-index: 2;
  }
}

.list-item {
  cursor: move;

  > .van-cell {
    padding-left: 0;
  }

  .sort-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    //color: #fff;

    .icon {
      font-size: 20px;
      opacity: 0.7;
      padding: 0 17px 0 15px;
      display: block;
      box-sizing: content-box;
      color: var(--text);
    }
  }
}

.list-item.ghost {
  --van-cell-background: var(--background-active);
}
</style>

<style lang="scss" scoped>
:deep(.van-tabs__content) {
  display: none;
}

:deep(.van-tabs__nav) {
  background-color: var(--background);
}
</style>
