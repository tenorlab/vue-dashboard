<script setup lang="ts">
// file: src/dashboard-components/DashboardWidgetBase.vue
import { computed } from 'vue'
import {
  Button,
  MoveLeftIcon,
  MoveRightIcon,
  XCircleIcon as RemoveWidgetIcon,
} from './dashboard-primitives/'
import { getDistinctCssClasses } from '@tenorlab/dashboard-core'
import type { IDashboardWidgetProps, TWidgetEmits } from './interfaces'

const props = defineProps<IDashboardWidgetProps>()
const emits = defineEmits<TWidgetEmits>()
const defaultActionIconSize = 'size-5'
const computedHideTitle = computed(() => props.hideTitle && !props.isEditing)

const rootCssClass = computed(() => {
  const borderCssClasses = props.borderCssClasses || ''
  const noBorder = props.noBorder
  let cssClass = `dashboard-widget ${props.isEditing ? 'editing' : ''} border border-solid`

  if (!noBorder) {
    if ((borderCssClasses || '').trim().length > 0) {
      cssClass = `${cssClass} ${borderCssClasses}`
    } else {
      cssClass = `${cssClass} border-card-invert border-opacity-20`
    }
  } else {
    cssClass = `${cssClass} border-transparent border-opacity-0`
  }

  if (props.noShadow) {
    cssClass = `${cssClass} no-shadow`
  }

  if (props.noPadding) {
    cssClass = `${cssClass} no-padding p-0`
  }

  if ((props.backgroundCssClasses || '').trim().length > 0) {
    cssClass = `${cssClass} ${props.backgroundCssClasses}`
  } else {
    cssClass = `${cssClass} bg-card content-card`
  }

  if (['large', 'xlarge'].indexOf(props.size || '') > -1) {
    cssClass = `${cssClass} ${props.size}-widget`
  }

  return getDistinctCssClasses(cssClass)
})

const widgetHeaderCssClass = computed(() => {
  const hideTitle = computedHideTitle.value
  return getDistinctCssClasses(
    `widget-header`,
    hideTitle
      ? 'hidden'
      : `flex items-center justify-between border-b border-solid border-card-invert`,
    !hideTitle ? 'border-opacity-20' : 'border-opacity-0',
  )
})

const onRemoveClick = () => {
  if (props.widgetKey) {
    emits('removeClick', props.widgetKey, props.parentWidgetKey)
  }
}

const onMoveClick = (direction: -1 | 1) => {
  if (props.widgetKey) {
    emits('moveClick', direction, props.widgetKey, props.parentWidgetKey)
  }
}
</script>

<template>
  <div :class="rootCssClass">
    <div :class="widgetHeaderCssClass">
      <div class="widget-title-wrapper w-full flex flex-row gap-2 items-center justify-between">
        <h2 class="widget-title">
          {{ props.title }}
        </h2>
        <div></div>
      </div>

      <div data-testid="collapse-and-other-actions">
        <div class="actions-inner">
          <div>
            <span class="hidden">Widget</span>
          </div>
          <div class="actions-buttons-container">
            <Button
              :data-testid="`move-widget-left_${props.title}`"
              :isIconButton="true"
              :disabled="props.index < 1"
              :tooltip="{
                placement: 'top',
                title: `${props.index < 1 ? 'Already at min position' : 'Move Widget to the left/up'}`,
              }"
              @click.stop="onMoveClick(-1)"
            >
              <MoveLeftIcon :class="defaultActionIconSize" />
            </Button>

            <Button
              :data-testid="`move-widget-right_${props.title}`"
              :isIconButton="true"
              :disabled="props.index >= props.maxIndex"
              :tooltip="{
                placement: 'top',
                title: `${props.index >= props.maxIndex ? 'Already at max position' : 'Move Widget to the right/down'}`,
              }"
              @click.stop="onMoveClick(1)"
            >
              <MoveRightIcon :class="defaultActionIconSize" />
            </Button>

            <Button
              :data-testid="`remove-container_${props.title}`"
              :isIconButton="true"
              :tooltip="{
                placement: 'top',
                title: 'Remove Widget',
              }"
              @click.stop="onRemoveClick"
            >
              <RemoveWidgetIcon :class="defaultActionIconSize" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="widget-inner">
      <slot></slot>
    </div>
  </div>
</template>
