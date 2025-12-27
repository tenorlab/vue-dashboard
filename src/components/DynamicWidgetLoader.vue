<script setup lang="ts">
// file: src/dashboard-components/DynamicWidgetLoader.vue
import {
  // defineAsyncComponent,
  computed,
  shallowRef,
  watchEffect,
  markRaw,
  h,
} from 'vue'
import { useWidgetEmits } from './use-widget-emits'
import { parseContainerTitle } from '@tenorlab/dashboard-core'
// import DashboardWidgetBase from './DashboardWidgetBase.vue'
import type { IChildWidgetConfigEntry, TDashboardWidgetKey } from '@tenorlab/dashboard-core'
import type {
  TDashboardWidgetCatalog,
  TWidgetEmits,
  IDynamicWidgetCatalogEntry,
} from './interfaces'

// Add this helper function at the top of your script setup or in a shared utils file
const isVersionCompatible = (hostVer: string, widgetVer: string): boolean => {
  const clean = (v: string) => v.replace(/[^0-9.]/g, '')
  const h = clean(hostVer).split('.').map(Number)
  const w = clean(widgetVer).split('.').map(Number)

  if (h[0] !== w[0]) return false // Major version mismatch
  if (h[1] < w[1]) return false // Host is older than widget needs
  return true
}

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
const errorInfo = shallowRef<{ message: string; details?: string } | null>(null)

watchEffect(async () => {
  const entry = catalogEntry.value
  if (!entry) return

  // Reset state
  errorInfo.value = null

  // CASE A: Static Component
  if (entry.component) {
    resolvedComponent.value = entry.component
    return
  }

  // CASE B: Dynamic Loader
  if (entry.loader) {
    try {
      // 1. Check Versions (if meta exists)
      /* @ts-ignore */
      const hostVer = typeof __HOST_VUE_VERSION__ !== 'undefined' ? __HOST_VUE_VERSION__ : '3.5.0'
      const externalDeps = entry.meta?.externalDependencies || []
      const vueReq = externalDeps.find((d) => d.startsWith('vue@'))

      if (vueReq) {
        const requiredVer = vueReq.split('@')[1]
        if (!isVersionCompatible(hostVer, requiredVer)) {
          throw new Error(`Incompatible Vue version. Required: ${requiredVer}, Host: ${hostVer}`)
        }
      }

      console.log('Loading widget', props.widgetKey, entry.meta)

      // 2. Load the Module
      const mod = await entry.loader()
      resolvedComponent.value = markRaw(mod.default || mod)
      //resolvedComponent.value = defineAsyncComponent(entry.loader)
    } catch (err: any) {
      console.error(`Widget Load Error [${props.widgetKey}]:`, err)

      // Create a "Local" error component similar to your React version
      // We use h() here to create a functional component on the fly
      resolvedComponent.value = markRaw({
        name: 'WidgetErrorFallback',
        render: () =>
          h(
            'div',
            { class: 'p-4 border border-dashed border-error bg-error/10 text-error rounded' },
            [
              h('p', { class: 'font-bold' }, `Failed to load "${props.widgetKey}"`),
              h(
                'p',
                { class: 'text-xs italic' },
                err.message || 'The remote plugin is unavailable.',
              ),
              entry.meta
                ? h(
                    'pre',
                    { class: 'text-[10px] mt-2 opacity-70 overflow-auto' },
                    JSON.stringify(entry.meta, null, 2),
                  )
                : null,
            ],
          ),
      })
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

/*
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
*/
</script>

<template>
  <Suspense>
    <template #default>
      <div v-if="resolvedComponent">
        <component
          :is="resolvedComponent"
          :index="index"
          :maxIndex="childWidgetEntries.length - 1"
          :widgetKey="widgetKey"
          :parentWidgetKey="parentWidgetKey"
          :widgetCatalog="widgetCatalog"
          :isEditing="isEditing"
          :highlight="(isContainer && targetContainerKey === widgetKey) || false"
          :title="
            isContainer ? parsedContainerTitle : catalogEntry?.meta?.name || catalogEntry?.title
          "
          :extraProps="extraProps"
          @removeClick="onRemoveClick"
          @moveClick="onMoveClick"
          @selectContainer="selectContainer"
        >
          <template v-if="isContainer" #default>
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
      </div>

      <div v-else class="flex items-center justify-center p-8 border border-dashed border-base-300">
        <p class="text-sm animate-pulse">Initializing {{ widgetKey }}...</p>
      </div>
    </template>

    <template #fallback>
      <div
        class="relative min-h-12 flex flex-col items-center justify-center bg-base-200 rounded-lg"
      >
        <div class="z-10 text-primary font-bold mb-4">
          Loading {{ catalogEntry?.title || 'Widget' }}
        </div>
        <div
          class="animate-ping absolute h-24 w-24 rounded-full border-4 border-primary opacity-20"
        ></div>
        <div
          class="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent"
        ></div>
      </div>
    </template>
  </Suspense>
</template>
