import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vitePluginAntdvNoCssinjs from '../src/index'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/vite-plugin-antdv-no-cssinjs/' : '/',
  plugins: [
    vue(),
    vitePluginAntdvNoCssinjs({
      offCssInJs: true,
      cssFileType: 'no-file',
      components: true,
      ignoreComponents: [],
      antdvConfig: {
        theme: {
          token: {
            colorPrimary: '#42b883',
            borderRadius: 20,
          },
        }
      },
    }),
  ],
  optimizeDeps: {

  },
})
