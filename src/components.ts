import type { ConfigProviderProps } from 'ant-design-vue/es/config-provider'
import * as antd from 'ant-design-vue'
import { ConfigProvider } from 'ant-design-vue'
import { extractStyle } from 'ant-design-vue/lib/_util/static-style-extract/index.js'
import { h } from 'vue'

const pickerMap = {
  MonthPicker: 'month',
  WeekPicker: 'week',
  QuarterPicker: 'quarter',
}

const compChildNameMap = {
  MenuDivider: 'Menu',
  MenuItem: 'Menu',
  MenuItemGroup: 'Menu',
  SubMenu: 'Menu',
  TableColumn: 'Table',
  TableColumnGroup: 'Table',
  TableSummary: 'Table',
  TableSummaryRow: 'Table',
  TableSummaryCell: 'Table',
  TabPane: 'Tabs',
  TimelineItem: 'Timeline',
}

export function getAntdNode(antdComponents: string[]) {
  return antdComponents.map((compName) => {
    const Comp = antd[compName]
    if (compName === 'Dropdown') {
      return (
        h(Comp, { key: compName, menu: { items: [] } }, {
          default: () => h('div'),
        })
      )
    }
    if (compName in pickerMap) {
      const Comp = antd.DatePicker
      const type = pickerMap[compName]
      return h(Comp, { key: compName, picker: type })
    }
    if (compName in compChildNameMap) {
      const ParentComp = antd[compChildNameMap[compName]]
      return (
        h(ParentComp, {
          default: () => h(Comp),
        })
      )
    }
    if (compName === 'QRCode' || compName === 'Segmented') {
      return (
        h(Comp, { key: compName, value: '' }, {
          default: () => h('div'),
        })
      )
    }
    return h(Comp, { key: compName }, {
      default: () => h('div'),
    })
  })
}

export function getAntdStyle(antdComponents: string[] | boolean, antdvConfig?: ConfigProviderProps) {
  if (antdComponents === false) {
    return false
  }

  const configProps = Object.assign({
    theme: {},
  }, antdvConfig)

  configProps.theme.hashed = false

  return extractStyle(allNodes =>
    h(ConfigProvider, configProps, {
      default: () => Array.isArray(antdComponents)
        ? getAntdNode(antdComponents)
        : allNodes,
    }))
}

function toNearestEven(num: number) {
  const rounded = Math.round(num)
  return rounded % 2 === 0 ? rounded : rounded + 1
}

export function fixPxValues(cssString: string) {
  return cssString.replace(/(-?\d+\.\d+)px/g, (match, num) => {
    const value = Number.parseFloat(num)
    const even = toNearestEven(value)
    return `${even}px`
  })
}
