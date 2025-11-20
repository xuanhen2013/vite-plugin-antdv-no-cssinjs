# vite-plugin-antdv-no-cssinjs

一个用于关闭 Ant Design Vue 的 CSS-in-JS 功能并生成静态 CSS 文件的 Vite 插件。

## 功能特性

- ✅ 关闭 Ant Design Vue 的 CSS-in-JS 运行时样式注入
- ✅ 自动生成静态 CSS 文件
- ✅ 支持三种样式文件输出模式
- ✅ 支持按需生成指定组件的样式
- ✅ 支持忽略特定组件（如 notification、message）
- ✅ 支持 Ant Design Vue 主题配置
- ✅ 样式文件缓存机制，提升构建性能

## 安装

```bash
npm install vite-plugin-antdv-no-cssinjs -D
# 或
pnpm add vite-plugin-antdv-no-cssinjs -D
# 或
yarn add vite-plugin-antdv-no-cssinjs -D
```

## 使用方法

### 基础配置

在 `vite.config.ts` 中引入并配置插件：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vitePluginAntdvNoCssinjs from 'vite-plugin-antdv-no-cssinjs'

export default defineConfig({
  plugins: [
    vue(),
    vitePluginAntdvNoCssinjs({
      offCssInJs: true,
      cssFileType: 'no-file', // 默认为 'no-file' 或 'inline-style' 或 'style-file' 或 'file' 
    }),
  ],
})

// main.ts
// 注入样式
import 'virtual:antdv-no-cssinjs.css'
```

## 配置选项

### `offCssInJs`

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否关闭 CSS-in-JS。设置为 `true` 时，会强制替换 `useStyle` 为空函数，完全禁用运行时样式注入。

### `cssFileType`

- **类型**: `'inline-style' | 'style-file' | 'file'` | `no-file`
- **默认值**: `'no-file'`
- **说明**: 样式文件的输出类型
  - `'inline-style'`: 内联样式，直接将样式插入到 HTML 的 `<head>` 中
  - `'style-file'`: 生成样式文件，自动插入到 HTML 的 `<head>` 中（通过 `<link>` 标签）
  - `'file'`: 仅生成样式文件，不自动插入（适用于 Nuxt 等需要手动插入的场景）
  - `'no-file'`: 不生成样式文件, 使用 `virtual:antdv-no-cssinjs.css` 虚拟文件导入

### `cssFilePath`

- **类型**: `string`
- **默认值**: `'./public'`
- **说明**: 样式文件的输出路径。仅在 `cssFileType` 为 `'file'` 时有效。

### `cssFileName`

- **类型**: `string`
- **默认值**: 根据组件和主题配置自动生成的哈希值
- **说明**: 样式文件的名称。仅在 `cssFileType` 为 `'style-file'` 或 `'file'` 时有效。如果不指定，会根据组件列表和主题配置自动生成哈希文件名。

### `components`

- **类型**: `string[] | boolean`
- **默认值**: `true`
- **说明**: 需要生成样式的组件列表
  - `false`: 不生成任何组件样式
  - `true`: 生成所有组件的样式
  - `string[]`: 仅生成指定组件的样式，例如 `['Button', 'Input', 'Table']`

### `ignoreComponents`

- **类型**: `('notification' | 'message')[]`
- **默认值**: `[]`
- **说明**: 需要忽略的组件列表。目前支持忽略以下组件：
  - `'notification'`: 通知组件
  - `'message'`: 消息组件

### `antdvConfig`

- **类型**: `ConfigProviderProps`
- **默认值**: `{}`
- **说明**: Ant Design Vue 的全局配置，用于主题定制等。配置会传递给 `ConfigProvider` 组件。

## 使用示例

### 示例 1: 内联样式

```typescript
import vitePluginAntdvNoCssinjs from 'vite-plugin-antdv-no-cssinjs'

export default defineConfig({
  plugins: [
    vitePluginAntdvNoCssinjs({
      offCssInJs: true,
      cssFileType: 'inline-style',
    }),
  ],
})
```

### 示例 2: 生成样式文件

```typescript
import vitePluginAntdvNoCssinjs from 'vite-plugin-antdv-no-cssinjs'

export default defineConfig({
  plugins: [
    vitePluginAntdvNoCssinjs({
      offCssInJs: true,
      cssFileType: 'style-file',
      cssFileName: 'antdv.css',
    }),
  ],
})
```

### 示例 3: 仅生成文件（适用于 Nuxt）

```typescript
import vitePluginAntdvNoCssinjs from 'vite-plugin-antdv-no-cssinjs'

export default defineConfig({
  plugins: [
    vitePluginAntdvNoCssinjs({
      offCssInJs: true,
      cssFileType: 'file',
      cssFilePath: './public',
      cssFileName: 'antdv.css',
    }),
  ],
})
```

### 示例 4: 按需生成组件样式

```typescript
import vitePluginAntdvNoCssinjs from 'vite-plugin-antdv-no-cssinjs'

export default defineConfig({
  plugins: [
    vitePluginAntdvNoCssinjs({
      offCssInJs: true,
      cssFileType: 'inline-style',
      components: ['Button', 'Input', 'Table', 'Form'],
    }),
  ],
})
```

### 示例 5: 自定义主题配置

```typescript
import vitePluginAntdvNoCssinjs from 'vite-plugin-antdv-no-cssinjs'

export default defineConfig({
  plugins: [
    vitePluginAntdvNoCssinjs({
      offCssInJs: true,
      cssFileType: 'inline-style',
      antdvConfig: {
        theme: {
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 4,
          },
        },
      },
    }),
  ],
})
```

### 示例 6: 忽略特定组件

```typescript
import vitePluginAntdvNoCssinjs from 'vite-plugin-antdv-no-cssinjs'

export default defineConfig({
  plugins: [
    vitePluginAntdvNoCssinjs({
      offCssInJs: true,
      cssFileType: 'inline-style',
      ignoreComponents: ['notification', 'message'],
    }),
  ],
})
```

## 工作原理

1. **关闭 CSS-in-JS**: 通过替换 `genComponentStyleHook` 函数为空实现，阻止运行时样式注入
2. **生成静态样式**: 使用 Ant Design Vue 的 `extractStyle` API 提取组件样式
3. **样式缓存**: 生成的样式文件会缓存到 `node_modules/.cache/antdv-no-cssinjs/` 目录，基于组件列表和主题配置的哈希值进行缓存
4. **样式注入**: 根据 `cssFileType` 配置，将样式以内联或外部文件的方式注入到 HTML 中

## 注意事项

1. 此插件需要 `ant-design-vue` 版本 >= 4.0.0
2. 此插件需要 `vue` 版本 >= 3.0.0
3. 样式文件会在构建时生成，开发环境也会实时生成
4. 如果修改了组件列表或主题配置，样式文件会自动重新生成
5. 使用 `ignoreComponents` 时，被忽略的组件将不会生成样式，需要确保这些组件在运行时不会使用

## 许可证

MIT

