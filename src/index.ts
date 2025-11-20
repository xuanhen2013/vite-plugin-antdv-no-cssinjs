import type { ConfigProviderProps } from 'ant-design-vue/es/config-provider'
import type { Plugin } from 'vite'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fixPxValues, getAntdStyle } from './components'

export const CSSFileTypes = {
  INLINE_STYLE: 'inline-style',
  STYLE_FILE: 'style-file',
  CSS_FILE: 'file',
  NO_FILE: 'no-file',
} as const

interface VitePluginAntdvNoCssinjsOptions {
  /**
   * 是否关闭 css-in-js 功能
   * - true 会强制替换 useStyle 为空函数
   */
  offCssInJs: boolean
  /**
   * 样式文件类型
   * - inline-style: 内联样式, 直接将样式插入到 html head 中
   * - style-file: 生成样式文件，需要手动插入到 html head 中
   * - file: 生成样式文件什么都不做，方便 nuxt 手动插入样式文件
   * - no-file: 不生成样式文件, 使用 `virtual:antdv-no-cssinjs.css` 虚拟文件导入
   */
  cssFileType: (typeof CSSFileTypes)[keyof typeof CSSFileTypes]
  /**
   * 样式文件路径
   * - 当 cssFileType 为 file 时，有效
   */
  cssFilePath?: string
  /**
   * 样式文件名称
   * - 当 cssFileType 为 style-file 或 file 时，有效
   */
  cssFileName?: string
  /**
   * 生成样式的组件
   * - false 则不生成
   * - true 生成所有组件样式
   * - string[] 生成指定组件样式
   */
  components?: string[] | boolean
  /**
   * 强制忽略的组件，目前只支持以下组件
   * - notification 通知组件
   * - message 消息组件
   */
  ignoreComponents?: ('notification' | 'message')[]
  /**
   * antdv 全局配置
   */
  antdvConfig?: ConfigProviderProps
}

const ignoreComponentsCodeByKey = {
  notification: 'export default { config() {} }',
  message: 'export default { config() {} }',
  useStyleEs: `
  export function genComponentStyleHook() { return () => [node => node, ''] }
  export default genComponentStyleHook;
  `,
  useStyleCjs: `
  function genComponentStyleHook() { return () => [node => node, ''] }
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = genComponentStyleHook;
  `,
}

const useStyleFiles = [
  'ant-design-vue/lib/theme/util/genComponentStyleHook',
  'ant-design-vue/es/theme/util/genComponentStyleHook',
]
const notificationFiles = ['ant-design-vue/es/notification', 'ant-design-vue/lib/notification']
const messageFiles = ['ant-design-vue/es/message', 'ant-design-vue/lib/message']

const VIRTUAL_ANTDV_NO_CSSINJS_CSS_ID = 'virtual:antdv-no-cssinjs.css'

export default function vitePluginAntdvNoCssinjs(options: VitePluginAntdvNoCssinjsOptions): Plugin {
  const config = {
    offCssInJs: options.offCssInJs,
    cssFileType: options.cssFileType ?? CSSFileTypes.NO_FILE,
    cssFilePath: path.resolve(process.cwd(), options.cssFilePath || './public'),
    cssFileName: options.cssFileName,
    components: options.components ?? true,
    ignoreComponents: options.ignoreComponents ?? [],
    antdvConfig: options.antdvConfig || {},
  }

  let cssText = ''

  if (config.components !== false) {
    const hash = createHash('sha256').update(JSON.stringify({
      components: config.components,
      theme: config.antdvConfig?.theme,
    })).digest('hex').slice(0, 8)

    if (!config.cssFileName) {
      config.cssFileName = `${hash}.css`
    }
    const cssFilePath = path.resolve(process.cwd(), 'node_modules/.cache/antdv-no-cssinjs', `${hash}.css`)
    if (fs.existsSync(cssFilePath)) {
      cssText = fs.readFileSync(cssFilePath, 'utf-8')
    }
    else {
      cssText = getAntdStyle(config.components, config.antdvConfig) as string
      cssText = fixPxValues(cssText)
      fs.mkdirSync(path.dirname(cssFilePath), { recursive: true })
      fs.writeFileSync(cssFilePath, cssText)
      if (config.cssFileType === CSSFileTypes.CSS_FILE) {
        const filePath = path.resolve(config.cssFilePath, config.cssFileName)
        fs.mkdirSync(path.dirname(filePath), { recursive: true })
        fs.writeFileSync(filePath, cssText)
      }
    }
  }

  let assetsPath = 'assets'
  let basePath = ''

  return {
    name: 'vite-plugin-antdv-no-cssinjs',
    enforce: 'post',

    config(viteConfig) {
      if (config.offCssInJs) {
        viteConfig.optimizeDeps ??= {}
        viteConfig.optimizeDeps.esbuildOptions ??= {}
        viteConfig.optimizeDeps.esbuildOptions.plugins ??= []
        viteConfig.optimizeDeps.esbuildOptions.plugins = [].concat(
          ...viteConfig.optimizeDeps.esbuildOptions.plugins as any,
          {
            name: 'esbuild-plugin-antdv-no-cssinjs',
            setup(build: any) {
              build.onLoad({ filter: /ant-design-vue\\es\\theme\\util\\genComponentStyleHook\.js/ }, async () => {
                return {
                  contents: ignoreComponentsCodeByKey.useStyleEs,
                }
              })
              build.onLoad({ filter: /ant-design-vue\\lib\\theme\\util\\genComponentStyleHook\.js/ }, async () => {
                return {
                  contents: ignoreComponentsCodeByKey.useStyleCjs,
                }
              })
            },
          } as any,
        )
      }
    },

    configResolved(config) {
      assetsPath = config.build.assetsDir
      basePath = config.base
    },

    configureServer(server) {
      if (config.cssFileType === CSSFileTypes.STYLE_FILE && config.cssFileName) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.endsWith(path.posix.join(assetsPath, config.cssFileName!))) {
            res.setHeader('Content-Type', 'text/css')
            res.end(cssText)
          }
          else {
            next()
          }
        })
      }
    },

    resolveId(id) {
      if (id === VIRTUAL_ANTDV_NO_CSSINJS_CSS_ID) {
        return id
      }
    },

    load(id) {
      if (id === VIRTUAL_ANTDV_NO_CSSINJS_CSS_ID) {
        return cssText
      }

      if (config.ignoreComponents.includes('notification') && notificationFiles.some(file => id.includes(file))) {
        return ignoreComponentsCodeByKey.notification
      }
      if (config.ignoreComponents.includes('message') && messageFiles.some(file => id.includes(file))) {
        return ignoreComponentsCodeByKey.message
      }

      if (config.offCssInJs && useStyleFiles.some(file => id.includes(file))) {
        if (id.includes('es/')) {
          return ignoreComponentsCodeByKey.useStyleEs
        }
        return ignoreComponentsCodeByKey.useStyleCjs
      }
    },

    transformIndexHtml(html) {
      if (config.cssFileType === CSSFileTypes.INLINE_STYLE) {
        return {
          html,
          tags: [
            {
              tag: 'style',
              children: cssText,
            },
          ],
        }
      }
      if (config.cssFileType === CSSFileTypes.STYLE_FILE && config.cssFileName) {
        const cssFilePath = path.posix.join(basePath, assetsPath, config.cssFileName!)
        return {
          html,
          tags: [
            {
              tag: 'link',
              attrs: { rel: 'stylesheet', href: cssFilePath },
            },
          ],
        }
      }
    },

    generateBundle() {
      if (config.cssFileType === CSSFileTypes.STYLE_FILE && config.cssFileName) {
        this.emitFile({
          type: 'asset',
          fileName: path.posix.join(assetsPath, config.cssFileName!),
          source: cssText,
        })
      }
    },
  }
}
