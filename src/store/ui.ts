import { defineStore } from 'pinia'
import { store } from '.'
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { isMobile } from '@/utils/system/os.ts'

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

    const routes = ref<(()=>any)[]>([])
    function addRoute(route: ()=>any) {
      routes.value.push(route)
    }
    function removeRoute(route: ()=>any) {
      routes.value = routes.value.filter(x => x !== route)
    }

    // @ts-ignore
    window._back = ()=>{
      if (routes.value.length){
        routes.value.pop()?.()
      }
    }

    const zoom = ref(1)
    watch(
      zoom,
      newVal => {
        if (isMobile()) {
          // 移动端使用 CSS transform 实现缩放
          const app = document.getElementById('root')
          if (app) {
            app.style.transform = `scale(${newVal})`
            app.style.transformOrigin = 'top left'
            app.style.width = `${100 / newVal}%`
            app.style.height = `${100 / newVal}%`
          }

        } else {
          // 桌面端使用 Tauri API
          getCurrentWebview().setZoom(newVal).catch(err => {
            console.error('设置缩放失败:', err)
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
      zoom
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
