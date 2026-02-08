<script setup lang="ts">
import { ref, computed, watch, markRaw } from 'vue'

import {
  getWidgetMetaFromCatalog,
  getDistinctCssClasses,
  parseContainerTitle,
} from '@tenorlab/dashboard-core'
import {
  HandIcon,
  HandGrabIcon,
  TimerResetIcon as ResetDashboardToDefaultIcon,
  SettingsIcon,
  ChevronDownIcon,
  UndoIcon,
  RedoIcon,
  Button,
  DraggablePanel,
  TextField,
  Dropdown,
} from '../dashboard-primitives/'
import type {
  IDashboardConfig,
  IDashboardSettingEntry,
  TDashboardUndoStatus,
  TDashboardWidgetKey,
  TWidgetMetaInfoBase,
} from '@tenorlab/dashboard-core'
import type { TDashboardWidgetCatalog } from '../interfaces/'

import WidgetListItem from './WidgetListItem.vue'
import SettingListItem from './SettingListItem.vue'

type TTabInfo = {
  id: number
  label: string
  hideLabel?: boolean
  icon?: any
}

export type TWidgetsCatalogFlyoutProps = {
  targetContainerKey?: TDashboardWidgetKey
  widgetsCatalog: TDashboardWidgetCatalog
  currentDashboardConfig: IDashboardConfig
  undoStatus: TDashboardUndoStatus
  zIndex?: number
  addWidget: (widgetKey: TDashboardWidgetKey, parentWidgetKey?: TDashboardWidgetKey) => any
  addContainer: (widgetKey: TDashboardWidgetKey) => any
  onSettingItemsUpdated: (items: IDashboardSettingEntry[]) => any
  onResetToDefaultDashboardClick: () => any
  onUndoOrRedo: (operation: 'Undo' | 'Redo') => any
  onDoneClick: () => any
}

const props = defineProps<TWidgetsCatalogFlyoutProps>()

const isWidgetAlreadyAdded = (widgetKey: TDashboardWidgetKey, dashboardConfig: IDashboardConfig) => {
  const allExistingWidgets = [
    ...dashboardConfig.widgets.filter((x) => x.indexOf('Container') === -1),
    ...dashboardConfig.childWidgetsConfig.map((x) => x.widgetKey),
  ]
  return allExistingWidgets.includes(widgetKey)
}

// --- State ---
const title = ref<string>('Editing')
const tabValue = ref(0)
const searchText = ref('')
const isDragging = ref(false)
const isTabsMenuOpen = ref(false)

// Get the array of available widget keys from the Map
const widgetKeys = computed<TDashboardWidgetKey[]>(() => Array.from(props.widgetsCatalog.keys()))

// Filter out the container and map the remaining keys to their metadata
type TWidgetWithMeta = {
  widgetKey: TDashboardWidgetKey
  metaData: TWidgetMetaInfoBase
}
const unfilteredWidgetsWithMeta = computed<TWidgetWithMeta[]>(() => {
  return widgetKeys.value.map((widgetKey) => ({
    widgetKey,
    metaData: getWidgetMetaFromCatalog(widgetKey, props.widgetsCatalog),
  }))
})

const widgetsWithMeta = computed<TWidgetWithMeta[]>(() => {
  return unfilteredWidgetsWithMeta.value.filter(
    (item) => item.metaData.categories.includes('Widget') && matchSearchTextForWidget(item.metaData),
  )
})
const chartWidgetsWithMeta = computed<TWidgetWithMeta[]>(() => {
  return unfilteredWidgetsWithMeta.value.filter(
    (item) => item.metaData.categories.includes('Chart') && matchSearchTextForWidget(item.metaData),
  )
})
const containerWidgetsWithMeta = computed<TWidgetWithMeta[]>(() => {
  return unfilteredWidgetsWithMeta.value.filter(
    (item) => item.metaData.categories.includes('Container') && matchSearchTextForWidget(item.metaData),
  )
})

const isTargetingContainer = computed(() => !!props.targetContainerKey)
const getIsTargetingContainer = () => isTargetingContainer.value

const tabs = computed((): TTabInfo[] => {
  const results: TTabInfo[] = [
    {
      id: 0,
      label: 'Widgets',
    },
    {
      id: 1,
      label: 'Charts',
    },
  ]

  if (!getIsTargetingContainer()) {
    results.push({
      id: 2,
      label: 'Containers',
    })
    results.push({
      id: 3,
      label: 'CSS Settings',
      hideLabel: true,
      icon: markRaw(SettingsIcon),
    })
  }

  return results
})

const currentCategory = computed((): string => {
  return tabs.value.find((x) => x.id === tabValue.value)?.label || 'Category...'
})

// --- Methods ---

// const handleSearchTextChange = (event: Event): any => {
//   searchText.value = (event.target as HTMLInputElement).value
// }
const handleSearchTextChange = (value: string): any => {
  searchText.value = value
}

const matchSearchTextForWidget = (metaData: TWidgetMetaInfoBase): boolean => {
  const lowerCaseText = searchText.value.trim().toLowerCase()
  if (lowerCaseText.length < 1) {
    return true
  }
  return (
    metaData.name.trim().toLowerCase().includes(lowerCaseText) ||
    metaData.description.toLowerCase().includes(lowerCaseText) ||
    metaData.categories.some((c) => c.toLowerCase().includes(lowerCaseText))
  )
}

const matchSearchTextForSetting = (item: IDashboardSettingEntry): boolean => {
  const lowerCaseText = searchText.value.trim().toLowerCase()
  if (lowerCaseText.length < 1) {
    return true
  }
  return (
    item.name.trim().toLowerCase().includes(lowerCaseText) ||
    item.description.toLowerCase().includes(lowerCaseText)
  )
}

const getTabClassName = (tabNum: number, noBorderBottom?: boolean) => {
  return getDistinctCssClasses(
    'px-4 py-2 font-medium cursor-pointer',
    `${!noBorderBottom ? 'border-b-2' : ''} border-transparent hover:border-primary focus:outline-none`,
    tabNum === tabValue.value ? 'text-primary border-primary' : '',
  )
}

const getMobileTabClassName = (tabNum: number) => {
  return getDistinctCssClasses(
    `w-full flex items-center gap-2 px-2 py-1 text-left text-sm cursor-pointer border`,
    tabNum !== tabValue.value
      ? `border-transparent content-topbar hover:bg-primary hover:content-primary`
      : 'border-primary text-primary',
  )
}

// Handler for when WidgetListItem emits 'addWidget'
const onAddWidgetClick = (widgetKey: TDashboardWidgetKey) => {
  if (!getIsTargetingContainer()) {
    // targeting dashboard
    props.addWidget(widgetKey)
  } else {
    // targeting container
    props.addWidget(widgetKey, props.targetContainerKey)
  }
}

// Handler for when SettingListItem emits 'settingChanged'
const onSettingItemChanged = (item: IDashboardSettingEntry) => {
  const updatedItems = (props.currentDashboardConfig.cssSettings || []).map((existingItem) => {
    if (existingItem.key === item.key) {
      return item
    }
    return existingItem
  })
  props.onSettingItemsUpdated(updatedItems)
}

const handleToggleTabsOpen = (value: boolean) => {
  isTabsMenuOpen.value = value
}
const handleTabClick = (value: number) => {
  tabValue.value = value
  isTabsMenuOpen.value = false
}

const onDraggingChange = (value: boolean) => {
  isDragging.value = value
}

watch(
  () => props.targetContainerKey,
  (newKey) => {
    if (!!newKey) {
      handleTabClick(0)
      const containerTitle = parseContainerTitle(newKey)
      title.value = `Editing ${containerTitle}`
    } else {
      title.value = 'Widget Catalog'
    }
  },
  { immediate: true },
)
</script>

<template>
  <DraggablePanel
    testId="dashboard-catalog-flyout"
    :className="`transition-colors duration-150 bg-body content-body bg-opacity-70 border-2 ${!isDragging ? 'border-primary' : 'border-warning'} max-w-72 sm:max-w-90`"
    :zIndex="zIndex || 99999"
    :style="{
      backdropFilter: 'blur(8px)',
    }"
    @draggingChange="onDraggingChange"
  >
    <div class="flex flex-col gap-2 p-2">
      <div class="flex flex-row gap-2 justify-between">
        <!-- Drag Handle -->
        <div
          :class="`handle cursor-grab flex-1 flex gap-2 w-full ${!isDragging ? 'hover:text-primary' : 'text-warning'}`"
        >
          <HandGrabIcon v-if="isDragging" class="size-5" />
          <HandIcon v-else class="size-5" />
          <h2
            class="flex-1 text-base margin-0 capitalize"
            :title="
              isTargetingContainer ? title : `Editing dashboard: ${currentDashboardConfig.dashboardName}`
            "
          >
            {{ title }}
          </h2>
        </div>

        <!-- Action Buttons (Undo/Redo/Reset) -->
        <div class="flex flex-row gap-2 items-center">
          <Button
            data-testid="undo-dashboard-config-change"
            :isIconButton="true"
            :tooltip="{
              placement: 'bottom',
              title: 'Undo',
            }"
            :disabled="undoStatus.isUndoDisabled"
            @click="onUndoOrRedo('Undo')"
          >
            <UndoIcon class="size-5" />
          </Button>
          <Button
            data-testid="redo-dashboard-config-change"
            :isIconButton="true"
            :tooltip="{
              placement: 'bottom',
              title: 'Redo',
            }"
            :disabled="undoStatus.isRedoDisabled"
            @click="onUndoOrRedo('Redo')"
          >
            <RedoIcon class="size-5" />
          </Button>
          <Button
            data-testid="reset-dashboard-to-default"
            :isIconButton="true"
            :tooltip="{
              placement: 'bottom',
              title: 'Reset this dashboard to the default configuration',
            }"
            @click="onResetToDefaultDashboardClick"
          >
            <ResetDashboardToDefaultIcon class="size-5" />
          </Button>
        </div>
      </div>

      <!-- tabs -->
      <div class="hidden sm:flex sm:flex-row sm:items-center sm:gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="getTabClassName(tab.id, tab.id === 3)"
          @click="() => handleTabClick(tab.id)"
        >
          <span :class="tab.hideLabel ? 'sr-only' : ''">{{ tab.label }}</span>
          <component v-if="tab.icon" :is="tab.icon" />
        </button>
      </div>
      <!-- tabs mobile -->
      <div class="flex flex-col gap-1 sm:hidden">
        <Dropdown
          :enabled="true"
          :showChevron="true"
          :isMenuOpen="isTabsMenuOpen"
          @toggleOpen="handleToggleTabsOpen"
        >
          <template #icon>
            <div class="group flex items-center gap-2 text-primary group-hover:text-primary-inverse">
              <h5 class="py-2 font-bold">{{ currentCategory }}</h5>
              <ChevronDownIcon class="shrink-0 ml-1 size-4" />
            </div>
          </template>
          <div class="p-2 rounded-md border border-primary">
            <h6 class="font-semibold">Category:</h6>
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              :class="getMobileTabClassName(tab.id)"
              role="menuitem"
              :tabIndex="-1"
              @click="() => handleTabClick(tab.id)"
            >
              <span>{{ tab.label }}</span>
            </button>
          </div>
        </Dropdown>
      </div>

      <!-- Search Filter -->
      <div className="sm:mt-2 flex flex-col gap-1 w-full">
        <TextField
          label=""
          placeholder="Find..."
          size="small"
          class="w-full"
          v-model="searchText"
          @update:modelValue="handleSearchTextChange"
        />
      </div>

      <!-- Content Area -->
      <div class="flex flex-col gap-2 overflow-x-hidden overflow-y-auto" style="max-height: 360px">
        <div v-if="tabValue === 3" className="hidden px-2 w-full font-semibold sm:flex">
          {{ currentCategory }}:
        </div>

        <!-- Tab 0: Widgets -->
        <template v-if="tabValue === 0">
          <WidgetListItem
            v-for="item in widgetsWithMeta"
            :key="item.widgetKey"
            :widgetKey="item.widgetKey"
            :metaData="item.metaData"
            :alreadyAdded="isWidgetAlreadyAdded(item.widgetKey, currentDashboardConfig)"
            @addWidget="() => onAddWidgetClick(item.widgetKey)"
          />
        </template>

        <!-- Tab 1: Charts -->
        <template v-else-if="tabValue === 1">
          <WidgetListItem
            v-for="item in chartWidgetsWithMeta"
            :key="item.widgetKey"
            :widgetKey="item.widgetKey"
            :metaData="item.metaData"
            :alreadyAdded="isWidgetAlreadyAdded(item.widgetKey, currentDashboardConfig)"
            @addWidget="() => onAddWidgetClick(item.widgetKey)"
          />
        </template>

        <!-- Tab 2: Containers -->
        <template v-else-if="tabValue === 2 && !isTargetingContainer">
          <WidgetListItem
            v-for="item in containerWidgetsWithMeta"
            :key="item.widgetKey"
            :widgetKey="item.widgetKey"
            :metaData="item.metaData"
            :alreadyAdded="isWidgetAlreadyAdded(item.widgetKey, currentDashboardConfig)"
            @addWidget="() => addContainer(item.widgetKey)"
          />
        </template>

        <!-- Tab 3: Settings -->
        <template v-else-if="tabValue === 3 && !isTargetingContainer">
          <SettingListItem
            v-for="item in (currentDashboardConfig.cssSettings || []).filter(matchSearchTextForSetting)"
            :key="item.key"
            :item="item"
            @settingChanged="onSettingItemChanged"
          />
        </template>
      </div>

      <!-- Done Button -->
      <div class="mt-4 w-full flex flex-row justify-end pt-1">
        <Button
          class="bg-opacity-100"
          :tooltip="{
            placement: 'bottom',
            title: 'Click to exit edit mode',
          }"
          @click="onDoneClick"
        >
          Done
        </Button>
      </div>
    </div>
  </DraggablePanel>
</template>
