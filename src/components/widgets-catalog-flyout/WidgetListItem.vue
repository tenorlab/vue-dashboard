<script setup lang="ts">
import { computed, ref } from 'vue'
import { getDistinctCssClasses } from '@tenorlab/dashboard-core'
import { CircleQuestionMarkIcon as UnknownWidgetIcon } from '../dashboard-primitives'
import type { TDashboardWidgetKey, TWidgetMetaInfoBase } from '@tenorlab/dashboard-core'

type TWidgetListItemProps = {
  widgetKey: TDashboardWidgetKey
  metaData: TWidgetMetaInfoBase
  alreadyAdded: boolean
}

const props = defineProps<TWidgetListItemProps>()

const emits = defineEmits<{
  (event: 'addWidget'): void
}>()

const showExternals = ref(false)
const metaData = props.metaData
const OptionIconComponent = metaData?.icon || UnknownWidgetIcon
const displayName = metaData?.name || 'Unknown'
const description = metaData?.description || '---'
const noDuplicatedWidgets = metaData?.noDuplicatedWidgets || false
const addNotAllowed = computed(() => noDuplicatedWidgets && props?.alreadyAdded)

const className = computed(() => {
  return getDistinctCssClasses(`
    flex flex-row gap-2 p-2 rounded-md border text-sm bg-card content-card backdrop-opacity-100
    ${
      !addNotAllowed.value
        ? `cursor-pointer border-primary fill-danger hover:fill-primary content-primary hover:brightness-110`
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

const onExternalsClicked = (ev: any) => {
  ev.stopPropagation()
  ev.preventDefault()
  showExternals.value = !showExternals.value
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
        <div
          v-if="showExternals && metaData?.externalDependencies?.length > 0"
          class="mt-3 cursor-pointer"
          @click="onExternalsClicked"
        >
          Externals:
          <dl class="ml-2 flex flex-col text-xs">
            <dd v-for="(dep, i) in metaData?.externalDependencies" :key="i">- {{ dep }}</dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>
