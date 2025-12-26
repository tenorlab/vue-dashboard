<script setup lang="ts" generic="K extends TDashboardWidgetKey = TDashboardWidgetKey">
// file: src/dashboard-components/WidgetContainer.vue
import { computed } from 'vue'
import { Button } from './dashboard-primitives'
import {
  XCircleIcon as RemoveWidgetIcon,
  MoveLeftIcon,
  MoveRightIcon,
  CrosshairIcon as ContainerTargetedIcon,
} from './dashboard-primitives'
import { getDistinctCssClasses } from '@tenorlab/dashboard-core'
import { useWidgetEmits } from './use-widget-emits'
import { TDashboardWidgetKey } from '@tenorlab/dashboard-core'
import type { IDashboardWidgetProps, TWidgetEmits } from './interfaces/'

const props = withDefaults(defineProps<IDashboardWidgetProps>(), {
  title: '',
  size: 'default',
  direction: 'column',
  highlight: false,
  widgetKey: undefined,
  parentWidgetKey: undefined,
  placeholder: '',
})

const _emits = defineEmits<TWidgetEmits>()
const widgetEmits = useWidgetEmits(_emits)
const computedHasChildren = computed(() => props.maxIndex > -1)
const defaultActionIconSize = 'size-5'
const highlightBorderClassName = 'border-transparent'
const defaultBorderClassName = 'border-card-invert'

const borderColorClassName = computed(() => {
  const hasChildren = computedHasChildren.value
  if (props.highlight) {
    return highlightBorderClassName
  }
  if (props.isEditing && !hasChildren) {
    return defaultBorderClassName
  }
  return 'border-transparent'
})

const cssClass = computed(() => {
  const highlight = props.highlight || false
  const direction = props.direction || 'column'
  const hasChildren = computedHasChildren.value
  const isEditing = props.isEditing || false

  const highlightBorderClassName = 'border-transparent' //'border-primary'
  const defaultBorderClassName = 'border-card-invert'
  let borderColorClassName = highlight
    ? highlightBorderClassName
    : isEditing
      ? defaultBorderClassName
      : 'border-transparent'

  const isGrid = ['large', 'xlarge'].includes(props.size || '')

  let sizeCssClass = ''
  if (['large', 'xlarge'].indexOf(props.size || '') > -1) {
    sizeCssClass = `${props.size}-widget`
  }

  let minHeight = ''
  if (direction === 'row' && !hasChildren) {
    minHeight = 'min-h-48'
  } else if (direction === 'column' && !hasChildren) {
    minHeight = 'min-h-96'
  }

  let result = getDistinctCssClasses(
    `dashboard-widget-container relative `,
    !hasChildren ? 'has-no-children' : '',
    isEditing ? 'editing' : '',
    minHeight,
    sizeCssClass,
    isGrid ? 'widget-container-grid' : 'widget-container-flex',
    `direction-${direction}`,
    `border ${borderColorClassName}`,
    `${highlight ? 'highlight-container' : ''} ${borderColorClassName}`,
  )

  return result
})

const containerActionsCssClass = computed(() => {
  return `widget-container-header direction-${props.direction} flex items-center border ${borderColorClassName.value}`
})

// event handlers:
const onRemoveClick = () => {
  if (props.widgetKey) {
    widgetEmits.removeClick(props.widgetKey)
  }
}

const onMoveClick = (direction: -1 | 1) => {
  if (props.widgetKey) {
    widgetEmits.moveClick(direction, props.widgetKey, props.parentWidgetKey)
  }
}

const selectContainer = () => {
  if (props.widgetKey) {
    widgetEmits.selectContainer(props.widgetKey)
  }
}
</script>

<template>
  <!-- Main Widget Container -->
  <div :data-testid="`container_${props.widgetKey}`" data-change="asd" :class="cssClass">
    <!-- Widget Header/Actions Bar -->
    <div :class="containerActionsCssClass">
      <!-- Title Wrapper & Target Dialog Click -->
      <div class="widget-title-wrapper w-full flex whitespace-nowrap" @click.stop="selectContainer">
        <span class="text-sm font-semibold capitalize">{{ props.title }}</span>
      </div>

      <!-- Collapse and Other Actions -->
      <div data-testid="collapse-and-other-actions">
        <div class="actions-inner">
          <div class="actions-buttons-container">
            <!-- Target this Container Button -->
            <Button
              :data-testid="`open-widgets-catalog-from-container_${props.title}`"
              :isIconButton="true"
              class="whitespace-nowrap"
              :tooltip="{ placement: 'top', title: 'Target this Container' }"
              @click.stop="selectContainer"
            >
              <ContainerTargetedIcon
                :class="`${defaultActionIconSize} ${props.highlight ? 'text-success' : 'text-disabled'}`"
              />
            </Button>

            <!-- Move Left/Up Button -->
            <Button
              :data-testid="`move-container-left_${props.title}`"
              :isIconButton="true"
              :disabled="props.index < 1"
              :tooltip="{
                placement: 'top',
                title:
                  props.index < 1 ? 'Already at min position' : 'Move Container to the left/up',
              }"
              @click.stop="onMoveClick(-1)"
            >
              <MoveLeftIcon :class="defaultActionIconSize" />
            </Button>

            <!-- Move Right/Down Button -->
            <Button
              :data-testid="`move-container-right_${props.title}`"
              :isIconButton="true"
              :disabled="props.index >= props.maxIndex"
              :tooltip="{
                placement: 'top',
                title:
                  props.index >= props.maxIndex
                    ? 'Already at max position'
                    : 'Move Container to the right/down',
              }"
              @click.stop="onMoveClick(1)"
            >
              <MoveRightIcon :class="defaultActionIconSize" />
            </Button>

            <!-- Remove Container Button -->
            <Button
              :data-testid="`remove-container_${props.title}`"
              :isIconButton="true"
              :tooltip="{ placement: 'top', title: 'Remove Container' }"
              @click.stop="onRemoveClick"
            >
              <RemoveWidgetIcon :class="defaultActionIconSize" />
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Widget Children -->
    <div :data-testid="`childrenwrapper_${props.widgetKey}`" class="widget-container-inner">
      <!-- Slot for children -->
      <slot></slot>
    </div>
  </div>
</template>
