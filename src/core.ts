// @tenorlab/vue-dashboard
// file: src/core.ts

// You can't "exclude" a single item within an export * statement.
// Instead, you explicitly export your version.
// Because ESM handles name collisions by favoring local exports,
// your version of createStaticEntry will be the one consumers receive.

import type { Component as VueComponent } from 'vue'
import { markRaw } from 'vue'

// 1. Import types and original logic from core
import type { IDynamicWidgetCatalogEntry } from './components'
import type { IDynamicWidgetCatalogEntryBase, TWidgetMetaInfoBase } from '@tenorlab/dashboard-core'
import {
  createStaticEntry as _createStaticEntry,
  localWidgetDiscovery as _localWidgetDiscovery,
} from '@tenorlab/dashboard-core'

// 2. This re-exports all concrete values (utils, constants, classes)
// AND all types/interfaces from the core package
// *except* the types/functions we explicitly override here (see createStaticEntry below)
export * from '@tenorlab/dashboard-core'

/**
 * @name createStaticEntry
 * Wraps around (and shadows) the @tenorlab/dashboard-core createStaticEntry to ensure
 * the component added is marked raw (using markRaw)
 */
export const createStaticEntry = (
  key: string,
  component: VueComponent,
  metaData?: TWidgetMetaInfoBase,
): [string, IDynamicWidgetCatalogEntry] => {
  // We use markRaw here to prevent Vue from making the component definition reactive,
  // which is crucial for performance and preventing internal Vue warnings.
  return _createStaticEntry(key, markRaw(component), metaData)
}

/**
 * @name localWidgetDiscovery
 * Wraps around (and shadows) the @tenorlab/dashboard-core localWidgetDiscovery to ensure
 * the component added is marked raw (using markRaw)
 */
export const localWidgetDiscovery = (
  baseSrcPath: string, // e.g., "/src/async-widgets" or "/src/bundled-widgets"
  widgetModules: Record<string, any>,
  widgetMetaModules: Record<string, any>,
  lazy: boolean = true,
): [string, IDynamicWidgetCatalogEntryBase][] => {
  // We use markRaw here to prevent Vue from making the component definition reactive,
  // which is crucial for performance and preventing internal Vue warnings.
  const staticEntries = _localWidgetDiscovery(baseSrcPath, widgetModules, widgetMetaModules, lazy)
  // map through our local createStaticEntry helper to ensure components are marked raw
  return staticEntries.map((x) =>
    _createStaticEntry(x[0], markRaw((x[1] as any).component), (x[1] as any).meta),
  )
}
