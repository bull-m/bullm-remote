import { defineStore } from 'pinia'
import { store } from '.'
import { getCurrentWebview } from '@tauri-apps/api/webview'
import { platform } from '@/utils/system/os.ts'

export const useStore = defineStore(
  'ui',
  () => {
    const showSetup = ref(false)

    // 是否在控制页面
    const isControl = computed(() => {
      return !showSetup.value
    })

    const theme = ref('dark' as 'light' | 'dark')

    watch(
      theme,
      newVal => {
        document.documentElement.setAttribute('theme', newVal)
      },
      { immediate: true }
    )

    const setup = ref({
      noOverlay: false, // 是否隐藏mark层
    })

    const routes = ref<(() => any)[]>([])
    function addRoute(route: () => any) {
      routes.value.push(route)
    }
    function removeRoute(route: () => any) {
      routes.value = routes.value.filter(x => x !== route)
    }

    // @ts-ignore
    window._back = () => {
      if (routes.value.length) {
        routes.value.pop()?.()
      }
    }

    // 缩放
    const zoom = ref(1)
    watch(
      zoom,
      val => {
        zoom.value = Math.min(Math.max(val, 0.5), 3)
        if (platform() === 'android') {
          // 设置缩放比例为100%（原始大小）
          ;(window as any).AndroidWebView.setScale(window.devicePixelRatio * zoom.value * 100)
        } else {
          // Android：不支持。
          // macOS：仅适用于macOS 11+。
          // iOS：仅适用于iOS 14+。
          getCurrentWebview()
            .setZoom(val)
            .catch(err => {
              document.documentElement.style.zoom = `${val}` // 保底缩放方法
            })
        }
      },
      { immediate: true }
    )

    function init() {
      return Promise.resolve()
    }
    function clear() {
      showSetup.value = false
    }

    return {
      showSetup,
      isControl,
      init,
      clear,
      theme,
      setup,
      routes,
      addRoute,
      removeRoute,
      zoom,
    }
  },
  {
    // 开启持久化
    persist: {
      pick: ['theme', 'zoom'],
    },
  }
)

export function useStoreUi() {
  return useStore(store)
}
