// @tenorlab/vue-dashboard
// file: src/components/interfaces/core-vue.interfaces.ts
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
/**
 * @name TFrameworkComponentType
 * @description Represents a Vue component type.
 */
type TFrameworkComponentType = VueComponent

/**
 * @name TFrameworkElementType
 * @description Represents a Vue component instance.
 */
type TFrameworkElementType = VueComponent

/**
 * @name TWidgetMetaInfo
 * @description Extends the base widget meta information type with Vue-specific element type.
 * @template TFrameworkElementType - The type representing a Vue component instance.
 */
export type TWidgetMetaInfo = TWidgetMetaInfoBase<TFrameworkElementType | undefined>

/**
 * @name IDashboardGridProps
 * @description Extends the base dashboard grid properties interface.
 * @interface IDashboardGridProps
 */
export interface IDashboardGridProps extends IDashboardGridPropsBase {}

/**
 * @name IDashboardWidgetProps
 * @description Extends the base dashboard widget properties interface with optional extra properties.
 * @template TExtraProps - Additional properties to be included in the widget props.
 * @interface IDashboardWidgetProps
 */
export interface IDashboardWidgetProps<
  TExtraProps = any,
> extends IDashboardWidgetPropsBase<TExtraProps> {}

/**
 * @name IDashboardWidget
 * @description Represents a Vue component used as a dashboard widget.
 */
export type IDashboardWidget = VueComponent

/* begin: support plugin architecture */

/**
 * @name TWidgetFactory
 * @description A factory type for creating Vue components.
 * @template TFrameworkComponentType - The type representing a Vue component.
 */
export type TWidgetFactory = TWidgetFactoryBase<TFrameworkComponentType>

/**
 * @name IDynamicWidgetCatalogEntry
 * @description Represents a dynamic widget catalog entry for Vue components.
 * @interface IDynamicWidgetCatalogEntry
 * @extends IDynamicWidgetCatalogEntryBase
 * @template TFrameworkElementType - The type representing a Vue component instance.
 * @template TFrameworkComponentType - The type representing a Vue component.
 */
export interface IDynamicWidgetCatalogEntry extends IDynamicWidgetCatalogEntryBase<
  TFrameworkElementType,
  TFrameworkComponentType
> {}

/**
 * @name TDashboardWidgetCatalog
 * @description A catalog type for Vue dashboard widgets.
 * @template TFrameworkElementType - The type representing a Vue component instance.
 * @template TFrameworkComponentType - The type representing a Vue component.
 */
export type TDashboardWidgetCatalog = TDashboardWidgetCatalogBase<
  TFrameworkElementType,
  TFrameworkComponentType
>

/* end: support plugin architecture */
