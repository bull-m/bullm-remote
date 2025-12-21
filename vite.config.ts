import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import {VantImports, VantResolver} from '@vant/auto-import-resolver'
import {fileURLToPath, URL} from 'node:url'
import Icons from 'unplugin-icons/vite'
import IconsResolver from "unplugin-icons/resolver"
import {FileSystemIconLoader} from "unplugin-icons/loaders"
import vueDevTools from 'vite-plugin-vue-devtools'

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue({
            script: {
                defineModel: true,
            },
        }),
        vueDevTools(),
        AutoImport({
            dts: 'src/typings/auto-import.d.ts',
            imports: [
                'vue',
                'vue-router',
            ],
            resolvers: [VantResolver()],
        }),
        Components({
            dts: 'src/typings/components.d.ts',
            resolvers: [
                VantResolver(),
                IconsResolver({
                    prefix: 'icon',
                    customCollections: ['svg']
                })
            ],
            types: []
        }),
        Icons({
            compiler: 'vue3',
            // autoInstall: true,
            customCollections: {
                svg: FileSystemIconLoader('src/assets/icons')
            }
        }),
    ],
    base: "./",
    // 设置路径别名
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    // 防止 Vite 清除 Rust 显示的错误
    clearScreen: false,
    // tauri需要一个固定端口，如果该端口不可用，则失败
    server: {
        port: 1520,
        strictPort: true,
        host: host || false,
        hmr: host
            ? {
                protocol: "ws",
                host,
                port: 1521,
            }
            : undefined,
        watch: {
            // 告诉 Vite 忽略监听 `src-tauri` 目录
            ignored: ["**/src-tauri/**"],
        },
    },
    // build: {
    //     // Tauri 在 Windows 上使用 Chromium，在 macOS 和 Linux 上使用 WebKit
    //     target:
    //         process.env.TAURI_ENV_PLATFORM == 'windows'
    //             ? 'chrome105'
    //             : 'safari13',
    //     // 在 debug 构建中不使用 minify
    //     minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    //     // 在 debug 构建中生成 sourcemap
    //     sourcemap: !!process.env.TAURI_ENV_DEBUG,
    // },
})
