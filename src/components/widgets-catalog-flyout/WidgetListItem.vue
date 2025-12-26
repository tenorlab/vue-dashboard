<script setup lang="ts">
import { computed } from 'vue'
import {
  TDashboardWidgetKey,
  TWidgetMetaInfoBase,
  getDistinctCssClasses,
} from '@tenorlab/dashboard-core'
import { CircleQuestionMarkIcon as UnknownWidgetIcon } from '../dashboard-primitives'

type TWidgetListItemProps = {
  widgetKey: TDashboardWidgetKey
  metaData: TWidgetMetaInfoBase
  alreadyAdded: boolean
}

const props = defineProps<TWidgetListItemProps>()

const emits = defineEmits<{
  (event: 'addWidget'): void
}>()

const OptionIconComponent = props.metaData?.icon || UnknownWidgetIcon
const displayName = props.metaData?.name || 'Unknown'
const description = props.metaData?.description || '---'
const noDuplicatedWidgets = props.metaData?.noDuplicatedWidgets || false
const addNotAllowed = computed(() => noDuplicatedWidgets && props?.alreadyAdded)

const className = computed(() => {
  return getDistinctCssClasses(`
    flex flex-row gap-2 p-2 rounded-md border text-sm bg-card content-card backdrop-opacity-100
    ${
      !addNotAllowed.value
        ? 'cursor-pointer border-primary fill-danger hover:fill-primary content-primary hover:brightness-110'
        : 'border-disabled fill-disabled text-disabled'
    }
  `)
})

const onListItemClick = () => {
  if (addNotAllowed.value) {
    return
  }
  // Emit the event instead of calling a prop function
  emits('addWidget')
}
</script>

<template>
  <div :class="className" style="width: calc(100% - 1rem)" @click="onListItemClick">
    <component :is="OptionIconComponent" class="" />
    <div class="w-full">
      <div class="flex flex-row items-center gap-2 justify-between">
        <span class="font-bold">{{ displayName }}</span>
        <div class="text-xs">{{ addNotAllowed ? '(Added)' : '' }}</div>
      </div>
      <div class="flex flex-col gap-2 text-xs">
        <div>{{ description }}</div>
      </div>
    </div>
  </div>
</template>
