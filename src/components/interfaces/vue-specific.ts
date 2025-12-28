// @tenorlab/vue-dashboard
// file: src/components/interfaces/vue-specific.ts
import { TDashboardWidgetKey } from '@tenorlab/dashboard-core'

// vue specific
/**
 * @name TWidgetEmits
 * @description Defines the event emits for Vue dashboard widgets.
 * @interface TWidgetEmits
 */
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
