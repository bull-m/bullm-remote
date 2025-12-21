import { PluginInfoType } from '@/store/plugin.ts'
import { plugins as builtInPlugin } from './built-in/index.json'

export interface PluginType {
  getConfigView?: (data: Config) => SetUpType[] // 配置面板
  getUseDevices?: (data: Config) => { id: string; label: string }[] // 获取使用到的引脚
  getDefaultConfig?: () => object // 获取公共数据
  template?: () => any // 模板
  icon?: () => any // 模板图标
  popup?: () => any // 模板图标
  setup?: () => any
}

// 设置类型
type Config = {
  [key: string]: string | number | boolean
}

// 设置面板类型
export type SetUpType =
  | SetUpGroup
  | {
      tabName: string
      list: SetUpGroup[]
    }[]
type SetUpGroup = {
  name: string
  child: {
    name?: string
    key: string
    type: 'pwm_pin' | 'string' | 'number' | 'radio' | string
    options?: { text: string; value: string | number }[]
  }[]
}

export const BuiltInPlugin = ref([
  ...builtInPlugin.map(x => {
    return {
      ...x,
      origin: 'built-in',
      id: `built-in-${x.source}`,
    }
  }),
] as PluginInfoType[])
