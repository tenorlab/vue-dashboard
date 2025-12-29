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
import type { TWidgetMetaInfoBase } from '@tenorlab/dashboard-core'
import { createStaticEntry as _createStaticEntry } from '@tenorlab/dashboard-core'

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
