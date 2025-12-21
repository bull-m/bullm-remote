/**
 * 版权所有 © 2025 牛明工作室 / yy祝。保留所有权利。
 * SPDX-License-Identifier: MIT
 * 根据 MIT 许可证（MIT License）授权。
 */

import { createApp } from 'vue'
import './assets/styles/style.scss'
import './assets/styles/component.scss'
import App from './App.vue'
// import 'vant/lib/index.css';
import '@/utils/device/gamepad.ts'
// 桌面端适配
import '@vant/touch-emulator'

import { setupStore } from './store'
import { setupRouter } from './router'

const app = createApp(App)
setupStore(app)
setupRouter(app)
app.mount('#app')
