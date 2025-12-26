<script setup lang="ts">
import {
  IDashboardSettingEntry,
  getDistinctCssClasses,
  dashboardSettingsUtils,
} from '@tenorlab/dashboard-core'
import { TextField } from '../dashboard-primitives'

type TSettingListItemProps = {
  item: IDashboardSettingEntry
}

const props = defineProps<TSettingListItemProps>()

const emits = defineEmits<{
  (event: 'settingChanged', item: IDashboardSettingEntry): void
}>()

const displayName = props.item.name || 'Unknown'
const description = props.item.description || '---'

const className = getDistinctCssClasses(`
  flex flex-row gap-2 p-2 rounded-md border text-sm bg-card content-card backdrop-opacity-100
`)

// Handler for emitting the updated item whenever the TextField value changes
const onInputChange = (value: string) => {
  // Emit the updated item object
  emits('settingChanged', {
    ...props.item,
    value: value || '',
  })
}

// Handler for keyboard events (ArrowUp/ArrowDown)
const onKeyIncrement = (step: 1 | -1) => {
  // increment/decrement entry value
  const updatedEntry = dashboardSettingsUtils.incrementOrDecrementValue(props.item, step)
  // Emit the updated entry
  emits('settingChanged', updatedEntry)
}
</script>

<template>
  <div :class="className" style="width: calc(100% - 1rem)">
    <div class="w-full">
      <div class="flex flex-row items-center gap-2 justify-between">
        <span class="font-bold">{{ displayName }}</span>
      </div>
      <div class="flex flex-col gap-2 text-xs">
        <div>{{ description }}</div>
      </div>
      <div>
        Value:
        <TextField
          label="Filter..."
          size="small"
          class="w-full"
          :modelValue="item.value"
          @update:modelValue="onInputChange"
          @keydown.up.prevent="onKeyIncrement(1)"
          @keydown.down.prevent="onKeyIncrement(-1)"
        />
      </div>
    </div>
  </div>
</template>
