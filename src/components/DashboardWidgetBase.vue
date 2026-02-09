<script setup lang="ts">
// file: src/dashboard-components/DashboardWidgetBase.vue
import { ref, computed } from 'vue'
import {
  Button,
  MoveLeftIcon,
  MoveRightIcon,
  XCircleIcon as RemoveWidgetIcon,
  ChevronDownIcon,
  HandGrabIcon,
} from './dashboard-primitives/'
import { getDistinctCssClasses } from '@tenorlab/dashboard-core'
import type { IDashboardWidgetProps, TWidgetEmits } from './interfaces'

const props = defineProps<IDashboardWidgetProps>()
const emits = defineEmits<TWidgetEmits>()
const defaultActionIconSize = 'size-5'
const computedHideTitle = computed(() => props.hideTitle && !props.isEditing)

const getNoCollapse = () => {
  const metaNoCollapse = (props.meta as any)?.noCollapse
  // meta overrides prop
  if (typeof metaNoCollapse !== 'undefined') {
    return metaNoCollapse
  }
  return props.noCollapse || false
}

const refIsCollapsed = ref(getNoCollapse() ? false : props.widgetSavedProps?.isCollapsed || false)

const _getCssClasses = (isCollapsed: boolean): string => {
  // if overrideCssClasses is provided, we do not compute any css classes but use the ones provided:
  if ((props.overrideCssClasses || '').trim().length > 0) {
    return (props.overrideCssClasses || '').trim()
  }

  const flowDirection = props.direction || 'column'
  const noBorder = props.noBorder

  let cssClass = `dashboard-widget ${isCollapsed ? 'collapsed' : ''}`
  cssClass = `${cssClass} direction-${flowDirection} ${props.isEditing ? 'editing' : ''}`
  cssClass = `${cssClass} border border-solid`

  if (['large', 'xlarge'].indexOf(props.size || '') > -1) {
    cssClass = `${cssClass} ${props.size}-widget`
  }

  if (!noBorder) {
    if ((props.borderCssClasses || '').trim().length > 0) {
      cssClass = `${cssClass} ${props.borderCssClasses}`
    } else {
      cssClass = `${cssClass} border-card-invert border-opacity-20`
    }
  } else {
    cssClass = `${cssClass} border-transparent border-opacity-0`
  }

  if (!!props.noShadow) {
    cssClass = `${cssClass} no-shadow`
  }

  if (!!props.noPadding) {
    cssClass = `${cssClass} no-padding p-0`
  }

  if ((props.backgroundCssClasses || '').trim().length > 0) {
    cssClass = `${cssClass} ${props.backgroundCssClasses}`.trim()
  } else {
    cssClass = `${cssClass} bg-card content-card`
  }

  if ((props.addCssClasses || '').trim().length > 0) {
    cssClass = `${cssClass} ${props.addCssClasses}`.trim()
  }

  return cssClass
}

const rootCssClass = computed(() => getDistinctCssClasses(_getCssClasses(refIsCollapsed.value)))

const widgetHeaderCssClass = computed(() => {
  const hideTitle = computedHideTitle.value
  return getDistinctCssClasses(
    `widget-header`,
    hideTitle ? 'hidden' : `flex items-center justify-between border-b border-solid border-card-invert`,
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

const emitSavedPropsChanged = () => {
  emits('savedPropsChanged', {
    parentWidgetKey: props.parentWidgetKey,
    widgetKey: props.widgetKey,
    isCollapsed: refIsCollapsed.value,
  })
}

const onCollapseExpand = () => {
  if (props.widgetKey) {
    refIsCollapsed.value = !refIsCollapsed.value
    emitSavedPropsChanged()
  }
}

// NOTE; not watching props.widgetSavedProps sine we are setting refIsCollapsed before we emit saved props changed.
</script>

<template>
  <div :class="rootCssClass">
    <div :class="widgetHeaderCssClass">
      <div class="widget-title-wrapper group w-full flex flex-row gap-2 items-center">
        <div
          class="drag-handle hidden cursor-pointer text-primary group-hover:flex hover:brightness-110 pointer-coarse:flex"
        >
          <HandGrabIcon class="size-5" />
        </div>
        <div class="flex flex-row gap-2 items-center justify-between">
          <slot name="title">
            <h2 class="widget-title">{{ title }}</h2>
          </slot>
          <slot name="title-right"></slot>
        </div>
      </div>

      <div :data-testid="`collapse-and-other-actions_${widgetKey}_${index}`">
        <div class="actions-inner">
          <div>
            <span class="hidden">Widget</span>
          </div>
          <div class="actions-buttons-container">
            <Button
              :data-testid="`move-widget-left_${widgetKey}_${index}`"
              :isIconButton="true"
              :disabled="index < 1"
              :tooltip="{
                placement: 'top',
                title: `${index < 1 ? 'Already at min position' : 'Move Widget to the left/up'}`,
              }"
              @click.stop="onMoveClick(-1)"
            >
              <MoveLeftIcon :class="defaultActionIconSize" />
            </Button>

            <Button
              :data-testid="`move-widget-right_${widgetKey}_${index}`"
              :isIconButton="true"
              :disabled="index >= maxIndex"
              :tooltip="{
                placement: 'top',
                title: `${index >= maxIndex ? 'Already at max position' : 'Move Widget to the right/down'}`,
              }"
              @click.stop="onMoveClick(1)"
            >
              <MoveRightIcon :class="defaultActionIconSize" />
            </Button>

            <Button
              :data-testid="`remove-container_${title}`"
              :isIconButton="true"
              :tooltip="{
                placement: 'top',
                title: 'Remove Widget',
              }"
              @click.stop="onRemoveClick"
            >
              <RemoveWidgetIcon :class="defaultActionIconSize" />
            </Button>

            <Button
              v-if="!getNoCollapse()"
              :data-testid="`collapse-expand_${widgetKey}_${index}`"
              className="collapse-button"
              :isIconButton="true"
              :tooltip="{
                placement: 'top',
                title: `${refIsCollapsed ? 'Expand Widget' : 'Collapse Widget'}`,
              }"
              @click.stop="() => onCollapseExpand()"
            >
              <ChevronDownIcon
                :class="defaultActionIconSize"
                :style="{
                  transform: refIsCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                  transition: 'transform 0.2s ease-in-out',
                }"
              />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="widget-inner transition-height duration-300 ease-in-out" :data-collapsed="refIsCollapsed">
      <slot></slot>
    </div>
  </div>
</template>
