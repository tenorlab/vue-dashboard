import type { TDashboardWidgetKey } from '@tenorlab/dashboard-core'
import type { TWidgetEmits } from './interfaces'

export function useWidgetEmits(emits: TWidgetEmits): {
  removeClick: (widgetKey: TDashboardWidgetKey, parentWidgetKey?: TDashboardWidgetKey) => any
  moveClick: (
    direction: -1 | 1,
    widgetKey: TDashboardWidgetKey,
    parentWidgetKey?: TDashboardWidgetKey,
  ) => any
  selectContainer: (containerKey?: TDashboardWidgetKey) => any
} {
  const removeClick = (widgetKey: TDashboardWidgetKey, parentWidgetKey?: TDashboardWidgetKey) => {
    emits('removeClick', widgetKey, parentWidgetKey)
  }

  const moveClick = (
    direction: -1 | 1,
    widgetKey: TDashboardWidgetKey,
    parentWidgetKey?: TDashboardWidgetKey,
  ): any => {
    emits('moveClick', direction, widgetKey, parentWidgetKey)
  }

  const selectContainer = (containerKey?: TDashboardWidgetKey): any => {
    emits('selectContainer', containerKey)
  }

  return {
    removeClick,
    moveClick,
    selectContainer,
  }
}
