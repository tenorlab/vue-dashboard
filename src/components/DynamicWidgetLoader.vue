<script setup lang="ts">
// file: src/dashboard-components/DynamicWidgetLoader.vue
import { defineAsyncComponent, computed, shallowRef, watchEffect } from 'vue'
import { useWidgetEmits } from './use-widget-emits'
import { parseContainerTitle } from '@tenorlab/dashboard-core'
// import DashboardWidgetBase from './DashboardWidgetBase.vue'
import type { IChildWidgetConfigEntry, TDashboardWidgetKey } from '@tenorlab/dashboard-core'
import type {
  TDashboardWidgetCatalog,
  TWidgetEmits,
  IDynamicWidgetCatalogEntry,
} from './interfaces'

type TDynamicWidgetLoaderProps<TExtraProps = any> = {
  index: number
  maxIndex: number
  widgetKey: TDashboardWidgetKey
  parentWidgetKey?: TDashboardWidgetKey
  targetContainerKey?: TDashboardWidgetKey
  childWidgetsConfig?: IChildWidgetConfigEntry[]
  widgetCatalog: TDashboardWidgetCatalog
  isEditing: boolean
  // for additional props passed to all widget from the dashboard through the DynamicWidgetLoader:
  extraProps?: TExtraProps
}

const props = defineProps<TDynamicWidgetLoaderProps>()

// Define the custom events that will be propagated up.
const _emits = defineEmits<TWidgetEmits>()
const widgetEmits = useWidgetEmits(_emits)

const keyParts = computed<string[]>(() => {
  return `${props.widgetKey}`.split('_')
})

const isContainer = computed<boolean>(() => {
  return keyParts.value.length > 1
})

const parsedKey = computed<string>(() => {
  return isContainer.value ? keyParts.value[0] : (props.widgetKey as any)
})

const parsedContainerTitle = computed<string>(() => {
  return isContainer.value ? parseContainerTitle(props.widgetKey) : ''
})

// 1. Retrieve the Entry from the Map
const catalogEntry = computed<IDynamicWidgetCatalogEntry | undefined>(() => {
  return props.widgetCatalog.get(parsedKey.value)
})

// 2. Resolve the Component to Render
// Use a shallowRef to hold the actual component definition
const resolvedComponent = shallowRef<any | null>(null)

watchEffect(async () => {
  const entry = catalogEntry.value
  if (!entry) return

  if (entry.component) {
    resolvedComponent.value = entry.component
  } else if (entry.loader) {
    // If it's remote (starts with http), resolve it manually to avoid AsyncComponent bugs
    if (entry.loader) {
      const mod = await entry.loader()
      resolvedComponent.value = mod.default || mod
    } else {
      // Keep local ones as Async for standard lazy loading
      resolvedComponent.value = defineAsyncComponent(entry.loader)
    }
  }
})

// Recursion logic: find children if this is a container
const childWidgetEntries = computed<IChildWidgetConfigEntry[]>(() => {
  if (!isContainer.value) {
    return []
  }
  return (props.childWidgetsConfig || []).filter((a) => a.parentWidgetKey === props.widgetKey)
})

// These functions ensure that the component listens to the custom events
// from the child (WidgetComponent) and re-emits them to the parent.
const onRemoveClick = (widgetKey: TDashboardWidgetKey, parentWidgetKey?: TDashboardWidgetKey) => {
  widgetEmits.removeClick(widgetKey, parentWidgetKey)
}

const onMoveClick = (
  direction: -1 | 1,
  widgetKey: TDashboardWidgetKey,
  parentWidgetKey?: TDashboardWidgetKey,
) => {
  widgetEmits.moveClick(direction, widgetKey, parentWidgetKey)
}

const selectContainer = (containerKey: TDashboardWidgetKey) => {
  widgetEmits.selectContainer(containerKey)
}
</script>

<template>
  <Suspense>
    <component
      v-if="resolvedComponent"
      :is="resolvedComponent"
      :index="index"
      :maxIndex="childWidgetEntries.length - 1"
      :widgetKey="widgetKey"
      :parentWidgetKey="parentWidgetKey"
      :widgetCatalog="widgetCatalog"
      :isEditing="isEditing"
      :highlight="(isContainer && targetContainerKey === widgetKey) || false"
      :title="(isContainer ? parsedContainerTitle : catalogEntry?.meta?.name) || false"
      :extraProps="extraProps"
      @removeClick="onRemoveClick"
      @moveClick="onMoveClick"
      @selectContainer="selectContainer"
    >
      <template v-if="isContainer">
        <DynamicWidgetLoaderDEV
          v-for="(entry, i) in childWidgetEntries"
          :key="`${entry.widgetKey}_${i}`"
          :index="i"
          :maxIndex="childWidgetEntries.length - 1"
          :widgetKey="entry.widgetKey"
          :parentWidgetKey="entry.parentWidgetKey"
          :widgetCatalog="widgetCatalog"
          :isEditing="isEditing"
          @removeClick="onRemoveClick"
          @moveClick="onMoveClick"
        />
      </template>
    </component>

    <div v-else class="flex flex-col">
      <span> Widget not found or loader failed: </span>
      <span>
        {{ catalogEntry?.meta?.name || catalogEntry?.title }}
      </span>
      <span>
        {{ widgetKey }}
      </span>
    </div>
    <template #fallback>
      <!-- This fallback will be ignored if the defineAsyncComponent 
        options (loadingComponent, delay, etc.) are used, 
        unless you explicitly set suspensible: true -->
      <div>Loading {{ catalogEntry?.meta?.name || catalogEntry?.title }}</div>
    </template>
  </Suspense>
</template>
