// file: src/dashboard-components/interfaces/vue-specific.ts
import { TDashboardWidgetKey } from '@tenorlab/dashboard-core'

// vue specific
export type TWidgetEmits = {
  (
    event: 'removeClick',
    widgetKey: TDashboardWidgetKey,
    parentWidgetKey?: TDashboardWidgetKey,
  ): void
  (
    event: 'moveClick',
    direction: -1 | 1,
    widgetKey: TDashboardWidgetKey,
    parentWidgetKey?: TDashboardWidgetKey,
  ): void
  (event: 'selectContainer', containerKey?: TDashboardWidgetKey): void
}
