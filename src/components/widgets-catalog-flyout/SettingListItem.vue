<script setup lang="ts">
import type { IDashboardSettingEntry } from '@tenorlab/dashboard-core'
import { getDistinctCssClasses, dashboardSettingsUtils } from '@tenorlab/dashboard-core'
import { Button, TextField, PlusCircleIcon, MinusCircleIcon } from '../dashboard-primitives'

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
  flex flex-row gap-2 px-2 text-sm backdrop-opacity-100
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
const incrementOrDecrement = (direction: 1 | -1) => {
  // increment/decrement entry value
  const updatedEntry = dashboardSettingsUtils.incrementOrDecrementValue(props.item, direction)
  // Emit the updated entry
  emits('settingChanged', updatedEntry)
}
</script>

<template>
  <div :class="className" style="width: calc(100% - 1rem)">
    <div class="w-full flex flex-col">
      <h6 class="font-bold">{{ displayName }}</h6>
      <p class="flex flex-col text-xs">{{ description }}</p>
      <div class="mt-1 flex flex-row gap-2 items-center">
        <TextField
          label=""
          size="small"
          class="w-full"
          :modelValue="item.value"
          @update:modelValue="onInputChange"
          @keydown.up.prevent="incrementOrDecrement(1)"
          @keydown.down.prevent="incrementOrDecrement(-1)"
        />
        <Button
          :data-testid="`setting-decrease_${item.key}`"
          :isIconButton="true"
          :tooltip="{
            placement: 'top',
            title: 'Decrease Value',
          }"
          @click="() => incrementOrDecrement(-1)"
        >
          <MinusCircleIcon />
        </Button>
        <Button
          :data-testid="`setting-increase_${item.key}`"
          :isIconButton="true"
          :tooltip="{
            placement: 'top',
            title: 'Increase Value',
          }"
          @click="() => incrementOrDecrement(1)"
        >
          <PlusCircleIcon />
        </Button>
      </div>
    </div>
  </div>
</template>
