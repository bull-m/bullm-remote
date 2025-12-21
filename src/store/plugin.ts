import { defineStore } from 'pinia'
import { store } from '.'
import { computed, ref, watch, WatchHandle } from 'vue'
import { useStoreLink } from '@/store/link'
import defaultPlugin from '@/assets/options/plugin.json'
import { loadPlugin } from '@/utils/plugin.ts'
import { BuiltInPlugin, PluginType, SetUpType } from '@/plugin'
import { fieldsFilter, fieldsFilterHigh } from '@/utils'
import { useStoreWarning } from '@/store/warning.ts'
import { LazyStore } from '@tauri-apps/plugin-store'

// 插件配置存储
const tauriStore = new LazyStore('plugins.bin')

export type PositionEnum = 'top' | 'left' | 'right' | 'permanent'

export type PluginSaveType = {
  config: any // 插件的配置
  name: string // 插件名称
  icon?: string // 插件按钮图标，普通插件才有
  position?: PositionEnum // 插件展示的位置
  info: PluginInfoType // 插件的原始信息
}

// 插件的描述信息
export type PluginInfoType = {
  id: string // 插件id 内置插件使用 'built-in:' 开头
  origin: 'built-in' | 'remote' | 'custom' // 插件类型
  source: string // 插件代码或code
  name: string // 插件名称
  icon?: string // 插件图标
  btnIcon?: string // 插件图标
  description?: string // 插件描述
  preview?: string // 插件预览图
  version?: string // 插件预览图
  type: 'fullscreen' | 'btn' | 'no-ui' // 插件类型

  // ...
}

// 插件运行时信息
export type PluginRunType = {
  id: string
  template?: any
  icon?: any // 模板图标
  popup?: any // 模板图标
  setup?: any
  useDevices: { id: string; label: string }[]
  configView?: SetUpType[]
  showPopup: boolean // 是否显示弹窗
  plugin: PluginType
  options: PluginSaveType // 插件配置
  info: PluginInfoType // 插件的描述信息
}

// 插件
export const useStore = defineStore(
  'plugin',
  () => {
    const options = ref<PluginSaveType[]>([])

    const list = ref<PluginRunType[]>([])

    let _watch_list = [] as WatchHandle[]

    async function init() {
      clear()
      const { connect, isLink } = useStoreLink()
      if (!isLink || !connect.info) return Promise.reject()
      const save = await tauriStore.get('plugins_' + connect.info.mac)
      let def = []
      try {
        def = JSON.parse(JSON.stringify(defaultPlugin[connect.info.type || 'null']))
      } catch (e) {}
      // 获取存储的插件或者默认的插件
      const options = ((save || def) as PluginSaveType[])
        .map(item => {
          let info: PluginInfoType = item.info
          // 内置插件从默认配置中获取信息
          if (info.origin === 'built-in') {
            info = BuiltInPlugin.value.find(p => p.source === info.source) ?? info
          }
          if (!info) {
            useStoreWarning().add(`部分插件不存在: ${item.name}`, 'error')
            return null
          }
          return {
            ...item,
            config: item.config,
            position: item.position,
            name: item.name || info.name, // 没有自定义名称就用插件名称
            icon: item.icon || info.btnIcon,
            info: Object.freeze(info),
          }
        })
        .filter(item => !!item)
      // --- 加载插件 ---
      list.value = await Promise.all(options.map(item => load(item)))
      // 监听插件列表变化，浅层监听，排序删除操作
      _watch_list.push(watch(list, savePlugin))
    }
    function load(option: PluginSaveType): Promise<PluginRunType> {
      return loadPlugin({
        source: option.info.source,
        origin: option.info.origin || 'built-in',
      }).then(plugin => {
        const optionRef = ref({
          ...option,
          config: {
            ...plugin?.getDefaultConfig?.(), // 合并默认配置
            ...option.config,
          },
        })
        const result = reactive<PluginRunType>({
          id: getId(),
          template: plugin?.template,
          icon: plugin?.icon,
          popup: plugin?.popup,
          setup: plugin?.setup,
          useDevices: plugin.getUseDevices?.(optionRef.value.config) || [], // 使用了的设备
          configView: plugin.getConfigView?.(optionRef.value.config),
          showPopup: false,
          plugin: plugin, // 插件对象
          options: optionRef.value, // 插件配置
          info: option.info,
        })
        // 监听插件配置变化
        _watch_list.push(
          watch(
            optionRef,
            value => {
              result.useDevices = plugin.getUseDevices?.(value.config) || []
              result.configView = plugin.getConfigView?.(value.config)
              savePlugin()
            },
            { deep: true }
          )
        )
        return result
      })
    }

    function getId() {
      return Math.random().toString(36).substr(2, 9)
    }

    async function resetPlugin() {
      const { connect, isLink } = useStoreLink()
      if (!isLink) {
        showToast('未连接设备，重置失败')
        return
      }
      await tauriStore.delete('plugins_' + connect.info!.mac)
      await init()
    }

    async function addPlugin(info: PluginInfoType) {
      const plugin = await load({
        config: {},
        name: info.name,
        icon: info.btnIcon,
        position: info.type === 'btn' ? 'top' : undefined,
        info: info,
      })
      list.value.push(plugin)
      savePlugin()
      return plugin
    }

    // 重置插件
    async function resetPluginById(id: string) {
      let index = list.value.findIndex(x => x.id === id)
      if (index === -1) {
        return Promise.reject('未找到插件')
      }
      const info = list.value[index].info
      // 重新加载插件
      const plugin = await load({
        config: {},
        name: info.name,
        icon: info.btnIcon,
        position: info.type === 'btn' ? 'top' : undefined,
        info: info,
      })
      plugin.id = id // 保留插件id达到重置的目的
      list.value[index] = plugin
      savePlugin()
      return plugin
    }

    let _timer = null as any

    function savePlugin() {
      console.log('savePlugin')
      _timer && clearTimeout(_timer)
      _timer = setTimeout(() => {
        _timer = null
        const { connect, isLink } = useStoreLink()
        if (!isLink) {
          showToast('未连接设备，保存失败')
          return
        }
        let json: PluginSaveType[] = list.value.map(item => fieldsFilter(item.options, 'name', 'icon', 'info', 'config', 'position'))
        tauriStore.set('plugins_' + connect.info!.mac, json)
      }, 300)
    }

    function clear() {
      _watch_list.forEach(item => item())
      list.value = []
    }

    return {
      options,
      init,
      clear,
      list,
      resetPlugin,
      savePlugin,
      addPlugin,
      resetPluginById,
    }
  },
  {
    // 开启持久化
    persist: false,
  }
)

export function useStorePlugin() {
  return useStore(store)
}
