// file: src/dashboard-components/interfaces/core-vue.interfaces.ts
import type {
  // TDashboardWidgetKey,
  TWidgetMetaInfoBase,
  IDashboardWidgetPropsBase,
  IDashboardGridPropsBase,
  TWidgetFactoryBase,
  IDynamicWidgetCatalogEntryBase,
  TDashboardWidgetCatalogBase,
} from '@tenorlab/dashboard-core'
import type { Component as VueComponent } from 'vue'

// framework specific component type and element type
type TFrameworkComponentType = VueComponent
type TFrameworkElementType = VueComponent

export type TWidgetMetaInfo = TWidgetMetaInfoBase<TFrameworkElementType | undefined>

export interface IDashboardGridProps extends IDashboardGridPropsBase {}

export interface IDashboardWidgetProps<
  TExtraProps = any,
> extends IDashboardWidgetPropsBase<TExtraProps> {}

export type IDashboardWidget = VueComponent

/* begin: support plugin architecture */

// export type TWidgetFactory = TWidgetFactoryBase<TFrameworkComponentType>
// export interface IDynamicWidgetCatalogEntry extends IDynamicWidgetCatalogEntryBase<
//   TWidgetMetaInfo,
//   TWidgetFactory,
//   TFrameworkComponentType
// > {}

// Abstract Catalog Type:
// It is a Map where the keys are TDashboardWidgetKey
// and the values are TDashboardWidgetFn functions that accept props with key TDashboardWidgetKey.
// export type TDashboardWidgetFn = (props: IDashboardWidgetProps) => IDashboardWidget
// export type TDashboardWidgetCatalog = Map<TDashboardWidgetKey, TDashboardWidgetFn>
// export type TDashboardWidgetCatalog = Map<TDashboardWidgetKey, IDynamicWidgetCatalogEntry>

export type TWidgetFactory = TWidgetFactoryBase<TFrameworkComponentType>

// a single entry in the widget catalog
export interface IDynamicWidgetCatalogEntry extends IDynamicWidgetCatalogEntryBase<
  TFrameworkElementType,
  TFrameworkComponentType
> {}

// Abstract Catalog Type:
// It is a Map where the keys are TDashboardWidgetKey
// and the values are TDashboardWidgetFn functions that accept props with key TDashboardWidgetKey.
export type TDashboardWidgetCatalog = TDashboardWidgetCatalogBase<
  TFrameworkElementType,
  TFrameworkComponentType
>

/* end: support plugin architecture */
