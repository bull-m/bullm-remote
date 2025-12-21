// vue-router 初始化
import type { App } from 'vue'
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home/index.vue'),
    meta: { title: '牛明-远控' },
  },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// 初始化方法
export function setupRouter(app: App<Element>) {
  app.use(router)
}
