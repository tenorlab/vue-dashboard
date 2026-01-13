# @tenorlab/vue-dashboard

# @tenorlab/vue-dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Template: Pro](https://img.shields.io/badge/Template-Pro--Available-gold.svg)](https://www.tenorlab.com)
[![Framework: Vue](https://img.shields.io/badge/Framework-Vue-42b883.svg)](https://vuejs.org/)

Foundation components for creating user-configurable, high-performance dashboards in Vue.

## 🏗 Relationship to Core

This package extends **@tenorlab/dashboard-core**. It provides the Vue implementation of the core logic, including specialized hooks, state management, and a suite of UI components.

> **Note**: This package re-exports all types and utilities from `@tenorlab/dashboard-core`. You do not need to install the core package separately.


## Demos

* [**React Demo**](https://react.tenorlab.com) (built with **@tenorlab/react-dashboard**)
* [**Vue Demo**](https://vue.tenorlab.com) (built with **@tenorlab/vue-dashboard**)


## ✨ Features

- **Type-Safe:** Deep integration with TypeScript 5.8+ for full IDE support.
- **State Management:** Built-in `useDashboardStore` and `useDashboardUndoService`.
- **User Configurable:** Ready-to-use components for adding, removing, and dragging widgets.
- **Themeable:** Native support for CSS Variables and Tailwind CSS.
- **Vite Optimized:** Full ESM support and tree-shakeable.

## 🚀 Quick Start

### Installation

Bash

```
# with npm
npm i @tenorlab/vue-dashboard

# with pnpm
pnpm add @tenorlab/vue-dashboard
```

### 1. Global Styles

Import the base styles in your entry file (e.g., `main.ts`):

```TypeScript
import '@tenorlab/vue-dashboard/styles.css'
```

------

## 🛠 Developer Guide

### 1. Creating a Widget

Widgets should be organized by their loading strategy.

- **Bundled Widgets**: Place in `src/bundled-widgets/` (loaded immediately).
- **Async Widgets**: Place in `src/async-widgets/` (lazy-loaded).

Each widget requires a sub-directory using the `widget-name-here` convention.

#### Example: `WidgetTotalOrders`

Directory name `widget-total-orders`, files:
- WidgetTotalOrders.vue
- meta.ts
- index.ts

```Vue
// file: src/bundled-widgets/widget-total-orders/WidgetTotalOrders.vue
<script setup lang="ts">
import type {
  IDashboardWidgetProps,
  TDashboardWidgetKey,
  TWidgetEmits,
} from '@tenorlab/vue-dashboard'
import { DashboardWidgetBase, WrapperColumnContent, useWidgetEmits } from '@tenorlab/vue-dashboard'

defineProps<IDashboardWidgetProps>()
const emits = defineEmits<TWidgetEmits>()
const { removeClick: onRemoveClick, moveClick: onMoveClick } = useWidgetEmits(emits)
</script>

<template>
  <DashboardWidgetBase
    v-bind="props"
    widgetKey="WidgetTotalOrders"
    title="Total Orders"
    @removeClick="onRemoveClick"
    @moveClick="onMoveClick"
  >
    <WrapperColumnContent>
      <div class="dashboard-number number-xl text-primary">1,250</div>
      <div class="text-sm">Orders this month</div>
    </WrapperColumnContent>
  </DashboardWidgetBase>
</template>
```

```typescript
// file: src/bundled-widgets/widget-total-orders/meta.ts
import type { TWidgetMetaInfo } from '@tenorlab/vue-dashboard'
import { MonitorIcon as ComponentIcon } from '@tenorlab/vue-dashboard'
import { markRaw } from 'vue'

// Define the metadata object for the plugin
export const WidgetTotalOrdersMeta: TWidgetMetaInfo = {
  name: 'Total Orders',
  categories: ['Widget'],
  icon: markRaw(ComponentIcon),
  noDuplicatedWidgets: true,
  description: 'Displays information about your total orders.',
  externalDependencies: [],
}
```

```typescript
// file: src/bundled-widgets/widget-total-orders/index.ts
import WidgetTotalOrders from './WidgetTotalOrders.vue'
export default WidgetTotalOrders
```


### 2. Creating the Widgets Catalog

Create `src/widgets-catalog.ts` in your project root. This file manages how widgets are discovered (locally via Vite's `import.meta.glob` or remotely via CDN).


```typescript
// file: src/widgets-catalog.ts
import {
  IDynamicWidgetCatalogEntry,
  TDashboardWidgetCatalog,
  TWidgetMetaInfoBase,
  WidgetContainerColumn,
  WidgetContainerLarge,
  WidgetContainerRow,
  TWidgetFactory,
} from '@tenorlab/vue-dashboard'
import {
  createStaticEntry,
  localWidgetDiscovery,
  remoteWidgetDiscovery,
} from '@tenorlab/vue-dashboard/core'

import WidgetRecentPaymentInfo from './other-widgets/WidgetRecentPaymentInfo.vue'
//import { getWidgetsManifestUrl } from '@/utils'

const bundledWidgetsSrcPath = '/src/bundled-widgets'
const asyncWidgetsSrcPath = '/src/async-widgets'

// Use Vite's Glob Import
// This creates an object where the keys are file paths, and the values are the TWidgetFactory functions.
// We target the 'index.ts' files within the widgets subdirectories.
type TGlobModuleMap = Record<string, TWidgetFactory>

// Eagerly loaded (Non-lazy / Bundled):
const bundledWidgetModules = import.meta.glob('/src/bundled-widgets/*/index.ts', {
  eager: true /* we load this immediately */,
}) as TGlobModuleMap

// Lazy loaded (Code-split / Plugins):
const asyncWidgetModules = import.meta.glob('/src/async-widgets/*/index.ts') as TGlobModuleMap

// Meta modules (Always eager so titles/icons are available immediately)
const allMetaModules = import.meta.glob('/src/**/widget-*/meta.ts', {
  eager: true,
}) as Record<string, Record<string, TWidgetMetaInfoBase>>

const hasPermission = (_user: any, _permission: string) => true

/**
 * @name getWidgetCatalog
 * @description Dynamically builds the widgets catalog based on user type and operations/permissions.
 */
export const getWidgetCatalog = async (user: any | null): Promise<TDashboardWidgetCatalog> => {
  // A. Register Static Core Components
  const catalogMapEntries: [string, IDynamicWidgetCatalogEntry][] = [
    createStaticEntry('WidgetContainer', WidgetContainerColumn),
    createStaticEntry('WidgetContainerRow', WidgetContainerRow),
    createStaticEntry('WidgetContainerLarge', WidgetContainerLarge),
  ]

  // B. Register Business Static Widgets
  // we could filter further by permissions and user type if needed
  if (hasPermission(user, 'some-permission')) {
    catalogMapEntries.push(createStaticEntry('WidgetRecentPaymentInfo', WidgetRecentPaymentInfo))
  }

  // add bundled-widgets
  catalogMapEntries.push(...localWidgetDiscovery(
    bundledWidgetsSrcPath,
    bundledWidgetModules,
    allMetaModules,
    false, // lazy: false
  ))

  // Async widgets (dynamically loaded, like plugins)
  catalogMapEntries.push(...localWidgetDiscovery(
    asyncWidgetsSrcPath,
    asyncWidgetModules,
    allMetaModules,
    true, // lazy: true
  ))

  // Optional: Remote discovery of -pre-built widgets hosted on a CDN
  /*const manifestUrl = getWidgetsManifestUrl()
  if (manifestUrl.length > 0) {
    const remoteResponse = await remoteWidgetDiscovery(manifestUrl)
    if (!remoteResponse.message) {
      catalogMapEntries.push(...(remoteResponse.entries || []))
    }
  }*/

  return new Map(catalogMapEntries)
}
```

### 3. Defining Dashboard Defaults

Use a `dashboard-defaults.ts` file to define initial layouts based on user roles.

```typescript
// file: src/dashboard-defaults.ts
import {
  TDashboardWidgetKey,
  IChildWidgetConfigEntry,
  IDashboardConfig,
  TDashboardWidgetCatalog,
} from '@tenorlab/vue-dashboard'
import { blankDashboardConfig, cssSettingsCatalog } from '@tenorlab/vue-dashboard/core'
import { getWidgetCatalog } from './widgets-catalog'

// reserved identifier to be used only for the default dashboard
const DEFAULT_DASHBOARD_ID = 'default' as const
const DEFAULT_DASHBOARD_NAME = 'Default' as const

const getDefaultDashboardForCustomerUser = (
  user: any,
  clientAppKey: string,
  availableWidgetKeys: TDashboardWidgetKey[]
): IDashboardConfig => {
  const userID = user.userID || 0
  return {
    userID,
    clientAppKey,
    dashboardId: DEFAULT_DASHBOARD_ID,
    dashboardName: DEFAULT_DASHBOARD_NAME,
    zoomScale: 1,
    responsiveGrid: false,
    widgets: ['WidgetContainer_container1'],
    childWidgetsConfig: [
      { parentWidgetKey: 'WidgetContainer_container1', widgetKey: 'WidgetRecentPaymentInfo' }
    ],
    cssSettings: [...cssSettingsCatalog]
  }
}

export const getDashboardDefaults = async (
  user: any | null,
  clientAppKey: string
): Promise<{
  dashboardConfig: IDashboardConfig
  widgetsCatalog: TDashboardWidgetCatalog
}> => {
  const widgetsCatalog = await getWidgetCatalog(user)

  if (!user) return { dashboardConfig: blankDashboardConfig, widgetsCatalog }

  return {
    dashboardConfig: getDefaultDashboardForCustomerUser(user, clientAppKey, [...widgetsCatalog.keys()]),
    widgetsCatalog
  }
}
```

### 4. Implementation Example: Read-Only Dashboard

Use this for a simplified, non-editable view of the dashboard.

TypeScript

```vue
<script setup lang="ts">
// file: src/views/DashboardReadonly.vue
import { reactive, watch, onMounted } from 'vue'
import {
  IDashboardConfig,
  TDashboardWidgetCatalog,
  useDashboardStore,
} from '@tenorlab/vue-dashboard'
import {
  blankDashboardConfig,
  cssVarsUtils,
  useDashboardStorageService,
} from '@tenorlab/vue-dashboard/core'
import { DynamicWidgetLoader, DashboardGrid } from '@tenorlab/vue-dashboard'
import { getDashboardDefaults } from '../dashboard-defaults'

const clientAppKey = 'myclientapp'
const user = { id: 1234 }
const userId = user.id
const dashboardStore = useDashboardStore()
const dashboardStorageService = useDashboardStorageService()

const {
  isLoading: _,
  isEditing,
  currentDashboardConfig,
  targetContainerKey,
} = dashboardStore.computed

type TState = {
  defaultDashboardConfig: IDashboardConfig
  widgetsCatalog: TDashboardWidgetCatalog
}

const localState = reactive<TState>({
  defaultDashboardConfig: blankDashboardConfig,
  widgetsCatalog: new Map(),
})

const getDefaultDashboardConfig = (): IDashboardConfig => {
  return localState.defaultDashboardConfig
}

async function _fetchDashboardConfig() {
  const defaultConfig = getDefaultDashboardConfig()
  const savedConfigs = await dashboardStorageService.getSavedDashboards(
    userId,
    clientAppKey,
    localState.widgetsCatalog,
    defaultConfig,
  )
  dashboardStore.setAllDashboardConfigs(savedConfigs)
  // show default or first dashboard
  const dashboardConfig =
    savedConfigs.find((x) => x.dashboardId === 'default') || savedConfigs[0] || defaultConfig
  dashboardStore.setCurrentDashboardConfig(dashboardConfig)
  cssVarsUtils.restoreCssVarsFromSettings(dashboardConfig.cssSettings || [])
  setTimeout(() => dashboardStore.setIsLoading(false), 250)
}

onMounted(async () => {
  const defaults = await getDashboardDefaults(user, clientAppKey)
  localState.defaultDashboardConfig = defaults.dashboardConfig
  localState.widgetsCatalog = defaults.widgetsCatalog
  await _fetchDashboardConfig()
})
</script>

<template>
  <div class="relative flex flex-col h-full">
    <DashboardGrid
      :isEditing="false"
      :zoomScale="Number(currentDashboardConfig.zoomScale)"
      :responsiveGrid="currentDashboardConfig.responsiveGrid"
    >
      <DynamicWidgetLoader
        v-for="(widgetKey, index) in currentDashboardConfig.widgets"
        :key="`${widgetKey}_${index}`"
        :widgetKey="widgetKey"
        :parentWidgetKey="undefined"
        :targetContainerKey="targetContainerKey"
        :index="index"
        :maxIndex="currentDashboardConfig.widgets.length - 1"
        :childWidgetsConfig="currentDashboardConfig.childWidgetsConfig"
        :widgetCatalog="localState.widgetsCatalog"
        :isEditing="isEditing"
        :extraProps="dashboardContext"
        @removeClick="() => {}"
        @moveClick="() => {}"
        @selectContainer="() => {}"
      />
    </DashboardGrid>
  </div>
</template>
```


#### 5. Full Editable Dashboard

For a complete example including **Undo/Redo**, **Zooming**, **Catalog Flyouts**, and **Multiple Dashboards**, please refer to the [Full Implementation Example](https://github.com/tenorlab/vue-dashboard-sample/blob/main/views/DashboardFullExample.vue).



------

## 🧩 Components & Services

### UI Components

- **`DashboardGrid`**: The main layout engine for positioning widgets.
- **`WidgetContainer`**: Wrapper providing common widget UI (headers, actions, loading states).
- **`WidgetsCatalogFlyout`**: A draggable panel for users to browse and add new widgets.
- **`DynamicWidgetLoader`**: The core widget loader component.

### Hooks & State

- **`useDashboardStore`**: Access the underlying reactive store to manage widget state, layout, and configuration.
- **`useDashboardUndoService`**: Provides `undo` and `redo` functionality for user layout changes.


------


## Links

 - [@tenorlab/react-dashboard](https://www.npmjs.com/package/@tenorlab/react-dashboard): React-specific components
 - [@tenorlab/vue-dashboard](https://www.npmjs.com/package/@tenorlab/vue-dashboard): Vue-specific components
 - [Official Website](https://www.tenorlab.com)
 - [React Demo](https://react.tenorlab.com)
 - [Vue Demo](https://vue.tenorlab.com)
 - [Get the Pro Template](https://payhip.com/b/gPBpo)
 - [Follow on BlueSky](https://bsky.app/profile/tenorlab.bsky.social)


------


## ⚖️ Licensing & Usage

**@tenorlab/vue-dashboard** is [MIT licensed](https://opensource.org/licenses/MIT). 

It provides the foundational components and logic for building dashboards. You are free to use it in any project, personal or commercial.

## ⚡️ Go Pro and Save Time: Tenorlab App Template

A commercial license for a full-blown professional app template is available for purchase [**here**](https://www.tenorlab.com) and comes with:

* **Full Application Shell:** A clean, optimized Vite + TypeScript project structure (with either React or Vue).
* **Dashboard Management:** Production-ready logic for creating, listing, renaming, and deleting multiple user-defined dashboards.
* **Implementation Examples:** Expert patterns for both "Read-Only" (Analyst view) and "User-Editable" (Admin view) dashboard modes.
* **Tenorlab Theme Engine:** A sophisticated Tailwind-based system supporting multiple custom themes (not just Light/Dark mode).


[**Live React Demo**](https://react.tenorlab.com), [**Live Vue Demo**](https://vue.tenorlab.com)
