<template>
  <van-field readonly v-bind="$attrs" :label="label" is-link inset @click="showPopup = true">
    <template #right-icon>
      <ZIcon style="font-size: 20px; color: var(--text)" v-if="modelValue" :icon="modelValue" />
    </template>
  </van-field>
  <van-action-sheet style="--van-action-sheet-max-height: 93vh" v-model:show="showPopup" title="选择图标" :teleport="teleport_new">
    <van-collapse v-model="activeNames">
      <van-collapse-item v-for="(item, title) in metadata.categories" :title="titleChinese[title] ?? title">
        <div class="list">
          <ZIcon @click="onItem(item2)" v-for="item2 in item" :icon="item2" />
        </div>
      </van-collapse-item>
    </van-collapse>
    <ZFieldBtn v-if="modelValue" sticky :btns="[{ text: '取消选择', color: 'cancel', click: () => onItem('') }]" />
  </van-action-sheet>
</template>
<script setup lang="ts">
import { metadata } from '@iconify-json/mdi'
import { getPopupParentEl } from '@/utils/ui/element.ts'

const modelValue = defineModel<string>()

const showPopup = ref(false)

const activeNames = ref([])

const titleChinese = {
  'Account / User': '账户 / 用户',
  Agriculture: '农业',
  'Alert / Error': '警告 / 错误',
  'Alpha / Numeric': '字母 / 数字',
  Animal: '动物',
  Arrange: '排列',
  Arrow: '箭头',
  Audio: '音频',
  Automotive: '汽车',
  Banking: '银行',
  Battery: '电池',
  'Brand / Logo': '品牌 / 标志',
  'Cellphone / Phone': '手机 / 电话',
  Clothing: '服装',
  Cloud: '云',
  Color: '颜色',
  Currency: '货币',
  Database: '数据库',
  'Date / Time': '日期 / 时间',
  'Developer / Languages': '开发者 / 编程语言',
  'Device / Tech': '设备 / 科技',
  'Drawing / Art': '绘图 / 艺术',
  'Edit / Modify': '编辑 / 修改',
  Emoji: '表情符号',
  'Files / Folders': '文件 / 文件夹',
  'Food / Drink': '食物 / 饮品',
  Form: '表单',
  'Gaming / RPG': '游戏 / 角色扮演',
  'Geographic Information System': '地理信息系统',
  'Hardware / Tools': '硬件 / 工具',
  'Health / Beauty': '健康 / 美容',
  Holiday: '节日',
  'Home Automation': '家庭自动化',
  Lock: '锁',
  Math: '数学',
  'Medical / Hospital': '医疗 / 医院',
  Music: '音乐',
  Nature: '自然',
  Navigation: '导航',
  Notification: '通知',
  'People / Family': '人员 / 家庭',
  Photography: '摄影',
  Places: '地点',
  Printer: '打印机',
  Religion: '宗教',
  Science: '科学',
  Settings: '设置',
  Shape: '形状',
  Shopping: '购物',
  'Social Media': '社交媒体',
  Sport: '运动',
  'Text / Content / Format': '文本 / 内容 / 格式',
  Tooltip: '工具提示',
  'Transportation + Flying': '交通 + 航空',
  'Transportation + Other': '交通 + 其他',
  'Transportation + Road': '交通 + 公路',
  'Transportation + Water': '交通 + 水路',
  Vector: '矢量',
  'Video / Movie': '视频 / 电影',
  View: '视图',
  Weather: '天气',
}

function onItem(icon: string) {
  modelValue.value = icon
  showPopup.value = false
}

const props = defineProps<{
  teleport?: string
  label: string
}>()
const teleport_new = ref(null as any)

onMounted(() => {
  teleport_new.value = props.teleport || getPopupParentEl()
})
</script>
<style lang="scss" scoped>
.list {
  display: flex;
  flex-wrap: wrap;
  color: var(--text);

  .z-icon {
    padding: 10px;
    font-size: 25px;
    cursor: pointer;
    border-radius: 10px;
    &:active {
      background-color: var(--background-active);
    }
  }
}
</style>
